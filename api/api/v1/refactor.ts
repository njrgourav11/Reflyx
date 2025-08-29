import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withCommon } from '../../_lib/handler';

export default withCommon(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { code } = (req.body || {}) as { code?: string };
  if (!code) return res.status(400).json({ error: true, message: 'code required' });

  // Placeholder refactor suggestions
  res.status(200).json({ success: true, suggestions: [
    { id: 'R1', title: 'Extract function', detail: 'Split long function into smaller ones.' },
    { id: 'R2', title: 'Rename variable', detail: 'Use descriptive variable names.' }
  ]});
});

