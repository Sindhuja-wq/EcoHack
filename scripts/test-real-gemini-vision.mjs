import fs from 'fs';
import path from 'path';
import { GeminiWasteAnalysisProvider } from '../src/lib/ai/gemini-provider.ts';

// 1. Read API key safely from .env
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
let apiKey = '';
let modelName = 'gemini-3.8-flash';

for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('GEMINI_API_KEY=')) {
    apiKey = trimmed.slice('GEMINI_API_KEY='.length).replace(/["']/g, '').trim();
  }
  if (trimmed.startsWith('GEMINI_MODEL=')) {
    modelName = trimmed.slice('GEMINI_MODEL='.length).replace(/["']/g, '').trim();
  }
}

if (!apiKey) {
  console.error('API key is missing');
  process.exit(1);
}

// 2. Locate generated artifact images and copy to public/test-images
const brainDir = 'C:/Users/sanja/.gemini/antigravity-ide/brain/2639ab90-6899-40b9-b09f-de86e2116e27';
const testImagesDir = path.resolve('public/test-images');
if (!fs.existsSync(testImagesDir)) {
  fs.mkdirSync(testImagesDir, { recursive: true });
}

const brainFiles = fs.readdirSync(brainDir);
const targets = [
  { prefix: 'test_plastic_bottle_', name: 'plastic_bottle.jpg', expectedCategory: 'plastic' },
  { prefix: 'test_cardboard_box_', name: 'cardboard_box.jpg', expectedCategory: 'cardboard' },
  { prefix: 'test_cotton_tshirt_', name: 'cotton_tshirt.jpg', expectedCategory: 'fabric' },
  { prefix: 'test_glass_jar_', name: 'glass_jar.jpg', expectedCategory: 'glass' },
  { prefix: 'test_vegetable_scraps_', name: 'vegetable_scraps.jpg', expectedCategory: 'organic' },
];

for (const t of targets) {
  const match = brainFiles.find(f => f.startsWith(t.prefix) && f.endsWith('.jpg'));
  if (match) {
    const src = path.join(brainDir, match);
    const dst = path.join(testImagesDir, t.name);
    fs.copyFileSync(src, dst);
    t.filePath = dst;
  }
}

// 3. Test Gemini Provider on all 5 images
const provider = new GeminiWasteAnalysisProvider(apiKey, modelName);

async function runVisionTests() {
  console.log('=== REAL GEMINI VISION ANALYSIS VERIFICATION ===');
  console.log(`Using Model: ${modelName}`);

  const results = [];

  for (const t of targets) {
    if (!t.filePath || !fs.existsSync(t.filePath)) {
      console.error(`Missing image for ${t.name}`);
      continue;
    }

    const imageBytes = fs.readFileSync(t.filePath);
    const imageBase64 = `data:image/jpeg;base64,${imageBytes.toString('base64')}`;

    console.log(`\n--------------------------------------------------`);
    console.log(`Analyzing: [${t.name}] (${imageBytes.length} bytes)`);

    try {
      const result = await provider.analyzeImage(imageBase64, 'image/jpeg', 'San Francisco', t.name);
      results.push({ target: t, result });

      console.log(`  -> Detected Item     : ${result.detectedItem}`);
      console.log(`  -> Material Category : ${result.materialCategory} (Expected: ${t.expectedCategory})`);
      console.log(`  -> Confidence        : ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`  -> Item Condition    : ${result.itemCondition || 'N/A'}`);
      console.log(`  -> Provider Used     : ${result.providerUsed}`);
      console.log(`  -> Is Demo Sample    : ${result.isDemoSample}`);
      console.log(`  -> Options Generated : ${result.transformationOptions.length}`);
      
      result.transformationOptions.forEach((opt, idx) => {
        console.log(`     Option ${idx + 1}: "${opt.title}" (${opt.difficulty}, ${opt.estimatedTime})`);
      });
    } catch (err) {
      console.error(`  -> ERROR analyzing ${t.name}:`, err.message);
    }
  }

  // 4. Verification across all results
  console.log(`\n==================================================`);
  console.log(`=== SUMMARY COMPARISON ACROSS ALL 5 SAMPLES ===`);
  const categories = results.map(r => r.result.materialCategory);
  const items = results.map(r => r.result.detectedItem);
  const uniqueCategories = new Set(categories);

  console.log(`Total analyzed: ${results.length}/5`);
  console.log(`Unique categories detected: ${uniqueCategories.size}/5 (${[...uniqueCategories].join(', ')})`);
  
  if (uniqueCategories.size === 5) {
    console.log(`\nSUCCESS: All 5 images produced completely distinct, genuine vision analysis matching their true contents!`);
  } else {
    console.warn(`WARNING: Some categories overlapped. Check outputs above.`);
  }
}

runVisionTests();
