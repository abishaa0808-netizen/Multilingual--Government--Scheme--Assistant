import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import schemesData from './src/data/schemes.json' with { type: 'json' };
import {
  toolSchemeSearch,
  toolEligibilityChecker,
  toolStateFilter,
  toolSectorFilter,
  toolSchemeDetails,
  toolBenefits,
  toolApplicationInfo,
  toolOfficialSource,
  toolWhatAmIMissing,
  getAllSchemes,
} from './src/services/tools.ts';
import { runGovernmentSchemeAgent, AgentRequest } from './src/services/agent.ts';
import { SECTORS, STATES_AND_UTS, LANGUAGES, OCCUPATIONS, EDUCATION_LEVELS, Scheme } from './src/data/constants.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API Endpoints

// 1. Get schemes catalog with search and filters
app.get('/api/schemes', (req: Request, res: Response) => {
  const { q, state, sector, government } = req.query;
  let results = getAllSchemes();

  if (q && typeof q === 'string' && q.trim()) {
    const searchRes = toolSchemeSearch(q);
    results = searchRes.data as Scheme[];
  }

  if (state && typeof state === 'string' && state !== 'All-India (Central)') {
    const norm = state.toLowerCase();
    results = results.filter(
      (s) => s.state.toLowerCase() === norm || (s.government === 'Central' && s.state.toLowerCase().includes('all-india'))
    );
  }

  if (sector && typeof sector === 'string' && sector !== 'All') {
    const normSec = sector.toLowerCase();
    results = results.filter((s) => s.sector.toLowerCase() === normSec);
  }

  if (government && typeof government === 'string' && government !== 'All') {
    results = results.filter((s) => s.government.toLowerCase() === government.toLowerCase());
  }

  res.json({
    total: results.length,
    schemes: results,
  });
});

// 2. Get specific scheme by ID
app.get('/api/schemes/:id', (req: Request, res: Response) => {
  const schemeResult = toolSchemeDetails(req.params.id);
  if (!schemeResult.data) {
    res.status(404).json({ error: 'Scheme not found' });
    return;
  }
  res.json(schemeResult.data);
});

// 3. Agent Chat
app.post('/api/agent/chat', async (req: Request, res: Response) => {
  try {
    const body: AgentRequest = req.body;
    if (!body.message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const agentResponse = await runGovernmentSchemeAgent(body);
    res.json(agentResponse);
  } catch (err: any) {
    console.error('Agent chat error:', err);
    res.status(500).json({ error: 'Failed to process request', details: err?.message || 'Unknown error' });
  }
});

// 4. Personalized Eligibility Checker endpoint
app.post('/api/eligibility-check', (req: Request, res: Response) => {
  try {
    const profile = req.body;
    const result = toolEligibilityChecker(profile);
    res.json(result);
  } catch (err: any) {
    console.error('Eligibility check error:', err);
    res.status(500).json({ error: 'Eligibility calculation error' });
  }
});

// 5. "What Am I Missing?" cross-sector detector endpoint
app.post('/api/missing-schemes', (req: Request, res: Response) => {
  try {
    const { sectors = [], profile } = req.body;
    const result = toolWhatAmIMissing(sectors, profile);
    res.json(result);
  } catch (err: any) {
    console.error('Missing schemes check error:', err);
    res.status(500).json({ error: 'Failed to find cross-sector schemes' });
  }
});

// 6. Metadata constants
app.get('/api/constants', (_req: Request, res: Response) => {
  res.json({
    sectors: SECTORS,
    states: STATES_AND_UTS,
    languages: LANGUAGES,
    occupations: OCCUPATIONS,
    educationLevels: EDUCATION_LEVELS,
  });
});

// Full-stack Vite dev server or static distribution
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Government Scheme Assistant full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (process.env.VERCEL !== '1') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}
