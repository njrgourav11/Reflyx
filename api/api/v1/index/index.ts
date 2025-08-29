import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withCommon } from '../../../_lib/handler';
import { embedTexts } from '../../../_lib/embeddings/ollama';
import { ensureCollection, upsert } from '../../../_lib/vector/qdrant';
import { chunkContent } from '../../../_lib/indexer/chunker';

export default withCommon(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { file_path, content, language } = (req.body || {}) as { file_path?: string; content?: string; language?: string };
  if (!content) return res.status(400).json({ error: true, message: 'content required' });

  const chunks = (await chunkContent(content, language)).slice(0, 200);
  const texts = chunks.map((c) => c.text).filter(Boolean);
  const vectors = await embedTexts(texts);
  await ensureCollection(vectors[0]?.length || 768);

  await upsert(chunks.map((c, i) => ({
    id: `${file_path || 'unknown'}:${c.startLine}-${c.endLine}`,
    vector: vectors[i] || [],
    payload: {
      file_path,
      language,
      chunk_index: i,
      start_line: c.startLine,
      end_line: c.endLine,
      type: c.type,
      text: c.text
    }
  })));

  res.status(200).json({ success: true, message: `Indexed ${chunks.length} chunks`, file_path, language });
});

