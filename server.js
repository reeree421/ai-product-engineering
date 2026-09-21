import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';
import { buildRagSystemPrompt, retrieveRelevantChunks } from './lib/rag.js';

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const trackTool = {
  name: "get_upcoming_deadlines",
  description: "Fetches academic deadlines",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "Information needed" }
    }
  }
};

app.post('/query', async (req, res) => {
  try {
    const userInput = req.body.userInput ?? req.body.prompt ?? req.body.query;
    const { base64Image, mimeType } = req.body;
    const chunks = await retrieveRelevantChunks(ai, userInput, 3);
    const sysPrompt = buildRagSystemPrompt(chunks);

    let contents = userInput;
    if (base64Image) {
      contents = [
        { inlineData: { data: base64Image, mimeType } },
        userInput
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: sysPrompt,
        tools: [{ functionDeclarations: [trackTool] }]
      }
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
       const finalResponse = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: [
            { text: userInput },
            { functionCall: response.functionCalls[0] },
            { functionResponse: { name: "get_upcoming_deadlines", response: { "deadlines": ["Assignment 1 due Friday", "Midterm on Oct 15"] } } }
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

app.listen(3000, () => console.log('Server running on port 3000'));