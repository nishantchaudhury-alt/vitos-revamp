// Initialize Prism on globalThis BEFORE language components load.
// prism-core registers `Prism` on `window`/`self`; in SSR it falls back
// to a local object, so language plugins can't find it. We pin it here.
// @ts-expect-error - prism-core has no bundled types
import prismCore from "prismjs/components/prism-core";

const g = globalThis as unknown as { Prism?: unknown };
if (!g.Prism) g.Prism = prismCore;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const P = g.Prism as any;

// Side-effect imports must come AFTER global is set.
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";

export const highlight: (code: string, grammar: unknown, lang: string) => string = P.highlight;
export const languages: Record<string, unknown> = P.languages;
