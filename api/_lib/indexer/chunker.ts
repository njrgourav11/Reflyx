import { initTreeSitter, parseCode, canParse, TSLanguage } from './treesitter';

export interface Chunk {
  text: string;
  startLine: number;
  endLine: number;
  type?: 'function' | 'class' | 'block' | 'text';
  language?: string;
}

// Naive fallback chunker (paragraph by blank lines)
export function naiveChunk(content: string, language?: string): Chunk[] {
  const lines = content.split('\n');
  const chunks: Chunk[] = [];
  let start = 0;
  for (let i = 0; i <= lines.length; i++) {
    if (i === lines.length || lines[i].trim() === '') {
      const segment = lines.slice(start, i).join('\n').trim();
      if (segment) {
        chunks.push({ text: segment, startLine: start + 1, endLine: i, type: 'text', language });
      }
      start = i + 1;
    }
  }
  return chunks;
}

function guessTslang(language?: string): TSLanguage | undefined {
  if (!language) return undefined;
  const id = language.toLowerCase();
  if (id.includes('typescript') || id === 'ts') return 'typescript';
  if (id.includes('javascript') || id === 'js') return 'javascript';
  return undefined;
}

// Tree-sitter based chunking (functions/classes) when grammars are available
export async function treeSitterChunk(content: string, language?: string): Promise<Chunk[]> {
  const lang = guessTslang(language);
  if (!lang) return naiveChunk(content, language);

  const ok = await initTreeSitter();
  if (!ok || !canParse(lang)) return naiveChunk(content, language);

  const tree = parseCode(content, lang);
  if (!tree) return naiveChunk(content, language);

  const chunks: Chunk[] = [];
  const srcLines = content.split('\n');

  function addChunk(start: number, end: number, type: Chunk['type']) {
    const text = srcLines.slice(start, end + 1).join('\n');
    chunks.push({ text, startLine: start + 1, endLine: end + 1, type, language });
  }

  function visit(node: any) {
    const type = node.type as string;
    if (type === 'function_declaration' || type === 'method_definition') {
      addChunk(node.startPosition.row, node.endPosition.row, 'function');
    } else if (type === 'class_declaration' || type === 'class') {
      addChunk(node.startPosition.row, node.endPosition.row, 'class');
    }
    for (let i = 0; i < node.namedChildCount; i++) {
      visit(node.namedChild(i));
    }
  }

  visit(tree.rootNode);
  return chunks.length ? chunks : naiveChunk(content, language);
}

export async function chunkContent(content: string, language?: string): Promise<Chunk[]> {
  try {
    return await treeSitterChunk(content, language);
  } catch {
    return naiveChunk(content, language);
  }
}

