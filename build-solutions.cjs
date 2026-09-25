const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoPath = 'c:\\\\Users\\\\Arjan\\\\OneDrive\\\\Documents\\\\GitHub\\\\ai-product-engineering';
process.chdir(repoPath);

const tracks = [
  { track: 1, slug: 'context-aware-academic-assistant', title: 'Context-Aware Academic Assistant', toolName: 'get_upcoming_deadlines', toolDesc: 'Fetches academic deadlines', toolMockResult: '{ "deadlines": ["Assignment 1 due Friday", "Midterm on Oct 15"] }' },
  { track: 2, slug: 'smart-pantry-recipe-architect', title: 'Smart Pantry & Recipe Architect', toolName: 'calculate_nutrition', toolDesc: 'Calculates nutrition for ingredients', toolMockResult: '{ "calories": 450, "protein": "20g", "carbs": "50g" }' },
  { track: 3, slug: 'local-hardware-troubleshooting-bot', title: 'Local Hardware Troubleshooting Bot', toolName: 'ping_device', toolDesc: 'Pings an IP address', toolMockResult: '{ "status": "offline", "latency_ms": null }' },
  { track: 4, slug: 'travel-log-itinerary-copilot', title: 'Travel Log & Itinerary Copilot', toolName: 'convert_currency', toolDesc: 'Converts currency to NPR', toolMockResult: '{ "cost_npr": "4,500 NPR" }' },
  { track: 5, slug: 'personal-fitness-rehab-coach', title: 'Personal Fitness & Rehab Coach', toolName: 'generate_workout_timer', toolDesc: 'Generates a timer for sets', toolMockResult: '{ "timer_url": "http://localhost:3000/timer?sec=60" }' },
  { track: 6, slug: 'automated-expense-tax-analyst', title: 'Automated Expense & Tax Analyst', toolName: 'export_to_sheets', toolDesc: 'Exports data to Google Sheets', toolMockResult: '{ "status": "success", "sheet_row": 142 }' },
  { track: 7, slug: 'household-plant-care-botany-assistant', title: 'Household Plant Care & Botany Assistant', toolName: 'check_local_weather', toolDesc: 'Checks weather forecast', toolMockResult: '{ "temp_c": 8, "forecast": "frost warning" }' },
  { track: 8, slug: 'tabletop-rpg-board-game-master', title: 'Tabletop RPG / Board Game Master', toolName: 'roll_dice', toolDesc: 'Rolls dice', toolMockResult: '{ "roll_total": 18, "dice": [6, 6, 4, 2] }' },
  { track: 9, slug: 'local-heritage-architecture-guide', title: 'Local Heritage & Architecture Guide', toolName: 'get_walking_distance', toolDesc: 'Gets walking distance to next site', toolMockResult: '{ "distance_km": 1.2, "time_mins": 15 }' },
  { track: 10, slug: 'home-maintenance-diy-helper', title: 'Home Maintenance & DIY Helper', toolName: 'email_landlord', toolDesc: 'Emails the landlord for repair', toolMockResult: '{ "status": "sent", "ticket_id": "REQ-0042" }' }
];

function writePhase1UI(trackTitle) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${trackTitle}</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    textarea { width: 100%; height: 100px; margin-bottom: 1rem; }
    #output { margin-top: 2rem; padding: 1rem; background: #f0f0f0; border-radius: 8px; white-space: pre-wrap;}
    .hidden { display: none; }
  </style>
</head>
<body>
  <h1>${trackTitle}</h1>
  <textarea id="prompt" placeholder="Enter your prompt here..."></textarea>
  <br>
  <button id="submitBtn">Send</button>
  <p id="loading" class="hidden">Loading...</p>
  <div id="output"></div>

  <script>
    document.getElementById('submitBtn').addEventListener('click', async () => {
      const prompt = document.getElementById('prompt').value;
      const output = document.getElementById('output');
      const loading = document.getElementById('loading');
      
      output.innerText = '';
      loading.classList.remove('hidden');

      try {
        const res = await fetch('/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        output.innerText = data.response;
      } catch (err) {
        output.innerText = 'Error: ' + err.message;
      } finally {
        loading.classList.add('hidden');
      }
    });
  </script>
</body>
</html>`;
  fs.mkdirSync(path.join(repoPath, 'public'), { recursive: true });
  fs.writeFileSync(path.join(repoPath, 'public', 'index.html'), html);
}

function writePhase1Server() {
  const code = `import express from 'express';
const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/query', (req, res) => {
  const { prompt } = req.body;
  res.json({ response: "This is a mock response to: " + prompt });
});

app.listen(3000, () => console.log('Server running on port 3000'));`;
  fs.writeFileSync(path.join(repoPath, 'server.js'), code);
}

function writePhase2Server() {
  const code = `import express from 'express';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/query', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt
    });
    res.json({ response: response.text });
  } catch (error) {
    res.status(500).json({ response: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));`;
  fs.writeFileSync(path.join(repoPath, 'server.js'), code);
}

function writePhase3Server() {
  const code = `import express from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Extremely simplified RAG mock implementation
function getMockRagContext() {
  const vaultPath = path.join(process.cwd(), 'sample-vault');
  let context = '';
  if (fs.existsSync(vaultPath)) {
    const files = fs.readdirSync(vaultPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      context += '\\n--- ' + file + ' ---\\n' + fs.readFileSync(path.join(vaultPath, file), 'utf8');
    }
  }
  return context;
}

app.post('/query', async (req, res) => {
  try {
    const { prompt } = req.body;
    const context = getMockRagContext();
    
    const sysPrompt = "Use the following context to answer the user.\\nContext:\\n" + context;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: { systemInstruction: sysPrompt }
    });
    res.json({ response: response.text });
  } catch (error) {
    res.status(500).json({ response: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));`;
  fs.writeFileSync(path.join(repoPath, 'server.js'), code);
}

function writePhase4UI(trackTitle) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${trackTitle}</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    textarea { width: 100%; height: 100px; margin-bottom: 1rem; }
    #output { margin-top: 2rem; padding: 1rem; background: #f0f0f0; border-radius: 8px; white-space: pre-wrap;}
    .hidden { display: none; }
  </style>
</head>
<body>
  <h1>${trackTitle}</h1>
  <textarea id="prompt" placeholder="Enter your prompt here..."></textarea>
  <br>
  <input type="file" id="imageInput" accept="image/*">
  <br><br>
  <button id="submitBtn">Send</button>
  <p id="loading" class="hidden">Loading...</p>
  <div id="output"></div>

  <script>
    document.getElementById('submitBtn').addEventListener('click', async () => {
      const prompt = document.getElementById('prompt').value;
      const fileInput = document.getElementById('imageInput');
      const output = document.getElementById('output');
      const loading = document.getElementById('loading');
      
      output.innerText = '';
      loading.classList.remove('hidden');

      let base64Image = null;
      let mimeType = null;

      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        mimeType = file.type;
        const reader = new FileReader();
        base64Image = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(file);
        });
      }

      try {
        const res = await fetch('/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, base64Image, mimeType })
        });
        const data = await res.json();
        output.innerText = data.response;
      } catch (err) {
        output.innerText = 'Error: ' + err.message;
      } finally {
        loading.classList.add('hidden');
      }
    });
  </script>
</body>
</html>`;
  fs.writeFileSync(path.join(repoPath, 'public', 'index.html'), html);
}

function writePhase4Server(t) {
  const code = `import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function getMockRagContext() {
  const vaultPath = path.join(process.cwd(), 'sample-vault');
  let context = '';
  if (fs.existsSync(vaultPath)) {
    const files = fs.readdirSync(vaultPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      context += '\\n--- ' + file + ' ---\\n' + fs.readFileSync(path.join(vaultPath, file), 'utf8');
    }
  }
  return context;
}

const trackTool = {
  name: "${t.toolName}",
  description: "${t.toolDesc}",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "Information needed" }
    }
  }
};

app.post('/query', async (req, res) => {
  try {
    const { prompt, base64Image, mimeType } = req.body;
    const context = getMockRagContext();
    const sysPrompt = "Use the following context to answer the user.\\nContext:\\n" + context;
    
    let contents = [];
    if (base64Image) {
      contents.push({ inlineData: { data: base64Image, mimeType: mimeType }});
    }
    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: contents,
      config: { 
        systemInstruction: sysPrompt,
        tools: [{ functionDeclarations: [trackTool] }]
      }
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
       // Mock handling the tool call
       const finalResponse = await ai.models.generateContent({
         model: 'gemini-3.5-flash-lite',
         contents: [
            { text: prompt },
            { functionCall: response.functionCalls[0] },
            { functionResponse: { name: "${t.toolName}", response: ${t.toolMockResult} } }
         ]
       });
       res.json({ response: finalResponse.text });
    } else {
       res.json({ response: response.text });
    }
  } catch (error) {
    res.status(500).json({ response: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));`;
  fs.writeFileSync(path.join(repoPath, 'server.js'), code);
}


try {
  console.log("Switching to main branch...");
  execSync("git checkout main");

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const padNum = t.track.toString().padStart(2, "0");
    const baseBranch = "track-" + padNum + "-" + t.slug;
    const solutionBranch = "solution-" + baseBranch;
    console.log("\\nProcessing branch " + solutionBranch + "...");

    // Checkout base branch
    execSync("git checkout " + baseBranch);
    
    // Create solution branch
    try { execSync("git branch -D " + solutionBranch); } catch(e) {}
    execSync("git checkout -b " + solutionBranch);

    // Phase 1
    writePhase1UI(t.title);
    writePhase1Server();
    execSync("git add .");
    execSync('git commit -m "Phase 1: UI & Mock Backend"');

    // Phase 2
    writePhase2Server();
    execSync("git add .");
    execSync('git commit -m "Phase 2: Vanilla Gemini Integration"');

    // Phase 3
    writePhase3Server();
    execSync("git add .");
    execSync('git commit -m "Phase 3: The RAG Pipeline"');

    // Phase 4
    writePhase4UI(t.title);
    writePhase4Server(t);
    execSync("git add .");
    execSync('git commit -m "Phase 4: Multimodal & Tools"');
  }

  execSync("git checkout main");
  console.log("\\nAll solution branches created successfully!");

} catch (error) {
  console.error("Error:", error.stdout ? error.stdout.toString() : error);
}
