import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import {
  toolSchemeSearch,
  toolEligibilityChecker,
  toolSchemeDetails,
  toolWhatAmIMissing,
  getAllSchemes,
} from './services/tools.ts';
import { runGovernmentSchemeAgent, AgentRequest } from './services/agent.ts';
import { SECTORS, STATES_AND_UTS, LANGUAGES, OCCUPATIONS, EDUCATION_LEVELS, Scheme } from './data/constants.ts';

dotenv.config();

const apiApp = express();
apiApp.use(express.json());

// Support both /api/... and unprefixed paths in case Vercel rewrites strip or keep /api
function registerRoute(method: 'get' | 'post', pathStr: string, handler: any) {
  const unprefixed = pathStr.replace(/^\/api/, '');
  (apiApp as any)[method](pathStr, handler);
  if (unprefixed && unprefixed !== pathStr) {
    (apiApp as any)[method](unprefixed, handler);
  }
}

// 1. Schemes catalog with search and filters
registerRoute('get', '/api/schemes', (req: Request, res: Response) => {
  try {
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
  } catch (err: any) {
    console.error('Schemes fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve schemes', details: err?.message });
  }
});

// 2. Specific scheme by ID
registerRoute('get', '/api/schemes/:id', (req: Request, res: Response) => {
  try {
    const schemeResult = toolSchemeDetails(req.params.id);
    if (!schemeResult.data) {
      res.status(404).json({ error: 'Scheme not found' });
      return;
    }
    res.json(schemeResult.data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve scheme' });
  }
});

// 3. Agent Chat
registerRoute('post', '/api/agent/chat', async (req: Request, res: Response) => {
  try {
    const body: AgentRequest = req.body;
    if (!body?.message) {
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

// 4. Eligibility check
registerRoute('post', '/api/eligibility-check', (req: Request, res: Response) => {
  try {
    const profile = req.body;
    const result = toolEligibilityChecker(profile);
    res.json(result);
  } catch (err: any) {
    console.error('Eligibility check error:', err);
    res.status(500).json({ error: 'Eligibility calculation error' });
  }
});

// 5. Missing schemes check
registerRoute('post', '/api/missing-schemes', (req: Request, res: Response) => {
  try {
    const { sectors = [], profile } = req.body;
    const result = toolWhatAmIMissing(sectors, profile);
    res.json(result);
  } catch (err: any) {
    console.error('Missing schemes check error:', err);
    res.status(500).json({ error: 'Failed to find cross-sector schemes' });
  }
});

// 6. Constants
registerRoute('get', '/api/constants', (_req: Request, res: Response) => {
  res.json({
    sectors: SECTORS,
    states: STATES_AND_UTS,
    languages: LANGUAGES,
    occupations: OCCUPATIONS,
    educationLevels: EDUCATION_LEVELS,
  });
});

export default apiApp;
