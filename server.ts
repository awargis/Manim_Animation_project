import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support base64 screenshot payloads up to 15MB
  app.use(express.json({ limit: '15mb' }));

  app.post('/api/analyze-screenshot', async (req, res) => {
    try {
      const { imageBase64, mimeType, outroHookText, extraNotes } = req.body;

      if (!imageBase64 || !mimeType) {
        res.status(400).json({ error: 'Please provide an image screenshot to analyze.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const hookPhrase = outroHookText || 'Physics Lovers, Answer Batao?';

      const promptText = `You are a Principal Physics Animator & Manim Community (v0.18+) Engineer at a top EdTech company creating 9:16 vertical shorts (1080x1920, 60fps, ~16s duration) for I.E. Irodov problems.

Analyze this uploaded physics problem screenshot and generate:
1. Exact question number (e.g., "IRODOV 1.61"), chapter/topic title, clean problem statement, sub-questions, given parameter labels, and final analytical answers for (a) and (b).
2. A clear Hinglish (Hindi + English) conceptual explanation of what the question is actually saying and why the physical system behaves that way.
3. A 4-act storyboard covering:
   - Act 1 (0.0s - 3.5s): Question & Given Parameters Reveal
   - Act 2 (3.5s - 8.5s): Free-Body Diagram & Step-by-Step Force Decomposition
   - Act 3 (8.5s - 13.0s): Dynamic Motion Simulation
   - Act 4 (13.0s - 16.0s): "${hookPhrase}" interactive challenge hook
4. A complete, self-contained, 100% runnable Python Manim Community script (class IrodovVerticalMasterpiece(Scene)) configured for 9:16 aspect ratio (config.pixel_width = 1080, config.pixel_height = 1920, config.frame_width = 9.0, config.frame_height = 16.0, config.frame_rate = 60).
   - Must include a safe procedural WAV background sound generator using Python's built-in wave + numpy wrapped in try...except so it adds ambient sound via self.add_sound() if possible, and NEVER throws an error if audio fails.
   - Must animate the question number at the top, step-by-step hyper-realistic vector diagram in the middle, motion via ValueTracker, and end with the "${hookPhrase}" card at the bottom.
${extraNotes ? `Additional user instructions: ${extraNotes}` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questionNumber: { type: Type.STRING },
              chapterTitle: { type: Type.STRING },
              statement: { type: Type.STRING },
              subQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              givenBadges: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              answerSummaryA: { type: Type.STRING },
              answerSummaryB: { type: Type.STRING },
              conceptSummaryHinglish: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.STRING },
                    title: { type: Type.STRING },
                    timeRange: { type: Type.STRING },
                    narrationHinglish: { type: Type.STRING },
                    visualFocus: { type: Type.STRING },
                    keyFormula: { type: Type.STRING },
                  },
                  required: [
                    'stepNumber',
                    'title',
                    'timeRange',
                    'narrationHinglish',
                    'visualFocus',
                    'keyFormula',
                  ],
                },
              },
              customManimBody: {
                type: Type.STRING,
                description: 'Complete runnable Python Manim script for 9:16 vertical video with safe try/except WAV audio.',
              },
            },
            required: [
              'questionNumber',
              'chapterTitle',
              'statement',
              'subQuestions',
              'givenBadges',
              'answerSummaryA',
              'answerSummaryB',
              'conceptSummaryHinglish',
              'steps',
              'customManimBody',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({ error: 'Empty response from Gemini model.' });
        return;
      }

      const parsed = JSON.parse(rawText.trim());
      res.json(parsed);
    } catch (error: unknown) {
      console.error('Error analyzing screenshot:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to analyze screenshot with Gemini.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Irodov Manim Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
