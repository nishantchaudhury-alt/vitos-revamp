import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  FileText,
  User,
  Ticket as TicketIcon,
  Settings as SettingsIcon,
  GitBranch,
  ChevronDown,
  Sparkles,
  Check,
  TableProperties,
  LayoutGrid,
} from "lucide-react";
import { NewAopPanel } from "./NewAopPanel";
import { PageContainer } from "./PageContainer";
import { LeadDataLogPage } from "./LeadDataLogPage";
import { AopBuilder } from "./aop-builder/AopBuilder";
import buildLogo from "@/assets/build-logo.png";
import aopEmptyHero from "@/assets/aop-empty-hero.png";

interface Procedure {
  id: string;
  name: string;
  description: string;
  entity: { label: string; tone: "amber" | "violet" | "sky" | "emerald" | "slate" };
  icon: "file" | "user" | "ticket" | "custom";
  status: { label: string; tone: "active" | "attention" | "draft" };
  modified: string;
}

const PROCEDURES: Procedure[] = [
  {
    id: "1",
    name: "bank_loan_leads",
    description: "Automated target pipeline for high-value bank loan lead generation tables.",
    entity: { label: "Lead", tone: "amber" },
    icon: "file",
    status: { label: "Active", tone: "active" },
    modified: "2 months ago",
  },
  {
    id: "2",
    name: "collections",
    description:
      "Automated queue routing logic and lifecycle mapping rules for payment collections.",
    entity: { label: "Ticket", tone: "sky" },
    icon: "ticket",
    status: { label: "Active", tone: "active" },
    modified: "1 month ago",
  },
  {
    id: "3",
    name: "Loan Application Leads",
    description: "Dispatches verification parameters for active core consumer loan applicants.",
    entity: { label: "Lead", tone: "amber" },
    icon: "file",
    status: { label: "Active", tone: "active" },
    modified: "10 days ago",
  },
  {
    id: "4",
    name: "loanaccount",
    description:
      "Manages ledger entry validations and synchronization patterns across account tables.",
    entity: { label: "Lead", tone: "amber" },
    icon: "file",
    status: { label: "Active", tone: "active" },
    modified: "16 days ago",
  },
  {
    id: "5",
    name: "Ops",
    description: "Custom operations environment configuration and deployment webhooks.",
    entity: { label: "Custom", tone: "slate" },
    icon: "custom",
    status: { label: "Active", tone: "active" },
    modified: "22 days ago",
  },
];

const ENTITY_TONES = {
  amber: "bg-amber-50 text-amber-700 border-amber-200/70",
  violet: "bg-violet-50 text-violet-700 border-violet-200/70",
  sky: "bg-sky-50 text-sky-700 border-sky-200/70",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
  slate: "bg-slate-50 text-slate-700 border-slate-200/70",
};

const ICON_TONES = {
  amber: "bg-amber-100 text-amber-700",
  violet: "bg-violet-100 text-violet-700",
  sky: "bg-sky-100 text-sky-700",
  emerald: "bg-emerald-100 text-emerald-700",
  slate: "bg-slate-100 text-slate-600",
};

const STATUS_TONES = {
  active: { dot: "bg-emerald-500", text: "text-foreground" },
  attention: { dot: "bg-amber-500", text: "text-foreground" },
  draft: { dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

const ICON_MAP = {
  file: FileText,
  user: User,
  ticket: TicketIcon,
  custom: SettingsIcon,
} as const;

export function AopPage({
  workspaceName,
  onGoToSchema,
  onCanvasModeChange,
}: {
  workspaceName: string;
  onGoToSchema?: () => void;
  onCanvasModeChange?: (active: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [procedures] = useState<Procedure[]>(PROCEDURES);
  const [viewingProcedure, setViewingProcedure] = useState<Procedure | null>(null);
  const [configuringProcedure, setConfiguringProcedure] = useState<Procedure | null>(null);
  const [viewMode, setViewMode] = useState<"rows" | "cards">("rows");

  useEffect(() => {
    onCanvasModeChange?.(!!configuringProcedure);
  }, [configuringProcedure, onCanvasModeChange]);

  const filtered = useMemo(
    () => procedures.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [procedures, query],
  );

  if (viewingProcedure) {
    return (
      <LeadDataLogPage
        procedureName={viewingProcedure.name}
        workspaceName={workspaceName}
        onBack={() => setViewingProcedure(null)}
      />
    );
  }

  if (configuringProcedure) {
    return (
      <AopBuilder
        procedureName={configuringProcedure.name}
        workspaceName={workspaceName}
        onBack={() => setConfiguringProcedure(null)}
      />
    );
  }

  if (procedures.length === 0) {
    return (
      <PageContainer fullWidth>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Agent operating procedures
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Build workflows that run automatically. Each AOP connects your agents to a data table
            and tells them exactly when and how to act.
          </p>
        </div>

        {/* Search */}
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search procedures..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Empty state — compact two-column */}
        <div className="group relative mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-2xl opacity-30 bg-gradient-to-br from-emerald-200/40 via-green-200/30 to-teal-200/20"
          />

          <div className="relative grid gap-8 p-8 md:grid-cols-[1fr_1.05fr] md:items-center md:gap-10 md:p-10">
            {/* Left: copy + steps + CTA */}
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Build your first workflow
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Two quick steps to get your agents running.
              </p>

              <ol className="mt-5 space-y-2.5">
                <li className="flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-green-50/60 to-teal-50/40 p-3.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Set up your schema</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      Define the records your agents will act on — tickets, orders, leads.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/60 p-3.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-muted-foreground">
                      Configure your AOP
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      Once your schema is ready, you can connect your agents and activate your
                      workflow.
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                      <Sparkles className="h-3 w-3" />
                      We'll bring you back here automatically
                    </span>
                  </div>
                </li>
              </ol>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onGoToSchema?.()}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-hover hover:-translate-y-0.5"
                >
                  <TableProperties className="h-4 w-4" />
                  Set up schema
                </button>
                <span className="text-xs text-muted-foreground font-semibold">
                  Takes &lt; 2 min · No code required
                </span>
              </div>
            </div>

            {/* Right: illustration */}
            <div className="flex items-center justify-center">
              <WorkflowIllustration />
            </div>
          </div>
        </div>
        <NewAopPanel open={newOpen} onClose={() => setNewOpen(false)} />
      </PageContainer>
    );
  }

  return (
    <PageContainer fullWidth>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Agent operating procedures
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
          Connect agents to data tables and tell them when and how to act — define triggers,
          conditions and outcomes so every procedure runs consistently across your workspace.
        </p>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3">
          <div className="flex w-64 items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter procedures..."
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            New AOP
          </button>
          <div className="flex items-center rounded-md border border-border bg-background p-0.5">
            <button
              type="button"
              aria-label="Rows view"
              onClick={() => setViewMode("rows")}
              className={`rounded px-2 py-1.5 transition ${
                viewMode === "rows"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableProperties className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Cards view"
              onClick={() => setViewMode("cards")}
              className={`rounded px-2 py-1.5 transition ${
                viewMode === "cards"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {viewMode === "rows" ? (
          <>
            {/* Column headers */}
            <div className="grid grid-cols-[minmax(0,1fr)_110px_110px_130px_90px_110px] items-center gap-4 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div>Procedure</div>
              <div>Type</div>
              <div>Status</div>
              <div>Last Modified</div>
              <div className="text-center">DETAILS</div>
              <div className="text-center">AOP</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
              {filtered.map((p) => {
                const Icon = ICON_MAP[p.icon];
                const status = STATUS_TONES[p.status.tone];
                const showTypeIcon = p.icon === "user" || p.icon === "custom";
                const TypeLead = p.entity.label === "Lead" ? User : null;
                return (
                  <div
                    key={p.id}
                    className="group grid grid-cols-[minmax(0,1fr)_110px_110px_130px_90px_110px] items-center gap-4 px-4 py-3 transition hover:bg-hover"
                  >
                    {/* Procedure cell */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${ICON_TONES[p.entity.tone]}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-foreground">
                          {p.name}
                        </div>
                        <div className="mt-0.5 truncate text-[11.5px] leading-snug text-muted-foreground">
                          {p.description}
                        </div>
                      </div>
                    </div>

                    {/* Type */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${ENTITY_TONES[p.entity.tone]}`}
                      >
                        {p.entity.label === "Custom" ? (
                          <SettingsIcon className="h-2.5 w-2.5" />
                        ) : TypeLead ? (
                          <TypeLead className="h-2.5 w-2.5" />
                        ) : null}
                        {p.entity.label}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        <span className={`h-1 w-1 rounded-full ${status.dot}`} />
                        {p.status.label}
                      </span>
                    </div>

                    {/* Last Modified */}
                    <div className="text-[12px] text-muted-foreground">{p.modified}</div>

                    {/* View */}
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        aria-label="View details"
                        onClick={() => setViewingProcedure(p)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium text-foreground transition hover:bg-hover"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                    </div>

                    {/* AOP */}
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        aria-label="Configure AOP"
                        onClick={() => setConfiguringProcedure(p)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium text-foreground transition hover:bg-hover"
                      >
                        <GitBranch className="h-3 w-3" />
                        Configure
                      </button>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No procedures match "{query}".
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProcedureCard
                key={p.id}
                p={p}
                onView={() => setViewingProcedure(p)}
                onConfigure={() => setConfiguringProcedure(p)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                No procedures match &quot;{query}&quot;.
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2.5 text-[11.5px] text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            <span className="font-semibold text-foreground">{procedures.length}</span> entries
          </div>
        </div>
      </div>

      <NewAopPanel open={newOpen} onClose={() => setNewOpen(false)} />
    </PageContainer>
  );
}

function ProcedureCard({
  p,
  onView,
  onConfigure,
}: {
  p: Procedure;
  onView: () => void;
  onConfigure: () => void;
}) {
  const Icon = ICON_MAP[p.icon];
  const status = STATUS_TONES[p.status.tone];
  const TypeLead = p.entity.label === "Lead" ? User : null;
  return (
    <div className="flex flex-col rounded-xl border border-border bg-background p-4 transition hover:border-foreground/20 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${ICON_TONES[p.entity.tone]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-foreground">{p.name}</div>
          <div className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
            {p.description}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${ENTITY_TONES[p.entity.tone]}`}
        >
          {p.entity.label === "Custom" ? (
            <SettingsIcon className="h-2.5 w-2.5" />
          ) : TypeLead ? (
            <TypeLead className="h-2.5 w-2.5" />
          ) : null}
          {p.entity.label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          <span className={`h-1 w-1 rounded-full ${status.dot}`} />
          {p.status.label}
        </span>
      </div>

      <div className="mt-3 text-[12px] text-muted-foreground">Last modified {p.modified}</div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onView}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-hover"
        >
          <Eye className="h-3 w-3" />
          View
        </button>
        <button
          type="button"
          onClick={onConfigure}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-hover"
        >
          <GitBranch className="h-3 w-3" />
          Configure
        </button>
      </div>
    </div>
  );
}

type StepState = "done" | "active" | "todo";

function Step({ number, label, state }: { number: number; label: string; state: StepState }) {
  const circle =
    state === "active"
      ? "border-[#8B1E48] text-[#8B1E48] bg-background"
      : state === "done"
        ? "border-[#8B1E48] bg-[#8B1E48] text-white"
        : "border-border text-muted-foreground bg-background";
  const labelClass = state === "todo" ? "text-muted-foreground" : "text-foreground font-medium";
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm ${circle}`}
      >
        {state === "done" ? <Check className="h-4 w-4" /> : number}
      </div>
      <span className={`text-xs ${labelClass}`}>{label}</span>
    </div>
  );
}

function StepConnector({ state }: { state: StepState }) {
  const color = state === "done" ? "bg-[#8B1E48]" : "bg-border";
  return <div className={`mt-[18px] h-px flex-1 mx-3 ${color}`} />;
}

function WorkflowIllustration() {
  return (
    <svg
      viewBox="0 0 480 220"
      className="h-44 w-full max-w-[480px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        {/* Dot grid */}
        <pattern id="aopDots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#10b981" opacity="0.18" />
        </pattern>
        {/* Fade mask so dots blend into the card */}
        <radialGradient id="aopDotsMask" cx="50%" cy="50%" r="55%">
          <stop offset="60%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="aopDotsMaskApply">
          <rect width="480" height="220" fill="url(#aopDotsMask)" />
        </mask>
      </defs>

      {/* Dotted grid background */}
      <rect width="480" height="220" fill="url(#aopDots)" mask="url(#aopDotsMaskApply)" />

      {/* Connector paths */}
      <path d="M120 60 C 160 60, 160 110, 200 110" stroke="#34d399" strokeWidth="1.5" fill="none" />
      <path
        d="M120 160 C 160 160, 160 110, 200 110"
        stroke="#34d399"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M340 110 C 380 110, 380 110, 420 110"
        stroke="#34d399"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Connector dots (endpoints) */}
      <circle cx="120" cy="60" r="3" fill="#10b981" />
      <circle cx="200" cy="110" r="3" fill="#10b981" />
      <circle cx="120" cy="160" r="3" fill="#10b981" />
      <circle cx="340" cy="110" r="3" fill="#10b981" />
      <circle cx="420" cy="110" r="3" fill="#10b981" />

      {/* Label pill: Trigger */}
      <g>
        <rect
          x="135"
          y="78"
          width="56"
          height="18"
          rx="9"
          fill="#ffffff"
          stroke="#a7f3d0"
          strokeWidth="1"
        />
        <text
          x="163"
          y="90"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="9"
          fontWeight="600"
          fill="#047857"
        >
          Trigger
        </text>
      </g>

      {/* Label pill: Route */}
      <g>
        <rect
          x="350"
          y="92"
          width="44"
          height="18"
          rx="9"
          fill="#ffffff"
          stroke="#a7f3d0"
          strokeWidth="1"
        />
        <text
          x="372"
          y="104"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="9"
          fontWeight="600"
          fill="#047857"
        >
          Route
        </text>
      </g>

      {/* Top-left node card: Intake */}
      <g>
        <rect
          x="20"
          y="36"
          width="100"
          height="48"
          rx="10"
          fill="#ffffff"
          stroke="#d1fae5"
          strokeWidth="1.2"
        />
        <rect x="28" y="44" width="14" height="14" rx="3.5" fill="#d1fae5" />
        <rect x="32" y="48" width="6" height="1.5" rx="0.75" fill="#047857" />
        <rect x="32" y="51.5" width="6" height="1.5" rx="0.75" fill="#047857" />
        <rect x="32" y="55" width="4" height="1.5" rx="0.75" fill="#047857" />
        <text
          x="48"
          y="52"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="9"
          fontWeight="700"
          fill="#0f172a"
        >
          Intake
        </text>
        <text x="48" y="62" fontFamily="ui-sans-serif, system-ui" fontSize="7.5" fill="#64748b">
          New ticket received
        </text>
        <rect x="28" y="70" width="22" height="9" rx="4.5" fill="#ecfdf5" />
        <text
          x="39"
          y="76.5"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="6.5"
          fontWeight="600"
          fill="#047857"
        >
          12
        </text>
        <rect x="54" y="70" width="22" height="9" rx="4.5" fill="#ecfdf5" />
        <text
          x="65"
          y="76.5"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="6.5"
          fontWeight="600"
          fill="#047857"
        >
          04
        </text>
      </g>

      {/* Bottom-left node card: Classify */}
      <g>
        <rect
          x="20"
          y="136"
          width="100"
          height="48"
          rx="10"
          fill="#ffffff"
          stroke="#d1fae5"
          strokeWidth="1.2"
        />
        <rect x="28" y="144" width="14" height="14" rx="3.5" fill="#d1fae5" />
        <circle cx="35" cy="151" r="3" fill="none" stroke="#047857" strokeWidth="1.2" />
        <path d="M37 153 l2.5 2.5" stroke="#047857" strokeWidth="1.2" strokeLinecap="round" />
        <text
          x="48"
          y="152"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="9"
          fontWeight="700"
          fill="#0f172a"
        >
          Classify
        </text>
        <text x="48" y="162" fontFamily="ui-sans-serif, system-ui" fontSize="7.5" fill="#64748b">
          Detect intent + route
        </text>
        <rect x="28" y="170" width="22" height="9" rx="4.5" fill="#ecfdf5" />
        <text
          x="39"
          y="176.5"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="6.5"
          fontWeight="600"
          fill="#047857"
        >
          38
        </text>
        <rect x="54" y="170" width="26" height="9" rx="4.5" fill="#ecfdf5" />
        <text
          x="67"
          y="176.5"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="6.5"
          fontWeight="600"
          fill="#047857"
        >
          99%
        </text>
      </g>

      {/* Center node card: Resolve */}
      <g>
        <rect
          x="200"
          y="86"
          width="140"
          height="56"
          rx="10"
          fill="#ffffff"
          stroke="#86efac"
          strokeWidth="1.5"
        />
        <rect x="210" y="96" width="16" height="16" rx="4" fill="#86efac" />
        <path
          d="M214 104 l3 3 l5 -5"
          stroke="#065f46"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <text
          x="232"
          y="104"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="10"
          fontWeight="700"
          fill="#0f172a"
        >
          Resolve
        </text>
        <text x="232" y="115" fontFamily="ui-sans-serif, system-ui" fontSize="8" fill="#64748b">
          Run agent + reply
        </text>
        <rect x="210" y="124" width="26" height="11" rx="5.5" fill="#ecfdf5" />
        <text
          x="223"
          y="131.5"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="7"
          fontWeight="600"
          fill="#047857"
        >
          142
        </text>
        <rect x="240" y="124" width="34" height="11" rx="5.5" fill="#ecfdf5" />
        <text
          x="257"
          y="131.5"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="7"
          fontWeight="600"
          fill="#047857"
        >
          live
        </text>
        <rect x="278" y="124" width="34" height="11" rx="5.5" fill="#ecfdf5" />
        <text
          x="295"
          y="131.5"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="7"
          fontWeight="600"
          fill="#047857"
        >
          2.4s
        </text>
      </g>

      {/* Right node card: Notify */}
      <g>
        <rect x="420" y="86" width="44" height="48" rx="10" fill="#065f46" />
        <path
          d="M433 108 l4 4 l8 -8"
          stroke="#a7f3d0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <text
          x="442"
          y="125"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="7"
          fontWeight="600"
          fill="#a7f3d0"
        >
          Done
        </text>
      </g>
    </svg>
  );
}
