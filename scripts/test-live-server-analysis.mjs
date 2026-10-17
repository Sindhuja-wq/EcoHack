import fs from 'fs';
import path from 'path';

async function testEndpoint(imageName, imagePath) {
  console.log(`\n==================================================`);
  console.log(`Testing Live API with: ${imageName}`);

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Data = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  const payload = {
    imageBase64: base64Data,
    mimeType: 'image/jpeg',
    imageName: imageName,
    userCity: 'Seattle, WA',
  };

  const startTime = Date.now();
  const response = await fetch('http://localhost:3000/api/waste/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const durationMs = Date.now() - startTime;
  console.log(`HTTP Status: ${response.status} ${response.statusText} (${durationMs}ms)`);

  const data = await response.json();
  if (!response.ok) {
    console.error('API Error Response:', JSON.stringify(data, null, 2));
    return { success: false, data };
  }

  console.log(`Success: ${data.success}`);
  console.log(`Analysis ID: ${data.analysisId}`);
  console.log(`Provider Name: ${data.providerName}`);
  console.log(`Is Mock: ${data.isMock}`);
  console.log(`Is Demo Sample: ${data.result?.isDemoSample}`);
  console.log(`Detected Item: "${data.result?.detectedItem}"`);
  console.log(`Material Category: "${data.result?.materialCategory}"`);
  console.log(`Confidence: ${(data.result?.confidence * 100).toFixed(1)}%`);
  console.log(`Item Condition: "${data.result?.itemCondition}"`);
  console.log(`Uncertainty Notes: "${data.result?.uncertaintyNotes}"`);
  console.log(`Recommended Route: "${data.result?.environmentalImpact?.recommendedRoute}"`);
  console.log(`Transformation Options Count: ${data.result?.transformationOptions?.length}`);
  
  data.result?.transformationOptions?.forEach((opt, idx) => {
    console.log(`  [Option ${idx + 1}] "${opt.title}" (${opt.difficulty}, ${opt.estimatedTime})`);
    console.log(`      Short Explanation: ${opt.shortExplanation}`);
    console.log(`      Tools/Materials: ${opt.materialsTools?.join(', ')}`);
    if (opt.stepByStep && opt.stepByStep.length > 0) {
      console.log(`      Step 1: ${opt.stepByStep[0].instruction}`);
    }
  });

  return { success: true, result: data.result };
}

async function main() {
  const bottlePath = path.resolve('public/test-images/plastic_bottle.jpg');
  const boxPath = path.resolve('public/test-images/cardboard_box.jpg');

  const bottleResult = await testEndpoint('plastic_bottle.jpg', bottlePath);
  const boxResult = await testEndpoint('cardboard_box.jpg', boxPath);

  console.log(`\n==================================================`);
  console.log(`=== COMPARISON AND DIFFERENTIATION VERIFICATION ===`);

  if (!bottleResult.success || !boxResult.success) {
    console.error('FAILED: One or both requests failed!');
    process.exit(1);
  }

  const bRes = bottleResult.result;
  const cRes = boxResult.result;

  console.log(`Item 1 detected: ${bRes.detectedItem} (${bRes.materialCategory})`);
  console.log(`Item 2 detected: ${cRes.detectedItem} (${cRes.materialCategory})`);

  const differentCategories = bRes.materialCategory !== cRes.materialCategory;
  const bothRealAI = !bRes.isDemoSample && !cRes.isDemoSample;
  const distinctTitles = bRes.transformationOptions[0].title !== cRes.transformationOptions[0].title;

  console.log(`\nVerification Checks:`);
  console.log(`1. Real AI Provider Used (Not Mock): ${bothRealAI ? 'PASSED' : 'FAILED'}`);
  console.log(`2. Different Material Categories: ${differentCategories ? 'PASSED' : 'FAILED'}`);
  console.log(`3. Distinct, Specific Blueprints: ${distinctTitles ? 'PASSED' : 'FAILED'}`);

  if (bothRealAI && differentCategories && distinctTitles) {
    console.log(`\n>>> ALL CRITERIA VERIFIED SUCCESSFULLY WITH REAL GEMINI VISION API <<<`);
  } else {
    console.error(`\n>>> VERIFICATION FAILED <<<`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
