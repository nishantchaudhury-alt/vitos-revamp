import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  X,
  Code2,
  Globe,
  Plug,
  Bot,
  ChevronRight,
  Braces,
  Wand2,
  Shuffle,
  FileCheck2,
  GitBranch,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RestApiFlow } from "./RestApiFlow";
import {
  CustomFunctionFlow,
  CustomFnMetadataCard,
  CustomFnRuntimeCard,
} from "./CustomFunctionFlow";
import { AgentMetadataCard } from "./AgentAsApiForm";

type TopType = "rest-or-fn" | "mcp" | "agent";
type SubType = "rest" | "custom-fn" | null;
type SideEffect = "Read" | "Write" | "Destructive";
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type StepId = 1 | 2 | 3;

export type PathParam = {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
};

export function NewIntegrationFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<StepId>(1);

  // Step 1 — Type
  const [topType, setTopType] = useState<TopType>("rest-or-fn");
  const [subType, setSubType] = useState<SubType>("rest");

  // Step 2 — Identity
  const [name, setName] = useState("Search customers");
  const [slug, setSlug] = useState("customers.search");
  const [slugTouched, setSlugTouched] = useState(true);
  const [description, setDescription] = useState("Looks up customers by name, email or order ID.");
  const [sideEffect, setSideEffect] = useState<SideEffect>("Read");

  // Step 3 — Configure (REST / Custom fn)
  const [method, setMethod] = useState<Method>("GET");
  const [url, setUrl] = useState("https://api.stripe.com/v1/charges");
  const [pathParams, setPathParams] = useState<PathParam[]>([
    { name: "id", type: "string", description: "Resource ID" },
  ]);

  // Step 3 — Configure (MCP)
  const [mcpName, setMcpName] = useState("kapture-ops");
  const [mcpTransport, setMcpTransport] = useState("Streamable HTTP");
  const [mcpToolTab, setMcpToolTab] = useState<"custom" | "predefined">("custom");

  // Step 3 — Configure (Custom function)
  const [fnLanguage, setFnLanguage] = useState<"TypeScript" | "JavaScript" | "Python">(
    "TypeScript",
  );
  const [fnRuntime, setFnRuntime] = useState("Node.js 20");
  const [fnTimeout, setFnTimeout] = useState("10s");
  const [fnCode, setFnCode] = useState(
    `export async function handler(input, ctx) {
  // input: validated payload
  // ctx: { secrets, logger, fetch }
  const res = await ctx.fetch("https://api.example.com/data", {
    headers: { Authorization: \`Bearer \${ctx.secrets.API_KEY}\` },
  });
  const data = await res.json();
  return { ok: true, count: data.items.length };
}`,
  );
  const [fnName, setFnName] = useState("Search customers");
  const [fnDescription, setFnDescription] = useState(
    "Looks up customers by name, email or order ID.",
  );

  // Agent as API — metadata
  const [agentName, setAgentName] = useState("Search customers");
  const [agentDescription, setAgentDescription] = useState(
    "Looks up customers by name, email or order ID.",
  );

  // Step 4 (MCP) — Alerts & Quotas
  const [mcpOpsTab, setMcpOpsTab] = useState<"alerts" | "quotas">("alerts");
  const [alerts, setAlerts] = useState({
    p95: "2000",
    p99: "5000",
    errorRate: "1",
    spike5xx: "10",
    throughputDrop: "50",
    dailyCostCap: "100",
    autoIncident: true,
  });
  const [channels, setChannels] = useState([
    { label: "Slack · #ops-alerts", mode: "On breach + recovery" },
    { label: "PagerDuty · on-call", mode: "Critical only" },
    { label: "Email · alerts@company.com", mode: "Daily digest" },
  ]);
  const [quotas, setQuotas] = useState({
    globalRpm: "1000",
    perKeyRpm: "60",
    perIpRpm: "120",
    burst: "20",
    concurrency: "50",
    strategy: "Token bucket",
    dailyCap: "100000",
    monthlyCap: "2000000",
    onExceed: "429 + Retry-After",
    ipList: false,
  });

  // Auto-slug from name
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

  const subTypeLabel =
    topType === "rest-or-fn"
      ? subType === "rest"
        ? "REST API"
        : subType === "custom-fn"
          ? "Custom function"
          : null
      : topType === "mcp"
        ? "MCP server"
        : "Agent as API";

  const canContinue: Record<StepId, boolean> = {
    1: subTypeLabel !== null && name.trim().length > 0 && slug.trim().length > 0,
    2: topType === "mcp" ? mcpName.trim().length > 0 : url.trim().length > 0,
    3: true,
  };

  const goNext = () => setStep((s) => (s < 3 ? ((s + 1) as StepId) : s));
  const goPrev = () => setStep((s) => (s > 1 ? ((s - 1) as StepId) : s));

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <header className="flex items-center gap-2.5 border-b border-border bg-card px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:bg-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-[13px] font-semibold tracking-tight text-foreground">
            New integration
          </h2>
          <span className="text-muted-foreground/40">·</span>
          <Breadcrumb step={step} subTypeLabel={subTypeLabel} slug={slug} />
        </div>
      </header>

      <div>
        {/* Body */}
        <div className="flex min-h-[520px] flex-col">
          <div className="mx-auto w-full max-w-5xl flex-1 px-7 py-6">
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <StepType
                  topType={topType}
                  subType={subType}
                  onTopType={(t) => {
                    setTopType(t);
                    setSubType(t === "rest-or-fn" ? "rest" : null);
                  }}
                  onSubType={setSubType}
                />
                <div>
                  {topType === "rest-or-fn" && subType === "rest" ? (
                    <RestApiFlow onBack={onBack} embedded />
                  ) : topType === "rest-or-fn" && subType === "custom-fn" ? (
                    <CustomFnMetadataCard
                      name={fnName}
                      description={fnDescription}
                      onName={setFnName}
                      onDescription={setFnDescription}
                    />
                  ) : topType === "agent" ? (
                    <AgentMetadataCard
                      name={agentName}
                      description={agentDescription}
                      onName={setAgentName}
                      onDescription={setAgentDescription}
                    />
                  ) : (
                    <StepIdentity
                      name={name}
                      slug={slug}
                      description={description}
                      sideEffect={sideEffect}
                      onName={(v) => setName(v)}
                      onSlug={(v) => {
                        setSlug(v);
                        setSlugTouched(true);
                      }}
                      onDescription={setDescription}
                      onSideEffect={setSideEffect}
                    />
                  )}
                </div>
              </div>
            )}

            {step === 2 && topType === "mcp" && (
              <StepConfigureMcp
                mcpName={mcpName}
                transport={mcpTransport}
                tab={mcpToolTab}
                onName={setMcpName}
                onTransport={setMcpTransport}
                onTab={setMcpToolTab}
              />
            )}

            {step === 2 && topType === "rest-or-fn" && subType !== "custom-fn" && (
              <StepConfigure
                method={method}
                url={url}
                pathParams={pathParams}
                onMethod={setMethod}
                onUrl={setUrl}
                onPathParams={setPathParams}
              />
            )}

            {step === 2 && topType === "rest-or-fn" && subType === "custom-fn" && (
              <CustomFnRuntimeCard
                language={fnLanguage}
                runtime={fnRuntime}
                timeout={fnTimeout}
                code={fnCode}
                onLanguage={setFnLanguage}
                onRuntime={setFnRuntime}
                onTimeout={setFnTimeout}
                onCode={setFnCode}
              />
            )}

            {step === 2 && topType === "agent" && <AgentPlaceholder />}

            {step === 3 && topType === "mcp" && (
              <StepMcpOps
                tab={mcpOpsTab}
                onTab={setMcpOpsTab}
                alerts={alerts}
                onAlerts={setAlerts}
                channels={channels}
                onChannels={setChannels}
                quotas={quotas}
                onQuotas={setQuotas}
              />
            )}
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between gap-3 border-t border-border bg-card px-7 py-4">
            <button
              type="button"
              onClick={step === 1 ? onBack : goPrev}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-hover"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? "Cancel" : "Back"}
            </button>
            <div className="flex items-center gap-2">
              {step >= 2 && (
                <button
                  type="button"
                  onClick={() => alert("Draft saved")}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-hover"
                >
                  {step === 3 ? "Save as draft" : "Save draft"}
                </button>
              )}
              {(() => {
                const isRest = topType === "rest-or-fn" && subType === "rest";
                const isCustomFn = topType === "rest-or-fn" && subType === "custom-fn";
                const isAgent = topType === "agent";
                const isMcp = topType === "mcp";
                const isFinalStep =
                  (step === 2 && (isRest || isCustomFn || isAgent)) || (step === 3 && isMcp);
                if (isFinalStep) {
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        alert(
                          isAgent
                            ? "Agent endpoint saved & published"
                            : isCustomFn
                              ? "Function saved & published"
                              : "Integration saved & published",
                        );
                        onBack();
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                    >
                      <Check className="h-4 w-4" />
                      Save and Publish
                    </button>
                  );
                }
                return (
                  <button
                    type="button"
                    disabled={!canContinue[step]}
                    onClick={goNext}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                );
              })()}
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}

/* -------------- Breadcrumb -------------- */
function AgentPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#e8e6e1] bg-card px-6 py-16 text-center">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.95_0.05_300)] text-[oklch(0.55_0.2_300)]">
        <Bot className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-semibold text-foreground">Agent configuration</h4>
      <p className="max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
        Endpoint, tools, alerts, and quotas for this agent will be configured here. Save and publish
        to create the endpoint with defaults, then fine-tune from the integration detail page.
      </p>
    </div>
  );
}

function Breadcrumb({
  step,
  subTypeLabel,
  slug,
}: {
  step: StepId;
  subTypeLabel: string | null;
  slug: string;
}) {
  const parts = ["All APIs", "New"];
  if (subTypeLabel) parts.push(subTypeLabel);
  if (step >= 2 && slug) parts.push(slug);
  return (
    <p className="truncate text-[11.5px] text-muted-foreground">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1.5 text-muted-foreground/60">→</span>}
          {i >= 2 ? <span className="font-mono">{p}</span> : p}
        </span>
      ))}
    </p>
  );
}

/* -------------- Step 1: Type -------------- */
function StepType({
  topType,
  subType,
  onTopType,
  onSubType,
}: {
  topType: TopType;
  subType: SubType;
  onTopType: (t: TopType) => void;
  onSubType: (s: SubType) => void;
}) {
  const topCards: {
    id: TopType;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
    pill: string;
    pillTone: string;
    title: string;
    description: string;
  }[] = [
    {
      id: "rest-or-fn",
      icon: Globe,
      iconBg: "bg-[oklch(0.94_0.05_10)]",
      iconColor: "text-primary",
      pill: "HTTP",
      pillTone: "bg-[oklch(0.95_0.04_20)] text-[oklch(0.5_0.18_20)]",
      title: "REST API or Custom Function",
      description: "Call an endpoint or write server-side logic.",
    },
    {
      id: "mcp",
      icon: Plug,
      iconBg: "bg-[oklch(0.94_0.04_165)]",
      iconColor: "text-[oklch(0.5_0.13_165)]",
      pill: "TOOLS",
      pillTone: "bg-[oklch(0.95_0.04_165)] text-[oklch(0.5_0.13_165)]",
      title: "MCP server",
      description: "Connect to an MCP server and expose its tools.",
    },
    {
      id: "agent",
      icon: Bot,
      iconBg: "bg-[oklch(0.95_0.05_300)]",
      iconColor: "text-[oklch(0.55_0.2_300)]",
      pill: "LLM",
      pillTone: "bg-[oklch(0.95_0.04_300)] text-[oklch(0.55_0.2_300)]",
      title: "Agent as an API",
      description: "Expose an agent as a versioned endpoint.",
    },
  ];

  const subCards: {
    id: NonNullable<SubType>;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }[] = [
    {
      id: "rest",
      icon: Globe,
      title: "REST API",
      description:
        "Point to an external HTTP endpoint. Set method, URL, auth, and response mapping.",
    },
    {
      id: "custom-fn",
      icon: Code2,
      title: "Custom Function",
      description: "Write TypeScript, JS, or Python on Vitos infrastructure.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          What type of integration do you want to build?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how your agent reaches the outside world. You can change this later.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {topCards.map((c) => {
          const Icon = c.icon;
          const active = topType === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onTopType(c.id)}
              className={cn(
                "relative flex flex-col gap-2 rounded-xl border bg-card p-3 text-left transition",
                active
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-border hover:border-primary/40 hover:bg-hover/40",
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-md",
                    c.iconBg,
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", c.iconColor)} />
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wider",
                    c.pillTone,
                  )}
                >
                  {c.pill}
                </span>
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-foreground">{c.title}</h4>
                <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
                  {c.description}
                </p>
              </div>
              {active && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>

      {topType === "rest-or-fn" && (
        <div className="flex w-full flex-col items-start gap-3 border-t border-border pt-6">
          <div className="text-left">
            <h4 className="text-[15px] font-semibold text-foreground">
              How are you implementing this integration?
            </h4>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Switch between standard REST declarations or custom code execution.
            </p>
          </div>
          <div
            role="tablist"
            aria-label="Implementation mode"
            className="inline-flex items-center rounded-full border border-border bg-muted/60 p-1"
          >
            {subCards.map((c) => {
              const active = subType === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSubType(c.id)}
                  className={cn(
                    "rounded-full px-6 py-2 text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c.title}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------- Step 2: Identity -------------- */
function StepIdentity({
  name,
  slug,
  description,
  sideEffect,
  onName,
  onSlug,
  onDescription,
  onSideEffect,
}: {
  name: string;
  slug: string;
  description: string;
  sideEffect: SideEffect;
  onName: (v: string) => void;
  onSlug: (v: string) => void;
  onDescription: (v: string) => void;
  onSideEffect: (v: SideEffect) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Name this integration
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Both humans and your agents use this to understand what the integration does.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Name"
          sublabel="(shown to agents)"
          hint="The LLM reads this to decide when to call it."
        >
          <input value={name} onChange={(e) => onName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Slug" sublabel="(stable ID)" hint="Auto-generated. Lowercase, dot-separated.">
          <input
            value={slug}
            onChange={(e) => onSlug(e.target.value)}
            className={cn(inputCls, "font-mono")}
          />
        </Field>
      </div>

      <Field
        label="Description"
        sublabel="(one sentence)"
        hint="Be specific — the agent reads this to choose when to call this integration."
      >
        <textarea
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          rows={3}
          className={cn(inputCls, "resize-y")}
        />
      </Field>

      <Field label="Side effect" hint="Drives default scopes, rate limits, external exposure.">
        <div className="flex flex-wrap gap-2">
          {(["Read", "Write", "Destructive"] as SideEffect[]).map((opt) => {
            const active = sideEffect === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onSideEffect(opt)}
                className={cn(
                  "rounded-lg border px-3.5 py-1.5 text-sm font-medium transition",
                  active
                    ? "border-primary bg-[oklch(0.97_0.025_350)] text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/40",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

/* -------------- Step 3: Configure -------------- */
type ConfigSection = "endpoint" | "auth" | "request" | "response";
type AuthType = "none" | "bearer" | "apikey" | "oauth";
type KV = { id: string; key: string; value: string };
type InputField = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description: string;
};

const newId = () => Math.random().toString(36).slice(2, 9);

export function StepConfigure({
  method,
  url,
  pathParams,
  onMethod,
  onUrl,
  onPathParams,
  showEndpoint = true,
}: {
  method: Method;
  url: string;
  pathParams: PathParam[];
  onMethod: (m: Method) => void;
  onUrl: (u: string) => void;
  onPathParams: (p: PathParam[]) => void;
  showEndpoint?: boolean;
}) {
  const [section, setSection] = useState<ConfigSection>(showEndpoint ? "endpoint" : "auth");

  // Auth state
  const [authType, setAuthType] = useState<AuthType>("bearer");
  const [bearerToken, setBearerToken] = useState("sk_live_••••••••••••••••••");
  const [apiKeyName, setApiKeyName] = useState("X-API-Key");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [apiKeyLocation, setApiKeyLocation] = useState<"header" | "query">("header");
  const [oauthClientId, setOauthClientId] = useState("");
  const [oauthClientSecret, setOauthClientSecret] = useState("");
  const [oauthTokenUrl, setOauthTokenUrl] = useState("");

  // Request state
  const [headers, setHeaders] = useState<KV[]>([
    { id: "h1", key: "Content-Type", value: "application/json" },
    { id: "h2", key: "X-Idempotency-Key", value: "{{request.id}}" },
  ]);
  const [queryParams, setQueryParams] = useState<KV[]>([
    { id: "q1", key: "expand", value: "customer" },
  ]);
  const [bodyType, setBodyType] = useState<"None" | "JSON" | "Form" | "Text">("JSON");
  const [bodyContent, setBodyContent] = useState<string>(
    `{\n  "amount":   "{{input.amount}}",\n  "currency": "{{input.currency}}",\n  "customer": "{{input.customer_id}}"\n}`,
  );
  const [inputSchema, setInputSchema] = useState<InputField[]>([
    {
      id: "if1",
      name: "amount",
      type: "integer",
      required: true,
      description: "Charge amount in smallest currency unit",
    },
    {
      id: "if2",
      name: "currency",
      type: "enum (usd, eur)",
      required: true,
      description: "ISO currency code",
    },
    {
      id: "if3",
      name: "customer_id",
      type: "string",
      required: false,
      description: "Stripe customer reference",
    },
  ]);

  // Response state
  const [successCodes, setSuccessCodes] = useState<string[]>(["200", "201"]);
  const [responseSchema, setResponseSchema] = useState<string>(
    `{\n  "id":      "string",\n  "amount":  "integer",\n  "status":  "enum<succeeded|pending|failed>",\n  "created": "timestamp"\n}`,
  );
  const [outputTransform, setOutputTransform] = useState<string>(
    `{\n  "charge_id": id,\n  "ok": status = "succeeded"\n}`,
  );

  const sections: {
    id: ConfigSection;
    label: string;
    hint: string;
  }[] = [
    { id: "endpoint", label: "Endpoint", hint: "Method, URL, path params" },
    { id: "auth", label: "Authentication", hint: "Bearer · OAuth · API Key" },
    { id: "request", label: "Request", hint: "Headers · Query · Body schema" },
    { id: "response", label: "Response", hint: "Schema · Status mapping · Transform" },
  ];

  const visibleSections = showEndpoint ? sections : sections.filter((s) => s.id !== "endpoint");

  return (
    <div className="flex flex-col gap-6">
      {/* Section tabs */}
      <nav
        aria-label="Configure sections"
        className="flex flex-wrap gap-2 border-b border-border pb-4"
      >
        {visibleSections.map((s) => {
          const active = section === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* Panel */}
      <div className="flex flex-col">
        {showEndpoint && section === "endpoint" && (
          <EndpointPanel
            method={method}
            url={url}
            pathParams={pathParams}
            onMethod={onMethod}
            onUrl={onUrl}
            onPathParams={onPathParams}
          />
        )}
        {section === "auth" && (
          <AuthPanel
            authType={authType}
            onAuthType={setAuthType}
            bearerToken={bearerToken}
            onBearerToken={setBearerToken}
            apiKeyName={apiKeyName}
            onApiKeyName={setApiKeyName}
            apiKeyValue={apiKeyValue}
            onApiKeyValue={setApiKeyValue}
            apiKeyLocation={apiKeyLocation}
            onApiKeyLocation={setApiKeyLocation}
            oauthClientId={oauthClientId}
            onOauthClientId={setOauthClientId}
            oauthClientSecret={oauthClientSecret}
            onOauthClientSecret={setOauthClientSecret}
            oauthTokenUrl={oauthTokenUrl}
            onOauthTokenUrl={setOauthTokenUrl}
          />
        )}
        {section === "request" && (
          <RequestPanel
            headers={headers}
            onHeaders={setHeaders}
            queryParams={queryParams}
            onQueryParams={setQueryParams}
            bodyType={bodyType}
            onBodyType={setBodyType}
            bodyContent={bodyContent}
            onBodyContent={setBodyContent}
            inputSchema={inputSchema}
            onInputSchema={setInputSchema}
          />
        )}
        {section === "response" && (
          <ResponsePanel
            successCodes={successCodes}
            onSuccessCodes={setSuccessCodes}
            responseSchema={responseSchema}
            onResponseSchema={setResponseSchema}
            outputTransform={outputTransform}
            onOutputTransform={setOutputTransform}
          />
        )}
      </div>
    </div>
  );
}

/* -------------- Configure: Endpoint panel -------------- */
function EndpointPanel({
  method,
  url,
  pathParams,
  onMethod,
  onUrl,
  onPathParams,
}: {
  method: Method;
  url: string;
  pathParams: PathParam[];
  onMethod: (m: Method) => void;
  onUrl: (u: string) => void;
  onPathParams: (p: PathParam[]) => void;
}) {
  const methods: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label>HTTP method</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {methods.map((m) => {
            const active = method === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onMethod(m)}
                className={cn(
                  "min-w-[68px] rounded-lg border px-3.5 py-1.5 font-mono text-[12px] font-bold tracking-wider transition",
                  active
                    ? methodTone(m, true)
                    : "border-border bg-card text-muted-foreground hover:border-primary/40",
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Request URL</Label>
        <div className="mt-2 flex overflow-hidden rounded-lg border border-border bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <span
            className={cn(
              "inline-flex items-center px-3.5 font-mono text-[12px] font-bold tracking-wider",
              methodTone(method, true),
              "rounded-none border-0",
            )}
          >
            {method}
          </span>
          <input
            value={url}
            onChange={(e) => onUrl(e.target.value)}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-sm text-foreground outline-none"
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Use <code className="rounded bg-muted px-1 py-px font-mono">{"{id}"}</code> for path
          params and <code className="rounded bg-muted px-1 py-px font-mono">{"{{env.X}}"}</code>{" "}
          for env variables.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Path parameters</Label>
          <button
            type="button"
            onClick={() =>
              onPathParams([...pathParams, { name: "", type: "string", description: "" }])
            }
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add param
          </button>
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {pathParams.length === 0 && (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3.5 py-3 text-xs text-muted-foreground">
              No path parameters. Click “Add param” to define one.
            </p>
          )}
          {pathParams.map((p, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_140px_1fr_auto] items-center gap-2">
              <input
                value={p.name}
                onChange={(e) =>
                  onPathParams(
                    pathParams.map((pp, i) => (i === idx ? { ...pp, name: e.target.value } : pp)),
                  )
                }
                placeholder="id"
                className={cn(inputCls, "font-mono")}
              />
              <div className="relative">
                <select
                  value={p.type}
                  onChange={(e) =>
                    onPathParams(
                      pathParams.map((pp, i) =>
                        i === idx ? { ...pp, type: e.target.value as PathParam["type"] } : pp,
                      ),
                    )
                  }
                  className={cn(inputCls, "appearance-none pr-8")}
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                </select>
                <svg
                  aria-hidden
                  className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M3 4.5 6 7.5 9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <input
                value={p.description}
                onChange={(e) =>
                  onPathParams(
                    pathParams.map((pp, i) =>
                      i === idx ? { ...pp, description: e.target.value } : pp,
                    ),
                  )
                }
                placeholder="Resource ID"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => onPathParams(pathParams.filter((_, i) => i !== idx))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-hover hover:text-foreground"
                aria-label="Remove parameter"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------- Configure: Auth panel -------------- */
function AuthPanel({
  authType,
  onAuthType,
  bearerToken,
  onBearerToken,
  apiKeyName,
  onApiKeyName,
  apiKeyValue,
  onApiKeyValue,
  apiKeyLocation,
  onApiKeyLocation,
  oauthClientId,
  onOauthClientId,
  oauthClientSecret,
  onOauthClientSecret,
  oauthTokenUrl,
  onOauthTokenUrl,
}: {
  authType: AuthType;
  onAuthType: (v: AuthType) => void;
  bearerToken: string;
  onBearerToken: (v: string) => void;
  apiKeyName: string;
  onApiKeyName: (v: string) => void;
  apiKeyValue: string;
  onApiKeyValue: (v: string) => void;
  apiKeyLocation: "header" | "query";
  onApiKeyLocation: (v: "header" | "query") => void;
  oauthClientId: string;
  onOauthClientId: (v: string) => void;
  oauthClientSecret: string;
  onOauthClientSecret: (v: string) => void;
  oauthTokenUrl: string;
  onOauthTokenUrl: (v: string) => void;
}) {
  const options: { id: AuthType; title: string; desc: string }[] = [
    { id: "bearer", title: "Bearer", desc: "Authorization: Bearer <token>" },
    { id: "apikey", title: "API Key", desc: "Static key in header or query param" },
    { id: "oauth", title: "OAuth 2.0", desc: "Authorization Code / Client Credentials" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label>Authentication type</Label>
        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {options.map((o) => {
            const active = authType === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onAuthType(o.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition",
                  active
                    ? "border-primary bg-[oklch(0.97_0.025_350)]"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                    active ? "border-primary" : "border-border",
                  )}
                >
                  {active && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{o.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                    {o.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {authType === "bearer" && (
        <Field label="Bearer token">
          <input
            value={bearerToken}
            onChange={(e) => onBearerToken(e.target.value)}
            placeholder="sk_live_..."
            className={cn(inputCls, "font-mono")}
          />
        </Field>
      )}

      {authType === "apikey" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px_1fr]">
          <Field label="Key name">
            <input
              value={apiKeyName}
              onChange={(e) => onApiKeyName(e.target.value)}
              placeholder="X-API-Key"
              className={cn(inputCls, "font-mono")}
            />
          </Field>
          <Field label="Location">
            <div className="relative">
              <select
                value={apiKeyLocation}
                onChange={(e) => onApiKeyLocation(e.target.value as "header" | "query")}
                className={cn(inputCls, "appearance-none pr-8")}
              >
                <option value="header">Header</option>
                <option value="query">Query</option>
              </select>
            </div>
          </Field>
          <Field label="Key value">
            <input
              value={apiKeyValue}
              onChange={(e) => onApiKeyValue(e.target.value)}
              placeholder="••••••••"
              className={cn(inputCls, "font-mono")}
            />
          </Field>
        </div>
      )}

      {authType === "oauth" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Client ID">
            <input
              value={oauthClientId}
              onChange={(e) => onOauthClientId(e.target.value)}
              className={cn(inputCls, "font-mono")}
            />
          </Field>
          <Field label="Client secret">
            <input
              type="password"
              value={oauthClientSecret}
              onChange={(e) => onOauthClientSecret(e.target.value)}
              className={cn(inputCls, "font-mono")}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Token URL">
              <input
                value={oauthTokenUrl}
                onChange={(e) => onOauthTokenUrl(e.target.value)}
                placeholder="https://auth.example.com/oauth/token"
                className={cn(inputCls, "font-mono")}
              />
            </Field>
          </div>
        </div>
      )}

      {authType === "none" && (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3.5 py-3 text-xs text-muted-foreground">
          This endpoint will be called without any credentials.
        </p>
      )}

      <p className="rounded-lg border border-border bg-muted/30 px-3.5 py-2.5 text-xs text-muted-foreground">
        Credentials are stored as encrypted secrets and never logged. Rotate from{" "}
        <span className="font-medium text-primary">Settings → Secrets</span>.
      </p>
    </div>
  );
}

/* -------------- Configure: Request panel -------------- */
function RequestPanel({
  headers,
  onHeaders,
  queryParams,
  onQueryParams,
  bodyType,
  onBodyType,
  bodyContent,
  onBodyContent,
  inputSchema,
  onInputSchema,
}: {
  headers: KV[];
  onHeaders: (v: KV[]) => void;
  queryParams: KV[];
  onQueryParams: (v: KV[]) => void;
  bodyType: "None" | "JSON" | "Form" | "Text";
  onBodyType: (v: "None" | "JSON" | "Form" | "Text") => void;
  bodyContent: string;
  onBodyContent: (v: string) => void;
  inputSchema: InputField[];
  onInputSchema: (v: InputField[]) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <KVSection
        title="Headers"
        addLabel="Add header"
        keyPlaceholder="Content-Type"
        valuePlaceholder="application/json"
        rows={headers}
        onChange={onHeaders}
      />

      <KVSection
        title="Query parameters"
        addLabel="Add param"
        keyPlaceholder="expand"
        valuePlaceholder="customer"
        rows={queryParams}
        onChange={onQueryParams}
      />

      <div>
        <div className="flex items-center justify-between">
          <Label>Body</Label>
          <div className="relative">
            <select
              value={bodyType}
              onChange={(e) => onBodyType(e.target.value as "None" | "JSON" | "Form" | "Text")}
              className={cn(inputCls, "h-9 w-32 appearance-none pr-8 text-xs font-medium")}
            >
              <option>None</option>
              <option>JSON</option>
              <option>Form</option>
              <option>Text</option>
            </select>
            <svg
              aria-hidden
              className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M3 4.5 6 7.5 9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        {bodyType === "None" ? (
          <p className="mt-2 rounded-lg border border-dashed border-border bg-muted/30 px-3.5 py-3 text-xs text-muted-foreground">
            No request body will be sent.
          </p>
        ) : (
          <CodeSurface
            value={bodyContent}
            onChange={onBodyContent}
            language={bodyType === "JSON" ? "json" : bodyType === "Form" ? "form" : "text"}
            rows={10}
          />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Input schema</Label>
          <button
            type="button"
            onClick={() =>
              onInputSchema([
                ...inputSchema,
                { id: newId(), name: "", type: "string", required: false, description: "" },
              ])
            }
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add field
          </button>
        </div>
        <div className="mt-2 overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[1.2fr_1.2fr_120px_1.6fr_36px] gap-0 border-b border-border bg-muted/40 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Field</span>
            <span>Type</span>
            <span>Required</span>
            <span>Description</span>
            <span />
          </div>
          {inputSchema.length === 0 && (
            <p className="px-3.5 py-4 text-xs text-muted-foreground">No fields defined yet.</p>
          )}
          {inputSchema.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-[1.2fr_1.2fr_120px_1.6fr_36px] items-center gap-0 border-b border-border last:border-b-0"
            >
              <input
                value={f.name}
                onChange={(e) =>
                  onInputSchema(
                    inputSchema.map((it) =>
                      it.id === f.id ? { ...it, name: e.target.value } : it,
                    ),
                  )
                }
                placeholder="field_name"
                className="border-0 bg-transparent px-3 py-2.5 font-mono text-[12.5px] text-foreground outline-none focus:bg-muted/30"
              />
              <input
                value={f.type}
                onChange={(e) =>
                  onInputSchema(
                    inputSchema.map((it) =>
                      it.id === f.id ? { ...it, type: e.target.value } : it,
                    ),
                  )
                }
                placeholder="string"
                className="border-0 bg-transparent px-3 py-2.5 font-mono text-[12.5px] text-foreground outline-none focus:bg-muted/30"
              />
              <button
                type="button"
                onClick={() =>
                  onInputSchema(
                    inputSchema.map((it) =>
                      it.id === f.id ? { ...it, required: !it.required } : it,
                    ),
                  )
                }
                className={cn(
                  "mx-3 my-1.5 inline-flex w-fit items-center rounded-md px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider transition",
                  f.required
                    ? "bg-[oklch(0.94_0.07_60)] text-[oklch(0.5_0.15_50)]"
                    : "bg-muted text-muted-foreground hover:bg-muted/70",
                )}
              >
                {f.required ? "required" : "optional"}
              </button>
              <input
                value={f.description}
                onChange={(e) =>
                  onInputSchema(
                    inputSchema.map((it) =>
                      it.id === f.id ? { ...it, description: e.target.value } : it,
                    ),
                  )
                }
                placeholder="Short description"
                className="border-0 bg-transparent px-3 py-2.5 text-[13px] text-foreground outline-none focus:bg-muted/30"
              />
              <button
                type="button"
                onClick={() => onInputSchema(inputSchema.filter((it) => it.id !== f.id))}
                className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition hover:bg-hover hover:text-foreground"
                aria-label="Remove field"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KVSection({
  title,
  addLabel,
  keyPlaceholder,
  valuePlaceholder,
  rows,
  onChange,
}: {
  title: string;
  addLabel: string;
  keyPlaceholder: string;
  valuePlaceholder: string;
  rows: KV[];
  onChange: (v: KV[]) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        <button
          type="button"
          onClick={() => onChange([...rows, { id: newId(), key: "", value: "" }])}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> {addLabel}
        </button>
      </div>
      <div className="mt-2 flex flex-col gap-2">
        {rows.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3.5 py-3 text-xs text-muted-foreground">
            None.
          </p>
        )}
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[1fr_1fr_36px] items-center gap-2">
            <input
              value={r.key}
              onChange={(e) =>
                onChange(rows.map((it) => (it.id === r.id ? { ...it, key: e.target.value } : it)))
              }
              placeholder={keyPlaceholder}
              className={cn(inputCls, "font-mono")}
            />
            <input
              value={r.value}
              onChange={(e) =>
                onChange(rows.map((it) => (it.id === r.id ? { ...it, value: e.target.value } : it)))
              }
              placeholder={valuePlaceholder}
              className={cn(inputCls, "font-mono")}
            />
            <button
              type="button"
              onClick={() => onChange(rows.filter((it) => it.id !== r.id))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-hover hover:text-foreground"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------- Configure: Response panel -------------- */
function ResponsePanel({
  successCodes,
  onSuccessCodes,
  responseSchema,
  onResponseSchema,
  outputTransform,
  onOutputTransform,
}: {
  successCodes: string[];
  onSuccessCodes: (v: string[]) => void;
  responseSchema: string;
  onResponseSchema: (v: string) => void;
  outputTransform: string;
  onOutputTransform: (v: string) => void;
}) {
  const allCodes = ["200", "201", "202", "204"];
  const errorRows: {
    http: string;
    code: string;
    message: string;
    action: string;
    tone: string;
  }[] = [
    {
      http: "400",
      code: "bad_request",
      message: "Invalid input payload",
      action: "Fail fast",
      tone: "oklch(0.5_0.2_25)",
    },
    {
      http: "401",
      code: "unauthorized",
      message: "Refresh token / re-auth",
      action: "Retry once",
      tone: "oklch(0.5_0.2_25)",
    },
    {
      http: "429",
      code: "rate_limited",
      message: "Upstream throttle",
      action: "Backoff + retry",
      tone: "oklch(0.5_0.2_25)",
    },
    {
      http: "5xx",
      code: "upstream_error",
      message: "Provider outage",
      action: "Retry + alert",
      tone: "oklch(0.5_0.2_25)",
    },
  ];

  const toggleCode = (c: string) => {
    if (successCodes.includes(c)) onSuccessCodes(successCodes.filter((x) => x !== c));
    else onSuccessCodes([...successCodes, c].sort());
  };
  const addCustom = () => {
    const v = window.prompt("Status code (e.g. 206)");
    if (!v) return;
    const cleaned = v.trim();
    if (!/^\d{3}$/.test(cleaned)) return;
    if (!successCodes.includes(cleaned)) onSuccessCodes([...successCodes, cleaned].sort());
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label>Success status codes</Label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {allCodes.map((c) => {
            const active = successCodes.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCode(c)}
                className={cn(
                  "rounded-lg border px-3 py-1 font-mono text-[12px] font-bold tracking-wider transition",
                  active
                    ? "border-[oklch(0.85_0.08_160)] bg-[oklch(0.95_0.05_160)] text-[oklch(0.42_0.14_160)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40",
                )}
              >
                {c}
              </button>
            );
          })}
          {successCodes
            .filter((c) => !allCodes.includes(c))
            .map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCode(c)}
                className="rounded-lg border border-[oklch(0.85_0.08_160)] bg-[oklch(0.95_0.05_160)] px-3 py-1 font-mono text-[12px] font-bold tracking-wider text-[oklch(0.42_0.14_160)]"
              >
                {c}
              </button>
            ))}
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm font-semibold text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>

      <div>
        <Label>Response schema</Label>
        <div className="mt-2">
          <CodeSurface
            value={responseSchema}
            onChange={onResponseSchema}
            language="json"
            rows={7}
          />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <Label>Output transform</Label>
          <span className="font-mono text-[11px] text-muted-foreground">JSONata · optional</span>
        </div>
        <div className="mt-2">
          <CodeSurface
            value={outputTransform}
            onChange={onOutputTransform}
            language="text"
            rows={5}
          />
        </div>
      </div>

      <div>
        <Label>Error mapping</Label>
        <div className="mt-2 overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[80px_1.2fr_1.6fr_1.2fr] gap-0 border-b border-border bg-muted/40 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>HTTP</span>
            <span>Code</span>
            <span>Message</span>
            <span>Action</span>
          </div>
          {errorRows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-[80px_1.2fr_1.6fr_1.2fr] items-center gap-0 border-b border-border px-3 py-2.5 last:border-b-0"
            >
              <span
                className="font-mono text-[13px] font-semibold"
                style={{ color: `oklch(0.5 0.2 25)` }}
              >
                {r.http}
              </span>
              <span className="font-mono text-[12.5px] text-foreground">{r.code}</span>
              <span className="text-[13px] text-muted-foreground">{r.message}</span>
              <span className="text-[13px] text-muted-foreground">{r.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------- Step 3 (MCP): Configure MCP server -------------- */
type McpTool = {
  name: string;
  meta: string;
  badge: "Bound API" | "Bound Fn" | "API";
};

function StepConfigureMcp({
  mcpName,
  transport,
  tab,
  onName,
  onTransport,
  onTab,
}: {
  mcpName: string;
  transport: string;
  tab: "custom" | "predefined";
  onName: (v: string) => void;
  onTransport: (v: string) => void;
  onTab: (v: "custom" | "predefined") => void;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const customTools: McpTool[] = [
    { name: "create_ticket", meta: "POST · /v1/tickets", badge: "Bound API" },
    { name: "pdf_render_fn", meta: "Custom Function · TS", badge: "Bound Fn" },
    { name: "kapture_lookup", meta: "GET · /custom/lookup", badge: "API" },
  ];
  const predefinedTools: McpTool[] = [
    { name: "search_docs", meta: "GET · /v1/docs/search", badge: "API" },
    { name: "list_users", meta: "GET · /v1/users", badge: "Bound API" },
    { name: "send_email_fn", meta: "Custom Function · TS", badge: "Bound Fn" },
  ];
  const tools = tab === "custom" ? customTools : predefinedTools;

  const endpoint = `https://mcp.kapture.io/c/${(mcpName || "").replace(/^kapture-?/, "") || "ops"}`;

  const manifest = JSON.stringify(
    {
      name: mcpName,
      tools: customTools.length + predefinedTools.length,
      auth: "oauth2",
      scopes: ["read:tickets", "write:refunds"],
    },
    null,
    2,
  );

  const badgeTone = (b: McpTool["badge"]) => {
    switch (b) {
      case "Bound API":
        return "border-[oklch(0.88_0.05_240)] bg-[oklch(0.97_0.025_240)] text-[oklch(0.45_0.14_240)]";
      case "Bound Fn":
        return "border-[oklch(0.88_0.05_300)] bg-[oklch(0.97_0.03_300)] text-[oklch(0.5_0.16_300)]";
      case "API":
        return "border-border bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Name + Transport */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>MCP Name</Label>
          <input
            value={mcpName}
            onChange={(e) => onName(e.target.value)}
            className={cn(inputCls, "h-9 font-mono text-sm")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Transport</Label>
          <div className="relative">
            <select
              value={transport}
              onChange={(e) => onTransport(e.target.value)}
              className={cn(inputCls, "h-9 appearance-none pr-9 text-sm")}
            >
              <option>Streamable HTTP</option>
              <option>SSE</option>
              <option>stdio</option>
            </select>
            <svg
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M3 4.5 6 7.5 9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Public endpoint */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Public endpoint
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-foreground">{endpoint}</p>
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(endpoint)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover hover:text-foreground"
          aria-label="Copy endpoint"
        >
          <CopyIcon />
        </button>
      </div>

      {/* Tools */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3.5 pb-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Tools</h4>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              Write a tool, or bind APIs and custom functions from the REST API section.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="inline-flex items-center rounded-full border border-border bg-background p-0.5">
              <button
                type="button"
                onClick={() => onTab("custom")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  tab === "custom"
                    ? "bg-[oklch(0.96_0.04_350)] text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                My Custom
                <span className="text-[9.5px] opacity-70">{customTools.length}</span>
              </button>
              <button
                type="button"
                onClick={() => onTab("predefined")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  tab === "predefined"
                    ? "bg-[oklch(0.96_0.04_350)] text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Predefined
                <span className="text-[9.5px] opacity-70">{predefinedTools.length}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <Plus className="h-3 w-3" /> Create Tool
            </button>
          </div>
        </div>

        <ul className="divide-y divide-border border-t border-border">
          {tools.map((t) => (
            <li
              key={t.name}
              className="flex items-center justify-between gap-3 px-4 py-2.5 transition hover:bg-hover/40"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-[13px] font-medium text-foreground">
                  {t.name}
                </p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                  {t.meta}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded border px-1.5 py-0.5 text-[10px] font-medium tracking-wide",
                    badgeTone(t.badge),
                  )}
                >
                  {t.badge}
                </span>
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[oklch(0.65_0.18_150)]" />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Tool Manifest */}
      <div className="flex flex-col gap-1.5">
        <h4 className="text-sm font-semibold text-foreground">Tool Manifest</h4>
        <CodeViewer filename="manifest.json" language="json" value={manifest} />
      </div>

      {createOpen && <CreateToolModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

/* -------------- Create Tool modal -------------- */
function CreateToolModal({ onClose }: { onClose: () => void }) {
  const [bindOpen, setBindOpen] = useState(false);
  const bindables = [
    { name: "create_ticket", meta: "POST · /v1/tickets", kind: "API" as const },
    { name: "kapture_lookup", meta: "GET · /custom/lookup", kind: "API" as const },
    { name: "list_refunds", meta: "GET · /v1/refunds", kind: "API" as const },
    { name: "pdf_render_fn", meta: "Custom Function · TS", kind: "Fn" as const },
    { name: "send_email_fn", meta: "Custom Function · TS", kind: "Fn" as const },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">Create a tool</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick how you want to expose this tool through MCP.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-hover hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex flex-col gap-2.5 px-6 pb-6">
          {/* Bind from REST API — expands inline */}
          <div
            className={cn(
              "overflow-hidden rounded-2xl border bg-card transition",
              bindOpen ? "border-primary" : "border-border",
            )}
          >
            <button
              type="button"
              onClick={() => setBindOpen((v) => !v)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-hover/40"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.96_0.04_350)]">
                <Plug className="h-4 w-4 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Bind from REST API section</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  Reuse an API or custom function you already defined.
                </p>
              </div>
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  bindOpen && "rotate-90",
                )}
              />
            </button>

            {bindOpen && (
              <div className="border-t border-border bg-background/50 p-2">
                <ul className="flex max-h-[240px] flex-col gap-1 overflow-auto">
                  {bindables.map((b) => (
                    <li key={b.name}>
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-hover"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-mono text-[13px] font-semibold text-foreground">
                            {b.name}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                            {b.meta}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                            b.kind === "API"
                              ? "border-[oklch(0.88_0.05_240)] bg-[oklch(0.97_0.025_240)] text-[oklch(0.45_0.14_240)]"
                              : "border-[oklch(0.88_0.05_300)] bg-[oklch(0.97_0.03_300)] text-[oklch(0.5_0.16_300)]",
                          )}
                        >
                          {b.kind === "API" ? "API" : "Fn"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 11V4.5A1.5 1.5 0 0 1 4.5 3H11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* -------------- Bits -------------- */
const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-foreground">{children}</label>;
}

function Field({
  label,
  sublabel,
  hint,
  children,
}: {
  label: string;
  sublabel?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
      </div>
      {children}
      {hint && <p className="text-xs leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

function methodTone(m: Method, active: boolean): string {
  if (!active) return "";
  switch (m) {
    case "GET":
      return "border border-[oklch(0.85_0.06_240)] bg-[oklch(0.95_0.04_240)] text-[oklch(0.45_0.18_240)]";
    case "POST":
      return "border border-[oklch(0.85_0.08_160)] bg-[oklch(0.95_0.05_160)] text-[oklch(0.42_0.14_160)]";
    case "PUT":
      return "border border-[oklch(0.85_0.08_80)] bg-[oklch(0.96_0.05_80)] text-[oklch(0.5_0.14_80)]";
    case "PATCH":
      return "border border-[oklch(0.85_0.08_40)] bg-[oklch(0.96_0.05_40)] text-[oklch(0.5_0.14_40)]";
    case "DELETE":
      return "border border-[oklch(0.85_0.08_20)] bg-[oklch(0.96_0.05_20)] text-[oklch(0.5_0.18_20)]";
  }
}

function stripUrl(u: string): string {
  try {
    const url = new URL(u);
    return url.pathname || u;
  } catch {
    return u;
  }
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden>
      <path d="M3 2.5v7l6-3.5-6-3.5z" />
    </svg>
  );
}

/* -------------- CodeViewer (read-only IDE-style block) -------------- */
function CodeViewer({
  filename,
  language = "json",
  value,
}: {
  filename: string;
  language?: string;
  value: string;
}) {
  const lines = value.split("\n");
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="overflow-hidden rounded-2xl border border-[oklch(0.22_0.01_280)] bg-[oklch(0.18_0.015_280)] shadow-lg shadow-black/10">
      {/* Window chrome */}
      <div className="flex items-center justify-between gap-3 border-b border-[oklch(0.26_0.01_280)] bg-[oklch(0.2_0.015_280)] px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[oklch(0.65_0.2_25)]" />
            <span className="h-3 w-3 rounded-full bg-[oklch(0.78_0.15_85)]" />
            <span className="h-3 w-3 rounded-full bg-[oklch(0.7_0.17_150)]" />
          </div>
          <div className="ml-2 inline-flex items-center gap-2 rounded-md bg-[oklch(0.24_0.012_280)] px-2.5 py-1">
            <FileIcon />
            <span className="font-mono text-[11.5px] text-[oklch(0.85_0.01_280)]">{filename}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-[oklch(0.3_0.01_280)] bg-[oklch(0.22_0.012_280)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[oklch(0.7_0.02_280)]">
            {language}
          </span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-[oklch(0.75_0.01_280)] transition hover:bg-[oklch(0.25_0.012_280)] hover:text-white"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      {/* Code body */}
      <div className="flex font-mono text-[12.5px] leading-[1.6]">
        <div
          aria-hidden
          className="select-none border-r border-[oklch(0.24_0.01_280)] bg-[oklch(0.19_0.015_280)] px-3.5 py-3 text-right text-[oklch(0.5_0.02_280)]"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="m-0 flex-1 overflow-x-auto whitespace-pre px-4 py-3 text-[oklch(0.92_0.01_280)]">
          {lines.map((line, i) => (
            <div key={i}>{highlightJsonLineDark(line) || "\u200B"}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function CodeSurface({
  value,
  onChange,
  language = "json",
  rows = 10,
}: {
  value: string;
  onChange: (v: string) => void;
  language?: string;
  rows?: number;
}) {
  const lines = value.length === 0 ? [""] : value.split("\n");
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const t = e.currentTarget;
      const s = t.selectionStart;
      const en = t.selectionEnd;
      const next = value.slice(0, s) + "  " + value.slice(en);
      onChange(next);
      requestAnimationFrame(() => {
        t.selectionStart = t.selectionEnd = s + 2;
      });
    }
  };
  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-[oklch(0.22_0.01_280)] bg-[oklch(0.18_0.015_280)] shadow-lg shadow-black/10">
      <div className="flex items-center justify-between gap-3 border-b border-[oklch(0.26_0.01_280)] bg-[oklch(0.2_0.015_280)] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[oklch(0.65_0.2_25)]" />
          <span className="h-3 w-3 rounded-full bg-[oklch(0.78_0.15_85)]" />
          <span className="h-3 w-3 rounded-full bg-[oklch(0.7_0.17_150)]" />
        </div>
        <span className="rounded-md border border-[oklch(0.3_0.01_280)] bg-[oklch(0.22_0.012_280)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[oklch(0.7_0.02_280)]">
          {language}
        </span>
      </div>
      <div className="relative flex font-mono text-[12.5px] leading-[1.6]">
        <div
          aria-hidden
          className="select-none border-r border-[oklch(0.24_0.01_280)] bg-[oklch(0.19_0.015_280)] px-3.5 py-3 text-right text-[oklch(0.5_0.02_280)]"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <div className="relative flex-1">
          <pre
            aria-hidden
            className="pointer-events-none m-0 min-h-full overflow-hidden whitespace-pre px-4 py-3 text-[oklch(0.92_0.01_280)]"
          >
            {lines.map((line, i) => (
              <div key={i}>
                {language === "json" ? highlightJsonLineDark(line) || "\u200B" : line || "\u200B"}
              </div>
            ))}
          </pre>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={rows}
            spellCheck={false}
            wrap="off"
            className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent px-4 py-3 font-mono text-[12.5px] leading-[1.6] text-transparent caret-[oklch(0.92_0.01_280)] outline-none selection:bg-[oklch(0.4_0.1_220)]/40"
          />
        </div>
      </div>
    </div>
  );
}

function FileIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 text-[oklch(0.7_0.1_60)]"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 2h5l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function highlightJsonLineDark(line: string): React.ReactNode {
  const tokens: React.ReactNode[] = [];
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)|([{}[\],])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) {
      tokens.push(
        <span key={key++} className="text-[oklch(0.75_0.01_280)]">
          {line.slice(last, m.index)}
        </span>,
      );
    }
    if (m[1] && m[2]) {
      tokens.push(
        <span key={key++} className="text-[oklch(0.78_0.15_220)]">
          {m[1]}
        </span>,
      );
      tokens.push(
        <span key={key++} className="text-[oklch(0.7_0.02_280)]">
          {m[2]}
        </span>,
      );
    } else if (m[1]) {
      tokens.push(
        <span key={key++} className="text-[oklch(0.8_0.13_145)]">
          {m[1]}
        </span>,
      );
    } else if (m[3]) {
      tokens.push(
        <span key={key++} className="font-medium text-[oklch(0.75_0.18_30)]">
          {m[3]}
        </span>,
      );
    } else if (m[4]) {
      tokens.push(
        <span key={key++} className="text-[oklch(0.8_0.15_55)]">
          {m[4]}
        </span>,
      );
    } else if (m[5]) {
      tokens.push(
        <span key={key++} className="text-[oklch(0.6_0.02_280)]">
          {m[5]}
        </span>,
      );
    }
    last = re.lastIndex;
  }
  if (last < line.length) {
    tokens.push(
      <span key={key++} className="text-[oklch(0.85_0.01_280)]">
        {line.slice(last)}
      </span>,
    );
  }
  return tokens.length ? tokens : null;
}

/* -------------- CodeEditor (JSON, line-numbered, syntax-highlighted) -------------- */
function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const lines = value.split("\n");
  return (
    <div className="relative flex min-h-[180px] font-mono text-[13px] leading-[1.6]">
      {/* Gutter */}
      <div
        aria-hidden
        className="select-none border-r border-white/5 bg-[oklch(0.16_0.02_280)] px-3 py-3 text-right text-white/30"
      >
        {lines.map((_, i) => (
          <div key={i} className="tabular-nums">
            {i + 1}
          </div>
        ))}
      </div>
      {/* Code surface */}
      <div className="relative flex-1">
        <pre
          aria-hidden
          className="pointer-events-none m-0 whitespace-pre-wrap break-words px-4 py-3 text-white/90"
        >
          {lines.map((line, i) => (
            <div key={i}>{highlightJsonLine(line) || "\u200B"}</div>
          ))}
        </pre>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          wrap="soft"
          className="absolute inset-0 h-full w-full resize-none whitespace-pre-wrap break-words bg-transparent px-4 py-3 text-transparent caret-white outline-none selection:bg-white/20"
        />
      </div>
    </div>
  );
}

function highlightJsonLine(line: string): React.ReactNode {
  const tokens: React.ReactNode[] = [];
  // Regex: keys, strings, numbers, booleans/null, punctuation
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)|([{}[\],])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) {
      tokens.push(<span key={key++}>{line.slice(last, m.index)}</span>);
    }
    if (m[1] && m[2]) {
      tokens.push(
        <span key={key++} className="text-[oklch(0.78_0.13_240)]">
          {m[1]}
        </span>,
      );
      tokens.push(
        <span key={key++} className="text-white/50">
          {m[2]}
        </span>,
      );
    } else if (m[1]) {
      tokens.push(
        <span key={key++} className="text-[oklch(0.82_0.15_140)]">
          {m[1]}
        </span>,
      );
    } else if (m[3]) {
      tokens.push(
        <span key={key++} className="text-[oklch(0.78_0.16_30)] font-medium">
          {m[3]}
        </span>,
      );
    } else if (m[4]) {
      tokens.push(
        <span key={key++} className="text-[oklch(0.82_0.15_60)]">
          {m[4]}
        </span>,
      );
    } else if (m[5]) {
      tokens.push(
        <span key={key++} className="text-white/40">
          {m[5]}
        </span>,
      );
    }
    last = re.lastIndex;
  }
  if (last < line.length) {
    tokens.push(<span key={key++}>{line.slice(last)}</span>);
  }
  return tokens;
}

/* -------------- Step 4 (MCP): Alerts & Quotas -------------- */
type AlertsState = {
  p95: string;
  p99: string;
  errorRate: string;
  spike5xx: string;
  throughputDrop: string;
  dailyCostCap: string;
  autoIncident: boolean;
};
type QuotasState = {
  globalRpm: string;
  perKeyRpm: string;
  perIpRpm: string;
  burst: string;
  concurrency: string;
  strategy: string;
  dailyCap: string;
  monthlyCap: string;
  onExceed: string;
  ipList: boolean;
};
type Channel = { label: string; mode: string };

function StepMcpOps({
  tab,
  onTab,
  alerts,
  onAlerts,
  channels,
  onChannels,
  quotas,
  onQuotas,
}: {
  tab: "alerts" | "quotas";
  onTab: (v: "alerts" | "quotas") => void;
  alerts: AlertsState;
  onAlerts: (v: AlertsState) => void;
  channels: Channel[];
  onChannels: (v: Channel[]) => void;
  quotas: QuotasState;
  onQuotas: (v: QuotasState) => void;
}) {
  const setA = <K extends keyof AlertsState>(k: K, v: AlertsState[K]) =>
    onAlerts({ ...alerts, [k]: v });
  const setQ = <K extends keyof QuotasState>(k: K, v: QuotasState[K]) =>
    onQuotas({ ...quotas, [k]: v });

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-nav (pills) */}
      <nav
        aria-label="Operations sections"
        className="flex flex-wrap gap-2 border-b border-border pb-4"
      >
        {(["alerts", "quotas"] as const).map((id) => {
          const active = tab === id;
          const label = id === "alerts" ? "Alerts" : "Quotas & Rate Limits";
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTab(id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* Panels */}
      <div className="min-w-0">
        {tab === "alerts" ? (
          <div className="flex flex-col gap-4">
            <Card title="Thresholds" subtitle="Trigger an alert when any of these metrics breach.">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Field label="p95 Latency (ms)">
                  <input
                    type="number"
                    value={alerts.p95}
                    onChange={(e) => setA("p95", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
                <Field label="p99 Latency (ms)">
                  <input
                    type="number"
                    value={alerts.p99}
                    onChange={(e) => setA("p99", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
                <Field label="Error Rate (%)">
                  <input
                    type="number"
                    value={alerts.errorRate}
                    onChange={(e) => setA("errorRate", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
                <Field label="5xx Spike (req/min)">
                  <input
                    type="number"
                    value={alerts.spike5xx}
                    onChange={(e) => setA("spike5xx", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
                <Field label="Throughput drop (%)">
                  <input
                    type="number"
                    value={alerts.throughputDrop}
                    onChange={(e) => setA("throughputDrop", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
                <Field label="Daily cost cap (USD)">
                  <input
                    type="number"
                    value={alerts.dailyCostCap}
                    onChange={(e) => setA("dailyCostCap", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
              </div>
            </Card>

            <Card
              title="Notification Channels"
              subtitle="Where to route alerts when a threshold breaches."
            >
              <div className="flex flex-col gap-2">
                {channels.map((ch, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 transition hover:border-foreground/20"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.65_0.18_150)]" />
                      <span className="truncate text-[13px] font-medium text-foreground">
                        {ch.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{ch.mode}</span>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const label = window.prompt("Channel (e.g. Slack · #channel)");
                    if (!label) return;
                    const mode = window.prompt("When to notify?", "On breach") || "On breach";
                    onChannels([...channels, { label, mode }]);
                  }}
                  className="inline-flex w-fit items-center gap-1 rounded-md py-1 text-[13px] font-medium text-primary transition hover:text-primary/80"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add channel
                </button>
              </div>
            </Card>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3.5">
              <span
                role="checkbox"
                aria-checked={alerts.autoIncident}
                onClick={() => setA("autoIncident", !alerts.autoIncident)}
                className={cn(
                  "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition",
                  alerts.autoIncident
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card",
                )}
              >
                {alerts.autoIncident && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-foreground">
                  Auto-create incident on critical breach
                </span>
                <span className="text-[11.5px] text-muted-foreground">
                  Opens a linked incident in PagerDuty / Linear with run-book attached.
                </span>
              </span>
            </label>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Card
              title="Rate Limits"
              subtitle="Throttle traffic before it reaches downstream tools."
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Field label="Global RPM">
                  <input
                    type="number"
                    value={quotas.globalRpm}
                    onChange={(e) => setQ("globalRpm", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
                <Field label="Per-key RPM">
                  <input
                    type="number"
                    value={quotas.perKeyRpm}
                    onChange={(e) => setQ("perKeyRpm", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
                <Field label="Per-IP RPM">
                  <input
                    type="number"
                    value={quotas.perIpRpm}
                    onChange={(e) => setQ("perIpRpm", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
                <Field label="Burst">
                  <input
                    type="number"
                    value={quotas.burst}
                    onChange={(e) => setQ("burst", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
                <Field label="Concurrency">
                  <input
                    type="number"
                    value={quotas.concurrency}
                    onChange={(e) => setQ("concurrency", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
                <Field label="Strategy">
                  <select
                    value={quotas.strategy}
                    onChange={(e) => setQ("strategy", e.target.value)}
                    className={cn(inputCls, "h-9 appearance-none pr-8")}
                  >
                    <option>Token bucket</option>
                    <option>Leaky bucket</option>
                    <option>Fixed window</option>
                    <option>Sliding window</option>
                  </select>
                </Field>
              </div>
            </Card>

            <Card title="Quotas" subtitle="Hard ceilings enforced over rolling windows.">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Field label="Daily request cap">
                  <input
                    type="number"
                    value={quotas.dailyCap}
                    onChange={(e) => setQ("dailyCap", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
                <Field label="Monthly request cap">
                  <input
                    type="number"
                    value={quotas.monthlyCap}
                    onChange={(e) => setQ("monthlyCap", e.target.value)}
                    className={cn(inputCls, "h-9")}
                  />
                </Field>
                <Field label="On exceed">
                  <select
                    value={quotas.onExceed}
                    onChange={(e) => setQ("onExceed", e.target.value)}
                    className={cn(inputCls, "h-9 appearance-none pr-8")}
                  >
                    <option>429 + Retry-After</option>
                    <option>Queue request</option>
                    <option>Soft warn + allow</option>
                    <option>Reject silently</option>
                  </select>
                </Field>
              </div>
            </Card>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3.5">
              <span
                role="checkbox"
                aria-checked={quotas.ipList}
                onClick={() => setQ("ipList", !quotas.ipList)}
                className={cn(
                  "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition",
                  quotas.ipList
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card",
                )}
              >
                {quotas.ipList && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-foreground">
                  IP allow / deny list
                </span>
                <span className="text-[11.5px] text-muted-foreground">
                  Restrict by CIDR ranges. Useful for partner-only endpoints.
                </span>
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function SubNavItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-left text-sm font-semibold transition",
        active
          ? "bg-[oklch(0.96_0.04_350)] text-primary"
          : "text-muted-foreground hover:bg-hover hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>;
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-4 py-3">
        <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[11.5px] text-muted-foreground">{subtitle}</p>}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
