export function logInfo(msg: string, meta?: any) {
  if (meta) console.log(JSON.stringify({ level: 'info', msg, ...meta }));
  else console.log(JSON.stringify({ level: 'info', msg }));
}
export function logError(msg: string, meta?: any) {
  if (meta) console.error(JSON.stringify({ level: 'error', msg, ...meta }));
  else console.error(JSON.stringify({ level: 'error', msg }));
}

