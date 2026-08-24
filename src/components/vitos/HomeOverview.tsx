import { useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bot,
  BookOpen,
  Columns2,
  Copy,
  Cpu,
  HelpCircle,
  Mic,
  MicOff,
  MessageSquare,
  Network,
  Plug,
  Radio,
  Rows2,
  ScrollText,
  Server,
  Shuffle,
  Sparkles,
  Table2,
  Unlink,
  UserRound,
  Wand2,
  Play,
} from "lucide-react";

import heroThumbnail from "@/assets/vitos-hero-thumbnail.png";
import buildLogo from "@/assets/build-logo.png";
import { PageContainer } from "./PageContainer";

type CardKey = "conversational" | "workflow" | "api" | "copilot" | "aop";

interface Props {
  workspaceName: string;
  userFirstName?: string;
  onStartBuilding?: (key: CardKey) => void;
}

function greetingForNow() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ---------- Needs your attention ---------- */

type HealthSeverity = "critical" | "warning" | "blocked" | "healthy";
type HealthGroup = "AGENTS" | "AOPS" | "SCHEMA";

interface HealthRow {
  group: HealthGroup;
  severity: HealthSeverity;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  meta: string;
  actionIcon?: React.ComponentType<{ className?: string }>;
  actionLabel: string;
  actionDisabled?: boolean;
}

const healthRows: HealthRow[] = [
  {
    group: "AGENTS",
    severity: "critical",
    icon: AlertTriangle,
    title: "Status Agent — 12 failed runs",
    meta: "Failing since 47 min ago",
    actionIcon: ScrollText,
    actionLabel: "View logs",
  },
  {
    group: "AGENTS",
    severity: "warning",
    icon: Unlink,
    title: "Escalation Agent — not connected",
    meta: "Created 3 days ago, never run",
    actionIcon: Shuffle,
    actionLabel: "Connect to AOP",
  },
  {
    group: "AOPS",
    severity: "blocked",
    icon: UserRound,
    title: "Refund resolution — 3 requests pending",
    meta: "Workflow blocked · oldest: 2h 14m",
    actionIcon: HelpCircle,
    actionLabel: "Review",
  },
  {
    group: "SCHEMA",
    severity: "healthy",
    icon: Copy,
    title: "All schemas healthy",
    meta: "4 active entities, no issues detected",
    actionLabel: "No action needed",
    actionDisabled: true,
  },
];

const healthSeverityStyles: Record<
  HealthSeverity,
  { tile: string; icon: string; pillBg: string; pillText: string; label: string }
> = {
  critical: {
    tile: "bg-red-500/10",
    icon: "text-red-600",
    pillBg: "bg-red-500/10",
    pillText: "text-red-600",
    label: "Critical",
  },
  warning: {
    tile: "bg-amber-500/10",
    icon: "text-amber-700",
    pillBg: "bg-amber-500/15",
    pillText: "text-amber-700",
    label: "Warning",
  },
  blocked: {
    tile: "bg-violet-500/10",
    icon: "text-violet-700",
    pillBg: "bg-amber-500/15",
    pillText: "text-amber-800",
    label: "Blocked",
  },
  healthy: {
    tile: "bg-emerald-500/10",
    icon: "text-emerald-700",
    pillBg: "bg-emerald-500/15",
    pillText: "text-emerald-700",
    label: "Healthy",
  },
};

function HealthRowItem({ row }: { row: HealthRow }) {
  const s = healthSeverityStyles[row.severity];
  const Icon = row.icon;
  const ActionIcon = row.actionIcon;
  return (
    <div className="grid grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_auto_auto] items-center gap-3 px-5 py-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      </span>
      <p className="truncate text-[13px] font-semibold text-foreground">{row.title}</p>
      <p className="truncate text-[12px] text-muted-foreground">{row.meta}</p>
      <span
        className={`shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium leading-none ${s.pillBg} ${s.pillText}`}
      >
        {s.label}
      </span>
      <button
        type="button"
        disabled={row.actionDisabled}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[11.5px] font-medium text-foreground transition hover:bg-hover disabled:cursor-default disabled:text-muted-foreground disabled:hover:bg-card"
      >
        {ActionIcon && <ActionIcon className="h-3 w-3" />}
        {row.actionLabel}
      </button>
    </div>
  );
}

/* ---------- Continue your work ---------- */

type WorkStatus = "in-build" | "draft" | "live" | "active" | "failing";
type WorkType = "Agent" | "AOP" | "Schema";
type WorkGroup = "RECENTLY CREATED" | "RECENTLY EDITED";

interface WorkRow {
  group: WorkGroup;
  type: WorkType;
  icon: React.ComponentType<{ className?: string }>;
  iconTile: string;
  iconColor: string;
  title: string;
  isNew?: boolean;
  meta: string;
  status: WorkStatus;
}

const workRows: WorkRow[] = [
  {
    group: "RECENTLY CREATED",
    type: "Agent",
    icon: Bot,
    iconTile: "bg-violet-500/10",
    iconColor: "text-violet-600",
    title: "support_classifier",
    isNew: true,
    meta: "Created 2h ago · not connected to an AOP yet",
    status: "in-build",
  },
  {
    group: "RECENTLY CREATED",
    type: "AOP",
    icon: Shuffle,
    iconTile: "bg-rose-500/10",
    iconColor: "text-rose-600",
    title: "bank_loan_leads",
    isNew: true,
    meta: "Created yesterday · agents not connected yet",
    status: "draft",
  },
  {
    group: "RECENTLY EDITED",
    type: "AOP",
    icon: Shuffle,
    iconTile: "bg-rose-500/10",
    iconColor: "text-rose-600",
    title: "Refund resolution",
    meta: "142 runs this week · edited yesterday",
    status: "live",
  },
  {
    group: "RECENTLY EDITED",
    type: "Schema",
    icon: Copy,
    iconTile: "bg-amber-500/10",
    iconColor: "text-amber-600",
    title: "Tickets",
    meta: "19 records · 7 states · edited yesterday",
    status: "active",
  },
  {
    group: "RECENTLY EDITED",
    type: "Agent",
    icon: Bot,
    iconTile: "bg-violet-500/10",
    iconColor: "text-violet-600",
    title: "Status Agent",
    meta: "12 failed runs today · last opened 2h ago",
    status: "failing",
  },
];

const workStatusStyles: Record<WorkStatus, { bg: string; text: string; label: string }> = {
  "in-build": { bg: "bg-amber-500/15", text: "text-amber-700", label: "In build" },
  draft: { bg: "bg-muted", text: "text-muted-foreground", label: "Draft" },
  live: { bg: "bg-emerald-500/15", text: "text-emerald-700", label: "Live" },
  active: { bg: "bg-emerald-500/15", text: "text-emerald-700", label: "Active" },
  failing: { bg: "bg-red-500/15", text: "text-red-600", label: "Failing" },
};

function WorkRowItem({ row }: { row: WorkRow }) {
  const Icon = row.icon;
  const s = workStatusStyles[row.status];
  return (
    <button
      type="button"
      className="grid w-full grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_auto] items-center gap-3 px-5 py-2.5 text-left transition hover:bg-hover"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-[13px] font-semibold text-foreground">{row.title}</span>
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {row.type}
        </span>
        {row.isNew && (
          <span className="shrink-0 inline-flex items-center rounded bg-[#5b1538] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            New
          </span>
        )}
      </div>
      <p className="truncate text-[12px] text-muted-foreground">{row.meta}</p>
      <span
        className={`shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium leading-none ${s.bg} ${s.text}`}
      >
        {s.label}
      </span>
    </button>
  );
}

/* ---------- Group label ---------- */

const groupTones: Record<string, { bar: string; text: string; dot: string }> = {
  AGENTS: {
    bar: "bg-gradient-to-r from-violet-500/[0.04] via-violet-500/[0.015] to-transparent",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  AOPS: {
    bar: "bg-gradient-to-r from-rose-500/[0.04] via-rose-500/[0.015] to-transparent",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  SCHEMA: {
    bar: "bg-gradient-to-r from-amber-500/[0.04] via-amber-500/[0.015] to-transparent",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  "RECENTLY CREATED": {
    bar: "bg-gradient-to-r from-sky-500/[0.04] via-sky-500/[0.015] to-transparent",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  "RECENTLY EDITED": {
    bar: "bg-gradient-to-r from-emerald-500/[0.04] via-emerald-500/[0.015] to-transparent",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
};

function GroupLabel({ children }: { children: string }) {
  const tone = groupTones[children] ?? {
    bar: "bg-muted/40",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  };
  return (
    <div className="flex items-center gap-2 border-y border-border bg-muted/30 px-5 py-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${tone.text}`}>
        {children}
      </span>
    </div>
  );
}

/* ---------- Build cards ---------- */

const buildCards: {
  key: CardKey;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tile: string;
  iconColor: string;
  blob: string;
}[] = [
  {
    key: "conversational",
    icon: MessageSquare,
    title: "Conversational agent",
    description: "Handle customer queries across voice, chat, WhatsApp and email — automatically.",
    tile: "bg-amber-500/10",
    iconColor: "text-amber-600",
    blob: "bg-gradient-to-br from-amber-300/50 via-orange-300/40 to-pink-300/30",
  },
  {
    key: "workflow",
    icon: Cpu,
    title: "Work agent",
    description: "Automate background tasks that run on triggers — no human needed in the loop.",
    tile: "bg-sky-500/10",
    iconColor: "text-sky-600",
    blob: "bg-sky-400/30",
  },
  {
    key: "api",
    icon: Plug,
    title: "Agent as API",
    description: "Plug your agent into any system or product via a simple API call.",
    tile: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    blob: "bg-emerald-400/30",
  },
];

const aopCard = {
  key: "aop" as CardKey,
  icon: Network,
  title: "Multi-agent workflow (AOP)",
  description:
    "Coordinate multiple agents across an end-to-end customer journey. AOP decides which agent runs when, passes data between them, and enforces your business rules.",
  tile: "bg-violet-500/10",
  iconColor: "text-violet-600",
  blob: "bg-violet-400/30",
};

/* ---------- Main component ---------- */

type Page = "overview" | "health" | "work";

export function HomeOverview({ workspaceName, userFirstName = "Swati", onStartBuilding }: Props) {
  const wsName = workspaceName.trim() || "your workspace";
  const liveCount = 7;
  const issuesCount = healthRows.filter((r) => r.severity !== "healthy").length;

  const [page, setPage] = useState<Page>("overview");
  const [layout, setLayout] = useState<"stack" | "split">("split");

  const healthGroups: HealthGroup[] = ["AGENTS", "AOPS", "SCHEMA"];

  if (page === "health") {
    return (
      <FullList onBack={() => setPage("overview")} title="All workspace issues">
        {healthGroups.map((g) => {
          const rows = healthRows.filter((r) => r.group === g);
          if (rows.length === 0) return null;
          return (
            <div key={g}>
              <GroupLabel>{g}</GroupLabel>
              <div className="divide-y divide-border">
                {rows.map((r, i) => (
                  <HealthRowItem key={i} row={r} />
                ))}
              </div>
            </div>
          );
        })}
      </FullList>
    );
  }

  if (page === "work") {
    return (
      <FullList onBack={() => setPage("overview")} title="All recent activity">
        {(["RECENTLY CREATED", "RECENTLY EDITED"] as WorkGroup[]).map((g) => {
          const rows = workRows.filter((r) => r.group === g);
          if (rows.length === 0) return null;
          return (
            <div key={g}>
              <GroupLabel>{g}</GroupLabel>
              <div className="divide-y divide-border">
                {rows.map((r, i) => (
                  <WorkRowItem key={i} row={r} />
                ))}
              </div>
            </div>
          );
        })}
      </FullList>
    );
  }

  return (
    <PageContainer className="py-6">
      {/* Hero banner */}
      <img
        src={heroThumbnail}
        alt="AI agents that speak, act and solve"
        className="mb-5 max-h-[26vh] w-full rounded-2xl object-cover shadow-md"
      />

      {/* Start building */}
      <section id="start-building" className="scroll-mt-8">
        <div className="mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Start building your solution
            </h2>
          </div>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#8B1E48] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
            <span className="text-white">✦</span> Powered by Vitos AI Core
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SolutionCard
            onClick={() => onStartBuilding?.("conversational")}
            icon={MessageSquare}
            tile="bg-violet-500/10"
            iconColor="text-violet-600"
            gradient="bg-gradient-to-bl from-violet-500/5 via-transparent to-transparent"
            title="Conversation Agent"
            description="Build intelligent voice & chat agents that handle customer conversations end-to-end."
            ctaLabel="Get Started"
            preview={<ConversationPreview />}
          />
          <SolutionCard
            onClick={() => onStartBuilding?.("workflow")}
            icon={Cpu}
            tile="bg-sky-500/10"
            iconColor="text-sky-600"
            gradient="bg-gradient-to-bl from-sky-500/5 via-transparent to-transparent"
            title="Work Agent"
            description="Design & deploy automated workflows to streamline processes and boost team efficiency."
            ctaLabel="Get Started"
            preview={<WorkflowPreview />}
          />
          <SolutionCard
            onClick={() => onStartBuilding?.("copilot")}
            icon={Plug}
            tile="bg-emerald-500/10"
            iconColor="text-emerald-600"
            gradient="bg-gradient-to-bl from-emerald-500/5 via-transparent to-transparent"
            title="Copilot Agent"
            description="Expose any agent as a callable API. Plug AI capabilities into your existing systems without rebuilding them."
            ctaLabel="Get Started"
            titleBadge={{ label: "New", tone: "rose" }}
            preview={<HelperAgentPreview />}
          />
          <SolutionCard
            onClick={() => onStartBuilding?.("aop")}
            icon={Network}
            tile="bg-amber-400/15"
            iconColor="text-amber-600"
            gradient="bg-gradient-to-bl from-amber-400/10 via-transparent to-transparent"
            title="AOP (Orchestrator)"
            description="The conductor — doesn't execute work itself. Coordinates which agents run, in what order, on what trigger and with what data."
            ctaLabel="Start tour"
            badge={{ label: "Guided", tone: "rose" }}
            preview={<AopPreview />}
          />
        </div>
      </section>

      {/* Workspace stats */}
      <section className="mt-8 mb-3">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Pick up where you left off</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Recently created and edited agents & AOPs in{" "}
              <span className="font-medium text-foreground">{wsName}</span>
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11.5px] font-medium text-emerald-700">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>{liveCount} agents live</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          <StatCard
            icon={Bot}
            tile="bg-violet-500/10"
            iconColor="text-violet-600"
            value="12"
            label="Agents"
            meta={
              <span className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 7 live
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" /> 5 draft
                </span>
              </span>
            }
          />
          <StatCard
            icon={Shuffle}
            tile="bg-emerald-500/10"
            iconColor="text-emerald-600"
            value="5"
            label="AOPs"
            meta={
              <span className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 3 live
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" /> 2 draft
                </span>
              </span>
            }
          />
          <StatCard
            icon={Table2}
            tile="bg-sky-500/10"
            iconColor="text-sky-600"
            value="8"
            label="Schemas"
            meta="164 records"
          />
          <StatCard
            icon={BookOpen}
            tile="bg-amber-400/15"
            iconColor="text-amber-600"
            value="4"
            label="Knowledge bases"
            meta="23 sources"
          />
        </div>
      </section>

      {/* Recent activity table */}
      <section className="mb-6">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Recent agents & AOPs
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {workRows.filter((r) => r.type !== "Schema").length}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_120px_120px_28px] items-center gap-4 border-b border-border bg-muted/10 px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            <span>Name</span>
            <span>Type</span>
            <span>Status</span>
            <span aria-hidden />
          </div>
          <div className="divide-y divide-border">
            {workRows
              .filter((r) => r.type !== "Schema")
              .map((row, i) => {
                const Icon = row.icon;
                const s = workStatusStyles[row.status];
                return (
                  <button
                    key={i}
                    type="button"
                    className="group grid w-full grid-cols-[minmax(0,1fr)_120px_120px_28px] items-center gap-4 px-4 py-3 text-left transition hover:bg-hover"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${row.iconTile}`}
                      >
                        <Icon className={`h-4 w-4 ${row.iconColor}`} />
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-semibold text-foreground">
                            {row.title}
                          </span>
                          {row.isNew && (
                            <span className="shrink-0 inline-flex items-center rounded bg-[#5b1538] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                              New
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[11.5px] text-muted-foreground">{row.meta}</p>
                      </div>
                    </div>
                    <span className="inline-flex w-fit items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
                      {row.type}
                    </span>
                    <span
                      className={`inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium leading-none ${s.bg} ${s.text}`}
                    >
                      {s.label}
                    </span>
                    <span className="flex justify-end">
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  tile: string;
  iconColor: string;
  value: string;
  label: string;
  meta?: React.ReactNode;
}

function StatCard({ icon: Icon, tile, iconColor, value, label, meta }: StatCardProps) {
  return (
    <div className="group relative flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition hover:border-primary/40 hover:shadow-sm">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${tile}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[18px] font-semibold leading-none tracking-tight text-foreground tabular-nums">
            {value}
          </span>
          <span className="truncate text-[12px] font-medium text-muted-foreground">{label}</span>
        </div>
        {meta && <div className="mt-1 truncate text-[10.5px] text-muted-foreground/80">{meta}</div>}
      </div>
      <ArrowRight className="h-3 w-3 -rotate-45 text-muted-foreground/40 transition group-hover:text-foreground" />
    </div>
  );
}

function FullList({
  onBack,
  title,
  children,
}: {
  onBack: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PageContainer className="py-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 -ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-muted-foreground transition hover:bg-hover hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </button>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">{children}</div>
    </PageContainer>
  );
}

/* ---------- Solution card ---------- */

type BadgeTone = "muted" | "rose" | "violet";

const badgeToneStyles: Record<BadgeTone, string> = {
  muted: "bg-muted text-muted-foreground",
  rose: "bg-[#8B1E48] text-white shadow-sm",
  violet: "bg-violet-500/10 text-violet-700",
};

interface SolutionCardProps {
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  tile: string;
  iconColor: string;
  gradient?: string;
  title: string;
  description: string;
  ctaLabel: string;
  badge?: { label: string; tone: BadgeTone };
  titleBadge?: { label: string; tone: BadgeTone };
  preview: React.ReactNode;
}

export function SolutionCard({
  onClick,
  icon: Icon,
  tile,
  iconColor,
  gradient,
  title,
  description,
  ctaLabel,
  badge,
  titleBadge,
  preview,
}: SolutionCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card p-3.5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
    >
      {gradient && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 opacity-70 ${gradient}`}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_75%)]"
      />

      <div className="relative mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`flex h-7 w-7 items-center justify-center rounded-md ${tile}`}>
            <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
          </span>
          <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
        </div>
        {titleBadge && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeToneStyles[titleBadge.tone]}`}
          >
            <Sparkles className="h-2 w-2" />
            {titleBadge.label}
          </span>
        )}
      </div>

      <p className="relative mb-3 text-[11.5px] leading-snug text-muted-foreground">
        {description}
      </p>

      <div className="relative mb-3 mt-auto flex h-[88px] flex-col">{preview}</div>

      <div className="relative flex items-center justify-between border-t border-dotted border-border/60 pt-2.5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClick?.();
          }}
          className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#8B1E48] transition hover:gap-1.5"
        >
          {ctaLabel}
          <ArrowRight className="h-3 w-3" />
        </button>
        {badge && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${badgeToneStyles[badge.tone]}`}
          >
            <Sparkles className="h-2 w-2" />
            {badge.label}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- Card previews ---------- */

export function ConversationPreview() {
  const [mode, setMode] = useState<"voice" | "non-voice">("voice");
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMode("voice");
          }}
          className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium transition ${
            mode === "voice"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mic className="h-3 w-3" /> Voice
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMode("non-voice");
          }}
          className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium transition ${
            mode === "non-voice"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MicOff className="h-3 w-3" /> Non-Voice
        </button>
      </div>
      {mode === "voice" ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E5396B] text-white">
            <Mic className="h-3 w-3" />
          </span>
          <div className="flex flex-1 items-center gap-[2px]">
            {[6, 12, 8, 16, 10, 18, 7, 14, 9, 20, 11, 15, 8, 13, 6, 10].map((h, i) => (
              <span
                key={i}
                className="w-[2px] rounded-full bg-gradient-to-t from-[#8B1E48] to-[#E5396B] animate-wave-bar"
                style={{
                  height: `${h}px`,
                  animationDelay: `${(i % 8) * 90}ms`,
                  animationDuration: `${800 + (i % 5) * 120}ms`,
                }}
              />
            ))}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#E5396B]">
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E5396B] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E5396B]" />
            </span>
            LIVE
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
          <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground">
            Refund my invoice
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#E5396B] px-2 py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 w-1 rounded-full bg-white animate-wave-bar"
                style={{ animationDelay: `${i * 160}ms`, animationDuration: "900ms" }}
              />
            ))}
          </span>
        </div>
      )}
    </div>
  );
}

export function WorkflowPreview() {
  const Node = ({ color, label }: { color: string; label: string }) => (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground shadow-sm">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} /> {label}
    </span>
  );
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-border bg-violet-500/[0.04] px-3 py-5">
      <div className="flex items-center gap-2 px-[8px]">
        <Node color="bg-rose-500" label="Start" />
        <span className="relative h-px w-8 overflow-hidden bg-border animate-flow-line" />
        <Node color="bg-violet-500" label="Decide" />
        <span className="relative h-px w-8 overflow-hidden bg-border animate-flow-line" />
        <Node color="bg-emerald-500" label="Act" />
      </div>
    </div>
  );
}

export function ApiPreview() {
  return (
    <div className="overflow-hidden rounded-lg bg-[#0f1115] font-mono text-[11px]">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-2.5 py-1.5">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-white/60">
          POST /v1/run
        </span>
      </div>
      <div className="space-y-1 px-2.5 py-2 text-white/90">
        <div>
          <span className="text-emerald-400">$ curl</span> https://api.vitos.ai \
        </div>
        <div>
          <span className="text-emerald-400">-d</span>{" "}
          <span className="text-amber-300">{`{ agent: 'billing' }`}</span>
        </div>
      </div>
    </div>
  );
}

export function HelperAgentPreview() {
  const Endpoint = ({
    method,
    path,
    tone,
  }: {
    method: string;
    path: string;
    tone: "get" | "post";
  }) => (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-1.5 py-1 shadow-sm">
      <span
        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${
          tone === "get" ? "bg-emerald-500/15 text-emerald-700" : "bg-sky-500/15 text-sky-700"
        }`}
      >
        {method}
      </span>
      <span className="font-mono text-[10.5px] text-foreground">{path}</span>
    </div>
  );
  return (
    <div className="flex h-full flex-col justify-center gap-1.5 rounded-lg border border-border bg-emerald-500/[0.06] px-2.5 py-2">
      <Endpoint method="GET" path="/agent/classify" tone="get" />
      <Endpoint method="POST" path="/agent/summarise" tone="post" />
    </div>
  );
}

function AopPreview() {
  const Pill = ({ color, label }: { color: string; label: string }) => (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} /> {label}
    </span>
  );
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Pill color="bg-amber-500" label="Billing" />
      <Pill color="bg-yellow-500" label="Support" />
      <Pill color="bg-amber-400" label="Sales" />
      <span className="inline-flex items-center rounded-full border border-dashed border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">
        +14
      </span>
    </div>
  );
}
