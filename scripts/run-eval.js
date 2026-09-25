/**
 * Session 13 Core: POST each test-suite.json question to /query and print for scoring.
 *
 *   # terminal 1: npm run dev
 *   # terminal 2: npm run eval
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const suitePath = path.join(root, 'test-suite.json');
const baseUrl = process.env.APP_URL || 'http://localhost:3000';

async function main() {
  if (!fs.existsSync(suitePath)) {
    console.error('Create test-suite.json with [{ "question", "expected", "category" }, ...]');
    process.exit(1);
  }

  const cases = JSON.parse(fs.readFileSync(suitePath, 'utf8'));
  const limit = Math.min(cases.length, Number(process.env.EVAL_LIMIT || 15));
  const rl = readline.createInterface({ input, output });
  const results = [];

  for (let i = 0; i < limit; i += 1) {
    const c = cases[i];
    const res = await fetch(`${baseUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: c.question }),
    });
    const data = await res.json();
    const actual = data.response || data.answer || JSON.stringify(data);

    console.log('\n---');
    console.log(`Q: ${c.question}`);
    console.log(`Expected: ${c.expected}`);
    console.log(`Actual: ${actual}`);

    const correctness = Number(await rl.question('Correctness (1-5): '));
    const relevance = Number(await rl.question('Relevance (1-5): '));
    const notes = await rl.question('Notes (optional): ');
    results.push({ question: c.question, correctness, relevance, notes });
  }

  rl.close();
  const out = path.join(root, 'eval-results.json');
  fs.writeFileSync(out, JSON.stringify(results, null, 2));
  const avgC = results.reduce((s, r) => s + r.correctness, 0) / results.length;
  const avgR = results.reduce((s, r) => s + r.relevance, 0) / results.length;
  console.log(`\nAverage Correctness: ${avgC.toFixed(1)}/5`);
  console.log(`Average Relevance: ${avgR.toFixed(1)}/5`);
  console.log('Wrote', out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
