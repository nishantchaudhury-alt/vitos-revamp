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
import { cn } from "@/lib/utils";
import vitosLogo from "@/assets/vitos-logo.png";
import bgRight from "@/assets/vitos-bg-right.png";

export type AgentTypeKey = "conversation" | "workflow" | "api" | "multi";
export type AgentStatus = "in_build" | "active" | "paused";
export type ConversationSubType = "voice" | "text";
export type VoiceMode = "single" | "multi";

export interface Agent {
  id: string;
  name: string;
  type: AgentTypeKey;
  lastModified: string;
  lastModifiedAt: string;
  status: AgentStatus;
  subType?: ConversationSubType;
  voiceMode?: VoiceMode;
}

interface Props {
  scope: "all" | AgentTypeKey;
  onCreateAgent?: (key: AgentTypeKey | "copilot") => void;
  onOpenAgent?: (agent: Agent) => void;
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
  conversation: { label: "Conversation", bg: "#EEEDFE", text: "#534AB7", Icon: MessageCircle },
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
    voiceMode: "single",
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
    status: "in_build",
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
    status: "in_build",
  },
  {
    id: "7",
    name: "refund_resolver",
    type: "workflow",
    lastModified: "2 days ago",
    lastModifiedAt: "2026-07-12 16:02",
    status: "in_build",
  },
  {
    id: "8",
    name: "lead_qualifier",
    type: "conversation",
    subType: "voice",
    voiceMode: "multi",
    lastModified: "3 days ago",
    lastModifiedAt: "2026-07-11 08:15",
    status: "in_build",
  },
  {
    id: "9",
    name: "crm_sync_api",
    type: "api",
    lastModified: "6 days ago",
    lastModifiedAt: "2026-07-08 12:48",
    status: "in_build",
  },
  {
    id: "10",
    name: "inbound_support_line",
    type: "conversation",
    subType: "voice",
    voiceMode: "single",
    lastModified: "1 day ago",
    lastModifiedAt: "2026-07-13 22:10",
    status: "in_build",
  },
  {
    id: "11",
    name: "appointment_reminder_calls",
    type: "conversation",
    subType: "voice",
    voiceMode: "multi",
    lastModified: "4 hours ago",
    lastModifiedAt: "2026-07-14 10:02",
    status: "in_build",
  },
  {
    id: "12",
    name: "whatsapp_order_bot",
    type: "conversation",
    subType: "text",
    lastModified: "2 days ago",
    lastModifiedAt: "2026-07-12 19:33",
    status: "in_build",
  },
  {
    id: "13",
    name: "email_triage_assistant",
    type: "conversation",
    subType: "text",
    lastModified: "6 days ago",
    lastModifiedAt: "2026-07-08 07:29",
    status: "in_build",
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

type SortKey = "name" | "type" | "channel" | "modified" | "status";
type SortDir = "asc" | "desc";
type ConversationFilter = ConversationSubType;

const STATUS_OPTIONS: AgentStatus[] = ["active", "in_build", "paused"];

function getChannelType(agent: Agent) {
  if (agent.type === "conversation") return agent.subType === "voice" ? "Voice" : "Chat";
  if (agent.type === "api") return "API";
  if (agent.type === "workflow") return "Workflow";
  return "AOP";
}

export function AgentsListPage({
  scope,
  onCreateAgent,
  onOpenAgent,
  initialCreateOpen = false,
  initialAgents = ALL_AGENTS,
  createdNotice,
  onDismissNotice,
}: Props) {
  const [query, setQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>(() =>
    initialAgents.map((agent) => ({ ...agent, status: "in_build" })),
  );
  const [trashed, setTrashed] = useState<Array<Agent & { deletedAt: string }>>([
    {
      id: "t1",
      name: "Test Bhupendra multi voice bot",
      type: "conversation",
      subType: "voice",
      voiceMode: "multi",
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
      voiceMode: "single",
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
  const [conversationFilters, setConversationFilters] = useState<Set<ConversationFilter>>(
    new Set(),
  );
  const [statusFilters, setStatusFilters] = useState<Set<AgentStatus>>(new Set());
  // Density fixed to compact
  const [sortKey, setSortKey] = useState<SortKey>("modified");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
    if (typeFilters.size > 0 || conversationFilters.size > 0) {
      list = list.filter((agent) => {
        if (agent.type !== "conversation") return typeFilters.has(agent.type);
        return (
          typeFilters.has("conversation") ||
          (agent.subType ? conversationFilters.has(agent.subType) : false)
        );
      });
    }
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
        case "channel":
          av = getChannelType(a);
          bv = getChannelType(b);
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
  }, [scopedAgents, query, typeFilters, conversationFilters, statusFilters, sortKey, sortDir]);

  const totalUnfiltered = scopedAgents.length;
  const showType = scope === "all";
  const isEmpty = scopedAgents.length === 0 && !query;
  const typeFilterCount = typeFilters.size + conversationFilters.size;
  const hasFilters = typeFilterCount + statusFilters.size > 0;
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pagedAgents = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    setPage(1);
  }, [query, typeFilters, conversationFilters, statusFilters, scope, rowsPerPage]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const typeCounts = useMemo(() => {
    const c: Record<AgentTypeKey, number> = { conversation: 0, workflow: 0, api: 0, multi: 0 };
    scopedAgents.forEach((a) => {
      c[a.type]++;
    });
    return c;
  }, [scopedAgents]);
  const conversationCounts = useMemo(
    () => ({
      voice: scopedAgents.filter(
        (agent) => agent.type === "conversation" && agent.subType === "voice",
      ).length,
      text: scopedAgents.filter(
        (agent) => agent.type === "conversation" && agent.subType === "text",
      ).length,
    }),
    [scopedAgents],
  );
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
    setConversationFilters(new Set());
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
          { ...rest, status: "in_build" as AgentStatus, lastModified: "just now" },
          ...a,
        ]);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  return (
    <div className="relative h-full w-full">
      <PageContainer fullWidth className="flex min-h-full flex-col px-4 pb-4 pt-0 sm:px-5">
        {createdNotice && (
          <div
            role="status"
            className="relative z-20 mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 shadow-sm"
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

        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-1">
          <div className="flex items-center gap-2.5 text-[13px]">
            <Rows2 className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="font-medium text-foreground">Kapture CX</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-primary">AI Agents</span>
          </div>
          <span className="flex h-9 w-12 items-center justify-center rounded-full border border-primary/60 bg-card text-primary shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
        </div>

        <section
          aria-label={SCOPE_TITLES[scope]}
          className="relative min-h-[350px] shrink-0 overflow-hidden sm:min-h-[380px]"
        >
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[50%] bg-cover bg-center bg-no-repeat opacity-70"
            style={{ backgroundImage: `url(${bgRight})` }}
          />
          <div className="relative flex flex-col items-center pt-16 text-center sm:pt-[88px]">
            <h1 className="text-[22px] font-semibold tracking-[0.01em] text-[#333a50] sm:text-[24px]">
              Voice + AI – Your Brand&apos;s New Superpower
            </h1>
            <div className="mt-12 flex h-[94px] w-[94px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_28%,#50434f_0%,#15111c_58%,#5f63d8_100%)] p-[5px] shadow-[0_14px_28px_rgba(69,59,147,0.22)]">
              <img
                src={vitosLogo}
                alt="Vitos AI"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>
        </section>

        {isEmpty && scope !== "all" ? (
          <div className="relative z-10 -mt-4">
            <EmptyState scope={scope as AgentTypeKey} />
          </div>
        ) : (
          <div className="relative z-10 -mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
              {/* Search */}
              <div
                className={`flex h-9 items-center gap-2 rounded-xl border border-border px-3 transition-all duration-150 ${
                  searchFocused ? "w-[320px] bg-card" : "w-[260px] bg-muted/20"
                }`}
              >
                <Search className="h-[15px] w-[15px] shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search..."
                  className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <div className="mx-1 h-[22px] w-px bg-border" />

              {/* Type filter (only when scope=all) */}
              {showType && (
                <AgentTypeFilterDropdown
                  open={openPanel === "type"}
                  setOpen={(o) => setOpenPanel(o ? "type" : null)}
                  count={typeFilterCount}
                  typeFilters={typeFilters}
                  conversationFilters={conversationFilters}
                  typeCounts={typeCounts}
                  conversationCounts={conversationCounts}
                  setTypeFilters={setTypeFilters}
                  setConversationFilters={setConversationFilters}
                />
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
                className="inline-flex h-9 w-11 items-center justify-center rounded-lg border border-border bg-background text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Import agents"
                title="Import agents"
                className="inline-flex h-9 w-11 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:bg-hover hover:text-foreground"
              >
                <Upload className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> Create New
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
                {[...conversationFilters].map((filter) => (
                  <FilterChip
                    key={`conversation-${filter}`}
                    label={filter === "voice" ? "Voice" : "Chat"}
                    onRemove={() => {
                      const next = new Set(conversationFilters);
                      next.delete(filter);
                      setConversationFilters(next);
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

            <div className="overflow-x-auto">
              <div className="min-w-[1040px]">
                {/* Table header */}
                <div className="grid grid-cols-[minmax(250px,1.35fr)_minmax(230px,1.15fr)_150px_150px_120px_64px] items-center gap-4 border-y border-border bg-muted/30 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                    label="Channel Type"
                    active={sortKey === "channel"}
                    dir={sortDir}
                    onClick={() => onSort("channel")}
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
                  <span className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Action
                  </span>
                </div>

                {/* Rows */}
                <div className="max-h-[360px] overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="px-4 py-16 text-center text-sm text-muted-foreground">
                      No results{query ? ` for "${query}"` : ""}
                    </div>
                  ) : (
                    pagedAgents.map((agent) => {
                      const meta = TYPE_META[agent.type];
                      const isVoiceAgent =
                        agent.type === "conversation" && agent.subType === "voice";
                      const visualMeta = isVoiceAgent
                        ? { ...meta, bg: "#FCE7EF", text: "#B22257", Icon: Phone }
                        : meta;
                      const status = STATUS_META[agent.status];
                      const Icon = visualMeta.Icon;
                      const opensBuilder =
                        (agent.type === "conversation" || agent.type === "workflow") && onOpenAgent;
                      return (
                        <div
                          key={agent.id}
                          role={opensBuilder ? "button" : undefined}
                          tabIndex={opensBuilder ? 0 : undefined}
                          aria-label={opensBuilder ? `Open ${agent.name} builder` : undefined}
                          onClick={() => opensBuilder && onOpenAgent?.(agent)}
                          onKeyDown={(event) => {
                            if (!opensBuilder || (event.key !== "Enter" && event.key !== " "))
                              return;
                            event.preventDefault();
                            onOpenAgent?.(agent);
                          }}
                          className={cn(
                            "group grid grid-cols-[minmax(250px,1.35fr)_minmax(230px,1.15fr)_150px_150px_120px_64px] items-center gap-4 border-b border-border/70 px-4 py-2 transition last:border-b-0 hover:bg-hover",
                            opensBuilder &&
                              "cursor-pointer focus:outline-none focus-visible:bg-[#FDF3F7] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B22257]/30",
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                              style={{ backgroundColor: visualMeta.bg, color: visualMeta.text }}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate text-[13px] font-medium text-foreground">
                              {agent.name}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <span
                              className="inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-medium"
                              style={{ backgroundColor: visualMeta.bg, color: visualMeta.text }}
                            >
                              <Icon className="h-3 w-3 shrink-0" />
                              <span className="truncate">{meta.label}</span>
                              {agent.type === "conversation" && agent.subType && (
                                <span className="border-l border-current/20 pl-1.5 opacity-90">
                                  {agent.subType === "voice"
                                    ? `${agent.voiceMode === "multi" ? "Multi" : "Single"} Voice`
                                    : "Non-Voice"}
                                </span>
                              )}
                            </span>
                          </div>

                          <span className="truncate text-[13px] text-foreground">
                            {getChannelType(agent)}
                          </span>

                          <span className="truncate text-[13px] text-foreground">
                            {agent.lastModified}
                          </span>

                          <div>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium"
                              style={{ backgroundColor: status.bg, color: status.text }}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: status.dot }}
                              />
                              {status.label}
                            </span>
                          </div>

                          <div className="flex items-center justify-center">
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
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border bg-card px-2 py-2 text-[12px] text-foreground sm:px-4">
              <label className="flex items-center gap-2">
                <span>Rows per page</span>
                <select
                  value={rowsPerPage}
                  onChange={(event) => setRowsPerPage(Number(event.target.value))}
                  className="h-8 rounded-lg border border-border bg-card px-2 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </label>
              <Pagination page={page} total={totalPages} onPageChange={setPage} />
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

function AgentTypeFilterDropdown({
  open,
  setOpen,
  count,
  typeFilters,
  conversationFilters,
  typeCounts,
  conversationCounts,
  setTypeFilters,
  setConversationFilters,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  count: number;
  typeFilters: Set<AgentTypeKey>;
  conversationFilters: Set<ConversationFilter>;
  typeCounts: Record<AgentTypeKey, number>;
  conversationCounts: Record<ConversationFilter, number>;
  setTypeFilters: React.Dispatch<React.SetStateAction<Set<AgentTypeKey>>>;
  setConversationFilters: React.Dispatch<React.SetStateAction<Set<ConversationFilter>>>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const conversationSelected = typeFilters.has("conversation");
  const selectedConversationChildren = conversationFilters.size;
  const allConversationChildrenSelected = selectedConversationChildren === 2;

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, setOpen]);

  const toggleTopLevel = (type: AgentTypeKey) => {
    if (type === "conversation") {
      if (conversationSelected || selectedConversationChildren > 0) {
        setTypeFilters((current) => {
          const next = new Set(current);
          next.delete("conversation");
          return next;
        });
        setConversationFilters(new Set());
      } else {
        setTypeFilters((current) => new Set(current).add("conversation"));
      }
      return;
    }

    setTypeFilters((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const toggleConversationFilter = (filter: ConversationFilter) => {
    setTypeFilters((current) => {
      const next = new Set(current);
      next.delete("conversation");
      return next;
    });
    setConversationFilters((current) => {
      const next = new Set(current);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition",
          count > 0
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-background text-foreground hover:bg-hover",
        )}
      >
        Type
        {count > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold text-primary-foreground">
            {count}
          </span>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Filter agents by type"
          className="absolute left-0 top-full z-50 mt-2 w-[300px] overflow-hidden rounded-xl border border-border bg-card shadow-[0_16px_40px_rgba(22,24,35,0.16)]"
        >
          <div className="border-b border-border bg-muted/20 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Agent type
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Select a type or narrow conversation agents by channel.
            </p>
          </div>
          <div className="max-h-[360px] overflow-y-auto p-1.5">
            <TreeFilterRow
              label="Conversation Agent"
              count={typeCounts.conversation}
              checked={conversationSelected || allConversationChildrenSelected}
              indeterminate={
                !conversationSelected &&
                selectedConversationChildren > 0 &&
                !allConversationChildrenSelected
              }
              icon={<MessageCircle className="h-3.5 w-3.5" />}
              onToggle={() => toggleTopLevel("conversation")}
            />

            <div className="relative ml-4 border-l border-dashed border-border pl-3">
              <TreeFilterRow
                label="Voice"
                count={conversationCounts.voice}
                checked={conversationSelected || conversationFilters.has("voice")}
                icon={<Phone className="h-3.5 w-3.5" />}
                onToggle={() => toggleConversationFilter("voice")}
                nested
              />
              <TreeFilterRow
                label="Non-Voice"
                count={conversationCounts.text}
                checked={conversationSelected || conversationFilters.has("text")}
                icon={<MessageSquare className="h-3.5 w-3.5" />}
                onToggle={() => toggleConversationFilter("text")}
                nested
              />
              <div className="relative ml-4 border-l border-dashed border-border pl-3">
                <TreeFilterRow
                  label="Chat"
                  count={conversationCounts.text}
                  checked={conversationSelected || conversationFilters.has("text")}
                  icon={<MessageCircle className="h-3.5 w-3.5" />}
                  onToggle={() => toggleConversationFilter("text")}
                  nested
                />
              </div>
            </div>

            <div className="my-1.5 border-t border-border" />
            <TreeFilterRow
              label="Work Agent"
              count={typeCounts.workflow}
              checked={typeFilters.has("workflow")}
              icon={<Cpu className="h-3.5 w-3.5" />}
              onToggle={() => toggleTopLevel("workflow")}
            />
            <TreeFilterRow
              label="Agent as API"
              count={typeCounts.api}
              checked={typeFilters.has("api")}
              icon={<Plug className="h-3.5 w-3.5" />}
              onToggle={() => toggleTopLevel("api")}
            />
            {typeCounts.multi > 0 && (
              <TreeFilterRow
                label="Multi-agent"
                count={typeCounts.multi}
                checked={typeFilters.has("multi")}
                icon={<Network className="h-3.5 w-3.5" />}
                onToggle={() => toggleTopLevel("multi")}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TreeFilterRow({
  label,
  count,
  checked,
  indeterminate = false,
  icon,
  onToggle,
  nested = false,
}: {
  label: string;
  count: number;
  checked: boolean;
  indeterminate?: boolean;
  icon: React.ReactNode;
  onToggle: () => void;
  nested?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={onToggle}
      className={cn(
        "group relative flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-muted/55",
        nested &&
          "before:absolute before:-left-3 before:top-1/2 before:w-3 before:border-t before:border-dashed before:border-border",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
          checked || indeterminate
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card group-hover:border-primary/50",
        )}
      >
        {indeterminate ? (
          <span className="h-0.5 w-2 rounded-full bg-primary-foreground" />
        ) : checked ? (
          <Check className="h-3 w-3" strokeWidth={3} />
        ) : null}
      </span>
      <span className="text-muted-foreground">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-foreground">
        {label}
      </span>
      <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground">{count}</span>
    </button>
  );
}

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

function Pagination({
  page,
  total,
  onPageChange,
}: {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-2 text-foreground">
        Page {page} of {total}
      </span>
      <PageBtn
        onClick={() => onPageChange(Math.max(1, page - 1))}
        aria-label="Previous"
        disabled={page === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </PageBtn>
      <PageBtn
        onClick={() => onPageChange(Math.min(total, page + 1))}
        aria-label="Next"
        disabled={page === total}
      >
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
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card"
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
