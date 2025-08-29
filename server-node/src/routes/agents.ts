import { Router } from 'express';
import { runAnalyzer } from '../agents/analyzer';
import { runPlanning } from '../agents/architecture';
import { runGenerator } from '../agents/generator';
import { runFixer } from '../agents/fixer';
import { runTesting } from '../agents/testing';
import { runOrchestrator } from '../agents/orchestrator';

const router = Router();

router.post('/analyzer', async (req, res, next) => {
  try {
    const result = await runAnalyzer({ ...(req.body || {}), correlationId: (req as any).correlationId });
    res.json(result);
  } catch (e) { next(e); }
});

router.post('/architecture', async (req, res, next) => {
  try {
    const result = await runPlanning({ ...(req.body || {}), correlationId: (req as any).correlationId });
    res.json(result);
  } catch (e) { next(e); }
});

router.post('/generator', async (req, res, next) => {
  try {
    const result = await runGenerator({ ...(req.body || {}), correlationId: (req as any).correlationId });
    res.json(result);
  } catch (e) { next(e); }
});

router.post('/fixer', async (req, res, next) => {
  try {
    const result = await runFixer({ ...(req.body || {}), correlationId: (req as any).correlationId });
    res.json(result);
  } catch (e) { next(e); }
});

router.post('/testing', async (req, res, next) => {
  try {
    const result = await runTesting({ ...(req.body || {}), correlationId: (req as any).correlationId });
    res.json(result);
  } catch (e) { next(e); }
});

router.post('/orchestrate', async (req, res, next) => {
  try {
    const result = await runOrchestrator({ ...(req.body || {}), correlationId: (req as any).correlationId });
    res.json(result);
  } catch (e) { next(e); }
});

export default router;

