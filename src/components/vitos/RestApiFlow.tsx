import { useState } from "react";
import { Check, ChevronDown, Lock, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type SideEffect = "Read" | "Write" | "Destructive";

type Scope = {
  id: string;
  description: string;
};

const SCOPES: Scope[] = [
  {
    id: "read:customers",
    description: "View client profiles, primary accounts, and core system records.",
  },
  {
    id: "write:customers",
    description: "Create, update, or append modifications to core customer configurations.",
  },
  {
    id: "read:orders",
    description: "Access individual checkout history, logs, and transaction invoices.",
  },
  {
    id: "write:orders",
    description:
      "Authorize updates, fulfill tracking parameters, or execute shipping dispatch requests.",
  },
  { id: "read:billing", description: "Read invoices." },
  { id: "billing:charge", description: "Charge cards." },
];

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export function RestApiFlow({
  onBack,
  embedded = false,
}: {
  onBack: () => void;
  embedded?: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [rootPrefix, setRootPrefix] = useState("https://api.example.com/v1");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [path, setPath] = useState("/customer");

  const [scopes, setScopes] = useState<string[]>(["write:customers"]);
  const [scopeOpen, setScopeOpen] = useState(false);

  const [sideEffect, setSideEffect] = useState<SideEffect>("Read");

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div>
        <p className="text-left text-[13px] text-muted-foreground">
          Provide the connection parameters, routing details, and security scopes for your agent to
          safely access this resource.
        </p>
      </div>

      {/* Two-column card layout */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 md:items-stretch">
        {/* Card 1 — Basic Metadata */}
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
              onChange={(e) => setName(e.target.value)}
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
                this to choose when to call this integration.
              </>
            }
          >
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Looks up customers by name, email or order ID."
              rows={3}
              className={cn(inputCls, "resize-y")}
            />
          </Field>
        </CardShell>

        {/* Card 2 — API Routing & Parameters */}
        <CardShell title="API Routing & Parameters">
          <div className="flex flex-col gap-4">
            <Field label="Root Prefix" hint="Base gateway/env path.">
              <input
                value={rootPrefix}
                onChange={(e) => setRootPrefix(e.target.value)}
                placeholder="https://api.example.com/v1"
                className={inputCls}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
              <Field label="Method" hint="HTTP verb standard.">
                <div className="relative">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as HttpMethod)}
                    className={cn(inputCls, "appearance-none pr-9")}
                  >
                    {METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </Field>
              <Field label="Slug" hint="Endpoint location path.">
                <input
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="/customer"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* Auto-Generated Live URL Target */}
          <div className="rounded-xl border border-[#e8e6e1] bg-[#f4f3f1]/60 p-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Auto-Generated Live URL Target
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#e8e6e1] bg-card px-3 py-2 font-mono text-[13px] text-foreground">
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                {method}
              </span>
              <span className="truncate">
                {rootPrefix}
                {path}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              System generated from route metrics. Immutable.
            </p>
          </div>

          {/* Scope */}
          <Field
            label="Scope"
            hint="The explicit system access permission scope required by your platform."
            headerRight={
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("vitos:navigate-policy"));
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:opacity-80"
              >
                <Plus className="h-3 w-3" />
                Add scope
              </button>
            }
          >
            <div>
              <button
                type="button"
                onClick={() => setScopeOpen((v) => !v)}
                className={cn(
                  inputCls,
                  "flex min-h-[42px] items-center justify-between text-left",
                  scopeOpen && "border-primary ring-2 ring-primary/20",
                )}
              >
                <div className="flex flex-1 flex-wrap items-center gap-1.5">
                  {scopes.length === 0 ? (
                    <span className="text-muted-foreground/70">Select scopes…</span>
                  ) : (
                    scopes.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-md border border-[#e8e6e1] bg-[#f4f3f1] px-2 py-0.5 font-mono text-[12.5px] text-foreground"
                      >
                        {id}
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setScopes((prev) => prev.filter((x) => x !== id));
                          }}
                          className="-mr-0.5 inline-flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-[#e8e6e1] hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </span>
                    ))
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    scopeOpen && "rotate-180",
                  )}
                />
              </button>
              {scopeOpen && (
                <div className="mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-[#e8e6e1] bg-card shadow-sm">
                  {SCOPES.map((s) => {
                    const active = scopes.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          setScopes((prev) =>
                            prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id],
                          )
                        }
                        className="flex w-full items-start gap-3 border-b border-[#e8e6e1] px-4 py-3 text-left last:border-b-0 hover:bg-[#f4f3f1]/70"
                      >
                        <div className="flex flex-1 flex-col items-start gap-1.5">
                          <ScopeChip id={s.id} />
                          <span className="text-xs text-muted-foreground">{s.description}</span>
                        </div>
                        {active && <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Field>
        </CardShell>
      </div>

      {!embedded && <div className="my-7 h-px bg-[#e8e6e1]" />}

      {/* Footer */}
      {!embedded && (
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
              alert("Integration created");
              onBack();
            }}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Create Integration
          </button>
        </div>
      )}
    </div>
  );
}

export function CardShell({
  step,
  title,
  footer,
  children,
  dense = false,
}: {
  step?: number;
  title: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  dense?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl border border-[#e8e6e1] bg-card",
        dense ? "p-4" : "p-6",
      )}
    >
      <div className={cn("flex items-center gap-3", dense ? "mb-3" : "mb-5")}>
        {step !== undefined && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4f3f1] text-sm font-semibold text-foreground">
            {step}
          </div>
        )}
        <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {title}
        </div>
      </div>
      <div className={cn("flex flex-1 flex-col", dense ? "gap-3.5" : "gap-5")}>{children}</div>
      {footer && (
        <div
          className={cn(
            "border-t border-dashed border-[#e8e6e1] text-xs italic text-muted-foreground",
            dense ? "mt-4 pt-3" : "mt-6 pt-4",
          )}
        >
          {footer}
        </div>
      )}
    </section>
  );
}

function ScopeChip({ id }: { id: string }) {
  return (
    <span className="rounded-md border border-[#e8e6e1] bg-[#f4f3f1] px-2 py-0.5 font-mono text-[12.5px] text-foreground">
      {id}
    </span>
  );
}

export function Field({
  label,
  sublabel,
  hint,
  headerRight,
  children,
}: {
  label: React.ReactNode;
  sublabel?: string;
  hint?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-foreground">
          {label}
          {sublabel && <span className="ml-1 font-normal text-muted-foreground">{sublabel}</span>}
        </div>
        {headerRight}
      </div>
      {children}
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function SegmentedPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-[#f4f3f1] p-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-full px-5 py-1.5 text-sm font-medium transition",
              active
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export const inputCls =
  "w-full rounded-lg border border-[#e8e6e1] bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
