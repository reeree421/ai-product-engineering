# Track 1: Context-Aware Academic Assistant

**The Problem / Concept**
Generic AI hallucinates syllabus details and teaches methods different from the professor's.

## Project Overview & Objectives
Students often struggle when using generic LLMs for studying because the AI doesn't know the specific grading rubrics, syllabus constraints, or idiosyncratic methods taught by their professor. This project builds a hyper-local, context-aware academic assistant that refuses to answer questions outside of the provided course material.

If you select this track, your goal is to build a functional Minimum Viable Prototype (MVP) that seamlessly integrates a Node.js/Express backend with Google's Gemini API, utilizing Retrieval-Augmented Generation (RAG), multimodal vision, and autonomous tool calling.

## My Implementation Notes
This track's vault covers Artificial Intelligence II (UFCF9S-15-2) optimization
topics: local search, evolutionary algorithms, and search operators. The
assistant answers grounded questions from `sample-vault/01-Concepts/` and
supports calculator, deadline, and knowledge-base search tools via `/tools`.
See `03-Project/Architecture.md` for the system diagram and
`03-Project/Evaluation-Report.md` for eval results.

## Detailed Requirements Document (PRD)

### 1. RAG (Obsidian) Core Requirement
To prevent hallucination, the AI must be grounded in a specific, personal knowledge base. You will build this using Markdown files in Obsidian.

* **Knowledge Base Content**: Create an Obsidian vault containing 5-10 markdown files representing lecture notes, course syllabus, and assignment prompts. The AI must retrieve relevant chunks and cite the specific file when answering.
* **Starter Vault**: Check the `sample-vault/` directory in this branch for pre-populated mock data to test your pipeline immediately!

### 2. Multimodal (Vision) Stretch Goal
AI is not just text. Modern products must perceive the world.

* **Vision Use Case**: The user interface should allow uploading an image. The AI uses Gemini's Vision capabilities to extract the text/structure and explains it using only the principles found in the RAG notes.

### 3. Tool Calling Stretch Goal
Agents need to take actions in the real world or fetch real-time data that isn't in their RAG database.

* **Tool Definition**: Implement a tool-calling schema that can trigger an action like get_upcoming_deadlines(). This tool should return hardcoded JSON of deadlines.

---

## Starter Kit Instructions
This repository contains the Node/Express starter kit.
1. Run `npm install`
2. Copy `.env.example` to `.env` and add your Gemini API Key.
3. Run `npm run dev`
