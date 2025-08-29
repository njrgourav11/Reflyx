import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withCommon } from '../../../_lib/handler';

export default withCommon(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return res.status(405).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  function send(event: string, data: any) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  send('start', { ok: true });

  const tokens = [
    '// Generating code...',
    'function example() {',
    '  // TODO: implement',
    '}'
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i < tokens.length) {
      send('token', { text: tokens[i++] });
    } else {
      send('done', { complete: true });
      clearInterval(interval);
      res.end();
    }
  }, 500);

  req.on('close', () => {
    clearInterval(interval);
  });
});

