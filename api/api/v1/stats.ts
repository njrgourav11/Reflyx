import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withCommon } from '../../_lib/handler';

export default withCommon(async (_req: VercelRequest, res: VercelResponse) => {
  res.status(200).json({ success: true, data: { indexed_files: 0, total_queries: 0, uptime: 'serverless' } });
});

