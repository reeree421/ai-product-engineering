/**
 * Walk sample-vault (or VAULT_PATH), split markdown into chunks, embed with
 * gemini-embedding-2, write embeddings.json.
 *
 *   npm run build-embeddings
 *   VAULT_PATH=../my-vault npm run build-embeddings
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { embedText, splitMarkdownChunks } from '../lib/embeddings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const MAX_NOTES = 10;
const vaultPath = process.env.VAULT_PATH || path.join(root, 'sample-vault');

function listMarkdown(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdown(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Set GEMINI_API_KEY in .env');
    process.exit(1);
  }

  const files = listMarkdown(vaultPath).slice(0, MAX_NOTES);
  if (!files.length) {
    console.error(`No .md files under ${vaultPath}. Set VAULT_PATH or add notes.`);
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const embeddingsData = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = path.relative(vaultPath, file);
    const chunks = splitMarkdownChunks(content);
    if (!chunks.length) {
      console.log('Skipping empty', rel);
      continue;
    }
    console.log(`Embedding ${rel} (${chunks.length} chunk${chunks.length === 1 ? '' : 's'})`);
    for (let i = 0; i < chunks.length; i += 1) {
      try {
        const embedding = await embedText(ai, chunks[i], 'RETRIEVAL_DOCUMENT', rel);
        embeddingsData.push({
          file: rel,
          chunkIndex: i,
          content: chunks[i],
          embedding,
        });
      } catch (err) {
        console.error('Failed on', rel, `chunk ${i}`, err.message);
        process.exit(1);
      }
    }
  }

  const outPath = path.join(root, 'embeddings.json');
  fs.writeFileSync(outPath, JSON.stringify(embeddingsData, null, 2));
  console.log(`Wrote ${embeddingsData.length} chunks → ${outPath}`);
}

main();
