const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

export async function embedTexts(texts: string[], model = OLLAMA_EMBED_MODEL): Promise<number[][]> {
  if (!texts || texts.length === 0) return [];
  const embeddings: number[][] = [];
  for (const text of texts) {
    const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: text })
    });
    const data = await res.json();
    const vec = (data && (data.embedding as number[])) || [];
    embeddings.push(vec);
  }
  return embeddings;
}

