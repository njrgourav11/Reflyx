import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withCommon } from '../../_lib/handler';

export default withCommon(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { prompt, language = 'text' } = (req.body || {}) as { prompt?: string; language?: string };
  const code = `// Generated (${language})\n// Prompt: ${prompt}\n`;
  res.status(200).json({ success: true, code });
});

