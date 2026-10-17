import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const envPath = path.resolve('.env');
const content = fs.readFileSync(envPath, 'utf8');
let apiKey = '';

for (const line of content.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('GEMINI_API_KEY=')) {
    apiKey = trimmed.slice('GEMINI_API_KEY='.length).replace(/["']/g, '').trim();
  }
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModernModels() {
  const models = [
    'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash-exp'
  ];

  console.log('--- Testing Current Supported Models ---');
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent('Hello, reply with: ECOHACK_OK');
      const reply = res.response.text();
      console.log(`Model [${m}]: SUCCESS -> ${reply.trim()}`);
    } catch (err) {
      console.log(`Model [${m}]: ERROR -> ${err.message}`);
    }
  }
}

testModernModels();
