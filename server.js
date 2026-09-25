import express from 'express';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { buildRagSystemPrompt, retrieveRelevantChunks } from './lib/rag.js';
import { executeTool, calculatorTool, deadlinesTool, searchKnowledgeBaseTool } from './lib/tools.js';
import { queryWithTools } from './lib/tools.js';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateWithRetry(params, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      const retryable = err?.status === 503 || err?.status === 429;
      if (!retryable || attempt === retries) throw err;
      const delay = 1000 * 2 ** attempt;
      console.warn(`Model busy (${err.status}), retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

const tools = [{ functionDeclarations: [calculatorTool, deadlinesTool, searchKnowledgeBaseTool] }];

app.post('/query', async (req, res) => {
  try {
    const userInput = req.body.userInput ?? req.body.prompt ?? req.body.query;
    const { base64Image, mimeType } = req.body;

    const chunks = await retrieveRelevantChunks(ai, userInput, 3);
    const sysPrompt = buildRagSystemPrompt(chunks);

    const userParts = [{ text: userInput }];
    if (base64Image) {
      userParts.unshift({ inlineData: { data: base64Image, mimeType } });
    }

    const contents = [{ role: 'user', parts: userParts }];

    let response = await generateWithRetry({
      model: 'gemini-3.5-flash-lite',
      contents,
      config: { systemInstruction: sysPrompt, tools },
    });

    // Handle every tool call the model requests, not just the first
    while (response.functionCalls && response.functionCalls.length > 0) {
      const modelContent = response.candidates?.[0]?.content;
      if (modelContent) {
        contents.push(modelContent);
      }

      const toolResults = await Promise.all(
        response.functionCalls.map(async (fc) => ({
          functionResponse: {
            name: fc.name,
            response: { result: await executeTool(fc.name, fc.args, { ai }) },
            id: fc.id,
          },
        }))
      );

      contents.push({ role: 'user', parts: toolResults });

      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents,
        config: { systemInstruction: sysPrompt, tools },
      });
    }

    res.json({ response: response.text, sources: chunks.map((c) => c.file) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ response: error.message });
  }
});
app.post('/tools', async (req, res) => {
  try {
    const text = await queryWithTools(ai, req.body.query);
    return res.json({ response: text, sources: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));