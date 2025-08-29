import { OrchestratorInput, OrchestratorOutput } from '../types/agents';
import { runAnalyzer } from './analyzer';
import { runPlanning } from './architecture';
import { runGenerator } from './generator';
import { runFixer } from './fixer';
import { runTesting } from './testing';

export async function runOrchestrator(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const steps: OrchestratorOutput['steps'] = [];
  const artifacts: OrchestratorOutput['artifacts'] = [];
  const reports: OrchestratorOutput['reports'] = {};

  try {
    const analysis = await runAnalyzer({ sources: {}, correlationId: input.correlationId });
    reports.analysis = analysis;
    steps.push({ name: 'analysis', status: 'ok', summary: 'Codebase analyzed (stub)' });

    const planning = await runPlanning({ requirements: input.initialRequirements, correlationId: input.correlationId });
    reports.planning = planning;
    steps.push({ name: 'planning', status: 'ok', summary: 'Architecture planned (stub)' });

    const generation = await runGenerator({ specs: planning, correlationId: input.correlationId });
    reports.generation = generation;
    artifacts.push(...generation.artifacts);
    steps.push({ name: 'generation', status: 'ok', summary: 'Code generated (stub)' });

    const fixing = await runFixer({ targets: [], correlationId: input.correlationId });
    reports.fixing = fixing;
    steps.push({ name: 'fixing', status: 'ok', summary: 'Quality review completed (stub)' });

    const testing = await runTesting({ targetBasePath: '.', correlationId: input.correlationId });
    reports.testing = testing;
    steps.push({ name: 'testing', status: 'ok', summary: 'Testing artifacts prepared (stub)' });

    return {
      correlationId: input.correlationId,
      steps,
      artifacts,
      reports,
      generatedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    steps.push({ name: 'error', status: 'error', summary: err?.message || 'Unknown error' });
    return {
      correlationId: input.correlationId,
      steps,
      artifacts,
      reports,
      generatedAt: new Date().toISOString(),
    };
  }
}

