import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync('.env', 'utf8');
let apiKey = '';
for (const line of envContent.split('\n')) {
  if (line.trim().startsWith('GEMINI_API_KEY=')) {
    apiKey = line.trim().slice('GEMINI_API_KEY='.length).replace(/["']/g, '').trim();
  }
}

async function testSelection() {
  const candidates = [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const available = new Set(
    (data.models || [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''))
  );

  for (const c of candidates) {
    if (available.has(c)) {
      console.log('Selected verified model:', c);
      return c;
    }
  }
}

testSelection();
