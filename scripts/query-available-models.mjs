import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync('.env', 'utf8');
let apiKey = '';
for (const line of envContent.split('\n')) {
  if (line.trim().startsWith('GEMINI_API_KEY=')) {
    apiKey = line.trim().slice('GEMINI_API_KEY='.length).replace(/["']/g, '').trim();
  }
}

if (!apiKey) {
  console.error('API key not found');
  process.exit(1);
}

async function listGoogleModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('ListModels HTTP error:', res.status, res.statusText);
      const text = await res.text();
      console.error(text);
      return;
    }
    const data = await res.json();
    console.log('Available models from Google for this API key:');
    const supported = [];
    for (const m of (data.models || [])) {
      const name = m.name.replace('models/', '');
      const methods = m.supportedGenerationMethods || [];
      if (methods.includes('generateContent')) {
        supported.push({
          name,
          displayName: m.displayName,
          inputTokenLimit: m.inputTokenLimit,
          outputTokenLimit: m.outputTokenLimit,
          methods
        });
      }
    }
    console.log(JSON.stringify(supported, null, 2));
  } catch (err) {
    console.error('Error fetching models:', err.message);
  }
}

listGoogleModels();
