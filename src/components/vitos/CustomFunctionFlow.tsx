import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardShell, Field, inputCls } from "./RestApiFlow";
import { highlight, languages } from "@/lib/prism-setup";
import "@/styles/prism-vitos.css";

export type Language = "TypeScript" | "JavaScript" | "Python";

export const RUNTIMES: Record<Language, string[]> = {
  TypeScript: ["Node.js 20", "Node.js 22", "Deno 1.46", "Bun 1.1"],
  JavaScript: ["Node.js 20", "Node.js 22", "Deno 1.46", "Bun 1.1"],
  Python: ["Python 3.11", "Python 3.12"],
};

export const TIMEOUTS = ["3s", "5s", "10s", "30s", "60s", "120s"];

export const STARTER_CODE: Record<Language, string> = {
  TypeScript: `export async function handler(input, ctx) {
  // input: validated system payload
  // ctx: { secrets, logger, fetch }
  const res = await ctx.fetch("https://api.example.com/data", {
    headers: { Authorization: \`Bearer \${ctx.secrets.API_KEY}\` },
  });
  const data = await res.json();
  return { ok: true, count: data.items.length };
}`,
  JavaScript: `export async function handler(input, ctx) {
  const res = await ctx.fetch("https://api.example.com/data", {
    headers: { Authorization: \`Bearer \${ctx.secrets.API_KEY}\` },
  });
  const data = await res.json();
  return { ok: true, count: data.items.length };
}`,
  Python: `async def handler(input, ctx):
    # input: validated system payload
    # ctx: { secrets, logger, fetch }
    res = await ctx.fetch(
        "https://api.example.com/data",
        headers={"Authorization": f"Bearer {ctx.secrets['API_KEY']}"},
    )
    data = await res.json()
    return {"ok": True, "count": len(data["items"])}`,
};

export function CustomFnMetadataCard({
  name,
  description,
  onName,
  onDescription,
}: {
  name: string;
  description: string;
  onName: (v: string) => void;
  onDescription: (v: string) => void;
}) {
  return (
    <CardShell
      title="Basic Metadata"
      footer="Metadata serves as context prompts for LLM decision boundaries."
    >
      <Field
        label="Name"
        sublabel="(shown to agents)"
        hint="The LLM reads this to decide when to call it."
      >
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Search customers"
          className={inputCls}
        />
      </Field>

      <Field
        label="Description"
        sublabel="(one sentence)"
        hint={
          <>
            <span className="font-semibold text-foreground">Be specific</span> — the agent reads
            this to choose when to call this function.
          </>
        }
      >
        <textarea
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder="Looks up customers by name, email or order ID."
          rows={6}
          className={cn(inputCls, "resize-y")}
        />
      </Field>
    </CardShell>
  );
}

export function CustomFnRuntimeCard({
  language,
  runtime,
  timeout,
  code,
  onLanguage,
  onRuntime,
  onTimeout,
  onCode,
}: {
  language: Language;
  runtime: string;
  timeout: string;
  code: string;
  onLanguage: (v: Language) => void;
  onRuntime: (v: string) => void;
  onTimeout: (v: string) => void;
  onCode: (v: string) => void;
}) {
  const fileName =
    language === "Python" ? "handler.py" : language === "JavaScript" ? "handler.js" : "handler.ts";
  const langBadge = language === "Python" ? "PY" : language === "JavaScript" ? "JS" : "TS";
  const prismLang =
    language === "Python" ? "python" : language === "JavaScript" ? "javascript" : "typescript";
  const grammar = (languages as Record<string, unknown>)[prismLang] ?? languages["clike"];
  // Prism drops a trailing newline in the highlighted output. Add a sentinel
  // space so the overlay height matches the textarea when the user types
  // a trailing newline.
  const highlighted = highlight(code + "\n", grammar, prismLang);
  const lineCount = Math.max(code.split("\n").length, 1);
  const gutterRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const onScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = t.scrollTop;
      preRef.current.scrollLeft = t.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = t.scrollTop;
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Language runtime" hint="Select the language your handler is written in.">
        <div className="inline-flex w-fit items-center gap-1 self-start rounded-full bg-[#f4f3f1] p-1">
          {(["TypeScript", "JavaScript", "Python"] as Language[]).map((lang) => {
            const active = language === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  onLanguage(lang);
                  onRuntime(RUNTIMES[lang][0]);
                  onCode(STARTER_CODE[lang]);
                }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Engine version" hint="Execution engine.">
          <div className="relative">
            <select
              value={runtime}
              onChange={(e) => onRuntime(e.target.value)}
              className={cn(inputCls, "appearance-none pr-9")}
            >
              {RUNTIMES[language].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>
        <Field label="Execution timeout" hint="Max wall-clock per invocation.">
          <div className="relative">
            <select
              value={timeout}
              onChange={(e) => onTimeout(e.target.value)}
              className={cn(inputCls, "appearance-none pr-9")}
            >
              {TIMEOUTS.map((t) => (
                <option key={t} value={t}>
                  {t} max limit
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>
      </div>

      <Field
        label="Implementation logic"
        headerRight={
          <code className="rounded-md border border-[#e8e6e1] bg-[#f4f3f1] px-2 py-0.5 font-mono text-[11.5px] text-foreground">
            handler(input, ctx)
          </code>
        }
      >
        <div className="overflow-hidden rounded-xl border border-[#e8e6e1] bg-[#0d1117] shadow-sm">
          <div className="flex items-center justify-between border-b border-white/5 bg-[#161b22] px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              <span className="ml-3 font-mono text-[11px] text-white/60">{fileName}</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
              {langBadge} compiler v5
            </span>
          </div>
          <div className="relative flex">
            {/* Gutter */}
            <div
              ref={gutterRef}
              aria-hidden="true"
              className="select-none overflow-hidden border-r border-white/5 bg-[#0d1117] py-3 pl-4 pr-3 text-right font-mono text-[12.5px] leading-relaxed text-white/25"
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Code surface */}
            <div className="relative flex-1">
              <pre
                ref={preRef}
                aria-hidden="true"
                className="pointer-events-none m-0 h-[300px] overflow-auto whitespace-pre px-4 py-3 font-mono text-[12.5px] leading-relaxed text-[#e6edf3]"
              >
                <code
                  className={`language-${prismLang}`}
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </pre>
              <textarea
                value={code}
                onChange={(e) => onCode(e.target.value)}
                onScroll={onScroll}
                spellCheck={false}
                wrap="off"
                className="absolute inset-0 h-full w-full resize-none whitespace-pre bg-transparent px-4 py-3 font-mono text-[12.5px] leading-relaxed text-transparent caret-white outline-none placeholder:text-white/30"
              />
            </div>
          </div>
        </div>
      </Field>
    </div>
  );
}

export function CustomFunctionFlow({
  onBack,
  embedded = false,
  embeddedStep,
}: {
  onBack: () => void;
  embedded?: boolean;
  embeddedStep?: 1 | 2;
}) {
  const [name, setName] = useState("Search customers");
  const [description, setDescription] = useState("Looks up customers by name, email or order ID.");

  const [language, setLanguage] = useState<Language>("TypeScript");
  const [runtime, setRuntime] = useState<string>("Node.js 20");
  const [timeout, setTimeout] = useState<string>("10s");
  const [code, setCode] = useState<string>(STARTER_CODE.TypeScript);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-foreground">{"\n"}</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Provide the identity metadata and runtime for the function your agent will invoke.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {(embeddedStep === undefined || embeddedStep === 1) && (
          <CustomFnMetadataCard
            name={name}
            description={description}
            onName={setName}
            onDescription={setDescription}
          />
        )}
        {(embeddedStep === undefined || embeddedStep === 2) && (
          <CustomFnRuntimeCard
            language={language}
            runtime={runtime}
            timeout={timeout}
            code={code}
            onLanguage={setLanguage}
            onRuntime={setRuntime}
            onTimeout={setTimeout}
            onCode={setCode}
          />
        )}
      </div>

      {!embedded && (
        <>
          <div className="my-7 h-px bg-[#e8e6e1]" />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-[#e8e6e1] bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-[#f4f3f1]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                alert("Function saved & published");
                onBack();
              }}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Save and Publish
            </button>
          </div>
        </>
      )}
    </div>
  );
}
