/**
 * Session 9 Core: retrieve → augment → generate.
 */

import fs from 'node:fs';
import path from 'node:path';
import { cosineSimilarity, embedText } from './embeddings.js';

function loadEmbeddingStore() {
  const storePath = path.join(process.cwd(), 'embeddings.json');
  if (!fs.existsSync(storePath)) return [];
  return JSON.parse(fs.readFileSync(storePath, 'utf8'));
}

export async function retrieveRelevantChunks(ai, query, topK = 3) {
  const store = loadEmbeddingStore();
  if (!store.length || !query) return [];

  const queryEmbedding = await embedText(ai, query, 'RETRIEVAL_QUERY');
  return store
    .map((item) => ({
      file: item.file,
      chunkIndex: item.chunkIndex,
      content: item.content,
      score: cosineSimilarity(queryEmbedding, item.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function buildRagPrompt(query, chunks) {
  const context = chunks
    .map((c) => `[Source: ${c.file}]\n${String(c.content).slice(0, 1500)}`)
    .join('\n\n---\n\n');
  return `CONTEXT:\n${context}\n\nQUESTION:\n${query}`;
}

export function buildRagSystemPrompt(chunks) {
  if (!chunks.length) {
    return 'No course notes were retrieved. Say you do not have enough context rather than inventing syllabus details.';
  }
  const context = chunks
    .map((c) => {
      const score = Number.isFinite(c.score) ? ` score=${c.score.toFixed(3)}` : '';
      return `--- ${c.file}${score} ---\n${c.content}`;
    })
    .join('\n\n');
  return (
    'Use only the following retrieved course notes to answer the user. ' +
    'Cite the source file name. If the notes are not enough, say so.\n\n' +
    'Context:\n' +
    context
  );
}

export async function ragQuery(ai, userQuestion) {
  const chunks = await retrieveRelevantChunks(ai, userQuestion, 3);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userQuestion,
    config: { systemInstruction: buildRagSystemPrompt(chunks) },
  });
  return {
    answer: response.text,
    sources: chunks.map((c) => c.file),
    topScore: chunks[0]?.score ?? 0,
  };
}
