import { useState } from "react";
import {
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  GitBranch,
  Play,
  Plug,
  Plus,
  Shuffle,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CardShell, Field, inputCls } from "./RestApiFlow";

type AuthProtocol = "api-key" | "oauth" | "mtls";
type MonitorType = "Error Rate Percentage" | "P95 Latency" | "Throughput Drop" | "5xx Spike";
type Operator = "Greater Than (>)" | "Less Than (<)" | "Equals (=)";
type EvalWindow = "1 Minute" | "5 Minutes" | "15 Minutes" | "1 Hour";
type RateUnit = "Req/Min" | "Req/Sec" | "Req/Hour";
type ExceedStrategy =
  "Return HTTP 429 payload immediately" | "Queue and delay" | "Shed lowest priority traffic";

const MODELS = [
  "Claude Sonnet 4",
  "gpt-4.1",
  "gpt-4o",
  "gpt-4o-mini",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
] as const;

const AUTH_OPTIONS: { id: AuthProtocol; title: string; description: string }[] = [
  {
    id: "api-key",
    title: "Standard API Key",
    description: "Secure header token match validation.",
  },
  {
    id: "oauth",
    title: "OAuth 2.0 Flow",
    description: "Cryptographic machine-to-machine scoped grants.",
  },
  {
    id: "mtls",
    title: "Mutual TLS (mTLS)",
    description: "Transport layer client certificate handshake validation.",
  },
];

const DEFAULT_TOOLS: { id: string; enabled: boolean }[] = [
  { id: "search_customer", enabled: true },
  { id: "refund_order", enabled: true },
  { id: "send_email", enabled: false },
  { id: "create_ticket", enabled: true },
];

export function AgentAsApiForm({
  onBack,
  embedded = false,
}: {
  onBack: () => void;
  embedded?: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [model, setModel] = useState<string>("Claude Sonnet 4");
  const [endpointPath, setEndpointPath] = useState("/v1/agents/support-ops");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [auth, setAuth] = useState<AuthProtocol>("api-key");
  const [rateLimit, setRateLimit] = useState("500");
  const [maxTokens, setMaxTokens] = useState("4096");
  const [temperature, setTemperature] = useState("0.2");

  const [tools, setTools] = useState(DEFAULT_TOOLS);

  const [monitorType, setMonitorType] = useState<MonitorType>("Error Rate Percentage");
  const [operator, setOperator] = useState<Operator>("Greater Than (>)");
  const [threshold, setThreshold] = useState("10");
  const [evalWindow, setEvalWindow] = useState<EvalWindow>("5 Minutes");
  const [webhookUrl, setWebhookUrl] = useState(
    "https://api.internal-ops.net/v1/webhooks/slack-alerts",
  );

  const [rateVelocity, setRateVelocity] = useState("1000");
  const [rateUnit, setRateUnit] = useState<RateUnit>("Req/Min");
  const [burst, setBurst] = useState("50");
  const [concurrency, setConcurrency] = useState("20");
  const [tokenQuota, setTokenQuota] = useState("5000000");
  const [exceedStrategy, setExceedStrategy] = useState<ExceedStrategy>(
    "Return HTTP 429 payload immediately",
  );

  return (
    <div className="flex flex-col">
      <div>
        <h2 className="text-base font-semibold text-foreground">Configure your Agent as API</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Expose an agent as a single callable endpoint. Define identity, endpoint configuration,
          tool access, alerting, and quotas.
        </p>
      </div>

      {/* Row 1 — Identity & Endpoint Config */}
      <div className="mt-6 flex flex-col gap-5">
        <AgentMetadataCard
          name={name}
          description={description}
          onName={setName}
          onDescription={setDescription}
        />

        <CardShell
          step={2}
          title="Configure Agent Endpoint"
          footer="Provision cognitive architecture settings, access path routes, security options, and parameters."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Underlying model core" hint="LLM used to run this agent.">
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={cn(inputCls, "appearance-none pr-9")}
                >
                  {MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>
            <Field label="Endpoint server target path" hint="Callable route on this workspace.">
              <input
                value={endpointPath}
                onChange={(e) => setEndpointPath(e.target.value)}
                placeholder="/v1/agents/support-ops"
                className={cn(inputCls, "font-mono")}
              />
            </Field>
          </div>

          <Field
            label="System prompt guardrails"
            hint="Executes on every invocation before tool calls."
          >
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a support triage agent. Classify the issue, attach the right tags, and call refund_order only when the customer is verified."
              rows={4}
              spellCheck={false}
              className={cn(inputCls, "resize-y font-mono text-[12.5px] leading-relaxed")}
            />
          </Field>

          <Field
            label="Authentication protocol selection"
            hint="Applied at the gateway before request enters the agent."
          >
            <div className="grid gap-2 md:grid-cols-3">
              {AUTH_OPTIONS.map((opt) => {
                const active = auth === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAuth(opt.id)}
                    className={cn(
                      "relative flex flex-col items-start gap-1 rounded-xl border px-3.5 py-3 text-left transition",
                      active
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-[#e8e6e1] bg-card hover:border-primary/30",
                    )}
                  >
                    <span className="text-[13px] font-semibold text-foreground">{opt.title}</span>
                    <span className="text-[11.5px] leading-snug text-muted-foreground">
                      {opt.description}
                    </span>
                    {active && (
                      <span className="absolute right-2.5 top-2.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Execution parameters">
            <div className="grid gap-3 md:grid-cols-3">
              <SubField label="Rate limit (RPM)">
                <input
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  inputMode="numeric"
                  className={cn(inputCls, "font-mono")}
                />
              </SubField>
              <SubField label="Max output tokens">
                <input
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  inputMode="numeric"
                  className={cn(inputCls, "font-mono")}
                />
              </SubField>
              <SubField label="Temperature">
                <input
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className={cn(inputCls, "font-mono")}
                />
              </SubField>
            </div>
          </Field>
        </CardShell>
      </div>

      {/* Row 2 — Tools & Output Pipeline */}
      <div className="mt-5 flex flex-col gap-5">
        <CardShell
          step={3}
          title="Tools Made Available"
          footer="Toggle and grant permissions for specific functional tool scopes execution environments."
        >
          <div className="flex flex-col gap-2">
            {tools.map((t) => (
              <label
                key={t.id}
                className={cn(
                  "group flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition",
                  t.enabled
                    ? "border-primary/40 bg-primary/[0.04]"
                    : "border-[#e8e6e1] bg-card hover:border-primary/20",
                )}
              >
                <input
                  type="checkbox"
                  checked={t.enabled}
                  onChange={() =>
                    setTools((prev) =>
                      prev.map((x) => (x.id === t.id ? { ...x, enabled: !x.enabled } : x)),
                    )
                  }
                  className="h-4 w-4 shrink-0 accent-primary"
                />
                <span className="flex-1 font-mono text-[13px] text-foreground">{t.id}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider",
                    t.enabled ? "bg-primary/10 text-primary" : "bg-[#f4f3f1] text-muted-foreground",
                  )}
                >
                  {t.enabled ? "Enabled" : "Disabled"}
                </span>
              </label>
            ))}
          </div>
        </CardShell>

        <CardShell
          step={4}
          title="Custom Format Pipeline Engine"
          footer="Map final conversation outputs directly into standardized enterprise payload structures."
        >
          {/* 1 · Pipeline overview */}
          <div className="rounded-xl border border-[#e8e6e1] bg-[#faf9f7] p-3.5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Response flow
                </span>
                <span className="text-[11.5px] text-muted-foreground">· click a step to edit</span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-semibold text-primary transition hover:bg-primary/10"
              >
                <Play className="h-3 w-3 fill-current" />
                Dry run
              </button>
            </div>

            <PipelineNodes />

            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-dashed border-[#e8e6e1] pt-3">
              <span className="mr-1 text-[11px] font-medium text-muted-foreground">
                Insert step
              </span>
              <AddChip icon={<Braces className="h-3 w-3" />} label="Parse" tint="slate" />
              <AddChip icon={<Shuffle className="h-3 w-3" />} label="Field map" tint="amber" />
              <AddChip icon={<FileCheck2 className="h-3 w-3" />} label="Validate" tint="emerald" />
              <AddChip icon={<Wand2 className="h-3 w-3" />} label="Transform" tint="violet" />
              <AddChip icon={<GitBranch className="h-3 w-3" />} label="Branch" tint="amber" />
            </div>
          </div>

          {/* 2 · Selected step editor */}
          <div className="rounded-xl border border-[#e8e6e1] bg-card">
            <div className="flex items-center gap-2.5 border-b border-[#e8e6e1] px-4 py-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wand2 className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Editing step
                  </span>
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-primary">
                    Custom format
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  Custom template to shape the response payload.
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Step name">
                  <input defaultValue="Custom format" className={inputCls} />
                </Field>
                <Field label="Payload format">
                  <div className="relative">
                    <select className={cn(inputCls, "appearance-none pr-9")}>
                      <option>Custom template</option>
                      <option>OpenAPI response (.yaml)</option>
                      <option>Protobuf schema (.proto)</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </Field>
              </div>

              <Field
                label="Template"
                hint={
                  <>
                    Reference upstream values with{" "}
                    <code className="rounded bg-[#f4f3f1] px-1 py-0.5 font-mono text-[11px] text-foreground">
                      {"{{agent.*}}"}
                    </code>{" "}
                    or{" "}
                    <code className="rounded bg-[#f4f3f1] px-1 py-0.5 font-mono text-[11px] text-foreground">
                      {"{{payload.*}}"}
                    </code>
                    .
                  </>
                }
              >
                <CodeEditor />
              </Field>
            </div>
          </div>
        </CardShell>
      </div>

      {/* Row 3 — Alerts & Quotas */}
      <div className="mt-5 flex flex-col gap-5">
        <CardShell
          step={5}
          title="Alerts"
          footer="Configure conditional performance thresholds and target destination routing protocols."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Metric monitoring type">
              <div className="relative">
                <select
                  value={monitorType}
                  onChange={(e) => setMonitorType(e.target.value as MonitorType)}
                  className={cn(inputCls, "appearance-none pr-9")}
                >
                  {["Error Rate Percentage", "P95 Latency", "Throughput Drop", "5xx Spike"].map(
                    (v) => (
                      <option key={v}>{v}</option>
                    ),
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>
            <Field label="Condition rule operator">
              <div className="relative">
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value as Operator)}
                  className={cn(inputCls, "appearance-none pr-9")}
                >
                  {["Greater Than (>)", "Less Than (<)", "Equals (=)"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>
            <Field label="Trigger threshold value">
              <div className="relative">
                <input
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  inputMode="numeric"
                  className={cn(inputCls, "pr-8 font-mono")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </Field>
            <Field label="Evaluation time window">
              <div className="relative">
                <select
                  value={evalWindow}
                  onChange={(e) => setEvalWindow(e.target.value as EvalWindow)}
                  className={cn(inputCls, "appearance-none pr-9")}
                >
                  {["1 Minute", "5 Minutes", "15 Minutes", "1 Hour"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>
          </div>
          <Field label="Notification webhook endpoint destination">
            <input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className={cn(inputCls, "font-mono")}
            />
          </Field>
        </CardShell>

        <CardShell
          step={6}
          title="Quotas & Rate Limits"
          footer="Regulate downstream infrastructure loads, concurrent connections, and cyclical billing caps."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Rate velocity threshold">
              <div className="flex items-stretch gap-2">
                <input
                  value={rateVelocity}
                  onChange={(e) => setRateVelocity(e.target.value)}
                  inputMode="numeric"
                  className={cn(inputCls, "font-mono")}
                />
                <div className="relative">
                  <select
                    value={rateUnit}
                    onChange={(e) => setRateUnit(e.target.value as RateUnit)}
                    className={cn(inputCls, "appearance-none pr-8")}
                  >
                    {["Req/Min", "Req/Sec", "Req/Hour"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </Field>
            <Field label="Maximum burst allowance">
              <input
                value={burst}
                onChange={(e) => setBurst(e.target.value)}
                inputMode="numeric"
                className={cn(inputCls, "font-mono")}
              />
            </Field>
            <Field label="Concurrent execution workers limit">
              <input
                value={concurrency}
                onChange={(e) => setConcurrency(e.target.value)}
                inputMode="numeric"
                className={cn(inputCls, "font-mono")}
              />
            </Field>
            <Field label="Hard monthly token quota">
              <div className="relative">
                <input
                  value={tokenQuota}
                  onChange={(e) => setTokenQuota(e.target.value)}
                  inputMode="numeric"
                  className={cn(inputCls, "pr-16 font-mono")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tokens
                </span>
              </div>
            </Field>
          </div>
          <Field label="Exceeded floor strategy (429 action)">
            <div className="relative">
              <select
                value={exceedStrategy}
                onChange={(e) => setExceedStrategy(e.target.value as ExceedStrategy)}
                className={cn(inputCls, "appearance-none pr-9")}
              >
                {[
                  "Return HTTP 429 payload immediately",
                  "Queue and delay",
                  "Shed lowest priority traffic",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </Field>
        </CardShell>
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
                alert("Agent endpoint saved & published");
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

export function AgentMetadataCard({
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
            this to choose when to call this integration.
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

function SubField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function PipelineNodes() {
  const nodes = [
    {
      icon: <Plug className="h-3.5 w-3.5" />,
      label: "Request in",
      sub: "JSON",
      tint: "text-sky-600",
    },
    {
      icon: <Braces className="h-3.5 w-3.5" />,
      label: "Parse body",
      sub: "JSON",
      tint: "text-slate-500",
    },
    {
      icon: <Wand2 className="h-3.5 w-3.5" />,
      label: "Custom format",
      sub: "Template",
      tint: "text-primary",
      active: true,
    },
    {
      icon: <Plug className="h-3.5 w-3.5 rotate-180" />,
      label: "Response out",
      sub: "JSON",
      tint: "text-orange-500",
    },
  ];
  return (
    <div className="flex flex-wrap items-stretch gap-1">
      {nodes.map((n, i) => (
        <div key={n.label} className="flex items-center gap-1">
          <div
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 transition",
              n.active
                ? "border-primary bg-primary/[0.06] shadow-sm ring-1 ring-primary/20"
                : "border-[#e8e6e1] bg-card hover:border-primary/40 hover:bg-[#f4f3f1]/60",
            )}
          >
            <span
              className={cn(
                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                n.active ? "bg-primary/15" : "bg-[#f4f3f1]",
                n.tint,
              )}
            >
              {n.icon}
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[12px] font-semibold text-foreground">{n.label}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {n.sub}
              </span>
            </div>
          </div>
          {i < nodes.length - 1 && (
            <div className="flex items-center">
              <span className="h-px w-2 bg-[#d9d6d0]" />
              <ChevronRight className="h-3 w-3 -mx-0.5 text-muted-foreground/50" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AddChip({
  icon,
  label,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  tint: "slate" | "amber" | "emerald" | "violet";
}) {
  const tintMap: Record<string, string> = {
    slate: "text-slate-500",
    amber: "text-amber-500",
    emerald: "text-emerald-500",
    violet: "text-violet-500",
  };
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e6e1] bg-card px-2.5 py-1 text-[12px] font-medium text-foreground transition hover:border-primary/40 hover:bg-[#f4f3f1]"
    >
      <Plus className="h-3 w-3 text-muted-foreground" />
      <span className={tintMap[tint]}>{icon}</span>
      {label}
    </button>
  );
}

function CodeEditor() {
  const lines = [
    <>{"{"}</>,
    <>
      {"  "}
      <span className="text-sky-300">{`"reply"`}</span>
      <span className="text-white/70">: </span>
      <span className="text-emerald-300">{`"{{agent.output}}"`}</span>
      <span className="text-white/70">,</span>
    </>,
    <>
      {"  "}
      <span className="text-sky-300">{`"intent"`}</span>
      <span className="text-white/70">: </span>
      <span className="text-emerald-300">{`"{{agent.intent}}"`}</span>
      <span className="text-white/70">,</span>
    </>,
    <>
      {"  "}
      <span className="text-sky-300">{`"confidence"`}</span>
      <span className="text-white/70">: </span>
      <span className="text-amber-300">{`{{agent.score}}`}</span>
    </>,
    <>{"}"}</>,
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-[#e8e6e1] bg-[#0d1117] shadow-sm">
      <div className="flex items-center justify-between border-b border-white/5 bg-[#161b22] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          <span className="ml-3 font-mono text-[11px] text-white/60">template.json</span>
        </div>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-white/40">
          JSON
        </span>
      </div>
      <div className="flex font-mono text-[12.5px] leading-relaxed">
        <div className="select-none border-r border-white/5 bg-[#0b0f14] px-3 py-3 text-right text-white/30">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 overflow-x-auto px-4 py-3 text-[#e6edf3]">
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </pre>
      </div>
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
    <div className="inline-flex items-center gap-1 rounded-full bg-[#f4f3f1] p-1">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-medium transition",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
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
