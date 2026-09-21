/**
 * Session 8 Core: generate embeddings and cosine similarity.
 * Session 9 uses retrieveRelevantChunks() from here (or from rag.js).
 */

export const EMBEDDING_MODEL = 'gemini-embedding-2';
export const EMBEDDING_DIMENSIONS = 768;

export function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/** gemini-embedding-2 uses prompt prefixes instead of taskType. */
export function formatEmbeddingInput(text, taskType = 'RETRIEVAL_DOCUMENT', title) {
  const content = String(text ?? '');
  if (taskType === 'RETRIEVAL_QUERY') {
    return `task: question answering | query: ${content}`;
  }
  const docTitle = title && String(title).trim() ? String(title).trim() : 'none';
  return `title: ${docTitle} | text: ${content}`;
}

/**
 * Split markdown into overlapping chunks for retrieval.
 * Prefers heading / paragraph boundaries, then hard-wraps long sections.
 */
export function splitMarkdownChunks(markdown, { maxChars = 900, overlap = 100 } = {}) {
  const text = String(markdown ?? '').replace(/\r\n/g, '\n').trim();
  if (!text) return [];

  const sections = text
    .split(/(?=^#{1,6}\s)/m)
    .flatMap((s) => s.split(/\n{2,}/))
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks = [];
  let buf = '';

  function flush() {
    if (buf) chunks.push(buf);
    buf = '';
  }

  function pushLong(section) {
    const step = Math.max(1, maxChars - overlap);
    for (let i = 0; i < section.length; i += step) {
      chunks.push(section.slice(i, i + maxChars));
    }
  }

  for (const section of sections) {
    if (section.length > maxChars) {
      flush();
      pushLong(section);
      continue;
    }
    if (!buf) {
      buf = section;
    } else if (buf.length + 2 + section.length <= maxChars) {
      buf = `${buf}\n\n${section}`;
    } else {
      flush();
      buf = section;
    }
  }
  flush();
  return chunks;
}

export async function embedText(ai, text, taskType = 'RETRIEVAL_DOCUMENT', title) {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: formatEmbeddingInput(text, taskType, title),
    config: { outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  const values = response.embeddings?.[0]?.values;
  if (!values?.length) {
    throw new Error('embedContent returned no embedding values');
  }
  return values;
}
