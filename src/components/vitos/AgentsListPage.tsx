import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Upload,
  Plus,
  Trash2,
  MessageCircle,
  Cpu,
  Plug,
  Network,
  Pencil,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Rows2,
  Rows4,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Phone,
  Download,
  Wand2,
  MoreHorizontal,
} from "lucide-react";
import { SolutionCard, ConversationPreview, WorkflowPreview, ApiPreview } from "./HomeOverview";
import { PageContainer } from "./PageContainer";

export type AgentTypeKey = "conversation" | "workflow" | "api" | "multi";
export type AgentStatus = "in_build" | "active" | "paused";
export type ConversationSubType = "voice" | "text";

export interface Agent {
  id: string;
  name: string;
  type: AgentTypeKey;
  lastModified: string;
  lastModifiedAt: string;
  status: AgentStatus;
  subType?: ConversationSubType;
}

interface Props {
  scope: "all" | AgentTypeKey;
  onCreateAgent?: (key: AgentTypeKey | "copilot") => void;
  initialCreateOpen?: boolean;
  initialAgents?: Agent[];
  createdNotice?: string | null;
  onDismissNotice?: () => void;
}

/* ---------- Meta ---------- */

const TYPE_META: Record<
  AgentTypeKey,
  { label: string; bg: string; text: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  conversation: { label: "Conversation", bg: "#FBEAF0", text: "#993556", Icon: MessageCircle },
  workflow: { label: "Work agent", bg: "#E6F1FB", text: "#185FA5", Icon: Cpu },
  api: { label: "Agent as API", bg: "#EAF3DE", text: "#3B6D11", Icon: Plug },
  multi: { label: "Multi-agent", bg: "#EEEDFE", text: "#534AB7", Icon: Network },
};

const STATUS_META: Record<AgentStatus, { label: string; dot: string; bg: string; text: string }> = {
  in_build: { label: "In build", dot: "#E9A400", bg: "#FFF8E1", text: "#8C5A00" },
  active: { label: "Active", dot: "#3B8F3B", bg: "#EAF3DE", text: "#3B6D11" },
  paused: { label: "Paused", dot: "#8A8A8A", bg: "#F1EFE8", text: "#5F5E5A" },
};

const SUBTYPE_META: Record<
  ConversationSubType,
  { label: string; short: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  voice: { label: "Voice agent", short: "Voice", Icon: Phone },
  text: { label: "Non-voice agent", short: "Text", Icon: MessageSquare },
};

/* ---------- Mock data ---------- */

export const ALL_AGENTS: Agent[] = [
  {
    id: "1",
    name: "sibi_local_testing",
    type: "conversation",
    subType: "voice",
    lastModified: "11 hours ago",
    lastModifiedAt: "2026-07-14 03:12",
    status: "in_build",
  },
  {
    id: "2",
    name: "arun_local_test",
    type: "conversation",
    subType: "text",
    lastModified: "7 days ago",
    lastModifiedAt: "2026-07-07 14:05",
    status: "in_build",
  },
  {
    id: "4",
    name: "test_keys",
    type: "api",
    lastModified: "4 days ago",
    lastModifiedAt: "2026-07-10 09:44",
    status: "paused",
  },
  {
    id: "5",
    name: "gpt_model_testing",
    type: "workflow",
    lastModified: "5 days ago",
    lastModifiedAt: "2026-07-09 18:21",
    status: "in_build",
  },
  {
    id: "6",
    name: "gppt",
    type: "workflow",
    lastModified: "7 days ago",
    lastModifiedAt: "2026-07-07 11:37",
    status: "active",
  },
  {
    id: "7",
    name: "refund_resolver",
    type: "workflow",
    lastModified: "2 days ago",
    lastModifiedAt: "2026-07-12 16:02",
    status: "active",
  },
  {
    id: "8",
    name: "lead_qualifier",
    type: "conversation",
    subType: "voice",
    lastModified: "3 days ago",
    lastModifiedAt: "2026-07-11 08:15",
    status: "active",
  },
  {
    id: "9",
    name: "crm_sync_api",
    type: "api",
    lastModified: "6 days ago",
    lastModifiedAt: "2026-07-08 12:48",
    status: "active",
  },
  {
    id: "10",
    name: "inbound_support_line",
    type: "conversation",
    subType: "voice",
    lastModified: "1 day ago",
    lastModifiedAt: "2026-07-13 22:10",
    status: "active",
  },
  {
    id: "11",
    name: "appointment_reminder_calls",
    type: "conversation",
    subType: "voice",
    lastModified: "4 hours ago",
    lastModifiedAt: "2026-07-14 10:02",
    status: "active",
  },
  {
    id: "12",
    name: "whatsapp_order_bot",
    type: "conversation",
    subType: "text",
    lastModified: "2 days ago",
    lastModifiedAt: "2026-07-12 19:33",
    status: "active",
  },
  {
    id: "13",
    name: "email_triage_assistant",
    type: "conversation",
    subType: "text",
    lastModified: "6 days ago",
    lastModifiedAt: "2026-07-08 07:29",
    status: "paused",
  },
  {
    id: "14",
    name: "web_chat_concierge",
    type: "conversation",
    subType: "text",
    lastModified: "9 hours ago",
    lastModifiedAt: "2026-07-14 05:11",
    status: "in_build",
  },
];

const SCOPE_TITLES: Record<Props["scope"], string> = {
  all: "All agents",
  conversation: "Conversation agents",
  workflow: "Work agents",
  api: "Agent as API",
  multi: "Multi-agent workflows (AOP)",
};

const EMPTY_STATES: Record<AgentTypeKey, { headline: string; cta: string }> = {
  conversation: {
    headline: "Handle customer queries automatically, 24/7",
    cta: "Create conversation agent",
  },
  workflow: {
    headline: "Automate background tasks without human intervention",
    cta: "Create work agent",
  },
  api: { headline: "Plug your agent into any system via API", cta: "Create agent as API" },
  multi: {
    headline: "Coordinate multiple agents into one seamless journey",
    cta: "Create multi-agent workflow",
  },
};

type SortKey = "name" | "type" | "modified" | "status";
type SortDir = "asc" | "desc";
type Density = "comfortable" | "compact";

const TYPE_OPTIONS: AgentTypeKey[] = ["conversation", "workflow", "api"];
const STATUS_OPTIONS: AgentStatus[] = ["active", "in_build", "paused"];

export function AgentsListPage({
  scope,
  onCreateAgent,
  initialCreateOpen = false,
  initialAgents = ALL_AGENTS,
  createdNotice,
  onDismissNotice,
}: Props) {
  const [query, setQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [trashed, setTrashed] = useState<Array<Agent & { deletedAt: string }>>([
    {
      id: "t1",
      name: "Test Bhupendra multi voice bot",
      type: "conversation",
      subType: "voice",
      lastModified: "2 months ago",
      lastModifiedAt: "2026-05-14 10:00",
      status: "paused",
      deletedAt: "2 months ago",
    },
    {
      id: "t2",
      name: "arun_local_test",
      type: "conversation",
      subType: "text",
      lastModified: "2 months ago",
      lastModifiedAt: "2026-05-16 12:00",
      status: "paused",
      deletedAt: "2 months ago",
    },
    {
      id: "t3",
      name: "arun_test_v2",
      type: "workflow",
      lastModified: "1 month ago",
      lastModifiedAt: "2026-06-10 09:00",
      status: "paused",
      deletedAt: "1 month ago",
    },
    {
      id: "t4",
      name: "Test for MCP",
      type: "api",
      lastModified: "1 month ago",
      lastModifiedAt: "2026-06-12 11:00",
      status: "paused",
      deletedAt: "1 month ago",
    },
    {
      id: "t5",
      name: "Test for MCP 2",
      type: "api",
      lastModified: "1 month ago",
      lastModifiedAt: "2026-06-13 11:00",
      status: "paused",
      deletedAt: "1 month ago",
    },
    {
      id: "t6",
      name: "arnav_bot_new",
      type: "conversation",
      subType: "voice",
      lastModified: "1 month ago",
      lastModifiedAt: "2026-06-15 08:00",
      status: "paused",
      deletedAt: "1 month ago",
    },
    {
      id: "t7",
      name: "Shital's_Bot",
      type: "workflow",
      lastModified: "1 month ago",
      lastModifiedAt: "2026-06-17 14:00",
      status: "paused",
      deletedAt: "1 month ago",
    },
    {
      id: "t8",
      name: "energy test 321",
      type: "conversation",
      subType: "text",
      lastModified: "1 month ago",
      lastModifiedAt: "2026-06-19 09:00",
      status: "paused",
      deletedAt: "1 month ago",
    },
    {
      id: "t9",
      name: "test_kbb",
      type: "workflow",
      lastModified: "1 month ago",
      lastModifiedAt: "2026-06-20 10:00",
      status: "paused",
      deletedAt: "1 month ago",
    },
  ]);
  const [trashOpen, setTrashOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [typeFilters, setTypeFilters] = useState<Set<AgentTypeKey>>(new Set());
  const [statusFilters, setStatusFilters] = useState<Set<AgentStatus>>(new Set());
  // Density fixed to compact
  const [sortKey, setSortKey] = useState<SortKey>("modified");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [createOpen, setCreateOpen] = useState(initialCreateOpen);
  const [openPanel, setOpenPanel] = useState<"type" | "status" | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[] } | null>(null);
  const [rowMenuId, setRowMenuId] = useState<string | null>(null);

  const scopedAgents = useMemo(
    () => (scope === "all" ? agents : agents.filter((a) => a.type === scope)),
    [agents, scope],
  );

  const filtered = useMemo(() => {
    let list = scopedAgents;
    if (query) list = list.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
    if (typeFilters.size > 0) list = list.filter((a) => typeFilters.has(a.type));
    if (statusFilters.size > 0) list = list.filter((a) => statusFilters.has(a.status));
    const dirMul = sortDir === "asc" ? 1 : -1;
    const sorted = [...list].sort((a, b) => {
      let av: string, bv: string;
      switch (sortKey) {
        case "name":
          av = a.name;
          bv = b.name;
          break;
        case "type":
          av = TYPE_META[a.type].label;
          bv = TYPE_META[b.type].label;
          break;
        case "status":
          av = STATUS_META[a.status].label;
          bv = STATUS_META[b.status].label;
          break;
        case "modified":
        default:
          av = a.lastModifiedAt;
          bv = b.lastModifiedAt;
          break;
      }
      return av < bv ? -1 * dirMul : av > bv ? 1 * dirMul : 0;
    });
    return sorted;
  }, [scopedAgents, query, typeFilters, statusFilters, sortKey, sortDir]);

  const totalUnfiltered = scopedAgents.length;
  const showType = scope === "all";
  const isEmpty = scopedAgents.length === 0 && !query;
  const hasFilters = typeFilters.size + statusFilters.size > 0;

  const typeCounts = useMemo(() => {
    const c: Record<AgentTypeKey, number> = { conversation: 0, workflow: 0, api: 0, multi: 0 };
    scopedAgents.forEach((a) => {
      c[a.type]++;
    });
    return c;
  }, [scopedAgents]);
  const statusCounts = useMemo(() => {
    const c: Record<AgentStatus, number> = { active: 0, in_build: 0, paused: 0 };
    scopedAgents.forEach((a) => {
      c[a.status]++;
    });
    return c;
  }, [scopedAgents]);

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const allSelected = filtered.length > 0 && filtered.every((a) => selected.has(a.id));
  const someSelected = filtered.some((a) => selected.has(a.id)) && !allSelected;
  const toggleAll = () => {
    if (allSelected) {
      setSelected((s) => {
        const n = new Set(s);
        filtered.forEach((a) => n.delete(a.id));
        return n;
      });
    } else {
      setSelected((s) => {
        const n = new Set(s);
        filtered.forEach((a) => n.add(a.id));
        return n;
      });
    }
  };

  const onSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const clearFilters = () => {
    setTypeFilters(new Set());
    setStatusFilters(new Set());
  };

  const bulkPause = () => {
    setAgents((prev) =>
      prev.map((a) => (selected.has(a.id) ? { ...a, status: "paused" as AgentStatus } : a)),
    );
    setSelected(new Set());
  };
  const doDelete = (ids: string[]) => {
    setAgents((prev) => {
      const removed = prev.filter((a) => ids.includes(a.id));
      setTrashed((t) => [...removed.map((a) => ({ ...a, deletedAt: "just now" })), ...t]);
      return prev.filter((a) => !ids.includes(a.id));
    });
    setSelected((s) => {
      const n = new Set(s);
      ids.forEach((id) => n.delete(id));
      return n;
    });
    setConfirmDelete(null);
  };
  const togglePauseSingle = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "paused" ? "active" : ("paused" as AgentStatus) }
          : a,
      ),
    );
  };

  const cloneAgent = (id: string) => {
    setAgents((prev) => {
      const src = prev.find((a) => a.id === id);
      if (!src) return prev;
      const copy: Agent = {
        ...src,
        id: `${id}-copy-${Date.now()}`,
        name: `${src.name} (copy)`,
        lastModified: "just now",
        lastModifiedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        status: "in_build",
      };
      const idx = prev.findIndex((a) => a.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };
  const exportAgent = (id: string) => {
    const agent = agents.find((a) => a.id === id);
    if (!agent) return;
    const blob = new Blob([JSON.stringify(agent, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agent.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const restoreAgent = (id: string) => {
    setTrashed((prev) => {
      const item = prev.find((a) => a.id === id);
      if (item) {
        const { deletedAt, ...rest } = item;
        setAgents((a) => [
          { ...rest, status: "paused" as AgentStatus, lastModified: "just now" },
          ...a,
        ]);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  return (
    <div className="relative h-full w-full">
      <PageContainer>
        {createdNotice && (
          <div
            role="status"
            className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 shadow-sm"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-4 w-4 text-emerald-700" aria-hidden />
            </span>
            <p className="min-w-0 flex-1 text-[13px] font-medium">{createdNotice}</p>
            <button
              type="button"
              onClick={onDismissNotice}
              aria-label="Dismiss creation message"
              className="rounded-md p-1 text-emerald-700 transition hover:bg-emerald-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {SCOPE_TITLES[scope]}
            </h1>
            <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
              Manage every agent in this workspace — conversations, background workflows and API
              endpoints — from one place. Filter, edit and monitor status without switching context.
            </p>
          </div>
        </div>

        {isEmpty && scope !== "all" ? (
          <EmptyState scope={scope as AgentTypeKey} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-3">
              {/* Search */}
              <div
                className={`flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 transition-all duration-150 ${
                  searchFocused ? "w-[320px] bg-card" : "w-[260px] bg-muted/30"
                }`}
              >
                <Search className="h-[15px] w-[15px] shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search agents..."
                  className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <div className="mx-1 h-[22px] w-px bg-border" />

              {/* Type filter (only when scope=all) */}
              {showType && (
                <FilterDropdown
                  label="Type"
                  open={openPanel === "type"}
                  setOpen={(o) => setOpenPanel(o ? "type" : null)}
                  count={typeFilters.size}
                >
                  {TYPE_OPTIONS.map((t) => {
                    const checked = typeFilters.has(t);
                    return (
                      <ChecklistRow
                        key={t}
                        checked={checked}
                        onToggle={() => {
                          const n = new Set(typeFilters);
                          if (checked) n.delete(t);
                          else n.add(t);
                          setTypeFilters(n);
                        }}
                        label={TYPE_META[t].label}
                        rightCount={typeCounts[t]}
                      />
                    );
                  })}
                </FilterDropdown>
              )}

              {/* Status filter */}
              <FilterDropdown
                label="Status"
                open={openPanel === "status"}
                setOpen={(o) => setOpenPanel(o ? "status" : null)}
                count={statusFilters.size}
              >
                {STATUS_OPTIONS.map((s) => {
                  const checked = statusFilters.has(s);
                  return (
                    <ChecklistRow
                      key={s}
                      checked={checked}
                      onToggle={() => {
                        const n = new Set(statusFilters);
                        if (checked) n.delete(s);
                        else n.add(s);
                        setStatusFilters(n);
                      }}
                      label={STATUS_META[s].label}
                      dotColor={STATUS_META[s].dot}
                      rightCount={statusCounts[s]}
                    />
                  );
                })}
              </FilterDropdown>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[12.5px] font-medium text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}

              <div className="flex-1" />

              {/* Import + Create — moved inside the table container */}
              <button
                type="button"
                onClick={() => setTrashOpen(true)}
                aria-label="Trash"
                title="Trash"
                className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] text-foreground transition hover:bg-hover">
                <Upload className="h-3.5 w-3.5" /> Import bot
              </button>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> Create new
              </button>
            </div>

            {/* Chip row */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-4 py-2">
                {[...typeFilters].map((t) => (
                  <FilterChip
                    key={`t-${t}`}
                    label={TYPE_META[t].label}
                    onRemove={() => {
                      const n = new Set(typeFilters);
                      n.delete(t);
                      setTypeFilters(n);
                    }}
                  />
                ))}
                {[...statusFilters].map((s) => (
                  <FilterChip
                    key={`s-${s}`}
                    label={STATUS_META[s].label}
                    onRemove={() => {
                      const n = new Set(statusFilters);
                      n.delete(s);
                      setStatusFilters(n);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Table header */}
            <div
              className={`grid items-center gap-4 border-y border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${
                showType
                  ? "grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_160px_140px_140px]"
                  : "grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_160px_140px_140px]"
              }`}
            >
              <SortHeader
                label="Name"
                active={sortKey === "name"}
                dir={sortDir}
                onClick={() => onSort("name")}
              />
              <SortHeader
                label="Type"
                active={sortKey === "type"}
                dir={sortDir}
                onClick={() => onSort("type")}
              />
              <SortHeader
                label="Last modified"
                active={sortKey === "modified"}
                dir={sortDir}
                onClick={() => onSort("modified")}
              />
              <SortHeader
                label="Status"
                active={sortKey === "status"}
                dir={sortDir}
                onClick={() => onSort("status")}
              />
              <span className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Action
              </span>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="px-4 py-16 text-center text-sm text-muted-foreground">
                No results{query ? ` for "${query}"` : ""}
              </div>
            ) : (
              filtered.map((agent) => {
                const meta = TYPE_META[agent.type];
                const status = STATUS_META[agent.status];
                const Icon = meta.Icon;
                const rowPad = "py-1.5";
                const iconSize = "h-6 w-6";
                return (
                  <div
                    key={agent.id}
                    className={`group grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_160px_140px_140px] items-center gap-4 border-b border-border/60 px-4 transition last:border-b-0 hover:bg-hover ${rowPad}`}
                  >
                    {/* Name */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex ${iconSize} shrink-0 items-center justify-center rounded-md`}
                        style={{ backgroundColor: meta.bg, color: meta.text }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate text-[13.5px] font-medium text-foreground">
                        {agent.name}
                      </span>
                    </div>

                    {/* Type */}
                    <div className="min-w-0">
                      <span
                        className="inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-medium"
                        style={{ backgroundColor: meta.bg, color: meta.text }}
                      >
                        <Icon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{meta.label}</span>
                        {agent.type === "conversation" && agent.subType && (
                          <SubTypeInline subType={agent.subType} />
                        )}
                      </span>
                    </div>

                    {/* Last modified */}
                    <div className="min-w-0">
                      <div className="truncate text-[13px] text-foreground">
                        {agent.lastModified}
                      </div>
                      <div className="truncate font-mono text-[10.5px] text-muted-foreground">
                        {agent.lastModifiedAt}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium"
                        style={{ backgroundColor: status.bg, color: status.text }}
                      >
                        <span className="relative flex h-1.5 w-1.5">
                          {agent.status === "in_build" && (
                            <span
                              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                              style={{ backgroundColor: status.dot }}
                            />
                          )}
                          <span
                            className="relative inline-flex h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: status.dot }}
                          />
                        </span>
                        {status.label}
                      </span>
                    </div>

                    {/* Row actions */}
                    <div className="flex items-center justify-end gap-1.5">
                      <ActionIconBtn label="Clone" onClick={() => cloneAgent(agent.id)}>
                        <Copy className="h-3.5 w-3.5" />
                      </ActionIconBtn>
                      <ActionIconBtn label="Export" onClick={() => exportAgent(agent.id)}>
                        <Download className="h-3.5 w-3.5" />
                      </ActionIconBtn>
                      <ActionIconBtn
                        label="Delete"
                        destructive
                        onClick={() => setConfirmDelete({ ids: [agent.id] })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </ActionIconBtn>
                    </div>
                  </div>
                );
              })
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2.5 text-[12px] text-muted-foreground">
              <span>
                Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
                <span className="font-medium text-foreground">{totalUnfiltered}</span> agents
              </span>
              <Pagination />
            </div>
          </div>
        )}
      </PageContainer>

      <CreateAgentPanel
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSelect={(key) => {
          setCreateOpen(false);
          onCreateAgent?.(key);
        }}
      />

      {confirmDelete && (
        <ConfirmDeleteDialog
          count={confirmDelete.ids.length}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => doDelete(confirmDelete.ids)}
        />
      )}

      {trashOpen && (
        <TrashDialog items={trashed} onClose={() => setTrashOpen(false)} onRestore={restoreAgent} />
      )}
    </div>
  );
}

/* ---------- Toolbar helpers ---------- */

function FilterDropdown({
  label,
  count,
  open,
  setOpen,
  children,
}: {
  label: string;
  count: number;
  open: boolean;
  setOpen: (o: boolean) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, setOpen]);

  const active = count > 0;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[13px] font-medium transition ${
          active
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-background text-foreground hover:bg-hover"
        }`}
      >
        {label}
        {active && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold text-primary-foreground">
            {count}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-60 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
}

function ChecklistRow({
  checked,
  onToggle,
  label,
  dotColor,
  rightCount,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  dotColor?: string;
  rightCount: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-foreground transition hover:bg-hover"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
        }`}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      {dotColor && (
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} />
      )}
      <span className="flex-1 truncate">{label}</span>
      <span className="font-mono text-[11px] text-muted-foreground">{rightCount}</span>
    </button>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 pl-2.5 pr-1 py-0.5 text-[12px] font-medium text-primary">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="flex h-4 w-4 items-center justify-center rounded-full transition hover:bg-primary/20"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  const Arrow = dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      <Arrow className={`h-3 w-3 ${active ? "opacity-100" : "opacity-[0.35]"}`} />
    </button>
  );
}

function TriCheckbox({
  checked,
  indeterminate,
  onChange,
  ...rest
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
} & React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={onChange}
      className={`flex h-4 w-4 items-center justify-center rounded border transition ${
        checked || indeterminate
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:border-foreground/40"
      }`}
      {...rest}
    >
      {indeterminate ? (
        <span className="block h-[2px] w-2 rounded-full bg-primary-foreground" />
      ) : checked ? (
        <Check className="h-3 w-3" strokeWidth={3} />
      ) : null}
    </button>
  );
}

function SubTypeInline({ subType }: { subType: ConversationSubType }) {
  const meta = SUBTYPE_META[subType];
  const Icon = meta.Icon;
  return (
    <span
      className="ml-0.5 inline-flex items-center gap-0.5 border-l border-current/20 pl-1 opacity-80"
      title={meta.label}
    >
      <Icon className="h-2.5 w-2.5" />
    </span>
  );
}

function RowAction({
  children,
  label,
  destructive,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  destructive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={`flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover ${
        destructive ? "hover:text-destructive" : "hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function RowActionsMenu({
  open,
  setOpen,
  isPaused,
  onTogglePause,
  onDelete,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, setOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Row actions"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={`flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover hover:text-foreground ${
          open ? "bg-hover text-foreground" : ""
        }`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg">
          <MenuItem
            icon={<Trash2 className="h-3.5 w-3.5" />}
            label="Delete"
            destructive
            onClick={onDelete}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] transition hover:bg-hover ${
        destructive ? "text-rose-600 hover:bg-rose-50" : "text-foreground"
      }`}
    >
      <span className={destructive ? "text-rose-500" : "text-muted-foreground"}>{icon}</span>
      {label}
    </button>
  );
}

function Pagination() {
  const [page, setPage] = useState(1);
  const total = 12;
  const pages = [1, 2, 3];
  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-2 text-muted-foreground">
        Page {page} of {total}
      </span>
      <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous">
        <ChevronLeft className="h-4 w-4" />
      </PageBtn>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`h-8 min-w-8 rounded-md px-2 text-sm font-medium transition ${
            page === p
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground hover:bg-hover"
          }`}
        >
          {p}
        </button>
      ))}
      <span className="px-1 text-muted-foreground">…</span>
      <button
        onClick={() => setPage(total)}
        className="h-8 min-w-8 rounded-md border border-border bg-card px-2 text-sm font-medium text-foreground hover:bg-hover"
      >
        {total}
      </button>
      <PageBtn onClick={() => setPage((p) => Math.min(total, p + 1))} aria-label="Next">
        <ChevronRight className="h-4 w-4" />
      </PageBtn>
    </div>
  );
}

function PageBtn({ children, onClick, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      {...rest}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:bg-hover hover:text-foreground"
    >
      {children}
    </button>
  );
}

function ConfirmDeleteDialog({
  count,
  onCancel,
  onConfirm,
}: {
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-up">
        <div className="flex items-start gap-3 px-5 pt-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">
              Delete {count} agent{count > 1 ? "s" : ""}?
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              This can't be undone. Connected live channels and integrations will stop receiving
              traffic immediately.
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-[13px] font-medium text-foreground transition hover:bg-hover"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-destructive px-3 py-1.5 text-[13px] font-semibold text-destructive-foreground transition hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateAgentPanel({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (key: AgentTypeKey | "copilot") => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className={`absolute inset-0 z-30 bg-foreground/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`absolute inset-0 z-40 flex items-center justify-center p-4 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-[1080px] max-h-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 ${
            open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.98]"
          }`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent px-6 pt-4 pb-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 hidden h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary sm:inline-flex">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  New agent
                </div>
                <h3 className="text-[16px] font-semibold tracking-tight text-foreground">
                  Which type of agent are we building today?
                </h3>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                  Choose a template to start with — you'll name and configure it in the next step.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <SolutionCard
              onClick={() => onSelect("conversation")}
              icon={MessageSquare}
              tile="bg-violet-500/10"
              iconColor="text-violet-600"
              gradient="bg-gradient-to-bl from-violet-500/5 via-transparent to-transparent"
              title="Conversation Agent"
              description="Build intelligent voice & chat agents that handle customer conversations end-to-end."
              ctaLabel="Get Started"
              titleBadge={{ label: "Most popular", tone: "rose" }}
              preview={<ConversationPreview />}
            />
            <SolutionCard
              onClick={() => onSelect("workflow")}
              icon={Cpu}
              tile="bg-sky-500/10"
              iconColor="text-sky-600"
              gradient="bg-gradient-to-bl from-sky-500/5 via-transparent to-transparent"
              title="Workflow Agent"
              description="Design & deploy automated workflows to streamline processes and boost team efficiency."
              ctaLabel="Get Started"
              preview={<WorkflowPreview />}
            />
            <SolutionCard
              onClick={() => onSelect("copilot")}
              icon={Wand2}
              tile="bg-amber-500/10"
              iconColor="text-amber-600"
              gradient="bg-gradient-to-bl from-amber-500/5 via-transparent to-transparent"
              title="Copilot Agent"
              description="Assist your teammates in real time — suggest replies, summarise threads and surface next-best actions."
              ctaLabel="Get Started"
              preview={<CopilotPreview />}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/30 px-6 py-2.5">
            <p className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Not sure which one? Start with{" "}
              <span className="font-medium text-foreground">Conversational</span> — it's the fastest
              way to see results.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-[12px] font-medium text-muted-foreground transition hover:bg-hover hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function CopilotPreview() {
  return (
    <div className="relative flex h-full w-full flex-col justify-center gap-1.5 overflow-hidden rounded-md border border-border/60 bg-gradient-to-br from-amber-50/70 to-white p-2">
      <div className="flex items-center gap-1.5">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
          <Wand2 className="h-2.5 w-2.5" />
        </span>
        <span className="text-[9.5px] font-semibold uppercase tracking-wider text-amber-700">
          Suggested reply
        </span>
      </div>
      <div className="rounded-md border border-amber-200/70 bg-white/80 px-1.5 py-1 text-[10px] leading-snug text-foreground shadow-sm">
        "Thanks for reaching out — I've flagged your order for a refund and you'll see it back in
        3–5 days."
      </div>
      <div className="flex items-center gap-1">
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-[1px] text-[9px] font-medium text-emerald-700">
          Insert
        </span>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-500/10 px-1.5 py-[1px] text-[9px] font-medium text-slate-700">
          Rewrite
        </span>
      </div>
    </div>
  );
}

function EmptyState({ scope }: { scope: AgentTypeKey }) {
  const meta = TYPE_META[scope];
  const empty = EMPTY_STATES[scope];
  const Icon = meta.Icon;
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: meta.bg, color: meta.text }}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-foreground">{empty.headline}</h2>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
        You haven't created any {meta.label.toLowerCase()} agents yet. Get started in a couple of
        clicks.
      </p>
      <button
        type="button"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        {empty.cta}
      </button>
    </div>
  );
}

function RowMoreMenu({
  open,
  setOpen,
  onClone,
  onExport,
  onDelete,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  onClone: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, setOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Row actions"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={`flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover hover:text-foreground ${
          open ? "bg-hover text-foreground" : ""
        }`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg">
          <MenuItem icon={<Copy className="h-3.5 w-3.5" />} label="Clone" onClick={onClone} />
          <MenuItem icon={<Download className="h-3.5 w-3.5" />} label="Export" onClick={onExport} />
          <MenuItem
            icon={<Trash2 className="h-3.5 w-3.5" />}
            label="Delete"
            destructive
            onClick={onDelete}
          />
        </div>
      )}
    </div>
  );
}

function TrashDialog({
  items,
  onClose,
  onRestore,
}: {
  items: Array<Agent & { deletedAt: string }>;
  onClose: () => void;
  onRestore: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const filtered = items.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[720px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-up">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-[16px] font-semibold text-foreground">AI Agent Trash</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 w-[280px]">
            <Search className="h-[15px] w-[15px] text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-[13px] focus:outline-none"
            />
          </div>
        </div>
        <div className="max-h-[480px] overflow-y-auto">
          <div className="grid grid-cols-[minmax(0,1fr)_160px_120px] items-center gap-4 border-y border-border bg-muted/30 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Name</span>
            <span>Created at</span>
            <span />
          </div>
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Trash is empty
            </div>
          ) : (
            filtered.map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-[minmax(0,1fr)_160px_120px] items-center gap-4 border-b border-border/60 px-5 py-3 last:border-b-0"
              >
                <span className="truncate text-[13.5px] font-medium text-foreground">{a.name}</span>
                <span className="text-[13px] text-muted-foreground">{a.deletedAt}</span>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onRestore(a.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-background px-3 py-1.5 text-[12.5px] font-medium text-primary transition hover:bg-primary/10"
                  >
                    <Upload className="h-3.5 w-3.5" /> Restore
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ActionIconBtn({
  children,
  label,
  destructive,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition ${
        destructive
          ? "hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          : "hover:bg-hover hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
