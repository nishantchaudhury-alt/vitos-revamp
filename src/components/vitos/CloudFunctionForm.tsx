import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardShell, Field, inputCls } from "./RestApiFlow";

type SideEffect = "Read" | "Write" | "Destructive";
type Runtime = "Node 20" | "Python 3.11";
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function CloudFunctionForm({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<HttpMethod>("POST");
  const [path, setPath] = useState("/v1/functions/new");
  const [sideEffect, setSideEffect] = useState<SideEffect>("Read");
  const [runtime, setRuntime] = useState<Runtime>("Node 20");
  const [code, setCode] = useState(
    `export default async function handler({ input, ctx }) {\n  // input is validated against the schema\n  return { ok: true };\n}`,
  );

  useEffect(() => {
    if (slugTouched) return;
    setSlug(
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.|\.$/g, ""),
    );
  }, [name, slugTouched]);

  return (
    <div className="flex flex-col">
      <div>
        <h2 className="text-base font-semibold text-foreground">Configure your Custom Function</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Define the function metadata and runtime configuration so your agent can call it as a
          first-class endpoint.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {/* Card 1 — Basic Metadata */}
        <CardShell
          step={1}
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
              onChange={(e) => setName(e.target.value)}
              placeholder="Search customers"
              className={inputCls}
            />
          </Field>
          <Field label="Slug" hint="Stable identifier. Lowercase, dot-separated.">
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="customers.search"
              className={cn(inputCls, "font-mono")}
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
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Looks up customers by name, email or order id."
              rows={5}
              className={cn(inputCls, "resize-y")}
            />
          </Field>
        </CardShell>

        {/* Card 2 — Runtime & Endpoint */}
        <CardShell step={2} title="Runtime & Endpoint">
          <div className="grid gap-4 md:grid-cols-[140px_1fr]">
            <Field label="Method" hint="HTTP verb.">
              <div className="relative">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className={cn(inputCls, "appearance-none pr-9 font-mono")}
                >
                  {(["GET", "POST", "PUT", "PATCH", "DELETE"] as HttpMethod[]).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>
            <Field label="Path" hint="Endpoint route.">
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/v1/functions/new"
                className={cn(inputCls, "font-mono")}
              />
            </Field>
          </div>

          <Field
            label="Side effect"
            hint="Drives default scopes, rate limits and external exposure."
          >
            <PillGroup
              options={["Read", "Write", "Destructive"] as SideEffect[]}
              value={sideEffect}
              onChange={setSideEffect}
            />
          </Field>

          <Field label="Runtime" hint="Execution environment.">
            <PillGroup
              options={["Node 20", "Python 3.11"] as Runtime[]}
              value={runtime}
              onChange={setRuntime}
            />
          </Field>

          <Field label="Starter code" hint="Editable in the function editor after creation.">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={6}
              spellCheck={false}
              className="w-full resize-y rounded-xl border border-border/60 bg-[#0d1117] px-3.5 py-2.5 font-mono text-[12.5px] leading-relaxed text-[#e6edf3] placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </Field>
        </CardShell>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-[#e8e6e1] bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-[#f4f3f1]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => alert("Function created")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          Create Function
        </button>
      </div>
    </div>
  );
}

/* ---------- Building blocks ---------- */

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium transition",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/40",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
