import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Search,
  Copy,
  Check,
  Play,
  ExternalLink,
  Bot,
  GitBranch,
  LayoutGrid,
  Globe,
  ChevronRight,
  X,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { highlight, languages } from "@/lib/prism-setup";
import "@/styles/prism-vitos.css";

// ---------- Types & mock data ----------

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Caller = "UI" | "Agent" | "Workflow" | "External";

type LogRow = {
  id: string;
  ts: Date;
  method: Method;
  path: string;
  code: number;
  ms: number;
  caller: Caller;
  actor: string;
  region: string;
  bytes: number;
  request: unknown;
  response: unknown;
};

const METHODS: Method[] = ["GET", "POST", "PATCH", "DELETE"];
const CALLERS: Caller[] = ["UI", "Agent", "Workflow", "External"];
const PATHS = [
  "/v1/orders",
  "/v1/orders/ord_38291",
  "/v1/customers/cus_77182/profile",
  "/v1/payments/intents",
  "/v1/inventory/sku/SHO-001",
  "/v1/webhooks/stripe",
  "/v1/agents/runs",
  "/v1/workflows/aop_42/execute",
  "/v1/auth/token",
  "/v1/files/upload",
];
const ACTORS = [
  "dashboard@kapture",
  "agent:concierge-v3",
  "workflow:refund-bot",
  "partner:stripe",
  "partner:shopify",
  "user:meera.k",
];
const REGIONS = ["us-east-1", "eu-west-1", "ap-south-1"];
const CODES = [200, 200, 200, 200, 201, 204, 400, 401, 404, 409, 422, 500, 502, 503];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function makeId() {
  return "req_" + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}
function makeRow(when: Date = new Date()): LogRow {
  const method = rand(METHODS);
  const code = rand(CODES);
  const caller = rand(CALLERS);
  const path = rand(PATHS);
  const ms = Math.max(8, Math.round(Math.abs(Math.random() ** 3 * 2400) + 18));
  const bytes = Math.round(200 + Math.random() * 8000);
  return {
    id: makeId(),
    ts: when,
    method,
    path,
    code,
    ms,
    caller,
    actor: rand(ACTORS),
    region: rand(REGIONS),
    bytes,
    request: {
      method,
      path,
      headers: { "content-type": "application/json", "x-trace-id": makeId() },
      body: {
        example: true,
        ts: when.toISOString(),
        amount: Math.round(Math.random() * 10000) / 100,
      },
    },
    response: {
      status: code,
      latency_ms: ms,
      body:
        code >= 500
          ? {
              error: "internal_error",
              message: "Upstream timeout reaching payments service",
              trace: makeId(),
            }
          : code >= 400
            ? { error: "validation_error", field: "amount", message: "must be a positive number" }
            : { ok: true, id: makeId(), processed_at: when.toISOString(), items: 3 },
    },
  };
}

function seedRows(n: number): LogRow[] {
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => makeRow(new Date(now - i * 1500)));
}

// ---------- Visual helpers ----------

const METHOD_BADGE: Record<Method, string> = {
  GET: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  POST: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  PUT: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  PATCH: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  DELETE: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

function statusTone(code: number) {
  if (code >= 500) return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  if (code >= 400) return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  if (code >= 300) return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
}

const CALLER_ICON: Record<Caller, React.ComponentType<{ className?: string }>> = {
  UI: LayoutGrid,
  Agent: Bot,
  Workflow: GitBranch,
  External: Globe,
};

function fmtTs(d: Date) {
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}
function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
function percentile(arr: number[], p: number) {
  if (arr.length === 0) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const idx = Math.min(s.length - 1, Math.floor((p / 100) * s.length));
  return s[idx];
}

// SLA + baseline thresholds (kept low so demo flips elevated states)
const ERROR_RATE_BASELINE = 0.05; // 2x = 10%
const SLA_P99_MS = 1500;

// ---------- Main ----------

export function RequestLogsTab() {
  const [rows, setRows] = useState<LogRow[]>(() => seedRows(60));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "errors" | "4xx" | "5xx">("all");
  const [caller, setCaller] = useState<"All" | Caller>("All");
  const [selectedId, setSelectedId] = useState<string>(() => "");

  // Live stream
  useEffect(() => {
    const t = setInterval(() => {
      setRows((prev) => [makeRow(new Date()), ...prev].slice(0, 400));
    }, 1600);
    return () => clearInterval(t);
  }, []);

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status === "errors" && r.code < 400) return false;
      if (status === "4xx" && !(r.code >= 400 && r.code < 500)) return false;
      if (status === "5xx" && r.code < 500) return false;
      if (caller !== "All" && r.caller !== caller) return false;
      if (q) {
        const hay = `${r.path} ${r.caller} ${r.code} ${fmtTs(r.ts)} ${r.actor}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, query, status, caller]);

  // Pick selected row — default to newest visible, fallback to newest of all
  const selected = rows.find((r) => r.id === selectedId) ?? visibleRows[0] ?? rows[0] ?? null;

  const errorCount = useMemo(() => rows.filter((r) => r.code >= 400).length, [rows]);
  const errorRate = rows.length === 0 ? 0 : errorCount / rows.length;
  const latencies = rows.map((r) => r.ms);
  const p50 = percentile(latencies, 50);
  const p95 = percentile(latencies, 95);
  const p99 = percentile(latencies, 99);

  const errorElevated = errorRate >= ERROR_RATE_BASELINE * 2;
  const slowestElevated = p99 >= SLA_P99_MS;

  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setCaller("All");
  };

  const exportCsv = () => {
    const head = [
      "time",
      "method",
      "path",
      "code",
      "ms",
      "caller",
      "actor",
      "region",
      "bytes",
      "id",
    ];
    const lines = [head.join(",")];
    for (const r of visibleRows) {
      lines.push(
        [
          r.ts.toISOString(),
          r.method,
          r.path,
          r.code,
          r.ms,
          r.caller,
          r.actor,
          r.region,
          r.bytes,
          r.id,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `request-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Zone 1 — Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span>Integrations</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">Request Logs</span>
          </div>
          <h1 className="mt-1 text-[20px] font-semibold tracking-tight text-foreground">
            Live API traffic
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Every request flowing through the platform — UI, Agents, Workflows, and External
            callers.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-medium text-emerald-700 ring-1 ring-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live streaming
          </span>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground transition hover:bg-muted/60"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Zone 2 — Metric cards */}
      <div className="grid grid-cols-5 gap-3">
        <MetricCard label="Requests" value={rows.length.toLocaleString()} sub="last 5 min" />
        <MetricCard
          label="Errors"
          value={`${errorCount}`}
          sub={`${(errorRate * 100).toFixed(1)}% rate`}
          tone={errorElevated ? "danger" : "default"}
        />
        <MetricCard label="Median latency" value={`${p50}ms`} sub="P50" />
        <MetricCard label="Slow tail" value={`${p95}ms`} sub="P95" />
        <MetricCard
          label="Slowest tail"
          value={p99 >= 1000 ? `${(p99 / 1000).toFixed(2)}s` : `${p99}ms`}
          sub={`P99 · ${SLA_P99_MS}ms SLA`}
          tone={slowestElevated ? "warning" : "default"}
        />
      </div>

      {/* Zone 3 — Toolbar */}
      <div className="flex items-center gap-3 rounded-[14px] border border-border bg-card p-2.5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search path, actor, request ID…"
            className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#B22257]/30"
          />
        </div>

        <FilterGroup label="Status">
          <FilterPill active={status === "all"} onClick={() => setStatus("all")}>
            All
          </FilterPill>
          <FilterPill
            active={status === "errors"}
            onClick={() => setStatus("errors")}
            tone="danger"
          >
            Errors
            <span
              className={cn(
                "ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                status === "errors"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
              )}
            >
              {errorCount}
            </span>
          </FilterPill>
          <FilterPill active={status === "4xx"} onClick={() => setStatus("4xx")} tone="warning">
            4xx
          </FilterPill>
          <FilterPill active={status === "5xx"} onClick={() => setStatus("5xx")} tone="danger">
            5xx
          </FilterPill>
        </FilterGroup>

        <div className="h-7 w-px bg-border" />

        <FilterGroup label="Caller">
          <FilterPill active={caller === "All"} onClick={() => setCaller("All")}>
            All
          </FilterPill>
          {CALLERS.map((c) => (
            <FilterPill key={c} active={caller === c} onClick={() => setCaller(c)}>
              {c}
            </FilterPill>
          ))}
        </FilterGroup>
      </div>

      {/* Zone 4 — Content grid */}
      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-4">
        <LogTable
          rows={visibleRows}
          totalCount={rows.length}
          selectedId={selected?.id ?? ""}
          onSelect={(id) => setSelectedId(id)}
          onClearFilters={clearFilters}
          filtersActive={query !== "" || status !== "all" || caller !== "All"}
        />
        <DetailPanel row={selected} />
      </div>
    </div>
  );
}

// ---------- Sub: MetricCard ----------

function MetricCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "danger" | "warning";
}) {
  const toneClasses =
    tone === "danger"
      ? "border-rose-200 bg-rose-50/70"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50/70"
        : "border-border bg-card";
  const labelTone =
    tone === "danger"
      ? "text-rose-700"
      : tone === "warning"
        ? "text-amber-800"
        : "text-muted-foreground";
  const valueTone =
    tone === "danger" ? "text-rose-700" : tone === "warning" ? "text-amber-800" : "text-foreground";
  return (
    <div className={cn("rounded-[14px] border px-3.5 py-3 transition", toneClasses)}>
      <div className="flex items-center justify-between">
        <div className={cn("text-[10.5px] font-semibold uppercase tracking-[0.14em]", labelTone)}>
          {label}
        </div>
        {tone !== "default" && <AlertTriangle className={cn("h-3.5 w-3.5", valueTone)} />}
      </div>
      <div className={cn("mt-1.5 text-[20px] font-semibold tracking-tight", valueTone)}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ---------- Sub: Filter chrome ----------

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
  tone = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "danger" | "warning";
}) {
  const activeClass =
    tone === "danger"
      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
      : tone === "warning"
        ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
        : "bg-[#FCE6EC] text-[#9A1F4A] ring-1 ring-[#F0CEDB]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[12px] font-medium transition",
        active ? activeClass : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

// ---------- Sub: LogTable ----------

function LogTable({
  rows,
  totalCount,
  selectedId,
  onSelect,
  onClearFilters,
  filtersActive,
}: {
  rows: LogRow[];
  totalCount: number;
  selectedId: string;
  onSelect: (id: string) => void;
  onClearFilters: () => void;
  filtersActive: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between px-1 text-[11.5px] text-muted-foreground">
        <span>
          Showing <span className="font-semibold text-foreground">{rows.length}</span> of{" "}
          <span className="font-semibold text-foreground">{totalCount}</span> requests
        </span>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-border bg-card">
        <div className="grid grid-cols-[96px_64px_minmax(0,1fr)_64px_72px_120px] gap-3 border-b border-border bg-muted/40 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <div>Time</div>
          <div>Method</div>
          <div>Path</div>
          <div>Code</div>
          <div className="text-right">ms</div>
          <div>Caller</div>
        </div>

        <div className="max-h-[560px] overflow-y-auto">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
              <p className="text-[13px] text-muted-foreground">
                {filtersActive ? "No requests match your filters" : "Waiting for requests…"}
              </p>
              {filtersActive && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="text-[12.5px] font-medium text-[#B22257] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            rows.map((r) => {
              const selected = r.id === selectedId;
              const is4xx = r.code >= 400 && r.code < 500;
              const is5xx = r.code >= 500;
              const Icon = CALLER_ICON[r.caller];
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelect(r.id)}
                  className={cn(
                    "grid w-full grid-cols-[96px_64px_minmax(0,1fr)_64px_72px_120px] items-center gap-3 border-b border-border/70 px-3 py-2 text-left transition hover:bg-muted/40 focus:outline-none",
                    is4xx && "bg-amber-50/40",
                    is5xx && "bg-rose-50/50",
                    selected && "bg-[#FCE6EC]/60",
                  )}
                  style={{
                    boxShadow: selected
                      ? "inset 2px 0 0 0 #C23469"
                      : is5xx
                        ? "inset 2px 0 0 0 #E11D48"
                        : is4xx
                          ? "inset 2px 0 0 0 #D97706"
                          : undefined,
                  }}
                >
                  <span className="font-mono text-[11.5px] text-muted-foreground">
                    {fmtTs(r.ts)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold",
                      METHOD_BADGE[r.method],
                    )}
                  >
                    {r.method}
                  </span>
                  <span className="truncate font-mono text-[12.5px] text-foreground">{r.path}</span>
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums",
                      statusTone(r.code),
                    )}
                  >
                    {r.code}
                  </span>
                  <span
                    className={cn(
                      "text-right font-mono text-[12px] tabular-nums",
                      r.ms > 1000 ? "font-medium text-rose-600" : "text-foreground",
                    )}
                  >
                    {r.ms}
                  </span>
                  <span className="inline-flex w-fit items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    {r.caller}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Sub: DetailPanel ----------

function DetailPanel({ row }: { row: LogRow | null }) {
  const [tab, setTab] = useState<"Response" | "Request">("Response");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);

  const payloadObj = row ? (tab === "Response" ? row.response : row.request) : null;
  const payloadStr = useMemo(
    () => (payloadObj ? JSON.stringify(payloadObj, null, 2) : ""),
    [payloadObj],
  );
  const highlighted = useMemo(
    () => (payloadStr ? highlight(payloadStr, languages.json, "json") : ""),
    [payloadStr],
  );

  if (!row) {
    return (
      <div className="sticky top-4 self-start rounded-[16px] border border-border bg-card p-6 text-[13px] text-muted-foreground">
        Select a request to inspect.
      </div>
    );
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(row.id);
    } catch {
      /* noop */
    }
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1400);
  };
  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(payloadStr);
    } catch {
      /* noop */
    }
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 1400);
  };

  return (
    <>
      <aside className="sticky top-4 flex max-h-[calc(100vh-2rem)] flex-col self-start overflow-hidden rounded-[16px] border border-border bg-card">
        {/* Section A — header */}
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold",
                METHOD_BADGE[row.method],
              )}
            >
              {row.method}
            </span>
            <span
              className={cn(
                "inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums",
                statusTone(row.code),
              )}
            >
              {row.code}
            </span>
            <span
              className={cn(
                "ml-auto font-mono text-[12px] tabular-nums",
                row.ms > 1000 ? "font-medium text-rose-600" : "text-muted-foreground",
              )}
            >
              {row.ms}ms
            </span>
          </div>
          <div className="mt-2 break-all font-mono text-[12.5px] font-medium text-foreground">
            {row.path}
          </div>
        </div>

        {/* Section B — actions */}
        <div className="grid grid-cols-3 gap-2 border-b border-border px-4 py-3">
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#C23469] px-3 text-[12px] font-medium text-white transition hover:bg-[#A91E59]"
          >
            <Play className="h-3.5 w-3.5" />
            Replay
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12px] font-medium text-foreground transition hover:bg-muted/60"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open trace
          </button>
          <button
            type="button"
            onClick={copyId}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12px] font-medium text-foreground transition hover:bg-muted/60"
          >
            {copiedId ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiedId ? "Copied" : "Copy ID"}
          </button>
        </div>

        {/* Section C — metadata */}
        <div className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3">
          <MetaRow label="Request ID" value={row.id} mono />
          <MetaRow label="Timestamp" value={row.ts.toISOString()} mono />
          <MetaRow label="Actor" value={row.actor} mono />
          <MetaRow label="Region" value={row.region} mono />
          <MetaRow label="Bytes" value={fmtBytes(row.bytes)} mono />
        </div>

        {/* Section D — payload */}
        <div className="flex min-h-0 flex-col px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1 rounded-md bg-muted/60 p-0.5">
              {(["Response", "Request"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded px-2 py-0.5 text-[11.5px] font-medium transition",
                    tab === t
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={copyPayload}
              className="inline-flex items-center gap-1 rounded-md p-1 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
              title="Copy payload"
            >
              {copiedPayload ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <div className="mt-2 max-h-[260px] overflow-auto rounded-lg border border-border bg-[#FAFAFB] p-3">
            <pre className="font-mono text-[11.5px] leading-[1.55] text-foreground">
              <code dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
          </div>

          <button
            type="button"
            onClick={() => setFullOpen(true)}
            className="mt-2 inline-flex items-center gap-1 self-start text-[12px] font-medium text-[#B22257] hover:underline"
          >
            Full payload
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {fullOpen && (
        <FullPayloadModal row={row} initialTab={tab} onClose={() => setFullOpen(false)} />
      )}
    </>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 truncate text-right text-[12px] text-foreground",
          mono && "font-mono text-[11.5px]",
        )}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

// ---------- Full payload modal ----------

function FullPayloadModal({
  row,
  initialTab,
  onClose,
}: {
  row: LogRow;
  initialTab: "Response" | "Request";
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"Response" | "Request">(initialTab);
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const payloadStr = useMemo(
    () => JSON.stringify(tab === "Response" ? row.response : row.request, null, 2),
    [tab, row],
  );
  const highlighted = useMemo(() => highlight(payloadStr, languages.json, "json"), [payloadStr]);
  const lineCount = payloadStr.split("\n").length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payloadStr);
    } catch {
      /* noop */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
    >
      <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-[16px] border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold",
                METHOD_BADGE[row.method],
              )}
            >
              {row.method}
            </span>
            <span
              className={cn(
                "inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums",
                statusTone(row.code),
              )}
            >
              {row.code}
            </span>
            <span className="ml-1 font-mono text-[12.5px] text-foreground">{row.path}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
          <div className="inline-flex items-center gap-1 rounded-md bg-muted/60 p-0.5">
            {(["Response", "Request"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded px-2.5 py-1 text-[12px] font-medium transition",
                  tab === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[12px] font-medium text-foreground transition hover:bg-muted/60"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="flex min-h-0 flex-1 overflow-auto bg-[#FAFAFB]">
          <div className="select-none border-r border-border px-3 py-4 text-right font-mono text-[11.5px] leading-[1.6] text-muted-foreground/70">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre className="flex-1 px-4 py-4 font-mono text-[12px] leading-[1.6] text-foreground">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        </div>
      </div>
    </div>
  );
}
