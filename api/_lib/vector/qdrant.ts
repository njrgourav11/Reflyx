const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION_NAME || 'code_chunks';

export interface QdrantPoint {
  id: string;
  vector: number[];
  payload?: Record<string, any>;
}

export async function ensureCollection(vectorSize: number, distance: 'Cosine'|'Euclid'|'Dot' = 'Cosine') {
  await fetch(`${QDRANT_URL}/collections/${QDRANT_COLLECTION}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vectors: { size: vectorSize, distance } })
  }).catch(() => void 0);
}

export async function upsert(points: QdrantPoint[]) {
  if (!points.length) return;
  await fetch(`${QDRANT_URL}/collections/${QDRANT_COLLECTION}/points`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points })
  });
}

export async function search(vector: number[], limit = 10, filter?: any) {
  const res = await fetch(`${QDRANT_URL}/collections/${QDRANT_COLLECTION}/points/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vector, limit, filter })
  });
  const data = await res.json();
  return data?.result || [];
}

