/**
 * Session 12 Core: read one local image, send it to Gemini, print JSON-ish text.
 * Put a jpeg/png in sample-images/ (see sample-images/README.md).
 *
 *   node scripts/extract-image.js
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_DIR = path.join(__dirname, '..', 'sample-images');

const EXTRACTION_PROMPT = `Extract information from this image literally and precisely.
Do not summarize, generalize, or infer anything not explicitly visible.
Return ONLY valid JSON with:
- title: string (exact text if a title is visible, otherwise describe literally)
- summary: string (describe only what is visibly drawn or written, one sentence)
- key_points: string[] (up to 5, quoting visible labels/text exactly as written)
- framing: string ("maximization" if the goal is reaching a highest/peak point, "minimization" if reaching a lowest point, or "unclear" if not stated)
- visual_cues: string[] (list any arrows, markers, current-position indicators, or movement/direction shown in the image, even if unlabeled)
- uncertain_or_illegible: string[] (list anything you are not fully confident about, or leave empty array if none)`;

function findSampleImage() {
  if (!fs.existsSync(SAMPLE_DIR)) return null;
  const files = fs
    .readdirSync(SAMPLE_DIR)
    .filter(f => /\.(png|jpe?g|webp)$/i.test(f));
  return files[0] ? path.join(SAMPLE_DIR, files[0]) : null;
}

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

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

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Set GEMINI_API_KEY in .env');
    process.exit(1);
  }

  const imagePath = process.argv[2] || findSampleImage();
  if (!imagePath) {
    console.error(
      'No image found. Add a .jpg or .png under sample-images/ or pass a path.'
    );
    process.exit(1);
  }

  const buffer = fs.readFileSync(imagePath);
  const ai = new GoogleGenAI({ apiKey });
  const response = await generateWithRetry(ai, {
    model: 'gemini-3.5-flash-lite',
    contents: [
      {
        role: 'user',
        parts: [
          { text: EXTRACTION_PROMPT },
          {
            inlineData: {
              mimeType: mimeFor(imagePath),
              data: buffer.toString('base64'),
            },
          },
        ],
      },
    ],
  });

  console.log('File:', imagePath);
  console.log(response.text);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
