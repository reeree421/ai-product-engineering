# Prompts library

## System prompt
[Session 2 system prompt]
response
--------
**Hill Climbing** is a heuristic search algorithm used in Artificial Intelligence... 


## Extraction / domain prompts
## Extraction / domain prompts

### Image extraction prompt (Lab 12, final iterated version)
\`\`\`
Extract information from this image literally and precisely.
Do not summarize, generalize, or infer anything not explicitly visible.
Return ONLY valid JSON with:
- title: string
- summary: string
- key_points: string[] (up to 5, quoting visible labels/text exactly)
- framing: string ("maximization"/"minimization"/"unclear")
- visual_cues: string[] (arrows, markers, movement indicators)
- uncertain_or_illegible: string[]
\`\`\`

### Sample output (Hill-Climbing.png, after iteration)
\`\`\`json
{
  "title": "Objective Function versus State Space graph",
  "key_points": ["global maximum", "local maximum", "Shoulder", "Current State"],
  "framing": "maximization",
  "visual_cues": ["Dark green circle marker labeled 'Current State'", "Black arrow pointing upward from Current State"]
}
\`\`\`
