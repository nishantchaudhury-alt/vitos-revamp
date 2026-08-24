import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Mail, Share2, Send } from "lucide-react";
import {
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Play,
  Activity,
  RefreshCw,
  Clock,
  ShieldCheck,
  Timer,
  DollarSign,
  RotateCcw,
  Users,
  Bot,
  ArrowLeftRight,
  Plug,
  Layers,
  Check,
  Eye,
  EyeOff,
  Key,
  Lock,
  Zap,
  Gauge,
  AlertTriangle,
  Plus,
  ShieldQuestion,
  FileSignature,
  PenLine,
  MapPin,
  Trash2,
  CheckCircle2,
  Terminal,
  Hash,
  KeyRound,
  Fingerprint,
  BadgeCheck,
  Webhook,
  Globe,
  Network,
  Shield,
  UserCheck,
  IdCard,
  Link2,
  Pencil,
  X,
} from "lucide-react";
import { Search, ChevronDown, Lightbulb } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MCP_CREDENTIALS, type McpCredential, toolsForScopes } from "@/components/vitos/mcpData";

type Row = {
  name: string;
  status: "Published" | "Draft" | "Deprecated";
  tags: string[];
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  version: string;
  binding: { label: string };
  owner: { name: string; sub?: string };
  calls24h: number;
  errRate: number;
};

const TABS = ["Overview", "Request / Response", "Policy & access", "Usage"] as const;
type Tab = (typeof TABS)[number];

const METHOD_BADGE: Record<Row["method"], string> = {
  GET: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  POST: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  PUT: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  DELETE: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

const TAG_TONE: Record<string, string> = {
  Read: "bg-[#FCE6EC] text-[#9A1F4A]",
  Write: "bg-[#FEF3D9] text-[#9A5B12]",
  Destructive: "bg-[#FDE2E2] text-[#9A1F1F]",
};

export function ApiDetailPage({ row, onBack }: { row: Row; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [copied, setCopied] = useState(false);
  const [tryOpen, setTryOpen] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const copyPath = async () => {
    try {
      await navigator.clipboard.writeText(row.path);
    } catch {
      /* noop */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyCurl = async () => {
    try {
      await navigator.clipboard.writeText(buildCurl(row));
    } catch {
      /* noop */
    }
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 1500);
  };

  const isRead = row.tags.includes("Read");

  return (
    <div className="flex w-full items-start gap-4">
      <div
        className="flex min-w-0 flex-1 flex-col gap-4 transition-[padding] duration-[250ms]"
        style={{ transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)" }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition hover:bg-hover hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All APIs
          </button>
        </div>

        {/* Header card */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FCE6EC] text-[#B22257]">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h1 className="text-base font-semibold tracking-tight text-foreground">
                    {row.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                    {row.status}
                  </span>
                  {row.tags.map((t) => (
                    <span
                      key={t}
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                        TAG_TONE[t] ?? "bg-muted text-foreground",
                      )}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-0.5 text-[12px] text-muted-foreground">
                  {row.binding.label} <span className="px-1">·</span>
                  cloud function <span className="px-1">·</span>
                  {row.version} <span className="px-1">·</span>
                  {row.owner.name}
                  {row.owner.sub && <> · {row.owner.sub}</>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <IconButton title="Copy">
                <Copy className="h-4 w-4" />
              </IconButton>
              <IconButton title="Open">
                <ExternalLink className="h-4 w-4" />
              </IconButton>
              <IconButton title="More">
                <MoreHorizontal className="h-4 w-4" />
              </IconButton>
              <button
                type="button"
                onClick={() => setTryOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-hover"
              >
                <Play className="h-3.5 w-3.5" />
                Try it
              </button>
            </div>
          </div>

          {/* Endpoint bar */}
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase",
                  METHOD_BADGE[row.method],
                )}
              >
                {row.method}
              </span>
              <code className="truncate font-mono text-[12px] text-foreground">{row.path}</code>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">{row.version}</span>
              <button
                type="button"
                onClick={copyPath}
                className="rounded-md p-1 text-muted-foreground transition hover:bg-hover hover:text-foreground"
                title="Copy path"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
              <span className="mx-0.5 h-4 w-px bg-border" />
              <button
                type="button"
                onClick={copyCurl}
                title="Copy cURL"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-[11.5px] font-medium text-foreground transition hover:bg-hover"
              >
                {curlCopied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {curlCopied ? "Copied" : "Copy cURL"}
              </button>
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                title="Share API"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-[11.5px] font-medium text-foreground transition hover:bg-hover"
              >
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                Share
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 inline-flex items-center gap-1 rounded-lg bg-[#F3F1F3] p-1">
            {TABS.map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[13px] font-medium transition",
                    active
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {tab === "Overview" ? (
            <OverviewTab row={row} isRead={isRead} />
          ) : tab === "Request / Response" ? (
            <RequestResponseTab row={row} />
          ) : tab === "Policy & access" ? (
            <PolicyAccessTab row={row} />
          ) : tab === "Usage" ? (
            <UsageTab row={row} />
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {tab} — coming soon.
            </div>
          )}
        </section>
      </div>
      {tryOpen && <TryItDrawer row={row} onClose={() => setTryOpen(false)} />}
      {shareOpen && <ShareApiModal row={row} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

/* ---------------- cURL + share ---------------- */

const API_BASE = "https://api.vitos.ai";

function buildCurl(row: Row) {
  const url = `${API_BASE}${row.path}`;
  const lines = [
    `curl -X ${row.method} '${url}'`,
    `  -H 'Authorization: Bearer $VITOS_API_KEY'`,
    `  -H 'X-Api-Version: ${row.version}'`,
  ];
  if (row.method !== "GET") {
    lines.push(`  -H 'Content-Type: application/json'`);
    lines.push(`  -d '{\n    "query": "acme",\n    "limit": 20\n  }'`);
  }
  return lines.join(" \\\n");
}

const EXPIRY_OPTIONS = [
  { value: "1h", label: "1 hour" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
] as const;

function randomToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 24; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function ShareApiModal({ row, onClose }: { row: Row; onClose: () => void }) {
  const [expiry, setExpiry] = useState<string>("24h");
  const [token, setToken] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const link = token ? `${API_BASE.replace("api.", "share.")}/a/${token}` : "";
  const expiryLabel = EXPIRY_OPTIONS.find((o) => o.value === expiry)?.label ?? "24 hours";
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const generate = () => {
    setToken(randomToken());
    setLinkCopied(false);
    setSentTo(null);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* noop */
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FCE6EC] text-[#B22257]">
          <Link2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
            Share this API
          </h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
            Recipients get a read-only view of{" "}
            <span className="font-medium text-foreground">{row.name}</span>. The link can only be
            opened once.
          </p>
        </div>
      </div>

      {/* Link settings */}
      <div className="mt-5 rounded-xl border border-border bg-muted/30 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold text-foreground">Link expiry</div>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              Expires after first use, or when it times out.
            </p>
          </div>
          <div className="relative shrink-0">
            <select
              value={expiry}
              onChange={(e) => {
                setExpiry(e.target.value);
                setToken(null);
                setSentTo(null);
              }}
              className="appearance-none rounded-lg border border-border bg-card py-1.5 pl-3 pr-8 text-[12.5px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {EXPIRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {!token ? (
          <button
            type="button"
            onClick={generate}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12.5px] font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Link2 className="h-3.5 w-3.5" />
            Generate one-time link
          </button>
        ) : (
          <div className="mt-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2">
              <code className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-foreground">
                {link}
              </code>
              <button
                type="button"
                onClick={copyLink}
                title="Copy link"
                className="shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-hover hover:text-foreground"
              >
                {linkCopied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">
                Created just now · single use · expires in {expiryLabel}
              </span>
              <button
                type="button"
                onClick={generate}
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary transition hover:opacity-80"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Or send by email
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {sentTo ? (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2 text-[12.5px] text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="truncate">Link sent to {sentTo}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSentTo(null);
                setEmail("");
              }}
              className="shrink-0 text-[11.5px] font-medium text-emerald-800 transition hover:opacity-80"
            >
              Send to someone else
            </button>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-lg border border-border bg-card py-2 pl-8 pr-3 text-[12.5px] text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              disabled={!emailValid}
              onClick={() => {
                if (!token) setToken(randomToken());
                setSentTo(email.trim());
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] font-semibold text-foreground transition hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border bg-card px-4 py-2 text-[12.5px] font-medium text-foreground transition hover:bg-hover"
        >
          Close
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[460px] rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function OverviewTab({ row, isRead }: { row: Row; isRead: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-8 pt-5 lg:grid-cols-[1fr_300px]">
      {/* LEFT — main content */}
      <div className="flex min-w-0 flex-col gap-6">
        {/* What this API does */}
        <div>
          <SectionLabel>What this API does</SectionLabel>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground">
            Full-text + faceted search across customer records with PII redaction for external
            callers. Find customers by name, email, segment, or custom attributes — safe for
            external agent and workflow access.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <StatCard
              icon={<Activity className="h-3.5 w-3.5" />}
              label="Side effect"
              value={isRead ? "Read" : "Write"}
            />
            <StatCard
              icon={<RefreshCw className="h-3.5 w-3.5" />}
              label="Idempotent"
              value={row.method === "GET" ? "Yes" : "N/A"}
              valueClass="text-emerald-600"
            />
            <StatCard
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Avg P95"
              value="142ms"
              valueClass="text-sky-600"
            />
          </div>
        </div>

        {/* Used by */}
        <div>
          <SectionLabel>Used by</SectionLabel>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <ConsumerCard
              iconBg="bg-[#FCE6EC]"
              iconColor="text-[#B22257]"
              icon={<Users className="h-4 w-4" />}
              title="Employee UI"
              desc="Ops & support team lookup — full PII visible, scoped by user role."
              badge="User identity"
            />
            <ConsumerCard
              iconBg="bg-[oklch(0.94_0.04_165)]"
              iconColor="text-[oklch(0.5_0.13_165)]"
              icon={<Bot className="h-4 w-4" />}
              title="Internal AI agents"
              desc="On-behalf-of caller — agent fetches records mid-conversation flow."
              badge="Agent identity"
            />
            <ConsumerCard
              iconBg="bg-[oklch(0.95_0.04_260)]"
              iconColor="text-[oklch(0.55_0.18_260)]"
              icon={<ArrowLeftRight className="h-4 w-4" />}
              title="Workflows"
              desc="Background processes with system identity for async operations."
              badge="System identity"
            />
            <ConsumerCard
              iconBg="bg-[oklch(0.95_0.05_60)]"
              iconColor="text-[oklch(0.55_0.15_60)]"
              icon={<Plug className="h-4 w-4" />}
              title="External clients"
              desc="API key auth — response trimmed, PII auto-redacted."
              badge="API key · trimmed"
            />
          </div>
        </div>

        {/* Versions + Bundles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-baseline justify-between">
              <div className="text-[13px] font-semibold text-foreground">Versions</div>
              <button className="text-[11.5px] font-medium text-[#B22257] hover:underline">
                View all →
              </button>
            </div>
            <div className="mt-3 flex flex-col divide-y divide-border/60">
              <VersionRow
                version={row.version}
                pill={<Pill tone="emerald">current</Pill>}
                right="12m ago"
              />
              <VersionRow
                version="v2.4.0"
                pill={<Pill tone="amber">sunset Aug 1</Pill>}
                right="3w ago"
              />
              <VersionRow
                version="v2.4.0"
                pill={<Pill tone="muted">archived</Pill>}
                right="2mo ago"
              />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-baseline justify-between">
              <div className="text-[13px] font-semibold text-foreground">Bundles</div>
              <button className="text-[11.5px] font-medium text-[#B22257] hover:underline">
                Manage →
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <BundleChip label="support-agent" />
              <BundleChip label="crm-read" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — metadata sidebar */}
      <aside className="flex flex-col gap-3">
        {/* Reliability + Metadata */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[13px] font-semibold text-foreground">Reliability</div>
          <div className="mt-3 flex flex-col divide-y divide-border/60">
            <SidebarRow
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              label="Circuit breaker"
              value={<span className="text-emerald-600">● Closed</span>}
            />
            <SidebarRow
              icon={<DollarSign className="h-3.5 w-3.5" />}
              label="Cost cap"
              value={<span className="text-amber-700">$50 / day</span>}
              highlight
            />
            <SidebarRow
              icon={<Timer className="h-3.5 w-3.5" />}
              label="Timeout"
              value="30s hard cutoff"
            />
            <SidebarRow
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              label="Retries"
              value="Max 3 · 5xx only"
            />
          </div>
          <div className="mt-4 border-t border-border/60 pt-4 text-[13px] font-semibold text-foreground">
            Metadata
          </div>
          <div className="mt-3 flex flex-col divide-y divide-border/60">
            <MetaRow
              label="Slug"
              value={<code className="font-mono text-[12px]">customers.search</code>}
            />
            <MetaRow
              label="Owner"
              value={<span className="font-mono text-[12px]">{row.owner.name}</span>}
            />
            <MetaRow
              label="Binding"
              value={<span className="font-mono text-[12px]">{row.binding.label}</span>}
            />
            <MetaRow
              label="Updated"
              value={<span className="font-mono text-[12px]">12m ago</span>}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 first:pt-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-medium text-foreground">{value}</span>
    </div>
  );
}

function SidebarRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-1.5 py-2",
        highlight && "-mx-1.5 rounded-md bg-amber-50 px-3",
      )}
    >
      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <span className="text-muted-foreground/70">{icon}</span>
        {label}
      </div>
      <div className="text-[12px] font-medium text-foreground">{value}</div>
    </div>
  );
}

function VersionRow({
  version,
  pill,
  right,
}: {
  version: string;
  pill: React.ReactNode;
  right: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2">
        <code className="font-mono text-[12.5px] text-foreground">{version}</code>
        {pill}
      </div>
      <span className="text-[11.5px] text-muted-foreground">{right}</span>
    </div>
  );
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "emerald" | "amber" | "muted";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    muted: "bg-muted text-muted-foreground ring-border",
  } as const;
  return (
    <span className={cn("rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ring-1", tones[tone])}>
      {children}
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="text-[12px] font-medium text-foreground">{value}</span>
    </div>
  );
}

function _MetaItem_OLD({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 first:pt-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-medium text-foreground">{value}</span>
    </div>
  );
}

function VersionItem({
  version,
  dot,
  label,
  right,
  rightClass,
}: {
  version: string;
  dot: string;
  label: string;
  right: string;
  rightClass?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
        <code className="font-mono text-[13px] text-foreground">{version}</code>
      </div>
      <span className="pl-3.5 text-[12px] text-muted-foreground">{label}</span>
      <span className={cn("pl-3.5 text-[11.5px] text-muted-foreground", rightClass)}>{right}</span>
    </div>
  );
}

/* ---------- small helpers ---------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </div>
  );
}

function IconButton({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      title={title}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-hover hover:text-foreground"
    >
      {children}
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-[15px] font-semibold tracking-tight text-foreground",
          valueClass,
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------------- Authentication tab ---------------- */

const AUTH_SUBTABS = [
  {
    id: "api-keys",
    label: "API Keys",
    description: "Static bearer tokens",
    icon: Key,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    id: "oauth",
    label: "OAuth 2.0 Apps",
    description: "Authorization-code + client-credentials clients",
    icon: KeyRound,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "jwt",
    label: "JWT / OIDC",
    description: "Verify tokens from your IdP (Auth0, Okta, Cognito…)",
    icon: Fingerprint,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
] as const;

type AuthSubtab = (typeof AUTH_SUBTABS)[number]["id"];

type ApiKey = {
  label: string;
  env: "LIVE" | "TEST";
  owner: string;
  date: string;
  token: string;
  scopes: string[];
  lastUsed: string;
  status: "Active" | "Rotating";
};

const SAMPLE_KEYS: ApiKey[] = [
  {
    label: "Support Agent · prod",
    env: "LIVE",
    owner: "rohit@vitos",
    date: "Mar 14",
    token: "vk_live_8aF2",
    scopes: ["tickets:read", "tickets:write", "kb:read"],
    lastUsed: "12s ago",
    status: "Active",
  },
  {
    label: "Finance Ops · sync",
    env: "LIVE",
    owner: "deepa@vitos",
    date: "Feb 02",
    token: "vk_live_T9qC",
    scopes: ["invoices:read", "payouts:read"],
    lastUsed: "4m ago",
    status: "Active",
  },
  {
    label: "Zapier (legacy)",
    env: "LIVE",
    owner: "ops@vitos",
    date: "Nov 18",
    token: "vk_live_Lz1m",
    scopes: ["*:read"],
    lastUsed: "9d ago",
    status: "Rotating",
  },
  {
    label: "QA sandbox",
    env: "TEST",
    owner: "qa@vitos",
    date: "Apr 02",
    token: "vk_test_X12p",
    scopes: ["*"],
    lastUsed: "1h ago",
    status: "Active",
  },
];

const ENV_TONE: Record<ApiKey["env"], string> = {
  LIVE: "bg-emerald-50 text-emerald-700",
  TEST: "bg-amber-50 text-amber-700",
};

// ===== Credentials section =====

const CRED_PROVIDERS = ["Internal API Keys", "Okta Workforce", "Partner OAuth", "Internal JWT"];

const RATE_LIMIT_OPTS = [
  { label: "None", desc: "" },
  { label: "Free Tier", desc: "60/minute" },
  { label: "Pro Tier", desc: "600/minute" },
  { label: "Enterprise", desc: "10000/minute" },
];

const IP_POLICY_OPTS = ["None", "Office IPs", "Partner Allowlist"];

const CRED_SCOPES = [
  { id: "users:read", desc: "Read user profiles" },
  { id: "users:write", desc: "Modify user profiles" },
  { id: "billing:read", desc: "Read invoices" },
  { id: "billing:charge", desc: "Charge cards" },
  { id: "search:query", desc: "Run search queries" },
];

function ScopesMultiSelect({
  options,
  value,
  onToggle,
  onClear,
}: {
  options: { id: string; desc: string }[];
  value: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-9 w-full items-center justify-between gap-2 rounded-lg border border-[#e8e6e1] bg-white px-3 py-1.5 text-left text-sm focus:border-[#C23469] focus:outline-none"
      >
        <div className="flex flex-1 flex-wrap items-center gap-1">
          {value.length === 0 ? (
            <span className="text-muted-foreground">Select scopes…</span>
          ) : (
            value.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-md border border-[#e8e6e1] bg-[#f4f3f1] px-1.5 py-0.5 font-mono text-[12px] text-foreground"
              >
                {id}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(id);
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
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-lg border border-[#e8e6e1] bg-white shadow-lg">
          {options.map((s, i) => {
            const active = value.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onToggle(s.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#faf9f7]",
                  i > 0 && "border-t border-[#f0eeea]",
                )}
              >
                <span className="font-mono text-[12.5px] text-foreground">{s.id}</span>
                <span className="ml-auto flex items-center gap-2 text-[12px] text-muted-foreground">
                  {s.desc}
                  {active && <Check className="h-4 w-4 text-[#C23469]" />}
                </span>
              </button>
            );
          })}
          {value.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="block w-full border-t border-[#f0eeea] px-3 py-2 text-left text-[12px] text-muted-foreground hover:bg-[#faf9f7]"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e6e1] bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:border-[#d8d6d1]"
    >
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );
}

function PillDropdown({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-[#e8e6e1] bg-white px-4 py-2 text-sm text-muted-foreground hover:border-[#d8d6d1]"
    >
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );
}

function CredentialsSection({
  openIntent = 0,
  credentials,
  onCredentialCreated,
}: {
  openIntent?: number;
  credentials: McpCredential[];
  onCredentialCreated?: (credential: McpCredential, secret: string) => void;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (openIntent > 0) setOpen(true);
  }, [openIntent]);
  return (
    <div className="flex flex-col">
      {/* Heading */}
      <div className="pb-5">
        <h3 className="text-[20px] font-semibold tracking-tight text-foreground">{"\n"}</h3>
        <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-muted-foreground">
          Track, audit, configure and revoke issued client token scopes or active access records.
        </p>
      </div>
      <div className="border-t border-[#e8e6e1]" />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 pb-4 pt-5">
        <div className="relative w-[320px] max-w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search subject or display name..."
            className="h-10 w-full rounded-full border border-[#e8e6e1] bg-white pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none"
          />
        </div>
        <PillDropdown label="Any provider" />
        <PillDropdown label="Any tier" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-[#B22257] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#9b1d4c]"
        >
          <Plus className="h-4 w-4" />
          Issue Credential
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#ecebe7] bg-white">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Display Name</th>
              <th className="px-5 py-3 text-left font-semibold">Subject</th>
              <th className="px-5 py-3 text-left font-semibold">Provider</th>
              <th className="px-5 py-3 text-left font-semibold">Rate Limit</th>
              <th className="px-5 py-3 text-left font-semibold">Scopes</th>
              <th className="px-5 py-3 text-left font-semibold">Expiry</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {credentials.map((credential) => (
              <tr key={credential.id} className="border-t border-[#f0eeea]">
                <td className="px-5 py-4 font-semibold text-foreground">
                  {credential.displayName}
                </td>
                <td className="px-5 py-4 font-mono text-[12.5px] text-foreground">
                  {credential.subject}
                </td>
                <td className="px-5 py-4 text-foreground">{credential.provider}</td>
                <td className="px-5 py-4 text-foreground">
                  {credential.rateLimit}
                  {credential.ipPolicy !== "None" ? (
                    <span className="ml-1.5 text-muted-foreground">· {credential.ipPolicy}</span>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-foreground">
                  {credential.scopes.length} {credential.scopes.length === 1 ? "scope" : "scopes"}
                </td>
                <td className="px-5 py-4 text-foreground">{credential.expiry}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground hover:bg-[#f3f1ed] hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open ? (
        <IssueCredentialDrawer
          onClose={() => setOpen(false)}
          onCredentialCreated={(credential, secret) => {
            setOpen(false);
            onCredentialCreated?.(credential, secret);
          }}
        />
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  options,
  value,
  onChange,
  renderOption,
}: {
  label: string;
  options: { value: string; label: React.ReactNode }[];
  value: string;
  onChange: (v: string) => void;
  renderOption?: (o: { value: string; label: React.ReactNode }) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <label className="mb-1.5 block text-[12px] font-medium text-foreground">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-[#e8e6e1] bg-white px-3 text-sm text-foreground hover:border-[#d8d6d1]"
      >
        <span className="truncate">{current?.label ?? "Select…"}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {open ? (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-[#e8e6e1] bg-white shadow-lg">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-[#faf9f7]"
            >
              <span className="min-w-0 flex-1">{renderOption ? renderOption(o) : o.label}</span>
              {o.value === value ? <Check className="h-4 w-4 shrink-0 text-[#C23469]" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function IssueCredentialDrawer({
  onClose,
  onCredentialCreated,
}: {
  onClose: () => void;
  onCredentialCreated: (credential: McpCredential, secret: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const [provider, setProvider] = useState(CRED_PROVIDERS[0]);
  const [subject, setSubject] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [rateLimit, setRateLimit] = useState("None");
  const [ipPolicy, setIpPolicy] = useState("None");
  const [scopes, setScopes] = useState<string[]>(["users:read"]);

  const effectiveTools = toolsForScopes(scopes);
  const writeTools = effectiveTools.filter((tool) => tool.access === "Writes");
  const canGenerate =
    subject.trim().length > 0 && displayName.trim().length > 0 && scopes.length > 0;

  const toggleScope = (id: string) =>
    setScopes((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  useEffect(() => {
    subjectInputRef.current?.focus();
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeWithEscape);
    return () => document.removeEventListener("keydown", closeWithEscape);
  }, [onClose]);

  const generateCredential = () => {
    if (!canGenerate) return;

    const randomBytes = new Uint8Array(16);
    window.crypto.getRandomValues(randomBytes);
    const randomSecret = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
    const type =
      provider === "Internal API Keys"
        ? "API Key"
        : provider === "Internal JWT"
          ? "JWT"
          : "OAuth 2.0";
    const credential: McpCredential = {
      id: `cred_mcp_${window.crypto.randomUUID?.() ?? Date.now()}`,
      displayName: displayName.trim(),
      subject: subject.trim(),
      type,
      status: "Active",
      provider,
      rateLimit,
      ipPolicy,
      expiry: expiry || "—",
      scopes,
    };

    onCredentialCreated(credential, `vts_mcp_${randomSecret}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-credential-title"
        onKeyDown={(event) => {
          if (event.key !== "Tab" || !panelRef.current) return;
          const focusable = Array.from(
            panelRef.current.querySelectorAll<HTMLElement>(
              'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        className="flex h-full w-[420px] max-w-full flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#e8e6e1] px-5 py-4">
          <h3
            id="issue-credential-title"
            className="text-[15px] font-semibold tracking-tight text-foreground"
          >
            Issue credential
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close credential drawer"
            className="rounded-md p-1 text-muted-foreground hover:bg-[#f3f1ed] hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <SelectField
            label="Provider"
            value={provider}
            onChange={setProvider}
            options={CRED_PROVIDERS.map((p) => ({ value: p, label: p }))}
          />

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-foreground">Subject</label>
            <input
              ref={subjectInputRef}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="svc-name"
              className="h-9 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-foreground">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-9 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 text-sm text-foreground focus:border-[#C23469] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-foreground">Expiry</label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="h-9 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 text-sm text-foreground focus:border-[#C23469] focus:outline-none"
            />
          </div>

          <SelectField
            label="Rate Limit"
            value={rateLimit}
            onChange={setRateLimit}
            options={RATE_LIMIT_OPTS.map((o) => ({
              value: o.label,
              label: o.desc ? (
                <span>
                  {o.label} <span className="text-muted-foreground">· {o.desc}</span>
                </span>
              ) : (
                o.label
              ),
            }))}
          />

          <SelectField
            label="IP Policy"
            value={ipPolicy}
            onChange={setIpPolicy}
            options={IP_POLICY_OPTS.map((p) => ({ value: p, label: p }))}
          />

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-foreground">Scopes</label>
            <ScopesMultiSelect
              options={CRED_SCOPES}
              value={scopes}
              onToggle={toggleScope}
              onClear={() => setScopes([])}
            />
            <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-[#e8e6e1] bg-[#faf9f7] px-3 py-2 text-[11px]">
              <span className="text-muted-foreground">Effective MCP access</span>
              <span className="font-medium text-foreground">
                {effectiveTools.length} tools · {writeTools.length} can write
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e8e6e1] px-5 py-4">
          <button
            type="button"
            disabled={!canGenerate}
            onClick={generateCredential}
            className="w-full rounded-xl bg-[#B22257] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#9b1d4c] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Generate secret
          </button>
          {!canGenerate ? (
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Add a subject, display name, and at least one scope to continue.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ===== Policies section =====

const API_OPTIONS = [
  "Any API",
  "Users Service",
  "Billing API",
  "Search Engine",
  "Events Stream",
  "Inventory",
] as const;

type PolicyTab = "scopes" | "rate" | "ip";

export function PoliciesSection() {
  const [tab, setTab] = useState<PolicyTab>("scopes");
  const TABS_P: { id: PolicyTab; label: string }[] = [
    { id: "scopes", label: "Scopes" },
    { id: "rate", label: "Rate Limit" },
    { id: "ip", label: "IP Restriction" },
  ];
  return (
    <div className="rounded-2xl border border-[#e8e6e1] bg-white px-6 pt-2 pb-6 shadow-[0_1px_0_rgba(15,15,15,0.02)]">
      {/* Tertiary tabs */}
      <div className="flex items-center gap-8 border-b border-[#e8e6e1]">
        {TABS_P.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative -mb-px pb-3.5 pt-3 text-[15px] transition-colors",
                active
                  ? "font-semibold text-[#C23469]"
                  : "font-medium text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#C23469]" />
              )}
            </button>
          );
        })}
      </div>
      <div className="pt-6">
        {tab === "scopes" ? (
          <ScopesPanel />
        ) : tab === "rate" ? (
          <RateLimitPanel />
        ) : (
          <IpRestrictionPanel />
        )}
      </div>
    </div>
  );
}

function ApiDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border bg-white px-3.5 text-sm transition",
          open
            ? "border-[#C23469] text-foreground"
            : "border-[#e8e6e1] text-muted-foreground hover:border-[#d8d6d1]",
        )}
      >
        <span className="text-foreground">{value}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {open ? (
        <div className="absolute left-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-[#e8e6e1] bg-white shadow-lg">
          {API_OPTIONS.map((o) => {
            const active = o === value;
            return (
              <button
                key={o}
                type="button"
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-[#faf9f7]",
                  active ? "text-[#C23469]" : "text-foreground",
                )}
              >
                <span>{o}</span>
                {active ? <Check className="h-4 w-4 text-[#C23469]" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function PolicyFilterBar({
  countLabel,
  apiValue,
  onApiChange,
  onNew,
  ctaLabel,
}: {
  countLabel: string;
  apiValue: string;
  onApiChange: (v: string) => void;
  onNew: () => void;
  ctaLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 pb-3">
      <div className="relative w-[320px] max-w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search parameters..."
          className="h-9 w-full rounded-full border border-[#e8e6e1] bg-white pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none"
        />
      </div>
      <ApiDropdown value={apiValue} onChange={onApiChange} />
      <span className="text-[13px] text-muted-foreground">{countLabel}</span>
      <button
        type="button"
        onClick={onNew}
        className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[#B22257] px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#9b1d4c]"
      >
        <Plus className="h-3.5 w-3.5" />
        {ctaLabel}
      </button>
    </div>
  );
}

const SCOPE_ROWS = [
  { code: "users:read", api: "Users Service", desc: "Read user profiles" },
  { code: "users:write", api: "Users Service", desc: "Modify user profiles" },
  { code: "billing:read", api: "Billing API", desc: "Read invoices" },
  { code: "billing:charge", api: "Billing API", desc: "Charge cards" },
  { code: "search:query", api: "Search Engine", desc: "Run search queries" },
];

function ScopesPanel() {
  const [api, setApi] = useState("Any API");
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col">
      <p className="max-w-4xl pb-4 text-[13.5px] leading-relaxed text-muted-foreground">
        Each scope maps functional access controls directly onto target API consumers. Add and
        maintain parameter strings here to enforce fine-grained operational boundaries before
        verifying cryptographic tokens against backend routes.
      </p>
      <PolicyFilterBar
        countLabel={`${SCOPE_ROWS.length} options total`}
        apiValue={api}
        onApiChange={setApi}
        onNew={() => setOpen(true)}
        ctaLabel="New Scope"
      />
      <div className="overflow-hidden rounded-xl border border-[#ecebe7] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#fafaf8] text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-[#d8d6d1] text-[#C23469] focus:ring-[#C23469]"
                />
              </th>
              <th className="px-2 py-2.5 text-left font-semibold">Code</th>
              <th className="px-4 py-2.5 text-left font-semibold">API</th>
              <th className="px-4 py-2.5 text-left font-semibold">Description</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {SCOPE_ROWS.map((r) => (
              <tr key={r.code} className="border-t border-[#f0eeea] hover:bg-[#fbfaf7]">
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-[#d8d6d1] text-[#C23469] focus:ring-[#C23469]"
                  />
                </td>
                <td className="px-2 py-2.5">
                  <span className="inline-flex items-center rounded-md bg-[#f3f1ed] px-2 py-0.5 font-mono text-[12px] text-foreground">
                    {r.code}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[13px] text-foreground">{r.api}</td>
                <td className="px-4 py-2.5 text-[13px] text-muted-foreground">{r.desc}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground hover:bg-[#f3f1ed] hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open ? <NewScopeDrawer onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

const RATE_ROWS = [
  { name: "Free Tier", requests: "60", window: "per minute" },
  { name: "Pro Tier", requests: "600", window: "per minute" },
  { name: "Enterprise", requests: "10,000", window: "per minute" },
];

function RateLimitPanel() {
  const [api, setApi] = useState("Any API");
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col">
      <p className="max-w-4xl pb-4 text-[13.5px] leading-relaxed text-muted-foreground">
        Each threshold maps volumetric request ceilings directly onto target API consumers. Declare
        and assign traffic limits here before connecting access parameters to prevent spikes from
        degrading production database performance.
      </p>
      <PolicyFilterBar
        countLabel={`${RATE_ROWS.length} options total`}
        apiValue={api}
        onApiChange={setApi}
        onNew={() => setOpen(true)}
        ctaLabel="New Rate Limit"
      />
      <div className="overflow-hidden rounded-xl border border-[#ecebe7] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#fafaf8] text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-[#d8d6d1] text-[#C23469] focus:ring-[#C23469]"
                />
              </th>
              <th className="px-2 py-2.5 text-left font-semibold">Name</th>
              <th className="px-4 py-2.5 text-left font-semibold">Requests</th>
              <th className="px-4 py-2.5 text-left font-semibold">Window</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {RATE_ROWS.map((r) => (
              <tr key={r.name} className="border-t border-[#f0eeea] hover:bg-[#fbfaf7]">
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-[#d8d6d1] text-[#C23469] focus:ring-[#C23469]"
                  />
                </td>
                <td className="px-2 py-2.5 text-[13px] font-semibold text-foreground">{r.name}</td>
                <td className="px-4 py-2.5 font-mono text-[12.5px] text-foreground">
                  {r.requests}
                </td>
                <td className="px-4 py-2.5 text-[13px] text-muted-foreground">{r.window}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground hover:bg-[#f3f1ed] hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open ? <NewRateLimitDrawer onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

const IP_ROWS = [
  { name: "Office IPs", cidrs: ["10.0.0.0/8", "192.168.1.0/24"] },
  { name: "Partner Allowlist", cidrs: ["203.0.113.0/24"] },
];

function IpRestrictionPanel() {
  const [api, setApi] = useState("Any API");
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col">
      <p className="max-w-4xl pb-4 text-[13.5px] leading-relaxed text-muted-foreground">
        Each network configuration maps origin boundaries directly onto target API consumers.
        Configure and restrict incoming blocks here before activating access routes to isolate
        execution context strictly within approved locations.
      </p>
      <PolicyFilterBar
        countLabel={`${IP_ROWS.length} options total`}
        apiValue={api}
        onApiChange={setApi}
        onNew={() => setOpen(true)}
        ctaLabel="New IP Rule"
      />
      <div className="overflow-hidden rounded-xl border border-[#ecebe7] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#fafaf8] text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-[#d8d6d1] text-[#C23469] focus:ring-[#C23469]"
                />
              </th>
              <th className="px-2 py-2.5 text-left font-semibold">Name</th>
              <th className="px-4 py-2.5 text-left font-semibold">CIDRs</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {IP_ROWS.map((r) => (
              <tr key={r.name} className="border-t border-[#f0eeea] hover:bg-[#fbfaf7]">
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-[#d8d6d1] text-[#C23469] focus:ring-[#C23469]"
                  />
                </td>
                <td className="px-2 py-2.5 text-[13px] font-semibold text-foreground">{r.name}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {r.cidrs.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center rounded-md bg-[#f3f1ed] px-2 py-0.5 font-mono text-[12px] text-foreground"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground hover:bg-[#f3f1ed] hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open ? <NewIpPolicyDrawer onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function DrawerShell({
  title,
  onClose,
  primaryLabel,
  children,
}: {
  title: string;
  onClose: () => void;
  primaryLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="flex h-full w-[420px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e8e6e1] px-5 py-4">
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e8e6e1] p-1.5 text-muted-foreground hover:bg-[#f3f1ed] hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-[#e8e6e1] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-foreground hover:bg-[#f3f1ed]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#C23469] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#a82c5b]"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewScopeDrawer({ onClose }: { onClose: () => void }) {
  return (
    <DrawerShell title="New scope" onClose={onClose} primaryLabel="Create scope">
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-foreground">API Target</label>
        <select className="h-10 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 text-sm text-foreground focus:border-[#C23469] focus:outline-none">
          <option value="">Select target architecture microservice...</option>
          {API_OPTIONS.filter((o) => o !== "Any API").map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-foreground">Code</label>
        <input
          type="text"
          placeholder="e.g. users:write"
          className="h-10 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-foreground">Description</label>
        <textarea
          rows={4}
          placeholder="Explicit functionality permission parameters statement..."
          className="w-full rounded-lg border border-[#e8e6e1] bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none"
        />
      </div>
    </DrawerShell>
  );
}

function NewRateLimitDrawer({ onClose }: { onClose: () => void }) {
  return (
    <DrawerShell title="New rate limit" onClose={onClose} primaryLabel="Create rate limit">
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-foreground">Policy Name</label>
        <input
          type="text"
          placeholder="e.g. Enterprise Tier Plan"
          className="h-10 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-foreground">
          Max Requests Threshold
        </label>
        <input
          type="number"
          placeholder="600"
          className="h-10 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-foreground">
          Time Window Frame
        </label>
        <select
          defaultValue="Minute"
          className="h-10 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 text-sm text-foreground focus:border-[#C23469] focus:outline-none"
        >
          <option>Second</option>
          <option>Minute</option>
          <option>Hour</option>
          <option>Day</option>
        </select>
      </div>
    </DrawerShell>
  );
}

function NewIpPolicyDrawer({ onClose }: { onClose: () => void }) {
  const [cidr, setCidr] = useState("");
  const [blocks, setBlocks] = useState<string[]>([]);
  const add = () => {
    const v = cidr.trim();
    if (!v) return;
    setBlocks((b) => [...b, v]);
    setCidr("");
  };
  return (
    <DrawerShell title="New IP policy" onClose={onClose} primaryLabel="Create IP policy">
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-foreground">
          Restriction Config Name
        </label>
        <input
          type="text"
          placeholder="e.g. European HQ Gateway Access"
          className="h-10 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-foreground">
          Add IP Target CIDR Block
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={cidr}
            onChange={(e) => setCidr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="192.168.1.0/24"
            className="h-10 flex-1 rounded-lg border border-[#e8e6e1] bg-white px-3 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none"
          />
          <button
            type="button"
            onClick={add}
            className="h-10 rounded-lg border border-[#e8e6e1] bg-white px-4 text-sm font-medium text-foreground hover:bg-[#faf9f7]"
          >
            Add
          </button>
        </div>
        {blocks.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {blocks.map((b, i) => (
              <span
                key={`${b}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#f3f1ed] px-2 py-1 font-mono text-[12.5px] text-foreground"
              >
                {b}
                <button
                  type="button"
                  onClick={() => setBlocks((arr) => arr.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </DrawerShell>
  );
}

export function AuthenticationTab({
  credentialsIntent = 0,
  credentials = MCP_CREDENTIALS,
  onCredentialCreated,
}: {
  credentialsIntent?: number;
  credentials?: McpCredential[];
  onCredentialCreated?: (credential: McpCredential, secret: string) => void;
}) {
  const [section, setSection] = useState<"providers" | "credentials">("providers");
  useEffect(() => {
    if (credentialsIntent > 0) setSection("credentials");
  }, [credentialsIntent]);
  const SECTIONS: { id: "providers" | "credentials"; label: string }[] = [
    { id: "providers", label: "Identity Providers" },
    { id: "credentials", label: "Credentials" },
  ];
  return (
    <div className="pt-5">
      <div className="rounded-2xl border border-[#e8e6e1] bg-white px-6 pt-2 pb-6 shadow-[0_1px_0_rgba(15,15,15,0.02)]">
        <div className="flex items-center gap-8 border-b border-[#e8e6e1]">
          {SECTIONS.map((s) => {
            const active = section === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={cn(
                  "relative -mb-px pb-3.5 pt-3 text-[15px] transition-colors",
                  active
                    ? "font-semibold text-[#C23469]"
                    : "font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#C23469]" />
                )}
              </button>
            );
          })}
        </div>
        <div className="pt-6">
          {section === "credentials" ? (
            <CredentialsSection
              openIntent={credentialsIntent}
              credentials={credentials}
              onCredentialCreated={onCredentialCreated}
            />
          ) : (
            <IdentityProvidersSection />
          )}
        </div>
      </div>
    </div>
  );
}

type ProviderType = "API_KEY" | "OAUTH2" | "JWT" | "OIDC";

const PROVIDER_TYPE_CARDS: {
  id: ProviderType;
  label: string;
  description: string;
  icon: typeof Key;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: "API_KEY",
    label: "API Keys",
    description: "Static token string configuration patterns.",
    icon: Key,
    iconBg: "bg-[#FDECF2]",
    iconColor: "text-[#C23469]",
  },
  {
    id: "OAUTH2",
    label: "OAuth 2.0",
    description: "Client credentials & code grant flow handshakes.",
    icon: Network,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    id: "JWT",
    label: "JWT",
    description: "Stateless cryptographic token crypt signature validators.",
    icon: ShieldCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    id: "OIDC",
    label: "OIDC",
    description: "Federated profile discovery and SSO enterprise directories.",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];

type ProviderRow = {
  id: string;
  name: string;
  type: ProviderType;
  config: string;
  fields: { label: string; value: string; mono?: boolean; copyable?: boolean }[];
};

const PROVIDER_ROWS: ProviderRow[] = [
  {
    id: "id_prov_01",
    name: "Internal API Keys",
    type: "API_KEY",
    config: `{"header":"X-API-Key"}`,
    fields: [
      { label: "Header Target", value: "X-API-Key", mono: true },
      { label: "Verification", value: "Static Pattern Mask" },
    ],
  },
  {
    id: "id_prov_02",
    name: "Okta Workforce",
    type: "OIDC",
    config: `{"issuer":"https://acme.okta.com","clientId":"0oa1abc","scopes":["openid","profile"]}`,
    fields: [
      { label: "Issuer URL", value: "https://acme.okta.com/oauth…", mono: true },
      { label: "Credentials", value: "0oa1abc", mono: true, copyable: true },
    ],
  },
  {
    id: "id_prov_03",
    name: "Partner OAuth",
    type: "OAUTH2",
    config: `{"authUrl":"https://partners.acme.com/oauth/authorize","tokenUrl":"https://partners.acme.com/oauth/token"}`,
    fields: [
      { label: "Auth URL", value: "https://partners.acme.com/o…", mono: true },
      { label: "Token URL", value: "https://partners.acme.com/o…", mono: true },
    ],
  },
  {
    id: "id_prov_04",
    name: "Internal JWT",
    type: "JWT",
    config: `{"issuer":"https://auth.internal","audience":"gateway","jwksUrl":"https://auth.internal/.well-known/jwks.json"}`,
    fields: [
      { label: "Issuer Spec", value: "https://auth.internal", mono: true },
      { label: "JWKS URI", value: "/.well-known/jwks.json", mono: true },
    ],
  },
];

const PROVIDER_TYPE_TONE: Record<ProviderType, string> = {
  API_KEY: "bg-slate-100 text-slate-700",
  OIDC: "bg-blue-50 text-blue-700",
  OAUTH2: "bg-violet-50 text-violet-700",
  JWT: "bg-emerald-50 text-emerald-700",
};

function IdentityProvidersSection() {
  const [open, setOpen] = useState(false);
  const [initialType, setInitialType] = useState<ProviderType>("API_KEY");
  const [editing, setEditing] = useState<ProviderRow | null>(null);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProviderType | null>(null);

  const filtered = PROVIDER_ROWS.filter((r) => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const openWithType = (t: ProviderType) => {
    setInitialType(t);
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (r: ProviderRow) => {
    setInitialType(r.type);
    setEditing(r);
    setOpen(true);
  };

  return (
    <div className="flex flex-col">
      <div className="pb-5">
        <h3 className="text-[20px] font-semibold tracking-tight text-foreground">{"\n"}</h3>
        <p className="mt-1.5 max-w-4xl text-[13.5px] leading-relaxed text-muted-foreground">
          Available token formats for this API. Click a card to filter the list of configured
          providers below.
        </p>
      </div>

      {/* Type cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PROVIDER_TYPE_CARDS.map((card) => {
          const Icon = card.icon;
          const selected = typeFilter === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setTypeFilter((prev) => (prev === card.id ? null : card.id))}
              className={cn(
                "relative overflow-hidden rounded-xl border p-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-[#C23469]/30",
                selected
                  ? "border-[#C23469] bg-[#FDF2F7] ring-1 ring-[#C23469]"
                  : "border-[#ecebe7] bg-white hover:border-[#C23469]/40 hover:shadow-sm",
              )}
            >
              <span aria-hidden className={cn("absolute inset-x-0 top-0 h-[2px]", card.iconBg)} />
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-black/[0.04]",
                    card.iconBg,
                    card.iconColor,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <div className="text-[13px] font-semibold tracking-tight text-foreground">
                  {card.label}
                </div>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                {card.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Providers list container */}
      <div className="mt-6 rounded-xl border border-[#ecebe7] bg-white overflow-hidden">
        {/* Top bar: search on the left, primary CTA on the right */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#ecebe7] bg-[#fafaf8]/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="relative w-[240px] max-w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search providers..."
                className="h-9 w-full rounded-lg border border-[#e8e6e1] bg-white pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none"
              />
            </div>
          </div>
          {typeFilter ? (
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C23469]/30 bg-[#FDF2F7] px-2.5 py-1 text-[12px] font-medium text-[#B22257]">
                {PROVIDER_TYPE_CARDS.find((c) => c.id === typeFilter)?.label}
              </span>
              <button
                type="button"
                onClick={() => setTypeFilter(null)}
                className="text-[12px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Clear
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => openWithType("API_KEY")}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#B22257] px-3.5 text-[13px] font-medium text-white shadow-sm transition hover:bg-[#9c1e4c] focus:outline-none focus:ring-2 focus:ring-[#C23469]/30"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Add New Identity
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((r) => {
              const meta = PROVIDER_TYPE_CARDS.find((c) => c.id === r.type)!;
              const Icon = meta.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => openEdit(r)}
                  className="group flex flex-col rounded-lg border border-[#ecebe7] bg-white p-3.5 text-left transition hover:border-[#C23469]/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C23469]/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-black/[0.04]",
                          meta.iconBg,
                          meta.iconColor,
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold tracking-tight text-foreground">
                          {r.name}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                          {r.id}
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                        PROVIDER_TYPE_TONE[r.type],
                      )}
                    >
                      {r.type}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-col gap-1.5 rounded-md bg-[#fafaf8]/60 p-2.5">
                    {r.fields.map((f) => (
                      <div key={f.label} className="flex items-center justify-between gap-3">
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {f.label}
                        </span>
                        <span
                          className={cn(
                            "flex min-w-0 items-center gap-1.5 truncate rounded-md bg-white px-2 py-1 text-[11px] text-foreground ring-1 ring-inset ring-[#ecebe7]",
                            f.mono && "font-mono",
                          )}
                        >
                          <span className="truncate">{f.value}</span>
                          {f.copyable ? (
                            <Copy className="h-3 w-3 shrink-0 text-muted-foreground" />
                          ) : null}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                    <span className="inline-flex items-center text-[11px] text-muted-foreground transition-colors group-hover:text-[#B22257]">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#e8e6e1] bg-white px-4 py-8 text-center text-sm text-muted-foreground">
              {typeFilter
                ? "No providers configured for this format yet."
                : "No providers match your search."}
            </div>
          ) : null}
        </div>
      </div>
      {open ? (
        <NewProviderDrawer
          initialType={initialType}
          editing={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function NewProviderDrawer({
  onClose,
  initialType = "API_KEY",
  editing = null,
}: {
  onClose: () => void;
  initialType?: ProviderType;
  editing?: ProviderRow | null;
}) {
  const TYPES: ProviderType[] = ["API_KEY", "OIDC", "OAUTH2", "JWT"];
  const LABELS: Record<ProviderType, string> = {
    API_KEY: "API_KEY",
    OIDC: "OIDC",
    OAUTH2: "OAuth2",
    JWT: "JWT",
  };
  const [type, setType] = useState<ProviderType>(initialType);

  // Dummy prefilled configuration per provider type when editing an existing row.
  const cfg: Record<string, string> = (() => {
    if (!editing) return {};
    try {
      return JSON.parse(editing.config) as Record<string, string>;
    } catch {
      return {};
    }
  })();

  const isEditing = !!editing;
  const title = isEditing ? `Edit ${editing!.name}` : "New identity provider";
  const primaryLabel = isEditing ? "Save changes" : "Create provider";
  const prettyConfig = isEditing
    ? JSON.stringify({ type: LABELS[editing!.type], ...cfg }, null, 2)
    : `{\n  "type": "${LABELS[type]}"\n}`;
  return (
    <DrawerShell title={title} onClose={onClose} primaryLabel={primaryLabel}>
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Name
        </label>
        <input
          type="text"
          defaultValue={editing?.name ?? ""}
          placeholder="e.g. Okta Workforce"
          className="h-10 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Type
        </label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => !isEditing && setType(t)}
                disabled={isEditing}
                className={cn(
                  "rounded-lg border px-3 py-1.5 font-mono text-[12.5px] transition disabled:cursor-not-allowed disabled:opacity-60",
                  active
                    ? "border-[#C23469] bg-[#FDECF2] text-[#C23469]"
                    : "border-[#e8e6e1] bg-white text-foreground hover:bg-[#faf9f7]",
                )}
              >
                {LABELS[t]}
              </button>
            );
          })}
        </div>
      </div>

      {type === "API_KEY" && (
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Header name
          </label>
          <input
            type="text"
            defaultValue={cfg.header ?? ""}
            placeholder="X-API-Key"
            className="h-10 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none"
          />
          <p className="mt-1.5 text-[12px] text-muted-foreground">
            The request header that carries the token.
          </p>
        </div>
      )}

      {type === "OIDC" && (
        <>
          <ProviderField
            label="Issuer URL"
            defaultValue={cfg.issuer}
            placeholder="https://accounts.google.com"
            mono
            hint="Must match the `iss` claim in tokens exactly."
          />
          <ProviderField
            label="Client ID"
            defaultValue={cfg.clientId}
            placeholder="client_abc123"
            mono
          />
          <ProviderField
            label="Client secret"
            defaultValue={isEditing ? "••••••••••••" : ""}
            placeholder="••••••••"
            type="password"
            hint="Stored encrypted. Never shown again after save."
          />
        </>
      )}

      {type === "OAUTH2" && (
        <>
          <ProviderField
            label="Authorization URL"
            defaultValue={cfg.authUrl}
            placeholder="https://example.com/oauth/authorize"
            mono
          />
          <ProviderField
            label="Token URL"
            defaultValue={cfg.tokenUrl}
            placeholder="https://example.com/oauth/token"
            mono
          />
          <ProviderField
            label="Client ID"
            defaultValue={cfg.clientId ?? (isEditing ? "client_partner_42" : "")}
            placeholder="client_x"
            mono
          />
        </>
      )}

      {type === "JWT" && (
        <>
          <ProviderField
            label="Issuer"
            defaultValue={cfg.issuer}
            placeholder="https://auth.internal"
            mono
            hint="Must match the `iss` claim in tokens exactly."
          />
          <ProviderField
            label="Audience"
            defaultValue={cfg.audience}
            placeholder="gateway"
            mono
            hint="The `aud` claim your gateway expects."
          />
          <ProviderField
            label="JWKS URI"
            defaultValue={cfg.jwksUrl}
            placeholder="https://auth.internal/.well-known/jwks.json"
            mono
            hint="Public key endpoint used to verify token signatures."
          />
        </>
      )}

      <div className="border-t border-[#e8e6e1] pt-4">
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Generated config
        </label>
        <pre className="overflow-x-auto rounded-lg bg-[#0f0f10] px-4 py-3 font-mono text-[12.5px] leading-relaxed text-emerald-300">
          {prettyConfig}
        </pre>
      </div>
    </DrawerShell>
  );
}

function ProviderField({
  label,
  placeholder,
  hint,
  mono,
  type = "text",
  defaultValue,
}: {
  label: string;
  placeholder?: string;
  hint?: string;
  mono?: boolean;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 text-foreground placeholder:text-muted-foreground focus:border-[#C23469] focus:outline-none",
          mono ? "font-mono text-[13px]" : "text-sm",
        )}
      />
      {hint ? <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ApiKeysPanel() {
  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-[16px] border border-border bg-card">
        {/* Panel header */}
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">API keys</h3>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              Manage and rotate static bearer tokens for external API access. Rotate every 90 days —
              keys are shown once on creation.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#B22257] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#9b1d4c]"
          >
            <Plus className="h-4 w-4" />
            Create key
          </button>
        </div>

        {/* Header */}
        <div className="grid grid-cols-[2.2fr_1.6fr_2fr_1fr_1fr_28px] items-center gap-4 border-b border-border bg-[#F3F1F3] px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <div>Label</div>
          <div>Token</div>
          <div>Scopes</div>
          <div>Last used</div>
          <div>Status</div>
          <div />
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {SAMPLE_KEYS.map((k) => (
            <div
              key={k.token}
              className="grid grid-cols-[2.2fr_1.6fr_2fr_1fr_1fr_28px] items-center gap-4 border-b border-border/70 px-4 py-2.5 text-left transition last:border-b-0 hover:bg-muted/40"
            >
              {/* Label */}
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-foreground">{k.label}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span
                    className={cn(
                      "rounded px-1 py-[1px] text-[9.5px] font-bold uppercase tracking-wide",
                      ENV_TONE[k.env],
                    )}
                  >
                    {k.env}
                  </span>
                  <span>·</span>
                  <span className="truncate">{k.owner}</span>
                  <span>·</span>
                  <span>{k.date}</span>
                </div>
              </div>

              {/* Token */}
              <div className="flex items-center gap-1.5">
                <div className="inline-flex items-center gap-1 rounded-md border border-border bg-[#F3F1F3] px-2 py-0.5 font-mono text-[11.5px] text-foreground">
                  <span>{k.token}</span>
                  <span className="tracking-wider text-muted-foreground">••••••••</span>
                </div>
                <button
                  type="button"
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition hover:bg-hover hover:text-foreground"
                  aria-label="Reveal token"
                >
                  <Eye className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition hover:bg-hover hover:text-foreground"
                  aria-label="Copy token"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>

              {/* Scopes */}
              <div className="flex flex-wrap items-center gap-1">
                {k.scopes.map((s) => (
                  <span
                    key={s}
                    className="rounded border border-border bg-muted/60 px-1.5 py-[1px] font-mono text-[10.5px] text-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Last used */}
              <div className="text-[12px] text-muted-foreground">{k.lastUsed}</div>

              {/* Status */}
              <div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    k.status === "Active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700",
                  )}
                >
                  {k.status === "Active" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  {k.status}
                </span>
              </div>

              {/* Actions */}
              <button
                type="button"
                className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-hover hover:text-foreground"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReliabilityCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-[14px] font-semibold tracking-tight text-foreground">{value}</div>
      <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">{sub}</div>
    </div>
  );
}

/* ---------------- OAuth Apps Panel ---------------- */

type OAuthApp = {
  name: string;
  workspace: string;
  installs: number;
  clientId: string;
  grants: ("authorization_code" | "refresh_token" | "client_credentials")[];
  redirectUri: string;
  scopes: string[];
  status: "Active" | "Review";
  warning?: string;
  highlight?: boolean;
};

const SAMPLE_OAUTH_APPS: OAuthApp[] = [
  {
    name: "Shopify Connector",
    workspace: "partnerships",
    installs: 1284,
    clientId: "cli_shp_42aA",
    grants: ["authorization_code", "refresh_token"],
    redirectUri: "https://shopify.kapture.cx/oauth/callback",
    scopes: ["orders:read", "customers:read"],
    status: "Active",
  },
  {
    name: "Slack App",
    workspace: "growth",
    installs: 412,
    clientId: "cli_slk_7n3K",
    grants: ["authorization_code"],
    redirectUri: "https://slack.com/oauth/v2/callback",
    scopes: ["channels:write", "tickets:read"],
    status: "Active",
  },
  {
    name: "Internal CLI",
    workspace: "platform",
    installs: 9,
    clientId: "cli_ic_X91p",
    grants: ["client_credentials"],
    redirectUri: "—",
    scopes: ["*"],
    status: "Review",
    warning: "Wildcard scope — review",
    highlight: true,
  },
];

const GRANT_TONE: Record<OAuthApp["grants"][number], string> = {
  authorization_code: "bg-indigo-50 text-indigo-700 border-indigo-100",
  refresh_token: "bg-indigo-50 text-indigo-700 border-indigo-100",
  client_credentials: "bg-indigo-50 text-indigo-700 border-indigo-100",
};

function OAuthAppLogo({ name }: { name: string }) {
  const lower = name.toLowerCase();
  const wrap = "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border";
  if (lower.includes("shopify")) {
    return (
      <div className={cn(wrap, "bg-[#F1FBF1]")}>
        <svg viewBox="0 0 109 124" className="h-4 w-4" aria-hidden="true">
          <path
            fill="#95BF47"
            d="M74.7 14.8c-.1 0-2.3.7-5.9 1.8-3.6-10.4-9.9-14.6-15-14.6-.5 0-1 .1-1.5.1C50.8.8 49 0 47 0c-15.6 0-23 19.5-25.3 29.4-6.1 1.9-10.4 3.2-10.9 3.4-3.4 1.1-3.5 1.2-3.9 4.4C6.5 39.7 0 96 0 96l64.6 12.1L99 99.6S74.8 14.9 74.7 14.8zM58.1 18.7c-2.8.9-6 1.9-9.4 2.9.1-4.8-.6-9.4-2-13 5.6.4 9.6 6.8 11.4 10.1zM46.1 5c1.3 0 2.5.3 3.7.8-4.8 2.2-9.9 8-12.1 19.4-2.7.8-5.3 1.6-7.8 2.4 2.6-8.9 8.6-22.6 16.2-22.6z M62 17.4c0-.3.1-.5.1-.8 0-3-.4-5.5-1.1-7.4 2.7.3 4.5 3.5 5.7 7-1.7.5-3.3 1-4.7 1.2z"
          />
          <path
            fill="#5E8E3E"
            d="M74.7 14.8c-.1 0-2.3.7-5.9 1.8-3.6-10.4-9.9-14.6-15-14.6L51 108.1l34.4-8.5S74.8 14.9 74.7 14.8z"
          />
          <path
            fill="#FFF"
            d="M53.5 47.6l-4.2 12.6s-3.7-1.7-8.2-1.4c-6.6.4-6.6 4.6-6.6 5.6.4 5.7 15.4 7 16.3 20.4.7 10.5-5.6 17.7-14.6 18.3-10.9.6-16.8-5.8-16.8-5.8l2.3-9.8s6 4.5 10.7 4.2c3.1-.2 4.2-2.7 4.1-4.5-.5-7.5-12.7-7.1-13.5-19.3-.7-10.3 6.1-20.7 21-21.6 5.6-.5 9.5 1.3 9.5 1.3z"
          />
        </svg>
      </div>
    );
  }
  if (lower.includes("slack")) {
    return (
      <div className={cn(wrap, "bg-[#F4F1FA]")}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="#E01E5A" d="M5 15a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0v-5z" />
          <path fill="#36C5F0" d="M9 5a2 2 0 1 1 2-2v2H9zm0 1a2 2 0 1 1 0 4H4a2 2 0 1 1 0-4h5z" />
          <path
            fill="#2EB67D"
            d="M19 9a2 2 0 1 1 2 2h-2V9zm-1 0a2 2 0 1 1-4 0V4a2 2 0 1 1 4 0v5z"
          />
          <path
            fill="#ECB22E"
            d="M15 19a2 2 0 1 1-2 2v-2h2zm0-1a2 2 0 1 1 0-4h5a2 2 0 1 1 0 4h-5z"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className={cn(wrap, "bg-[#0F172A] text-white")}>
      <Terminal className="h-4 w-4" />
    </div>
  );
}

function OAuthAppsPanel() {
  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-[16px] border border-border bg-card">
        {/* Panel header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
              OAuth 2.0 applications
            </h3>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              Choose how to register an OAuth 2.0 application to connect external services to your
              APIs.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-4 bg-[#FAFAFB] p-4 md:grid-cols-2">
          <OAuthProviderCard
            iconBg="#C23469"
            iconBorder="transparent"
            icon={<span className="text-base font-bold leading-none text-white">V</span>}
            title="Vitos"
            description="Use Vitos as your OAuth 2.0 provider. Pre-configured with native support — no manual credential setup required."
            ctaLabel="Connect"
            ctaVariant="primary"
            recommended
            highlights={[
              "Pre-configured — no setup",
              "Managed token rotation",
              "Built-in audit logging",
            ]}
          />
          <OAuthProviderCard
            iconBg="#f4f3f1"
            iconBorder="#e8e6e1"
            icon={<Code2 className="h-5 w-5 text-muted-foreground" />}
            title="Custom App"
            description="Register a third-party OAuth 2.0 application with your own credentials. Supports authorization code and client credentials flows."
            ctaLabel="Register app"
            ctaVariant="outline"
            highlights={[
              "Bring your own client ID & secret",
              "Authorization code + client credentials",
              "Custom redirect URIs and scopes",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function OAuthProviderCard({
  iconBg,
  iconBorder,
  icon,
  title,
  description,
  ctaLabel,
  ctaVariant,
  recommended = false,
  highlights = [],
}: {
  iconBg: string;
  iconBorder: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  ctaVariant: "primary" | "outline";
  recommended?: boolean;
  highlights?: string[];
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[14px] border bg-white p-6 transition",
        recommended
          ? "border-[#C23469]/25 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(194,52,105,0.25)] hover:border-[#C23469]/40"
          : "border-[#e8e6e1] hover:border-[#d4d1ca]",
      )}
    >
      {/* Header row: icon + recommended badge */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-[12px] border",
            recommended && "shadow-[0_6px_16px_-6px_rgba(194,52,105,0.45)]",
          )}
          style={{ backgroundColor: iconBg, borderColor: iconBorder }}
        >
          {icon}
        </div>
        {recommended && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf3] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-[#067647] ring-1 ring-inset ring-[#abefc6]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#17b26a]" />
            Recommended
          </span>
        )}
      </div>

      {/* Title + description */}
      <h4 className="mt-5 text-[16px] font-semibold tracking-tight text-foreground">{title}</h4>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{description}</p>

      {/* Highlights */}
      {highlights.length > 0 && (
        <ul className="mt-4 flex-1 space-y-2">
          {highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-[12.5px] text-foreground/80">
              <Check
                className={cn(
                  "mt-0.5 h-3.5 w-3.5 shrink-0",
                  recommended ? "text-[#C23469]" : "text-muted-foreground",
                )}
              />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      <div className="mt-6 pt-5 border-t border-[#f0eeea]">
        {ctaVariant === "primary" ? (
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#B22257] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9b1d4c]"
          >
            {ctaLabel}
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-xl border border-[#e8e6e1] bg-white px-3.5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-[#f4f3f1]"
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function OAuthAppCard({ app }: { app: OAuthApp }) {
  return (
    <div className={cn("rounded-xl border bg-card p-2.5 transition", "border-border")}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <OAuthAppLogo name={app.name} />
          <div className="min-w-0">
            <h4 className="text-[13px] font-semibold tracking-tight text-foreground">{app.name}</h4>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>{app.workspace}</span>
              <span>·</span>
              <span>{app.installs.toLocaleString()} installs</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-5 w-6 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-hover hover:text-foreground"
          aria-label="More actions"
        >
          <MoreHorizontal className="h-3 w-3" />
        </button>
      </div>

      {/* Fields */}
      <div className="mt-2 flex flex-col divide-y divide-border/60 text-[11px]">
        <OAuthField label="Client ID">
          <div className="inline-flex items-center gap-1.5">
            <span className="rounded-md border border-border bg-[#F3F1F3] px-2 py-0.5 font-mono text-[11.5px] text-foreground">
              {app.clientId}
            </span>
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition hover:bg-hover hover:text-foreground"
              aria-label="Copy client id"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </OAuthField>

        <OAuthField label="Client secret">
          <div className="inline-flex items-center gap-1.5">
            <span className="rounded-md border border-border bg-[#F3F1F3] px-2 py-0.5 font-mono text-[11.5px] text-foreground">
              cs_<span className="tracking-wider text-muted-foreground">••••••••••</span>
            </span>
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition hover:bg-hover hover:text-foreground"
              aria-label="Reveal secret"
            >
              <Eye className="h-3 w-3" />
            </button>
          </div>
        </OAuthField>

        <OAuthField label="Grants">
          <div className="flex flex-wrap items-center gap-1">
            {app.grants.map((g) => (
              <span
                key={g}
                className={cn(
                  "rounded border px-1.5 py-[1px] font-mono text-[10.5px]",
                  GRANT_TONE[g],
                )}
              >
                {g}
              </span>
            ))}
          </div>
        </OAuthField>

        <OAuthField label="Redirect URI">
          <span className="block break-all font-mono text-[11.5px] text-foreground">
            {app.redirectUri}
          </span>
        </OAuthField>

        <OAuthField label="Scopes">
          <div className="flex flex-wrap items-center gap-1">
            {app.scopes.map((s) => {
              const isWildcard = s.includes("*");
              return (
                <span
                  key={s}
                  className={cn(
                    "inline-flex items-center gap-1 rounded border px-1.5 py-[1px] font-mono text-[10.5px]",
                    isWildcard
                      ? "border-[#B22257]/30 bg-[#FCE7EF] text-[#B22257]"
                      : "border-border bg-muted/60 text-foreground",
                  )}
                >
                  {isWildcard && <AlertTriangle className="h-2.5 w-2.5" />}
                  {s}
                </span>
              );
            })}
          </div>
        </OAuthField>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
        {app.status === "Active" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        )}
        {app.warning ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FCE7EF] px-2 py-0.5 text-[11px] font-medium text-[#B22257]">
            <AlertTriangle className="h-3 w-3" />
            {app.warning}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
            <Users className="h-3 w-3" />
            {app.installs.toLocaleString()} active connections
          </span>
        )}
      </div>
    </div>
  );
}

function OAuthField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-3 py-1">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="min-w-0 text-foreground">{children}</div>
    </div>
  );
}

function OAuthAppsList() {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[1.8fr_1.4fr_1.6fr_1.6fr_1fr_28px] items-center gap-4 border-b border-border bg-[#F3F1F3] px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <div>Application</div>
        <div>Client ID</div>
        <div>Grants</div>
        <div>Redirect URI</div>
        <div>Status</div>
        <div />
      </div>
      {SAMPLE_OAUTH_APPS.map((app) => (
        <div
          key={app.clientId}
          className="grid grid-cols-[1.8fr_1.4fr_1.6fr_1.6fr_1fr_28px] items-center gap-4 border-b border-border/70 px-4 py-2.5 text-left transition last:border-b-0 hover:bg-muted/40"
        >
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-foreground">{app.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span className="truncate">{app.workspace}</span>
              <span>·</span>
              <span>{app.installs.toLocaleString()} installs</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <span className="rounded-md border border-border bg-[#F3F1F3] px-2 py-0.5 font-mono text-[11.5px] text-foreground">
              {app.clientId}
            </span>
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition hover:bg-hover hover:text-foreground"
              aria-label="Copy"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {app.grants.map((g) => (
              <span
                key={g}
                className={cn(
                  "rounded border px-1.5 py-[1px] font-mono text-[10.5px]",
                  GRANT_TONE[g],
                )}
              >
                {g}
              </span>
            ))}
          </div>
          <div className="truncate font-mono text-[11.5px] text-foreground">{app.redirectUri}</div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-hover hover:text-foreground"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- JWT / OIDC Panel ---------------- */

type IdpId = "auth0" | "okta" | "cognito" | "azure" | "google" | "custom";

type IdpDef = {
  id: IdpId;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconColor: string;
  iconBg: string;
  issuer: string;
  audience: string;
  jwks: string;
};

const IDPS: IdpDef[] = [
  {
    id: "auth0",
    label: "Auth0",
    icon: Shield,
    iconColor: "text-[#B22257]",
    iconBg: "bg-[#FCE7EF]",
    issuer: "https://YOUR_DOMAIN.auth0.com/",
    audience: "kapture-api",
    jwks: "https://YOUR_DOMAIN.auth0.com/.well-known/jwks.json",
  },
  {
    id: "okta",
    label: "Okta",
    icon: Lock,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    issuer: "https://YOUR_DOMAIN.okta.com/oauth2/default",
    audience: "api://default",
    jwks: "https://YOUR_DOMAIN.okta.com/oauth2/default/v1/keys",
  },
  {
    id: "cognito",
    label: "AWS Cognito",
    icon: Network,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    issuer: "https://cognito-idp.us-east-1.amazonaws.com/POOL_ID",
    audience: "CLIENT_ID",
    jwks: "https://cognito-idp.us-east-1.amazonaws.com/POOL_ID/.well-known/jwks.json",
  },
  {
    id: "azure",
    label: "Azure AD",
    icon: Layers,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    issuer: "https://login.microsoftonline.com/TENANT_ID/v2.0",
    audience: "api://kapture",
    jwks: "https://login.microsoftonline.com/TENANT_ID/discovery/v2.0/keys",
  },
  {
    id: "google",
    label: "Google Identity",
    icon: BadgeCheck,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
    issuer: "https://accounts.google.com",
    audience: "YOUR_CLIENT_ID.apps.googleusercontent.com",
    jwks: "https://www.googleapis.com/oauth2/v3/certs",
  },
  {
    id: "custom",
    label: "Custom",
    icon: ShieldQuestion,
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted",
    issuer: "https://idp.example.com/",
    audience: "your-api",
    jwks: "https://idp.example.com/.well-known/jwks.json",
  },
];

const TIPS_BY_IDP: Record<IdpId, string[]> = {
  auth0: [
    "Use your Auth0 domain as issuer, not the management API URL",
    "Audience must match your API identifier in Auth0's dashboard",
    "RS256 is recommended — avoid HS256 for production",
  ],
  okta: [
    "Issuer should include the authorization server path (e.g. /oauth2/default)",
    "Audience defaults to api://default unless overridden",
    "Rotate signing keys via Okta's admin console",
  ],
  cognito: [
    "Issuer is your User Pool URL — include region and pool ID",
    "Audience is the App Client ID from Cognito",
    "Tokens are signed with RS256 by default",
  ],
  azure: [
    "Use the v2.0 issuer URL with your tenant ID",
    "Audience must match the App ID URI registered in Azure AD",
    "Validate the `tid` claim to enforce your tenant",
  ],
  google: [
    "Issuer is always https://accounts.google.com",
    "Audience must equal your OAuth Client ID",
    "Verify the `hd` claim if you restrict to a Workspace domain",
  ],
  custom: [
    "Issuer must match the `iss` claim in your tokens exactly",
    "JWKS must be reachable over HTTPS and return valid JSON",
    "Stick to RS256 or ES256 for production deployments",
  ],
};

const ALGORITHMS = ["RS256", "ES256", "HS256", "RS384"] as const;
type Algorithm = (typeof ALGORITHMS)[number];

function JwtOidcPanel() {
  const [idp, setIdp] = useState<IdpId | null>(null);
  const [algos, setAlgos] = useState<Algorithm[]>(["RS256", "ES256"]);
  const [endpointsOpen, setEndpointsOpen] = useState(false);
  const current = idp ? IDPS.find((i) => i.id === idp)! : null;
  const hasIdp = current !== null;
  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-[16px] border border-border bg-card">
        {/* Panel header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold tracking-tight text-foreground">JWT / OIDC</h3>
            <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
              Verify tokens from your identity provider via JWKS — no shared secrets required.
            </p>
            <button
              type="button"
              onClick={() => setEndpointsOpen(true)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-[#B22257] hover:underline"
            >
              <Link2 className="h-3 w-3" />
              View server endpoints
            </button>
          </div>
          <button
            type="button"
            disabled={!hasIdp}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-medium transition",
              hasIdp
                ? "border-transparent bg-[#B22257] text-white shadow-sm hover:bg-[#9b1d4c]"
                : "cursor-not-allowed border-border bg-card text-muted-foreground",
            )}
          >
            <Check className="h-3.5 w-3.5" />
            Save configuration
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 bg-[#FAFAFB] p-4">
          {/* Identity provider selector */}
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Identity provider
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {IDPS.map((p) => {
                const Icon = p.icon;
                const active = p.id === idp;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setIdp(p.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-[12.5px] font-medium text-foreground transition hover:bg-hover",
                      active ? "border-[#B22257]/50 ring-1 ring-[#B22257]/30" : "border-border",
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", p.iconColor)} strokeWidth={2.25} />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration card */}
          <div className="rounded-xl border border-border bg-card p-3.5">
            <div className="flex items-center gap-2">
              <h4 className="text-[13px] font-semibold tracking-tight text-foreground">
                Configuration
              </h4>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                  hasIdp ? "bg-emerald-50 text-emerald-700" : "bg-[#FCE7EF] text-[#B22257]",
                )}
              >
                {hasIdp ? current!.label : "Select an IdP above"}
              </span>
            </div>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              {hasIdp
                ? `Fields pre-filled with ${current!.label} defaults — update values specific to your instance.`
                : "Select an identity provider above to pre-fill defaults for your configuration."}
            </p>

            <div className="mt-3 flex flex-col gap-3">
              <JwtField
                label="Issuer"
                required
                hint="Must match the `iss` claim in your tokens exactly."
                value={current?.issuer ?? ""}
                placeholder="Select an IdP above"
              />
              <JwtField
                label="Audience"
                required
                hint="The API identifier registered in your IdP."
                value={current?.audience ?? ""}
                placeholder="e.g. kapture-api"
              />
              <JwtField
                label="JWKS URI"
                required
                hint="Public key endpoint used to verify token signatures."
                value={current?.jwks ?? ""}
                placeholder="Select an IdP above"
              />

              {/* Algorithms */}
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Algorithms
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {ALGORITHMS.map((a) => {
                    const active = algos.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() =>
                          setAlgos((prev) =>
                            prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
                          )
                        }
                        className={cn(
                          "rounded-md border px-2 py-0.5 font-mono text-[11px] transition",
                          active
                            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                            : "border-border bg-card text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Claim → User mapping */}
              <div className="mt-1 rounded-lg border border-border bg-[#FAFAFB] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Claim → User mapping
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                      Optional
                    </span>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#B22257] hover:underline"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                </div>
                <div className="mt-2 overflow-hidden rounded-md border border-border">
                  {[
                    { claim: "sub", field: "user_id", tag: "default" },
                    { claim: "email", field: "email", tag: "default" },
                    { claim: "https://kapture/roles", field: "roles", tag: "custom" },
                  ].map((row, i) => (
                    <div
                      key={row.claim}
                      className={cn(
                        "grid grid-cols-[1fr_20px_1fr_auto] items-center gap-2 bg-card px-2.5 py-1.5",
                        i > 0 && "border-t border-border",
                      )}
                    >
                      <span className="truncate font-mono text-[11.5px] text-foreground">
                        {row.claim}
                      </span>
                      <span className="text-center text-muted-foreground">→</span>
                      <span className="truncate font-mono text-[11.5px] text-foreground">
                        {row.field}
                      </span>
                      <span
                        className={cn(
                          "text-[10.5px] font-medium",
                          row.tag === "custom" ? "text-amber-600" : "text-muted-foreground",
                        )}
                      >
                        {row.tag}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Default mappings cover most IdPs. Only edit if your IdP uses custom claim
                  namespaces.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ServerEndpointsDialog open={endpointsOpen} onOpenChange={setEndpointsOpen} />
    </div>
  );
}

function ServerEndpointsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const endpoints = [
    { label: "Authorize", path: "/oauth/authorize" },
    { label: "Token", path: "/oauth/token" },
    { label: "Revoke", path: "/oauth/revoke" },
    { label: "Discovery", path: "/.well-known/openid-configuration" },
  ];
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (path: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(path).catch(() => {});
    }
    setCopied(path);
    setTimeout(() => setCopied((c) => (c === path ? null : c)), 1200);
  };
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-[440px] overflow-hidden rounded-[16px] border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
              Server endpoints
            </h3>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
              Kapture's OAuth / OIDC endpoints — share these with partners integrating against your
              APIs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:bg-hover hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-3 flex flex-col divide-y divide-border px-5 pb-5">
          {endpoints.map((e) => (
            <div key={e.label} className="flex items-center justify-between gap-3 py-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {e.label}
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                <span className="truncate text-right font-mono text-[12px] text-foreground">
                  {e.path}
                </span>
                <button
                  type="button"
                  onClick={() => copy(e.path)}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:bg-hover hover:text-foreground"
                  aria-label={`Copy ${e.label} endpoint`}
                >
                  {copied === e.path ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JwtField({
  label,
  required,
  hint,
  value,
  placeholder,
}: {
  label: string;
  required?: boolean;
  hint: string;
  value: string;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        {required && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B22257]">
            Required
          </span>
        )}
      </div>
      <input
        defaultValue={value}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border border-border bg-[#FAFAFB] px-2.5 py-1.5 font-mono text-[11.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-[#B22257]/40"
      />
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function SigningSecretsPanel() {
  const secrets = [
    {
      id: "stripe",
      provider: "Stripe",
      target: "Payments webhook",
      alg: "HMAC-SHA256",
      header: "X-Kapture-Signature",
      rotated: "rotated 12d ago",
      preview: "whsec_•••••••••",
    },
    {
      id: "shopify",
      provider: "Shopify",
      target: "Orders webhook",
      alg: "HMAC-SHA256",
      header: "X-Kapture-Signature",
      rotated: "rotated 3h ago",
      preview: "whsec_•••••••••",
    },
  ];
  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-[16px] border border-border bg-card">
        {/* Panel header */}
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
              Webhook signing secrets
            </h3>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              We sign outbound webhooks and verify inbound ones. Compare with constant-time HMAC.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#B22257] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#9b1d4c]"
          >
            <Plus className="h-4 w-4" />
            New secret
          </button>
        </div>

        {/* Rows */}
        <div className="flex flex-col divide-y divide-border bg-card">
          {secrets.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCE7EF] text-[#B22257]">
                  <Webhook className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold tracking-tight text-foreground">
                    {s.provider} <span className="text-muted-foreground">→</span> {s.target}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted-foreground">
                    <span className="inline-flex items-center rounded-md bg-[#F3F1F3] px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-foreground">
                      {s.alg}
                    </span>
                    <span className="font-mono text-[11px] text-foreground">{s.header}</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {s.rotated}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="inline-flex items-center rounded-md border border-border bg-[#FAFAFB] px-2 py-1 font-mono text-[11.5px] text-foreground">
                  {s.preview}
                </span>
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[12px] font-medium text-foreground transition hover:bg-hover"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Rotate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConsumerCard({
  iconBg,
  iconColor,
  icon,
  title,
  desc,
  badge,
}: {
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-2.5 py-2">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-5 w-5 items-center justify-center rounded", iconBg, iconColor)}>
          {icon}
        </span>
        <span className="text-[12.5px] font-semibold text-foreground">{title}</span>
        <span className="ml-auto inline-flex items-center rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-foreground">
          {badge}
        </span>
      </div>
      <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{desc}</p>
    </div>
  );
}

function BundleChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 font-mono text-[12px] text-foreground">
      <Layers className="h-3 w-3 text-muted-foreground" />
      {label}
    </span>
  );
}

/* ---------------- IP Allowlist Panel ---------------- */

type IpRule = {
  cidr: string;
  label: string;
  hits: number;
};

const SAMPLE_IP_RULES: IpRule[] = [
  { cidr: "203.0.113.0/24", label: "Office VPN egress", hits: 8421 },
  { cidr: "198.51.100.42", label: "Shopify webhook src", hits: 1203 },
  { cidr: "0.0.0.0/0", label: "Public (test env)", hits: 41 },
];

function IpAllowlistPanel() {
  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-[16px] border border-border bg-card">
        {/* Panel header */}
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
              IP allowlist
            </h3>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              Network-level rules applied before authentication.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#B22257] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#9b1d4c]"
          >
            <Plus className="h-4 w-4" />
            Add CIDR
          </button>
        </div>

        {/* Header */}
        <div className="grid grid-cols-[2fr_3fr_1fr_28px] items-center gap-4 border-b border-border bg-[#F3F1F3] px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <div>CIDR</div>
          <div>Label</div>
          <div className="text-right">Hits · 24h</div>
          <div />
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {SAMPLE_IP_RULES.map((r) => (
            <div
              key={r.cidr}
              className="grid grid-cols-[2fr_3fr_1fr_28px] items-center gap-4 border-b border-border/70 px-4 py-2.5 text-left transition last:border-b-0 hover:bg-muted/40"
            >
              <div className="font-mono text-[12.5px] text-foreground">{r.cidr}</div>
              <div className="text-[13px] text-foreground">{r.label}</div>
              <div className="text-right font-mono text-[12.5px] text-foreground">
                {r.hits.toLocaleString()}
              </div>
              <button
                type="button"
                className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-hover hover:text-foreground"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Request / Response tab ---------------- */

const OPENAPI_CONTRACT = `{
  "openapi": "3.1.0",
  "operationId": "customers.search",
  "x-kapture-side-effect": "read",
  "x-kapture-llm-description": "Use when the user wants to look up customers...",
  "servers": [
    { "url": "https://api.kapturecrm.com", "description": "Production" },
    { "url": "https://staging.kapturecrm.com", "description": "Staging" },
    { "url": "https://sandbox.kapturecrm.com", "description": "Sandbox" }
  ],
  "parameters": [
    {
      "name": "q",
      "in": "query",
      "required": true,
      "schema": { "type": "string", "minLength": 1 }
    }
  ],
  "responses": {
    "200": { "description": "Match list" },
    "429": { "description": "Rate limited" }
  }
}`;

function RequestResponseTab({ row: _row }: { row: Row }) {
  return (
    <div className="pt-5">
      <OpenApiContractCard code={OPENAPI_CONTRACT} />
    </div>
  );
}

function OpenApiContractCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* noop */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const lines = code.split("\n");

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#f4f5f7] shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-[#e5e7eb] bg-[#f9fafb] px-6 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground">
            OpenAPI 3.1 contract
          </h3>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[12px] text-muted-foreground">
            Inputs &amp; outputs validated by the dispatcher
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-mono text-[11px] text-muted-foreground">v1.0.4-live</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        {/* Left: dark code viewer */}
        <div className="flex flex-col overflow-hidden rounded-2xl bg-[#0d0e12]">
          <div className="flex items-center justify-between gap-3 border-b border-white/5 px-3 py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-white/80">
                <span className="font-mono">openapi.json</span>
                <span className="rounded bg-white/10 px-1 py-px font-mono text-[9px] uppercase tracking-wide text-white/60">
                  json
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-white/80 transition hover:bg-white/[0.08]"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy Spec
                </>
              )}
            </button>
          </div>
          <pre className="m-0 flex-1 overflow-x-auto bg-[#0d0e12] py-4 font-mono text-[12px] leading-[1.7]">
            <code className="block">
              {lines.map((line, i) => {
                const lineNo = i + 1;
                const isServer = lineNo >= 6 && lineNo <= 10;
                return (
                  <div
                    key={i}
                    className={cn(
                      "grid grid-cols-[3rem_1fr] whitespace-pre",
                      isServer && "border-l-2 border-rose-500 bg-rose-500/10",
                    )}
                  >
                    <span className="select-none pr-3 text-right text-white/30">{lineNo}</span>
                    <span className="pr-4 text-white/90">{highlightJson(line)}</span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>

        {/* Right: unified workspace */}
        <TryItWorkspace />
      </div>
    </section>
  );
}

function TryItWorkspace() {
  const [tab, setTab] = useState<"schema" | "test">("schema");
  const [server, setServer] = useState("sandbox");
  const [query, setQuery] = useState("");
  const [executed, setExecuted] = useState(false);
  const [responseMode, setResponseMode] = useState<"payload" | "curl">("curl");
  const [status, setStatus] = useState<200 | 429>(200);

  const serverMap: Record<string, { label: string; host: string }> = {
    production: { label: "Production", host: "api.kapturecrm.com" },
    staging: { label: "Staging", host: "staging.kapturecrm.com" },
    sandbox: { label: "Sandbox", host: "sandbox.kapturecrm.com" },
  };
  const current = serverMap[server];
  const requestUrl = `https://${current.host}/v1/customers/search?q=${query || "test23"}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-card">
      {/* Segment A: Endpoint metadata */}
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Endpoint Target
            </span>
            <span className="font-mono text-[15px] font-semibold text-foreground">
              customers.search
            </span>
          </div>
          <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 font-mono text-[10.5px] font-semibold tracking-wide text-blue-700">
            READ_SIDE_EFFECT
          </span>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-amber-200/70 bg-amber-50/60 px-4 py-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="flex flex-col gap-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-amber-900">
              LLM Intent Target Matching Spec
            </div>
            <p className="text-[13px] leading-relaxed text-foreground/90">
              Use when the user wants to look up customers by name, email, phone, or order id.
            </p>
          </div>
        </div>
      </div>

      {/* Segment B: Tabs */}
      <div className="border-t border-[#e5e7eb] px-6 pt-4">
        <div className="grid grid-cols-2 rounded-xl bg-[#f4f5f7] p-1">
          <button
            type="button"
            onClick={() => setTab("schema")}
            className={cn(
              "rounded-lg py-2 text-[13px] font-semibold transition",
              tab === "schema" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            Schema View
          </button>
          <button
            type="button"
            onClick={() => setTab("test")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-semibold transition",
              tab === "test" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            Interactive Test
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </button>
        </div>
      </div>

      {tab === "schema" ? (
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Parameters
              </div>
              <span className="text-[11px] text-muted-foreground">Read-Only Blueprint</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[14px] font-semibold text-foreground">q</span>
              <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                query-param
              </span>
              <span className="rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                required
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Main search criteria term passed directly inside the incoming query string parameters.
            </p>
            <input
              readOnly
              placeholder="e.g. jordan.reyes@example.com"
              className="w-full rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 font-mono text-[13px] text-muted-foreground outline-none"
            />
            <p className="font-mono text-[11.5px] text-muted-foreground">
              string · minLength 1 — name, email, phone or order id
            </p>
          </div>
          <p className="text-[12.5px] text-muted-foreground">
            Switch to{" "}
            <button
              type="button"
              onClick={() => setTab("test")}
              className="font-semibold text-foreground underline underline-offset-2"
            >
              Interactive Test
            </button>{" "}
            to run this request against a real server.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-2">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Target Server
            </div>
            <div className="relative">
              <select
                value={server}
                onChange={(e) => setServer(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#e5e7eb] bg-card py-2.5 pl-7 pr-9 font-mono text-[13px] text-foreground outline-none focus:border-primary"
              >
                <option value="production">Production – api.kapturecrm.com</option>
                <option value="staging">Staging – staging.kapturecrm.com</option>
                <option value="sandbox">Sandbox – sandbox.kapturecrm.com</option>
              </select>
              <span className="pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-emerald-500" />
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {server === "sandbox"
                ? "Test data — safe to run repeatedly against sandbox."
                : server === "staging"
                  ? "Pre-production data — mirrors production schema."
                  : "Live data — requests hit real customer records."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[14px] font-semibold text-foreground">q</span>
              <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                query-param
              </span>
              <span className="rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                required
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Main search criteria term passed directly inside the incoming query string parameters.
            </p>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="test23"
              className="w-full rounded-lg border border-[#e5e7eb] bg-card px-3 py-2.5 font-mono text-[13px] text-foreground outline-none focus:border-primary"
            />
            <p className="font-mono text-[11.5px] text-muted-foreground">
              string · minLength 1 — name, email, phone or order id
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setStatus(429);
                setExecuted(true);
              }}
              className="rounded-lg border border-[#e5e7eb] bg-card px-3 py-2 text-[12.5px] font-medium text-foreground transition hover:bg-[#f4f5f7]"
            >
              Simulate 429
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStatus(200);
                  setExecuted(true);
                }}
                className="rounded-lg bg-[#0d0e12] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
              >
                Execute
              </button>
              <button
                type="button"
                onClick={() => {
                  setExecuted(false);
                  setQuery("");
                }}
                className="rounded-lg border border-[#e5e7eb] bg-card px-3 py-2 text-[12.5px] font-medium text-foreground transition hover:bg-[#f4f5f7]"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Request URL
            </div>
            <div className="overflow-hidden rounded-lg bg-[#0d0e12] px-3 py-2.5 font-mono text-[12.5px] text-emerald-300">
              {requestUrl}
            </div>
          </div>

          {executed && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Live Response
                </div>
                <div className="grid grid-cols-2 rounded-md bg-[#f4f5f7] p-0.5">
                  <button
                    type="button"
                    onClick={() => setResponseMode("payload")}
                    className={cn(
                      "rounded px-2.5 py-1 text-[11px] font-medium transition",
                      responseMode === "payload"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground",
                    )}
                  >
                    Payload
                  </button>
                  <button
                    type="button"
                    onClick={() => setResponseMode("curl")}
                    className={cn(
                      "rounded px-2.5 py-1 text-[11px] font-medium transition",
                      responseMode === "curl"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground",
                    )}
                  >
                    cURL
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-2">
                  {status === 200 ? (
                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-700">
                      200 OK
                    </span>
                  ) : (
                    <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-rose-700">
                      429 ERR
                    </span>
                  )}
                  <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                    <span>{status === 200 ? "278 ms" : "42 ms"}</span>
                    <span>{status === 200 ? "2.4 KB" : "0.2 KB"}</span>
                  </div>
                </div>
                <pre className="m-0 overflow-x-auto bg-[#0d0e12] p-4 font-mono text-[12px] leading-[1.7] text-white/90">
                  {responseMode === "curl" ? (
                    <code>
                      <div>
                        <span className="text-white/60">curl -X </span>
                        <span className="text-[#C792EA]">GET</span>
                        <span className="text-white/60"> \</span>
                      </div>
                      <div>
                        {"  "}
                        <span className="text-[#A5E8A5]">'{requestUrl}'</span>
                        <span className="text-white/60"> \</span>
                      </div>
                      <div>
                        {"  -H "}
                        <span className="text-[#A5E8A5]">'Authorization: Bearer ****'</span>
                        <span className="text-white/60"> \</span>
                      </div>
                      <div>
                        {"  -H "}
                        <span className="text-[#A5E8A5]">'accept: application/json'</span>
                      </div>
                    </code>
                  ) : status === 200 ? (
                    <code>{`{
  "results": [
    { "id": "cus_9F2A", "name": "Jordan Reyes", "email": "jordan.reyes@example.com" },
    { "id": "cus_7X31", "name": "Jordan Park", "email": "jpark@example.com" }
  ],
  "count": 2
}`}</code>
                  ) : (
                    <code>{`{
  "error": "rate_limited",
  "retry_after_ms": 1200
}`}</code>
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Segment C: Operations & Responses */}
      <div className="flex flex-col gap-3 border-t border-[#e5e7eb] p-6">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Operations &amp; Responses
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/40 px-4 py-3">
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-[11px] font-semibold text-emerald-700">
            200 OK
          </span>
          <span className="flex-1 text-[13px] font-semibold text-foreground">Match list</span>
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
            LIVE
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">#application/json</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] bg-card px-4 py-3">
          <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 font-mono text-[11px] font-semibold text-rose-700">
            429 ERR
          </span>
          <span className="flex-1 text-[13px] text-foreground">Rate limited</span>
          <span className="font-mono text-[11px] text-muted-foreground">#backoff-triggered</span>
        </div>
      </div>
    </div>
  );
}

// Minimal JSON syntax highlighter — returns ReactNodes for one line.
function highlightJson(line: string) {
  const tokens: Array<{ t: string; v: string }> = [];
  const re =
    /("(?:[^"\\]|\\.)*")(\s*:)?|(\b(?:true|false|null)\b)|(-?\d+(?:\.\d+)?)|([{}[\],])|(\s+)|([^\s])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m[1]) {
      tokens.push({ t: m[2] ? "key" : "string", v: m[1] });
      if (m[2]) tokens.push({ t: "punct", v: m[2] });
    } else if (m[3]) tokens.push({ t: "kw", v: m[3] });
    else if (m[4]) tokens.push({ t: "num", v: m[4] });
    else if (m[5]) tokens.push({ t: "punct", v: m[5] });
    else if (m[6]) tokens.push({ t: "ws", v: m[6] });
    else if (m[7]) tokens.push({ t: "text", v: m[7] });
  }
  const cls: Record<string, string> = {
    key: "text-[#7DD3FC]",
    string: "text-[#A5E8A5]",
    kw: "text-[#C792EA]",
    num: "text-[#F7B26A]",
    punct: "text-white/50",
    ws: "",
    text: "text-white/80",
  };
  return tokens.map((tok, i) => (
    <span key={i} className={cls[tok.t]}>
      {tok.v}
    </span>
  ));
}

/* ---------------- Policy & access tab ---------------- */

const CONSUMER_PILL: Record<"UI" | "AGENT" | "WORKFLOW" | "EXTERNAL", string> = {
  UI: "bg-[#E6F0FB] text-[#1F4F86]",
  AGENT: "bg-[#ECE6FB] text-[#4A2F86]",
  WORKFLOW: "bg-[#E6F5EC] text-[#1F6B45]",
  EXTERNAL: "bg-muted text-foreground",
};

function PolicyAccessTab({ row: _row }: { row: Row }) {
  const consumers: Array<{
    kind: "UI" | "AGENT" | "WORKFLOW" | "EXTERNAL";
    auth: string;
    fullPii: "yes" | "no" | "trimmed";
    autoApproved: boolean;
  }> = [
    { kind: "UI", auth: "user identity", fullPii: "yes", autoApproved: true },
    { kind: "AGENT", auth: "agent identity", fullPii: "yes", autoApproved: true },
    { kind: "WORKFLOW", auth: "system identity", fullPii: "yes", autoApproved: true },
    { kind: "EXTERNAL", auth: "API key", fullPii: "trimmed", autoApproved: true },
  ];

  return (
    <div className="flex flex-col gap-4 pt-5">
      {/* Accessibility banner */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-card">
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
        </span>
        <div className="flex-1">
          <div className="text-[14px] font-semibold text-emerald-900">
            This API is accessible to your agent
          </div>
          <div className="mt-0.5 text-[12.5px] text-emerald-800/90">
            Your bundle includes the required scope and your agent identity is an approved consumer
            type.
          </div>
        </div>
        <span className="rounded-md border border-emerald-200 bg-card px-2 py-1 font-mono text-[12px] text-emerald-900">
          customers:read
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Who can call this API */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-[13px] font-semibold text-foreground">Who can call this API</h3>
          <div className="mt-4">
            <div className="grid grid-cols-[1fr_1.2fr_70px_90px] items-center gap-3 border-b border-border pb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              <span>Consumer</span>
              <span>Auth method</span>
              <span className="text-center">Full PII</span>
              <span className="text-center">Auto-approved</span>
            </div>
            <ul className="divide-y divide-border/60">
              {consumers.map((c) => (
                <li
                  key={c.kind}
                  className="grid grid-cols-[1fr_1.2fr_70px_90px] items-center gap-3 py-2.5 text-[13px]"
                >
                  <span
                    className={cn(
                      "inline-flex w-fit items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      CONSUMER_PILL[c.kind],
                    )}
                  >
                    {c.kind}
                  </span>
                  <span className="font-mono text-[12.5px] text-foreground">{c.auth}</span>
                  <span className="text-center">
                    {c.fullPii === "yes" ? (
                      <Check className="mx-auto h-4 w-4 text-emerald-600" />
                    ) : (
                      <span className="font-semibold text-amber-700">Trimmed</span>
                    )}
                  </span>
                  <span className="text-center">
                    {c.autoApproved && <Check className="mx-auto h-4 w-4 text-emerald-600" />}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Rate limits */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-[13px] font-semibold text-foreground">Rate limits</h3>
          <div className="mt-3 flex flex-col divide-y divide-border/60">
            <RateRow
              icon={<Gauge className="h-3.5 w-3.5" />}
              label="Limit class"
              value="Standard"
            />
            <RateRow
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Max throughput"
              value="600 rpm"
            />
            <RateRow
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              label="On breach"
              value="429 · caller blocked"
            />
          </div>
          <div className="mt-4 border-t border-border/60 pt-3">
            <div className="flex items-baseline justify-between text-[12px]">
              <span className="text-muted-foreground">Current usage (last hour)</span>
              <span className="font-mono text-foreground">228 / 600 rpm</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-[#B22257]" style={{ width: "38%" }} />
            </div>
            <div className="mt-2 text-[11.5px] text-muted-foreground">
              38% of limit · <span className="text-amber-700">partner_acme hit 429 at 12:47</span>
            </div>
          </div>
        </section>

        {/* Response filter */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-[13px] font-semibold text-foreground">Response filter</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            What external callers receive vs internal callers
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FilterBlock
              tone="ok"
              icon={<Eye className="h-3.5 w-3.5" />}
              label="Internal (full)"
              lines={[
                { text: "// all fields returned", muted: true },
                { text: "$.items[*].name" },
                { text: "$.items[*].email" },
                { text: "$.items[*].agent_score" },
                { text: "$.items[*].internal_notes" },
                { text: "$.items[*].pii.ssn" },
              ]}
            />
            <FilterBlock
              tone="warn"
              icon={<EyeOff className="h-3.5 w-3.5" />}
              label="External (trimmed)"
              lines={[
                { text: "// stripped before response", muted: true },
                { text: "$.items[*].name" },
                { text: "$.items[*].email" },
                { text: "× $.items[*].agent_score", stripped: true },
                { text: "× $.items[*].internal_notes", stripped: true },
                { text: "× $.items[*].pii.ssn", stripped: true },
              ]}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[#B22257]" />
              Stripped for compliance / PII
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-emerald-600" />
              Returned to caller
            </span>
          </div>
        </section>

        {/* Access & approval */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-[13px] font-semibold text-foreground">Access & approval</h3>
          <div className="mt-3 flex flex-col divide-y divide-border/60">
            <ApprovalItem
              iconBg="bg-emerald-50 text-emerald-700"
              icon={<Zap className="h-4 w-4" />}
              title="Auto-approved for standard consumers"
              desc="UI, agent, and workflow consumers are granted access automatically when the required scope is in their bundle."
            />
            <ApprovalItem
              iconBg="bg-sky-50 text-sky-700"
              icon={<Key className="h-4 w-4" />}
              title="External access requires API key"
              desc="External clients must use API key auth. Response is auto-trimmed — PII and internal fields are removed before returning."
            />
            <ApprovalItem
              iconBg="bg-rose-50 text-rose-700"
              icon={<Lock className="h-4 w-4" />}
              title="Elevated access not available"
              desc="Full PII access for external callers is not permitted on this API. Contact the Platform team to discuss alternatives."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function RateRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0 text-[13px]">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function FilterBlock({
  tone,
  icon,
  label,
  lines,
}: {
  tone: "ok" | "warn";
  icon: React.ReactNode;
  label: string;
  lines: Array<{ text: string; muted?: boolean; stripped?: boolean }>;
}) {
  return (
    <div>
      <div
        className={cn(
          "mb-1.5 inline-flex items-center gap-1.5 text-[12px] font-medium",
          tone === "ok" ? "text-emerald-700" : "text-rose-700",
        )}
      >
        {icon}
        {label}
      </div>
      <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 font-mono text-[12px] leading-[1.7]">
        {lines.map((l, i) => (
          <div
            key={i}
            className={cn(
              "whitespace-pre",
              l.muted && "italic text-muted-foreground/80",
              l.stripped && "text-[#B22257]",
              !l.muted && !l.stripped && "text-foreground",
            )}
          >
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalItem({
  iconBg,
  icon,
  title,
  desc,
}: {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconBg)}>
        {icon}
      </span>
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-foreground">{title}</div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

/* ---------------- Usage tab ---------------- */

type ConsumerKind = "agent" | "ui" | "workflow" | "external";

const CONSUMER_TONE: Record<ConsumerKind, string> = {
  agent: "bg-[#FCE6EC] text-[#9A1F4A]",
  ui: "bg-[#E6F0FB] text-[#1F4F86]",
  workflow: "bg-[#FEF3D9] text-[#9A5B12]",
  external: "bg-[#E8F1EC] text-[#1F6B45]",
};

type AuditEvent = {
  time: string;
  kind: "agent" | "ui" | "ext" | "wf";
  status: number;
  detail: string;
  right: string;
  tone: "ok" | "warn" | "err";
};

function UsageTab({ row: _row }: { row: Row }) {
  // Generate 24 hourly buckets with a realistic curve (low overnight, peak midday).
  const data = useMemo(() => {
    const buckets: Array<{ hour: number; label: string; calls: number }> = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let h = 0; h < 24; h++) {
      // Bell-ish curve peaking around 13:00, low at 03:00
      const base = Math.sin(((h - 3) / 24) * Math.PI) * 950 + 120;
      const jitter = (rand() - 0.5) * 220;
      const calls = Math.max(60, Math.round(base + jitter));
      buckets.push({
        hour: h,
        label: `${String(h).padStart(2, "0")}:00`,
        calls,
      });
    }
    return buckets;
  }, []);

  const total = data.reduce((sum, b) => sum + b.calls, 0);

  const consumers: Array<{
    kind: ConsumerKind;
    name: string;
    calls: number;
    errRate: number;
  }> = [
    { kind: "agent", name: "support-agent-v3", calls: 4100, errRate: 1.2 },
    { kind: "ui", name: "ops-dashboard", calls: 2800, errRate: 0.0 },
    { kind: "workflow", name: "wf://nightly-sync", calls: 1600, errRate: 0.4 },
    { kind: "external", name: "partner_acme", calls: 920, errRate: 0.1 },
  ];

  const events: AuditEvent[] = [
    { time: "12:48", kind: "agent", status: 200, detail: "", right: "142ms", tone: "ok" },
    { time: "12:47", kind: "ui", status: 200, detail: "", right: "88ms", tone: "ok" },
    { time: "12:47", kind: "ext", status: 429, detail: "rate limit hit", right: "—", tone: "warn" },
    { time: "12:46", kind: "wf", status: 200, detail: "", right: "210ms", tone: "ok" },
    { time: "12:45", kind: "agent", status: 200, detail: "", right: "99ms", tone: "ok" },
    {
      time: "12:44",
      kind: "ui",
      status: 503,
      detail: "upstream timeout",
      right: "30s",
      tone: "err",
    },
  ];

  const [range, setRange] = useState<"24h" | "7d" | "30d">("24h");
  const consumerTotal = consumers.reduce((s, c) => s + c.calls, 0);

  return (
    <div className="flex flex-col gap-4 pt-5">
      {/* Top stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <UsageStat
          icon={<Activity className="h-3.5 w-3.5" />}
          label="Calls / 24h"
          value={total.toLocaleString()}
          hint={
            <span className="text-emerald-700">
              <TrendingUp className="mr-1 inline h-3 w-3" />
              12% vs yesterday
            </span>
          }
        />
        <UsageStat
          icon={<Clock className="h-3.5 w-3.5" />}
          label="P95 latency"
          value="142ms"
          hint="Stable · threshold 500ms"
        />
        <UsageStat
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          label="Error rate"
          value="0.4%"
          hint="1 consumer above 1%"
          tone="warn"
        />
        <UsageStat
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          label="Circuit breaker"
          value="Closed"
          hint="Healthy · no trips today"
          tone="ok"
        />
      </div>

      {/* Chart + Audit */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.45fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-4">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-[13px] font-semibold text-foreground">Call volume</h3>
              <span className="text-[11.5px] text-muted-foreground">
                last 24 hours · {total.toLocaleString()} total
              </span>
            </div>
            <div className="flex items-center gap-0.5 rounded-full border border-border bg-muted/40 p-0.5 text-[11px]">
              {(["24h", "7d", "30d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 font-medium",
                    range === r
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </header>

          <div className="relative mt-3 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 24, right: 4, left: -16, bottom: 0 }}
                barCategoryGap={4}
              >
                <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  interval={3}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(h: number) => `${String(h).padStart(2, "0")}:00`}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontSize: 12,
                  }}
                  labelFormatter={(h) => `${String(h).padStart(2, "0")}:00`}
                  formatter={(v: number) => [`${v.toLocaleString()} calls`, "Volume"]}
                />
                <Bar dataKey="calls" radius={[4, 4, 0, 0]} maxBarSize={26}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.hour === 14 ? "#B22257" : "#F8C2D2"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Spike annotation */}
            <div className="pointer-events-none absolute top-1 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800 shadow-sm">
              <AlertTriangle className="h-3 w-3" />
              support-agent-v3 spike at 14:00
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <header className="flex items-baseline justify-between">
            <h3 className="text-[13px] font-semibold text-foreground">Recent audit events</h3>
            <button className="text-[11.5px] font-medium text-[#B22257] hover:underline">
              View all →
            </button>
          </header>
          <ul className="mt-2 flex flex-col divide-y divide-border/60 font-mono text-[12px]">
            {events.map((e, i) => (
              <li
                key={i}
                className={cn(
                  "grid grid-cols-[44px_36px_48px_1fr_auto] items-center gap-2 py-2",
                  e.tone === "warn" && "-mx-2 rounded-md bg-amber-50/60 px-2",
                )}
              >
                <span className="text-muted-foreground">{e.time}</span>
                <span className="text-foreground">{e.kind}</span>
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[10.5px] font-semibold",
                    e.tone === "ok" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
                    e.tone === "warn" && "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
                    e.tone === "err" && "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
                  )}
                >
                  {e.status}
                </span>
                <span
                  className={cn(
                    "truncate",
                    e.tone === "ok" && "text-muted-foreground",
                    e.tone === "warn" && "text-rose-700",
                    e.tone === "err" && "text-rose-700",
                  )}
                >
                  {e.detail}
                </span>
                <span
                  className={cn(
                    "text-right",
                    e.tone === "ok" && "text-foreground",
                    e.tone === "warn" && "text-muted-foreground",
                    e.tone === "err" && "text-amber-700",
                  )}
                >
                  {e.right}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Top consumers */}
      <section className="rounded-xl border border-border bg-card p-4">
        <header className="flex items-baseline justify-between">
          <h3 className="text-[13px] font-semibold text-foreground">Top consumers</h3>
          <span className="text-[11.5px] text-muted-foreground">by call volume · last 24h</span>
        </header>
        <div className="mt-3">
          <div className="grid grid-cols-[90px_1fr_90px_180px_70px] items-center gap-3 border-b border-border pb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            <span>Type</span>
            <span>Identity</span>
            <span className="text-right">Calls</span>
            <span>Call share</span>
            <span className="text-right">Errors</span>
          </div>
          <ul>
            {consumers.map((c, idx) => {
              const share = (c.calls / consumerTotal) * 100;
              return (
                <li
                  key={c.name}
                  className={cn(
                    "grid grid-cols-[90px_1fr_90px_180px_70px] items-center gap-3 border-b border-border/60 py-2.5 text-[13px] last:border-b-0",
                    idx === 0 && "-mx-2 rounded-md bg-[#FDF3F6] px-2",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex w-fit items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      CONSUMER_TONE[c.kind],
                    )}
                  >
                    {c.kind}
                  </span>
                  <span className="truncate font-mono text-foreground">{c.name}</span>
                  <span className="text-right font-mono text-foreground">
                    {c.calls.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          idx === 0 ? "bg-[#B22257]" : "bg-[#F1A8BE]",
                        )}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <span className="w-9 text-right font-mono text-[12px] text-muted-foreground">
                      {Math.round(share)}%
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-right font-mono",
                      c.errRate >= 1
                        ? "text-rose-700"
                        : c.errRate > 0
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {c.errRate >= 1 && <AlertTriangle className="mr-0.5 inline h-3 w-3" />}
                    {c.errRate.toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}

function UsageStat({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: React.ReactNode;
  tone?: "ok" | "warn";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4",
        tone === "warn" && "border-amber-200 bg-amber-50/60",
      )}
    >
      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <span>{icon}</span>
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-[24px] font-semibold leading-tight text-foreground",
          tone === "warn" && "text-amber-800",
          tone === "ok" && "text-emerald-700",
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-[11.5px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function HealthMetric({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "ok" | "warn" | "err";
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </div>
      <div
        className={cn(
          "mt-1.5 font-mono text-xl font-semibold text-foreground",
          tone === "warn" && "text-amber-700",
          tone === "err" && "text-rose-700",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function formatCalls(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/* ---------- Try it drawer ---------- */

type TryParam = {
  name: string;
  type: string;
  required: boolean;
  example: string;
  description: string;
};

function paramsForRow(row: Row): TryParam[] {
  if (row.method === "GET") {
    return [
      {
        name: "q",
        type: "string",
        required: true,
        example: '"acme"',
        description: "Search query — matches name, email, or custom attributes.",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        example: "25",
        description: "Max number of results to return (1–100).",
      },
      {
        name: "cursor",
        type: "string",
        required: false,
        example: '"eyJpZCI6MTAwfQ"',
        description: "Opaque pagination cursor from a previous response.",
      },
    ];
  }
  if (row.method === "DELETE") {
    return [
      {
        name: "id",
        type: "string",
        required: true,
        example: '"cus_8f2k1"',
        description: "Identifier of the resource to delete.",
      },
    ];
  }
  return [
    {
      name: "name",
      type: "string",
      required: true,
      example: '"Acme Corp"',
      description: "Display name for the new record.",
    },
    {
      name: "email",
      type: "string",
      required: true,
      example: '"ops@acme.com"',
      description: "Primary contact email — must be unique.",
    },
    {
      name: "segment",
      type: "string",
      required: false,
      example: '"enterprise"',
      description: "Optional segment tag for routing and reporting.",
    },
  ];
}

function sampleResponseForRow(row: Row): string {
  if (row.method === "GET") {
    return JSON.stringify(
      {
        results: [
          { id: "cus_8f2k1", name: "Acme Corp", email: "ops@acme.com", segment: "enterprise" },
          { id: "cus_44hg2", name: "Acme Labs", email: "labs@acme.com", segment: "growth" },
        ],
        next_cursor: null,
        took_ms: 124,
      },
      null,
      2,
    );
  }
  if (row.method === "DELETE") {
    return JSON.stringify({ id: "cus_8f2k1", deleted: true }, null, 2);
  }
  return JSON.stringify(
    {
      id: "cus_8f2k1",
      name: "Acme Corp",
      email: "ops@acme.com",
      created_at: "2026-06-02T10:24:11Z",
    },
    null,
    2,
  );
}

function TryItDrawer({ row, onClose }: { row: Row; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [useTestCreds, setUseTestCreds] = useState(true);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<null | {
    body: string;
    status: number;
    latencyMs: number;
  }>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const params = useMemo(() => paramsForRow(row), [row]);
  const fullUrl = `https://api.vitos.dev/v1${row.path}`;

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setResponse({
        body: sampleResponseForRow(row),
        status: 200,
        latencyMs: 120 + Math.floor(Math.random() * 60),
      });
      setSending(false);
      setTimeout(() => {
        responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 30);
    }, 700);
  };

  const handleCopy = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response.body);
    } catch {
      /* noop */
    }
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1500);
  };

  return (
    <div
      className="sticky top-4 w-[480px] shrink-0 self-start overflow-hidden rounded-[12px] border border-[#E8E6E1] bg-white shadow-sm"
      style={{
        transform: mounted ? "translateX(0)" : "translateX(100%)",
        transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        height: "calc(100vh - 2rem)",
      }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-[#E8E6E1] bg-white px-4 py-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span
              className={cn(
                "mt-[2px] rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase",
                METHOD_BADGE[row.method],
              )}
            >
              {row.method}
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-[#1A1A1A]">Try it</div>
              <div className="truncate font-mono text-[11px] text-[#A0A0A0]">{fullUrl}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center text-[#6B6B6B] transition hover:text-[#1A1A1A]"
            style={{ borderRadius: 7, border: "0.5px solid #E8E6E1" }}
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4">
          <div className="text-[10px] font-medium uppercase tracking-wider text-[#A0A0A0]">
            What will be sent
          </div>
          <div
            className="mt-2 flex items-center gap-2 px-2.5 py-2"
            style={{ background: "#F4F3F1", border: "0.5px solid #E8E6E1", borderRadius: 9 }}
          >
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase",
                METHOD_BADGE[row.method],
              )}
            >
              {row.method}
            </span>
            <code className="truncate font-mono text-[12px] text-[#1A1A1A]">{fullUrl}</code>
          </div>

          <div className="mt-5 text-[10px] font-medium uppercase tracking-wider text-[#A0A0A0]">
            Example parameters
          </div>
          <div className="mt-2">
            {params.map((p, i) => (
              <div
                key={p.name}
                className="grid items-start gap-3 py-2.5"
                style={{
                  gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.4fr)",
                  borderTop: i === 0 ? "none" : "0.5px solid #F0EEEA",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[12px] font-medium text-[#1A1A1A]">{p.name}</span>
                  <span
                    className="rounded px-1 py-[1px] text-[10px] text-[#6B6B6B]"
                    style={{ background: "#F0EEEA" }}
                  >
                    {p.type}
                  </span>
                  {p.required && (
                    <span
                      className="h-[5px] w-[5px] rounded-full"
                      style={{ background: "#C23469" }}
                    />
                  )}
                </div>
                <code className="font-mono text-[12px] text-[#185FA5] break-all">{p.example}</code>
                <div className="text-[11px] text-[#6B6B6B] leading-relaxed">{p.description}</div>
              </div>
            ))}
          </div>

          <div
            className="mt-4 flex items-start gap-2 px-3 py-2 text-[11px] text-[#6B6B6B]"
            style={{ background: "#FAFAF9", border: "0.5px solid #E8E6E1", borderRadius: 7 }}
          >
            <ShieldQuestion className="mt-[1px] h-3.5 w-3.5 shrink-0 text-[#A0A0A0]" />
            <span>
              Example values are pulled from the API contract. Send the request to see a live
              response.
            </span>
          </div>

          {response && (
            <div
              ref={responseRef}
              className="mt-5 overflow-hidden rounded-[10px]"
              style={{ background: "#161618" }}
            >
              {/* Titlebar */}
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{ background: "#1E1E20" }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-[10px] w-[10px] rounded-full"
                      style={{ background: "#FF5F57" }}
                    />
                    <span
                      className="h-[10px] w-[10px] rounded-full"
                      style={{ background: "#FFBD2E" }}
                    />
                    <span
                      className="h-[10px] w-[10px] rounded-full"
                      style={{ background: "#28C840" }}
                    />
                  </span>
                  <Terminal className="ml-2 h-3 w-3 text-[#666]" />
                  <span className="font-mono text-[12px] text-[#666]">response.json</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-[1px] text-[10px] font-medium text-[#A0A0A0]"
                    style={{ background: "#2A2A2C" }}
                  >
                    JSON
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-[11px] text-[#A0A0A0] transition hover:text-white"
                  >
                    {copiedJson ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedJson ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              {/* Status bar */}
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{ borderTop: "1px solid #222", borderBottom: "1px solid #222" }}
              >
                <span
                  className="inline-flex items-center gap-1 rounded px-1.5 py-[2px] text-[11px] font-medium"
                  style={{
                    background: response.status >= 400 ? "#3A1A1A" : "#1A3320",
                    color: response.status >= 400 ? "#F87171" : "#4ADE80",
                  }}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {response.status} {response.status >= 400 ? "Error" : "OK"}
                </span>
                <span className="font-mono text-[12px] text-[#555]">{response.latencyMs}ms</span>
              </div>
              {/* Body */}
              <pre
                className="overflow-x-auto font-mono text-[12px]"
                style={{ padding: "14px 16px", lineHeight: 1.85, color: "#D4D4D4" }}
              >
                <code dangerouslySetInnerHTML={{ __html: highlightJsonFull(response.body) }} />
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-[#E8E6E1] bg-white px-4 py-3">
          <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#1A1A1A]">
            <span
              onClick={() => setUseTestCreds((v) => !v)}
              className="grid place-items-center"
              style={{
                width: 17,
                height: 17,
                borderRadius: 5,
                background: useTestCreds ? "#C23469" : "#fff",
                border: useTestCreds ? "1px solid #C23469" : "1px solid #E8E6E1",
              }}
            >
              {useTestCreds && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </span>
            Use test credentials
          </label>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white transition"
            style={{
              background: "#C23469",
              borderRadius: 8,
              padding: "9px 18px",
              opacity: sending ? 0.65 : 1,
              pointerEvents: sending ? "none" : "auto",
            }}
            onMouseEnter={(e) => {
              if (!sending) (e.currentTarget as HTMLButtonElement).style.background = "#A02A58";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#C23469";
            }}
          >
            {sending ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Sending…
              </>
            ) : response ? (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                Run again
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Send test request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function escapeJsonHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightJsonFull(json: string) {
  const escaped = escapeJsonHtml(json);
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match: string) => {
      let color = "#F8C555"; // numbers
      if (/^"/.test(match)) {
        if (/:$/.test(match))
          color = "#79B8FF"; // key
        else color = "#9ECBFF"; // string
      } else if (/true|false|null/.test(match)) {
        color = "#F97583";
      }
      return `<span style="color:${color}">${match}</span>`;
    },
  );
}
