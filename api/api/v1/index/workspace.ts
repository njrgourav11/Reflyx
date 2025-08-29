import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withCommon } from '../../../_lib/handler';

export default withCommon(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { workspace_path } = (req.body || {}) as { workspace_path?: string };
  res.status(200).json({ success: true, message: `Workspace indexing accepted: ${workspace_path}`, files_indexed: 0 });
});

