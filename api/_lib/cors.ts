export function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Correlation-Id');
}

export function handleCors(req: any, res: any): boolean {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

