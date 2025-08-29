import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withCommon } from '../../_lib/handler';
import { search } from '../../_lib/vector/qdrant';
import { embedTexts } from '../../_lib/embeddings/ollama';

export default withCommon(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { code, top_k = 10 } = (req.body || {}) as { code?: string; top_k?: number };
  if (!code) return res.status(400).json({ error: true, message: 'code required' });

  const [vector] = await embedTexts([code]);
  const results = await search(vector, Math.min(top_k, 50));
  res.status(200).json({ success: true, similar: results });
});

