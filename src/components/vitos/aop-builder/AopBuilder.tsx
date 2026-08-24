import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type EdgeTypes,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowUpRight,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minus,
  MoreHorizontal,
  Play,
  Plus,
  Save,
  Workflow,
  Zap,
  GitBranch,
  Wand2,
  FileText,
  Check,
  Search,
  Layers,
  X,
} from "lucide-react";
import { buildGraph, type FlatNodeData } from "./layout";
import { HEALTH_DOT, ORCHESTRATOR, type Health, type StateNode } from "./data";
import { LeadDataLogPage } from "../LeadDataLogPage";
import { StateConfigPanel } from "./StateConfigPanel";
import { createContext, useContext } from "react";

const AddRuleContext = createContext<((stateId: string) => void) | null>(null);

const AOP_OPTIONS = [
  { name: "bank_loan_leads", sub: "Orchestrator · Voice" },
  { name: "kyc_verification", sub: "Workflow" },
  { name: "collections_outreach", sub: "Orchestrator · Voice" },
  { name: "card_activation", sub: "Workflow" },
];

function CanvasTopBar({ procedureName, onSave }: { procedureName: string; onSave: () => void }) {
  const [current, setCurrent] = useState(procedureName);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as globalThis.Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <div
      ref={menuRef}
      className="pointer-events-auto absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          className={`flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-[13px] shadow-[0_6px_20px_-8px_rgba(24,24,27,0.25)] transition hover:bg-hover ${
            menuOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-border"
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            AOP
          </span>
          <span className="truncate font-mono font-semibold text-foreground">{current}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {menuOpen && (
          <div className="absolute left-1/2 top-[calc(100%+6px)] z-20 w-[260px] -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-card shadow-[0_12px_32px_-12px_rgba(24,24,27,0.3)]">
            <ul role="listbox" className="max-h-72 overflow-y-auto py-1">
              {AOP_OPTIONS.map((opt) => {
                const active = opt.name === current;
                return (
                  <li key={opt.name}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setCurrent(opt.name);
                        setMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-hover ${
                        active ? "bg-hover" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-mono text-[12.5px] font-semibold text-foreground">
                          {opt.name}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">{opt.sub}</div>
                      </div>
                      {active && <Check className="h-3.5 w-3.5 shrink-0 text-blue-600" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onSave}
        aria-label="Save"
        title="Save"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition hover:opacity-90"
      >
        <Save className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ---------------- Node components ----------------

function RootNodeCard({ data, selected }: NodeProps) {
  const d = data as FlatNodeData;
  return (
    <div
      className={`w-[240px] rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(24,24,27,0.05),0_10px_28px_-12px_rgba(24,24,27,0.2)] transition ${
        selected ? "ring-2 ring-blue-500/60 border-blue-500" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !border-0 !bg-muted-foreground/60"
      />
      <div className="flex items-center gap-2.5 px-3.5 pt-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#e0166d] via-primary to-[#8b1e48] shadow-sm">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="truncate font-mono text-[13px] font-semibold text-foreground">
            {d.name}
          </div>
          <div className="text-[10.5px] text-muted-foreground">{d.sub}</div>
        </div>
      </div>
      <div className="px-3.5 pb-3 pt-2 text-[11px] leading-snug text-muted-foreground">
        Orchestrates lead capture, verification, and disbursal states across the loan lifecycle.
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !border-0 !bg-muted-foreground/60"
      />
    </div>
  );
}

function StateNodeCard({ data, selected }: NodeProps) {
  const d = data as FlatNodeData;
  const onAddRule = useContext(AddRuleContext);
  const tint: Record<Health, { border: string; body: string; header: string }> = {
    good: {
      border: "border-emerald-400",
      body: "bg-emerald-100/70",
      header: "border-emerald-300 bg-emerald-200/70",
    },
    warn: {
      border: "border-amber-400",
      body: "bg-amber-100/70",
      header: "border-amber-300 bg-amber-200/70",
    },
    alert: {
      border: "border-rose-400",
      body: "bg-rose-100/70",
      header: "border-rose-300 bg-rose-200/70",
    },
    neutral: {
      border: "border-sky-300",
      body: "bg-sky-100/60",
      header: "border-sky-200 bg-sky-200/60",
    },
  };
  const t = tint[(d.health ?? "neutral") as Health];
  return (
    <div
      className={`w-[214px] overflow-hidden rounded-xl border ${t.border} ${t.body} shadow-[0_1px_2px_rgba(24,24,27,0.05),0_6px_18px_-8px_rgba(24,24,27,0.1)] transition hover:shadow-[0_2px_4px_rgba(24,24,27,0.06),0_14px_30px_-10px_rgba(24,24,27,0.18)] ${
        selected ? "ring-2 ring-blue-500/60 border-blue-500" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !border-0 !bg-muted-foreground/60"
      />
      <div className={`flex items-center gap-2 border-b ${t.header} px-3 py-2.5`}>
        <span
          className={`h-2 w-2 shrink-0 rounded-full ring-4 ${HEALTH_DOT[(d.health ?? "neutral") as Health]}`}
        />
        <div className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
          {d.name}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const sid = (d as FlatNodeData & { stateId?: string }).stateId;
            if (sid && onAddRule) onAddRule(sid);
          }}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-white/60 hover:text-foreground"
          aria-label="Add rule"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <MoreHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-3 px-3 py-2 text-[11.5px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Bot className="h-3 w-3" />
          <span className="font-mono font-semibold text-foreground">{d.agentCount ?? 0}</span>{" "}
          agents
        </span>
        <span className="inline-flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          <span className="font-mono font-semibold text-foreground">{d.ruleCount ?? 0}</span> rule
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !border-0 !bg-muted-foreground/60"
      />
    </div>
  );
}

function AgentCard({ name, kind, prio }: { name: string; kind?: string; prio?: string }) {
  return (
    <div
      className="flex-none rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(24,24,27,0.05),0_6px_18px_-8px_rgba(24,24,27,0.1)]"
      style={{ width: 210 }}
    >
      <div className="flex items-center gap-2 px-3 pt-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-500/15 text-emerald-700">
          <Bot className="h-3 w-3" />
        </span>
        <div className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-foreground">
          {name}
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1.5">
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] text-muted-foreground">
          {kind}
        </span>
        <span className="text-[11px] text-muted-foreground">
          Priority: <span className="font-mono text-foreground">{prio?.replace(/^P/, "")}</span>
        </span>
      </div>
    </div>
  );
}

function RuleNodeCard({ data, selected }: NodeProps) {
  const d = data as FlatNodeData & {
    agents?: Array<{ id: string; name: string; kind: string; prio: string }>;
  };
  const agents = d.agents ?? [];
  const tint: Record<Health, { border: string; body: string; header: string; label: string }> = {
    good: {
      border: "border-emerald-300/80",
      body: "bg-emerald-50/40",
      header: "bg-emerald-100/60",
      label: "text-emerald-700",
    },
    warn: {
      border: "border-amber-300/80",
      body: "bg-amber-50/40",
      header: "bg-amber-100/60",
      label: "text-amber-700",
    },
    alert: {
      border: "border-rose-300/80",
      body: "bg-rose-50/40",
      header: "bg-rose-100/60",
      label: "text-rose-700",
    },
    neutral: {
      border: "border-sky-300/80",
      body: "bg-sky-50/50",
      header: "bg-sky-100/60",
      label: "text-sky-700",
    },
  };
  const t = tint[(d.health ?? "neutral") as Health];
  return (
    <div
      className={`box-border w-full overflow-hidden rounded-2xl border border-dashed ${t.border} ${t.body} ${
        selected ? "ring-2 ring-blue-500/50" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !border-0 !bg-muted-foreground/60"
      />
      <div
        className={`flex h-9 items-center gap-2 border-b border-dashed ${t.border} ${t.header} px-3`}
      >
        <span
          className={`rounded bg-white/70 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-wide ${t.label}`}
        >
          RULE
        </span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-foreground">
          {d.name}
        </span>
        {agents.length > 1 && (
          <span className="shrink-0 rounded-full bg-white/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {agents.length} agents
          </span>
        )}
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-white/60 hover:text-foreground"
          aria-label="Rule options"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex flex-nowrap gap-[14px] p-[14px]">
        {agents.map((a) => (
          <AgentCard key={a.id} name={a.name} kind={a.kind} prio={a.prio} />
        ))}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !border-0 !bg-muted-foreground/60"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  root: RootNodeCard,
  state: StateNodeCard,
  rule: RuleNodeCard,
};

// Custom edge: neutral smoothstep with a "+" insert button at midpoint.
function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  label,
}: EdgeProps) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 12,
  });
  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      {label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            className="nodrag nopan pointer-events-none rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm"
          >
            {label as string}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

const edgeTypes: EdgeTypes = { plus: LabeledEdge };

const EDGE_STROKE = "hsl(215 16% 62%)";

// ---------------- Zoom bar ----------------

function ZoomBar({ onAutoArrange }: { onAutoArrange: () => void }) {
  const { zoomIn, zoomOut, fitView, getZoom, setViewport, getViewport } = useReactFlow();
  const [pct, setPct] = useState(100);

  useEffect(() => {
    const iv = setInterval(() => setPct(Math.round(getZoom() * 100)), 200);
    return () => clearInterval(iv);
  }, [getZoom]);

  const reset = () => {
    const v = getViewport();
    setViewport({ ...v, zoom: 1 }, { duration: 250 });
  };

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover hover:text-foreground";

  return (
    <div className="pointer-events-auto absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-border bg-card p-1 shadow-[0_6px_20px_-8px_rgba(24,24,27,0.15)]">
      <button
        type="button"
        className={btn}
        onClick={() => zoomOut({ duration: 200 })}
        aria-label="Zoom out"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={reset}
        className="min-w-[46px] rounded-md px-2 py-1 text-center font-mono text-[11.5px] text-foreground transition hover:bg-hover"
      >
        {pct}%
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => zoomIn({ duration: 200 })}
        aria-label="Zoom in"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      <span className="mx-1 h-4 w-px bg-border" />
      <button
        type="button"
        className={btn}
        onClick={onAutoArrange}
        aria-label="Auto-arrange nodes"
        title="Auto-arrange"
      >
        <Wand2 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => fitView({ duration: 350, padding: 0.15 })}
        aria-label="Fit to screen"
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ---------------- Left panel ----------------

interface LeftPanelProps {
  query: string;
  setQuery: (v: string) => void;
  openStates: Set<string>;
  toggleState: (id: string) => void;
  activeId: string | null;
  onFocus: (id: string) => void;
  procedureName: string;
  onViewLog: () => void;
  onAddRule: (stateId: string) => void;
  onBack: () => void;
}

function LeftPanel({
  query,
  setQuery,
  openStates,
  toggleState,
  activeId,
  onFocus,
  procedureName,
  onViewLog,
  onAddRule,
  onBack,
}: LeftPanelProps) {
  const q = query.trim().toLowerCase();
  const matches = (name: string) => !q || name.toLowerCase().includes(q);
  const [width, setWidth] = useState(240);
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const next = Math.min(480, Math.max(200, e.clientX));
      setWidth(next);
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <aside
      className="relative order-1 flex h-full shrink-0 flex-col border-r border-border bg-card"
      style={{ width }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          title="Back"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-hover hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <div className="text-[12px] font-semibold tracking-[0.05em] text-foreground">
          Agent Operating Procedure
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-border px-3 py-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search states, rules, agents…"
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-7 text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* States section */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            States
          </span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
            {q
              ? ORCHESTRATOR.children.filter(
                  (s) =>
                    matches(s.name) ||
                    s.children.some(
                      (r) => matches(r.name) || r.children.some((a) => matches(a.name)),
                    ),
                ).length
              : ORCHESTRATOR.children.length}
          </span>
        </div>
        {ORCHESTRATOR.children.map((s) => {
          const ruleMatch = s.children.some(
            (r) => matches(r.name) || r.children.some((a) => matches(a.name)),
          );
          const stateMatch = matches(s.name);
          if (q && !stateMatch && !ruleMatch) return null;
          const isOpen = openStates.has(s.id) || (q.length > 0 && (ruleMatch || stateMatch));
          const isActive = activeId === s.id;
          const agentCount = s.children.reduce((n, r) => n + r.children.length, 0);
          return (
            <div key={s.id} className="mb-0.5">
              <div
                className={`group flex w-full items-center gap-1.5 rounded-lg pr-1 transition ${
                  isActive ? "bg-hover" : "hover:bg-hover/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    toggleState(s.id);
                    onFocus(s.id);
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
                >
                  <ChevronRight
                    className={`h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  />
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ring-2 ${HEALTH_DOT[s.health]}`}
                  />
                  <span
                    className={`min-w-0 flex-1 truncate text-[12.5px] ${isActive ? "font-semibold text-foreground" : "font-medium text-foreground/85"}`}
                  >
                    {s.name}
                  </span>
                  {agentCount > 0 && (
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 font-mono text-[9.5px] font-medium text-muted-foreground">
                      {agentCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddRule(s.id);
                  }}
                  aria-label={`Schedule agent for ${s.name}`}
                  title="Configure"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-background hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {isOpen && (
                <div className="ml-[17px] mt-1 mb-1 border-l border-border/70 pl-2.5">
                  {s.children.map((r) => {
                    if (
                      q &&
                      !matches(r.name) &&
                      !matches(s.name) &&
                      !r.children.some((a) => matches(a.name))
                    )
                      return null;
                    return (
                      <div key={r.id} className="py-0.5">
                        <button
                          type="button"
                          onClick={() => onFocus(r.id)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-hover ${
                            activeId === r.id ? "bg-hover" : ""
                          }`}
                        >
                          <span className="rounded bg-amber-500/15 px-1.5 py-[2px] font-mono text-[9px] font-semibold tracking-wide text-amber-700">
                            RULE
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[12px] text-foreground/80">
                            {r.name}
                          </span>
                        </button>
                        {r.children.map((a) => {
                          if (q && !matches(a.name) && !matches(r.name) && !matches(s.name))
                            return null;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => onFocus(a.id)}
                              className={`ml-4 flex w-[calc(100%-1rem)] items-center gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-hover ${
                                activeId === a.id ? "bg-hover" : ""
                              }`}
                            >
                              <span className="rounded bg-blue-500/15 px-1.5 py-[2px] font-mono text-[9px] font-semibold tracking-wide text-blue-700">
                                AGT
                              </span>
                              <span className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground">
                                {a.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                  {s.children.length === 0 && (
                    <div className="px-2 py-1.5 text-[11.5px] italic text-muted-foreground/70">
                      No rules yet — click + to schedule an agent.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={(e) => {
          e.preventDefault();
          draggingRef.current = true;
          document.body.style.cursor = "col-resize";
          document.body.style.userSelect = "none";
        }}
        className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize bg-transparent hover:bg-primary/30 transition-colors"
      />
    </aside>
  );
}

// ---------------- Main builder ----------------

interface AopBuilderProps {
  procedureName: string;
  workspaceName: string;
  onBack: () => void;
}

function BuilderInner({ procedureName, workspaceName, onBack }: AopBuilderProps) {
  const initial = useMemo(() => buildGraph(ORCHESTRATOR), []);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlatNodeData>>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    initial.edges.map((e) => ({
      ...e,
      type: "plus",
      style: { stroke: EDGE_STROKE, strokeWidth: 1.4, opacity: 0.75 },
    })),
  );
  const [query, setQuery] = useState("");
  const [openStates, setOpenStates] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [configStateId, setConfigStateId] = useState<string | null>(null);
  const { fitView, setCenter, getNode } = useReactFlow();
  const didFit = useRef(false);

  const autoArrange = useCallback(() => {
    const fresh = buildGraph(ORCHESTRATOR);
    setNodes(fresh.nodes);
    setEdges(
      fresh.edges.map((e) => ({
        ...e,
        type: "plus",
        style: { stroke: EDGE_STROKE, strokeWidth: 1.4, opacity: 0.75 },
      })),
    );
    requestAnimationFrame(() => {
      requestAnimationFrame(() => fitView({ duration: 350, padding: 0.2 }));
    });
  }, [setNodes, setEdges, fitView]);

  useEffect(() => {
    if (didFit.current) return;
    didFit.current = true;
    // Give React Flow one paint so nodes are measured, then fit with generous padding.
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => fitView({ duration: 0, padding: 0.2 }));
    });
    return () => cancelAnimationFrame(raf);
  }, [fitView]);

  const toggleState = useCallback((id: string) => {
    setOpenStates((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const focusNode = useCallback(
    (id: string) => {
      setActiveId(id);
      setNodes((ns) => ns.map((n) => ({ ...n, selected: n.id === id })));
      const n = getNode(id);
      if (n) {
        setCenter(n.position.x + 110, n.position.y + 50, { zoom: 1, duration: 350 });
      }
    },
    [getNode, setCenter, setNodes],
  );

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setActiveId(node.id);
    const d = node.data as FlatNodeData;
    if (d.parentStateId) {
      setOpenStates((prev) => new Set(prev).add(d.parentStateId!));
    }
  }, []);

  if (showLog) {
    return (
      <LeadDataLogPage
        procedureName={procedureName}
        workspaceName={workspaceName}
        onBack={() => setShowLog(false)}
      />
    );
  }

  const configState: StateNode | undefined = configStateId
    ? ORCHESTRATOR.children.find((s) => s.id === configStateId)
    : undefined;

  return (
    <AddRuleContext.Provider value={setConfigStateId}>
      <div className="flex h-screen w-full min-h-0 flex-col overflow-hidden bg-[#f4f3f1]">
        {/* Top bar */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
          <nav className="flex min-w-0 items-center gap-1.5 text-[13px] text-muted-foreground">
            <span className="truncate">My Workspace</span>
            <span className="text-border">/</span>
            <span className="truncate">{workspaceName || "Kapture CX"}</span>
            <span className="text-border">/</span>
            <span className="truncate">AOP</span>
            <span className="text-border">/</span>
            <span className="truncate font-mono font-semibold text-foreground">
              {procedureName}
            </span>
          </nav>
          <div className="flex-1" />
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[13px] font-semibold text-foreground transition hover:bg-hover"
          >
            <Play className="h-3.5 w-3.5" />
            Simulate
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
          >
            <Save className="h-3.5 w-3.5" />
            Publish
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          <div className="relative order-3 min-w-0 flex-1">
            <CanvasTopBar
              procedureName={procedureName}
              onSave={() => {
                /* TODO: persist */
              }}
            />
            <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-border bg-card/90 px-2.5 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
              Drag to pan · Scroll to zoom · click a node to focus
            </div>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.25}
              maxZoom={1.8}
              panOnDrag
              zoomOnScroll
              nodesDraggable
              nodesConnectable={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={22}
                size={1.6}
                color="rgba(87,83,78,0.55)"
              />
            </ReactFlow>
            <ZoomBar onAutoArrange={autoArrange} />
          </div>

          <LeftPanel
            query={query}
            setQuery={setQuery}
            openStates={openStates}
            toggleState={toggleState}
            activeId={activeId}
            onFocus={focusNode}
            procedureName={procedureName}
            onViewLog={() => setShowLog(true)}
            onAddRule={setConfigStateId}
            onBack={onBack}
          />
          {configState && (
            <div className="order-2 flex min-h-0 shrink-0 border-r border-border bg-card">
              <StateConfigPanel state={configState} onClose={() => setConfigStateId(null)} />
            </div>
          )}
        </div>
      </div>
    </AddRuleContext.Provider>
  );
}

export function AopBuilder(props: AopBuilderProps) {
  return (
    <ReactFlowProvider>
      <BuilderInner {...props} />
    </ReactFlowProvider>
  );
}
