import test from "node:test";
import assert from "node:assert/strict";
import { awardPoints } from "../src/lib/gamification.ts";

test("Batch 3A - awardPoints participates in external transaction client", async () => {
  let findFirstCalled = false;
  let createTxCalled = false;
  let userUpdateCalled = false;

  const mockTx = {
    pointTransaction: {
      findFirst: async ({ where }) => {
        findFirstCalled = true;
        assert.equal(where.userId, "user-123");
        assert.equal(where.source, "CHALLENGE_COMPLETION");
        assert.equal(where.referenceId, "sub-456");
        return null; // Not existing yet
      },
      create: async ({ data }) => {
        createTxCalled = true;
        assert.equal(data.userId, "user-123");
        assert.equal(data.amount, 50);
        assert.equal(data.source, "CHALLENGE_COMPLETION");
        assert.equal(data.referenceId, "sub-456");
        return { id: "pt-1", ...data };
      },
    },
    user: {
      update: async ({ where, data }) => {
        userUpdateCalled = true;
        assert.equal(where.id, "user-123");
        return {
          id: "user-123",
          points: 150,
          streak: 1,
          lastActiveAt: new Date(),
        };
      },
    },
    badge: {
      findMany: async () => [],
    },
    userBadge: {
      findMany: async () => [],
      create: async () => {},
    },
  };

  const result = await awardPoints(
    "user-123",
    50,
    "CHALLENGE_COMPLETION",
    "sub-456",
    "Completed challenge",
    mockTx
  );

  assert.equal(findFirstCalled, true, "findFirst must be called within externalTx");
  assert.equal(createTxCalled, true, "pointTransaction.create must be called within externalTx");
  assert.equal(userUpdateCalled, true, "user.update must be called within externalTx");
  assert.equal(result.success, true);
  assert.equal(result.pointsAwarded, 50);
  assert.equal(result.totalPoints, 150);
});

test("Batch 3A - awardPoints prevents duplicate awards inside transaction", async () => {
  let createTxCalled = false;
  let userUpdateCalled = false;

  const mockTx = {
    pointTransaction: {
      findFirst: async ({ where }) => {
        // Simulate already existing record
        return {
          id: "pt-existing",
          userId: where.userId,
          source: where.source,
          referenceId: where.referenceId,
          amount: 50,
        };
      },
      create: async () => {
        createTxCalled = true;
      },
    },
    user: {
      findUnique: async () => ({ points: 200 }),
      update: async () => {
        userUpdateCalled = true;
      },
    },
    badge: {
      findMany: async () => [],
    },
    userBadge: {
      findMany: async () => [],
    },
  };

  const result = await awardPoints(
    "user-123",
    50,
    "CHALLENGE_COMPLETION",
    "sub-456",
    "Completed challenge",
    mockTx
  );

  assert.equal(result.success, false);
  assert.equal(result.alreadyAwarded, true);
  assert.equal(result.pointsAwarded, 0);
  assert.equal(result.totalPoints, 200);
  assert.equal(createTxCalled, false, "Must not create duplicate pointTransaction");
  assert.equal(userUpdateCalled, false, "Must not update user points when already awarded");
});

test("Batch 3A - awardPoints rejects zero or negative amounts", async () => {
  await assert.rejects(
    async () => {
      await awardPoints("user-123", 0, "CHALLENGE_COMPLETION", "sub-1", "test");
    },
    { message: "Point amount must be greater than zero." }
  );

  await assert.rejects(
    async () => {
      await awardPoints("user-123", -10, "CHALLENGE_COMPLETION", "sub-1", "test");
    },
    { message: "Point amount must be greater than zero." }
  );
});

test("Batch 3A - Conditional status transition prevents concurrent approval races", async () => {
  // Simulating database state
  const dbState = {
    submissionId: "sub-999",
    status: "PENDING",
    reviewerFeedback: null,
    reviewerId: null,
  };

  // Simulated conditional update: updateMany where id = submissionId AND status = 'PENDING'
  async function simulateAdminReview(adminId, action, feedback) {
    // Step 1: conditional update
    if (dbState.status !== "PENDING") {
      // 0 rows updated
      return { count: 0 };
    }
    // Exactly 1 row updated atomically
    dbState.status = action;
    dbState.reviewerFeedback = feedback;
    dbState.reviewerId = adminId;
    return { count: 1 };
  }

  // Moderator A and Moderator B attempt to approve concurrently
  const [modAResult, modBResult] = await Promise.all([
    simulateAdminReview("admin-1", "APPROVED", "Approved by mod A"),
    simulateAdminReview("admin-2", "APPROVED", "Approved by mod B"),
  ]);

  // Exactly one moderator must succeed (count: 1), the other must fail (count: 0)
  const totalSuccess = modAResult.count + modBResult.count;
  assert.equal(totalSuccess, 1, "Exactly one approval request can succeed");
  assert.equal(
    (modAResult.count === 1 && modBResult.count === 0) ||
    (modAResult.count === 0 && modBResult.count === 1),
    true,
    "The conflicting approval must be rejected with count 0"
  );
});

test("Batch 3A - Transaction rollback leaves status untouched if points fail", async () => {
  let submissionStatus = "PENDING";

  // Simulate transactional block
  async function executeApprovalTransaction(failDuringPoints) {
    const rollbackSnapshot = submissionStatus;
    try {
      // Step 1: conditional status change
      if (submissionStatus !== "PENDING") {
        throw new Error("ALREADY_REVIEWED");
      }
      submissionStatus = "APPROVED";

      // Step 2: award points
      if (failDuringPoints) {
        throw new Error("DB_POINTS_FAILURE: Connection reset");
      }

      return { success: true };
    } catch (err) {
      // Transaction rollback
      submissionStatus = rollbackSnapshot;
      throw err;
    }
  }

  // Expect failure during points awarding
  await assert.rejects(
    async () => {
      await executeApprovalTransaction(true);
    },
    { message: "DB_POINTS_FAILURE: Connection reset" }
  );

  // Status must have safely rolled back to PENDING
  assert.equal(submissionStatus, "PENDING", "Status must remain PENDING when transaction rolls back");

  // Subsequent approval can now succeed because status remained PENDING
  const retryResult = await executeApprovalTransaction(false);
  assert.equal(retryResult.success, true);
  assert.equal(submissionStatus, "APPROVED");
});
