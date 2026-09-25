/**
 * Session 11 Core: tools the model may request; your code executes them.
 * Never eval() or Function() on model-supplied strings.
 */

import { retrieveRelevantChunks } from './rag.js';

function tokenize(expression) {
  const tokens = [];
  const src = String(expression).replace(/\s+/g, '');
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if ('+-*/()'.includes(ch)) {
      tokens.push(ch);
      i += 1;
      continue;
    }
    if (/\d/.test(ch) || ch === '.') {
      let num = '';
      while (i < src.length && /[\d.]/.test(src[i])) {
        num += src[i];
        i += 1;
      }
      tokens.push(Number(num));
      continue;
    }
    throw new Error('Unsupported expression');
  }
  return tokens;
}

function parseExpr(tokens) {
  let pos = 0;

  function peek() {
    return tokens[pos];
  }

  function consume() {
    const t = tokens[pos];
    pos += 1;
    return t;
  }

  function factor() {
    const t = peek();
    if (t === '(') {
      consume();
      const v = add();
      if (consume() !== ')') throw new Error('Unsupported expression');
      return v;
    }
    if (typeof t === 'number') return consume();
    if (t === '-') {
      consume();
      return -factor();
    }
    throw new Error('Unsupported expression');
  }

  function mul() {
    let v = factor();
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const r = factor();
      v = op === '*' ? v * r : v / r;
    }
    return v;
  }

  function add() {
    let v = mul();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const r = mul();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }

  const value = add();
  if (pos !== tokens.length) throw new Error('Unsupported expression');
  return value;
}

export function safeCalculate(expression) {
  const result = parseExpr(tokenize(expression));
  if (typeof result !== 'number' || Number.isNaN(result)) {
    throw new Error('Not a number');
  }
  return result;
}

/**
 * @param {string} name
 * @param {Record<string, unknown>} args
 * @param {{ ai?: import('@google/genai').GoogleGenAI }} [ctx]
 */
export async function executeTool(name, args, ctx = {}) {
  if (name === 'calculate') {
    try {
      return String(safeCalculate(args.expression));
    } catch (err) {
      return `Error: ${err.message}`;
    }
  }
  if (name === 'get_upcoming_deadlines') {
    return getUpcomingDeadlines();
  }
  if (name === 'search_knowledge_base') {
    const chunks = await retrieveRelevantChunks(ctx.ai, String(args.query ?? ''), 2);
    if (!chunks.length || chunks[0].score < 0.5) {
      return 'No relevant information found in knowledge base.';
    }
    return chunks.map((c) => `[${c.file}]: ${String(c.content).slice(0, 500)}`).join('\n\n');
    
  }
  return `Unknown tool: ${name}`;
}

/** Hardcoded academic calendar for tool calling demos. */
export function getUpcomingDeadlines() {
  return {
    deadlines: [
      { item: 'Assignment 1', due: 'Friday', notes: 'Must be written in JavaScript. No external libraries.' },
      { item: 'Midterm', due: 'Oct 15', notes: 'Covers Lecture 1 (Big O) and syllabus policies.' },
    ],
  };
}

export const deadlinesTool = {
  name: 'get_upcoming_deadlines',
  description:
    'Fetches upcoming academic deadlines from the course calendar. Use when the user asks about due dates, exams, or what is coming up.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Optional filter, e.g. assignments or exams' },
    },
  },
};

export const calculatorTool = {
  name: 'calculate',
  description:
    'Evaluate a simple arithmetic expression and return the result. Use (15 / 100) * 2340 for percentages, not the % sign.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Arithmetic only: + - * / ( ). Example: (15 / 100) * 2340',
      },
    },
    required: ['expression'],
  },
};

/** Session 11 Core: register this next to calculatorTool in queryWithTools. */
export const searchKnowledgeBaseTool = {
  name: 'search_knowledge_base',
  description:
    'Search the course knowledge base (Obsidian vault embeddings) for relevant notes.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Natural language search query',
      },
    },
    required: ['query'],
  },
};

const MODEL = 'gemini-3.5-flash-lite';

async function generateWithRetry(ai, params, retries = 3) {
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
/**
 * Session 11: bounded tool loop. Wire from POST /tools (keep RAG on /query).
 * Core: uncomment searchKnowledgeBaseTool and finish executeTool search branch.
 */
export async function queryWithTools(ai, userMessage, maxRounds = 4) {
  const config = {
    tools: [
      {
        functionDeclarations: [
          calculatorTool,
          searchKnowledgeBaseTool,
          deadlinesTool,
        ],
      },
    ],
  };
  const contents = [{ role: 'user', parts: [{ text: userMessage }] }];

  for (let round = 0; round < maxRounds; round += 1) {
    const response = await generateWithRetry(ai, {
      model: MODEL,
      contents,
      config,
    });

    const calls = response.functionCalls;
    if (!calls?.length) {
      return response.text ?? '';
    }

    const modelContent = response.candidates?.[0]?.content;
    if (modelContent) contents.push(modelContent);

    const parts = [];
    for (const toolCall of calls) {
      const args = toolCall.args ?? {};
      console.log('Tool call:', toolCall.name, args);
      const result = await executeTool(toolCall.name, args, { ai });
      console.log('Tool result:', result);
      parts.push({
        functionResponse: {
          name: toolCall.name,
          response: { result },
          id: toolCall.id,
        },
      });
    }
    contents.push({ role: 'user', parts });
  }

  return 'Tool loop stopped after the maximum number of rounds.';
}
