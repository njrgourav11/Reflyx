// Web-tree-sitter loader and helpers
// Note: Ensure WASM grammars are placed under api/_lib/indexer/grammars/*

export type TSLanguage = 'javascript' | 'typescript';

let initialized = false;
let Parser: any;
let languages: Record<TSLanguage, any> = {};

export async function initTreeSitter(): Promise<boolean> {
  if (initialized) return true;
  try {
    // @ts-ignore - dynamic import at runtime
    Parser = await import('web-tree-sitter');
    await (Parser as any).default.init();

    // Load grammars if present
    const jsWasmPath = __dirname + '/grammars/tree-sitter-javascript.wasm';
    const tsWasmPath = __dirname + '/grammars/tree-sitter-typescript.wasm';

    try {
      const js = await (Parser as any).default.Language.load(jsWasmPath);
      languages.javascript = js;
    } catch {}
    try {
      const ts = await (Parser as any).default.Language.load(tsWasmPath);
      languages.typescript = ts;
    } catch {}

    initialized = true;
    return true;
  } catch (e) {
    return false;
  }
}

export function canParse(lang: TSLanguage): boolean {
  return !!languages[lang];
}

export function parseCode(code: string, lang: TSLanguage): any | null {
  if (!Parser || !languages[lang]) return null;
  const parser = new (Parser as any).default();
  parser.setLanguage(languages[lang]);
  return parser.parse(code);
}

