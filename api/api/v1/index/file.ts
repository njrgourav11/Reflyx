import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withCommon } from '../../../_lib/handler';

export default withCommon(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { file_path, content, language } = (req.body || {}) as { file_path?: string; content?: string; language?: string };
  res.status(200).json({ success: true, message: `Indexed file (serverless placeholder): ${file_path}`, size: content?.length || 0, language });
});

