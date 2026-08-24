import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type SideEffect = "Read" | "Write" | "Destructive";

export function McpServerForm({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [sideEffect, setSideEffect] = useState<SideEffect>("Read");
  const [url, setUrl] = useState("");
  const [displayName, setDisplayName] = useState("");

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
      <div className="flex flex-col gap-3.5">
        <Row label="Name" hint="Shown to humans and agents alike.">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="List Github repos"
            className={inputCls}
          />
        </Row>

        <Row label="Slug" hint="Stable identifier. Lowercase, dot-separated.">
          <input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="customers.search"
            className={cn(inputCls, "font-mono")}
          />
        </Row>

        <Row label="Description" hint="One sentence. The LLM reads this to decide when to call it.">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Looks up customers by name, email or order id."
            rows={3}
            className={cn(inputCls, "resize-y")}
          />
        </Row>

        <Row label="Side effect" hint="Drives default scopes, rate limits and external exposure.">
          <PillGroup
            options={["Read", "Write", "Destructive"] as SideEffect[]}
            value={sideEffect}
            onChange={setSideEffect}
          />
        </Row>

        <div className="border-t border-border" />

        <Row label="MCP server URL" hint="Streamable HTTP endpoint. We'll list tools on connect.">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://mcp.example.com/sse"
            className={cn(inputCls, "font-mono")}
          />
        </Row>

        <Row label="Display name">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="github-mcp"
            className={inputCls}
          />
        </Row>

        <div className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-3.5 py-3 text-xs leading-snug text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
          <p>
            On connect, we'll fetch the tool list. Each tool becomes its own API in this collection
            — you can rename, scope, and bundle them after.
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-3.5">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-hover"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => alert("MCP server connected")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          Connect MCP server
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-1.5 md:grid-cols-[260px_minmax(0,1fr)] md:gap-6">
      <div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        {hint && <div className="mt-0.5 text-xs leading-snug text-muted-foreground">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

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
