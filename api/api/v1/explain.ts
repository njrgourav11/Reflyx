import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withCommon } from '../../_lib/handler';

export default withCommon(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { code, language } = (req.body || {}) as { code?: string; language?: string };
  res.status(200).json({ success: true, explanation: `Minimal explanation for ${language || 'code'}.`, details: { lines: code?.split('\n').length || 0 } });
});

