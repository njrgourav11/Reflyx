import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withCommon } from '../../_lib/handler';

export default withCommon(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { query, max_results = 10 } = (req.body || {}) as { query?: string; max_results?: number };
  res.status(200).json({ success: true, query, response: `Serverless response for: ${query}`, results: [], max_results });
});

