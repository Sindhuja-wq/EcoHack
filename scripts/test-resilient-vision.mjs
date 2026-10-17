import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const envContent = fs.readFileSync('.env', 'utf8');
let apiKey = '';
for (const line of envContent.split('\n')) {
  if (line.trim().startsWith('GEMINI_API_KEY=')) {
    apiKey = line.trim().slice('GEMINI_API_KEY='.length).replace(/["']/g, '').trim();
  }
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testFlashModels() {
  const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash'];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent('Say OK');
      console.log(`Model [${m}]: SUCCESS (${res.response.text().trim()})`);
    } catch (err) {
      console.log(`Model [${m}]: FAILED (${err.message})`);
    }
  }
}

testFlashModels();
