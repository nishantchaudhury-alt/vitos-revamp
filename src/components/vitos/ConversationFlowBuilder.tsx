import { useCallback, useEffect, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bot,
  Box,
  Bug,
  Check,
  ChevronDown,
  Code2,
  GitBranch,
  Globe2,
  History,
  Info,
  Link2,
  ListTree,
  Lock,
  Maximize2,
  MessageSquare,
  Minus,
  MousePointer2,
  PanelLeftClose,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Plus,
  Redo2,
  RefreshCw,
  Rocket,
  Save,
  SlidersHorizontal,
  Sparkles,
  Star,
  TriangleAlert,
  Undo2,
  Unplug,
  Upload,
  Webhook,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import vitosLogo from "@/assets/vitos-logo.png";
import type { Agent } from "./AgentsListPage";

type NodeTone = "green" | "blue" | "amber" | "violet" | "pink" | "slate";
type NodeKind =
  | "trigger"
  | "message"
  | "wait"
  | "options"
  | "api"
  | "logic"
  | "action"
  | "connect"
  | "rating"
  | "transition"
  | "end"
  | "agent"
  | "preview";

type WorkNodeRow = {
  label: string;
  warning?: boolean;
  values?: string[];
};

type ConversationNodeData = {
  label: string;
  detail?: string;
  eyebrow?: string;
  tone: NodeTone;
  kind: NodeKind;
  compact?: boolean;
  wide?: boolean;
  subtitle?: string;
  provider?: string;
  temperature?: string;
  rows?: WorkNodeRow[];
  sourceHandles?: Array<{ id: string; top: string }>;
  footerLeft?: string;
  footerRight?: string;
  channelType?: string;
};

const TONE_STYLES: Record<NodeTone, { icon: string; border: string; handle: string }> = {
  green: {
    icon: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-200",
    handle: "!bg-emerald-500",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600",
    border: "border-blue-200",
    handle: "!bg-blue-500",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    border: "border-amber-200",
    handle: "!bg-amber-500",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600",
    border: "border-violet-200",
    handle: "!bg-violet-500",
  },
  pink: {
    icon: "bg-pink-50 text-[#C72B65]",
    border: "border-pink-200",
    handle: "!bg-[#C72B65]",
  },
  slate: {
    icon: "bg-slate-50 text-slate-600",
    border: "border-slate-200",
    handle: "!bg-slate-500",
  },
};

function NodeIcon({ kind }: { kind: NodeKind }) {
  const Icon =
    kind === "trigger"
      ? Zap
      : kind === "message"
        ? MessageSquare
        : kind === "wait"
          ? History
          : kind === "options"
            ? ListTree
            : kind === "api"
              ? Webhook
              : kind === "logic"
                ? GitBranch
                : kind === "connect"
                  ? Link2
                  : kind === "rating"
                    ? Star
                    : kind === "end"
                      ? Unplug
                      : Code2;
  return <Icon className="h-3.5 w-3.5" aria-hidden="true" />;
}

function FlowNodeCard({ data, selected }: NodeProps) {
  const node = data as ConversationNodeData;
  const tone = TONE_STYLES[node.tone];

  if (node.kind === "transition") {
    return (
      <div
        className={cn(
          "rounded-md bg-[#C72B65] px-2 py-1 text-[9px] font-semibold text-white shadow-sm",
          selected && "ring-2 ring-[#C72B65]/30 ring-offset-1",
        )}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!h-1.5 !w-1.5 !border-0 !bg-[#C72B65]"
        />
        {node.label}
        <Handle
          type="source"
          position={Position.Right}
          className="!h-1.5 !w-1.5 !border-0 !bg-[#C72B65]"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-[190px] rounded-lg border bg-white shadow-[0_4px_16px_rgba(35,35,45,0.07)] transition",
        tone.border,
        node.compact && "w-[150px]",
        selected && "ring-2 ring-[#C72B65]/45 ring-offset-1",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={cn("!h-2 !w-2 !border-2 !border-white", tone.handle)}
      />
      <div className="flex items-center gap-2 border-b border-border/70 px-2.5 py-2">
        <span
          className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", tone.icon)}
        >
          <NodeIcon kind={node.kind} />
        </span>
        <div className="min-w-0 flex-1">
          {node.eyebrow && (
            <div className="truncate text-[8px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {node.eyebrow}
            </div>
          )}
          <div className="truncate text-[10.5px] font-semibold text-foreground">{node.label}</div>
        </div>
      </div>
      {node.kind === "trigger" && node.channelType ? (
        <div className="px-2.5 py-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-600">
            <Globe2 className="h-2.5 w-2.5" aria-hidden="true" />
            {node.channelType}
          </span>
        </div>
      ) : (
        node.detail && (
          <div className="truncate px-2.5 py-2 font-mono text-[9px] italic text-muted-foreground">
            {node.detail}
          </div>
        )
      )}
      <Handle
        type="source"
        position={Position.Right}
        className={cn("!h-2 !w-2 !border-2 !border-white", tone.handle)}
      />
    </div>
  );
}

function WorkAgentNodeCard({ data, selected }: NodeProps) {
  const node = data as ConversationNodeData;
  const tone = TONE_STYLES[node.tone];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-slate-300 bg-white shadow-[0_5px_18px_rgba(35,35,45,0.08)] transition",
        node.wide ? "w-[300px]" : "w-[255px]",
        selected && "ring-2 ring-[#C72B65]/45 ring-offset-1",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={cn("!h-2.5 !w-2.5 !border-2 !border-white", tone.handle)}
      />

      <div className="flex items-start gap-2 border-b border-border/70 px-3 py-2.5">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600">
          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-semibold text-foreground">{node.label}</div>
          {node.subtitle && (
            <div className="mt-0.5 truncate text-[8.5px] text-muted-foreground">
              {node.subtitle}
            </div>
          )}
        </div>
      </div>

      {(node.provider || node.temperature) && (
        <div className="grid grid-cols-[1fr_72px] border-b border-border/70 bg-muted/20 text-[9px]">
          <div className="flex items-center gap-1.5 border-r border-border/70 px-3 py-1.5 text-foreground">
            <span className="h-2 w-2 rounded-full bg-[#17111A]" aria-hidden="true" />
            {node.provider}
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-muted-foreground">
            <SlidersHorizontal className="h-2.5 w-2.5 text-[#C72B65]" aria-hidden="true" />
            {node.temperature}
          </div>
        </div>
      )}

      <div className="divide-y divide-border/60">
        {node.rows?.map((row) => (
          <div key={row.label} className="relative px-3 py-1.5">
            <div className="flex items-center justify-between gap-2 text-[9px] text-muted-foreground">
              <span>{row.label}</span>
              {row.warning && (
                <TriangleAlert
                  className="h-3 w-3 shrink-0 text-amber-500"
                  aria-label="Needs setup"
                />
              )}
            </div>
            {row.values?.map((value) => (
              <div key={value} className="mt-1 truncate text-[8.5px] font-medium text-foreground">
                {value}
              </div>
            ))}
          </div>
        ))}
      </div>

      {(node.sourceHandles ?? [{ id: "output", top: "50%" }]).map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="source"
          position={Position.Right}
          style={{ top: handle.top }}
          className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#C72B65]"
        />
      ))}
    </div>
  );
}

function WorkflowPreviewNode({ data, selected }: NodeProps) {
  const node = data as ConversationNodeData;

  return (
    <div
      className={cn(
        "w-[500px] overflow-hidden rounded-xl border border-blue-200 bg-white shadow-[0_5px_18px_rgba(35,35,45,0.08)]",
        selected && "ring-2 ring-[#C72B65]/45 ring-offset-1",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#C72B65]"
      />
      <div className="flex items-center gap-2 border-b border-border/70 px-3 py-2.5">
        <Workflow className="h-4 w-4 text-blue-500" aria-hidden="true" />
        <span className="text-[11px] font-semibold text-foreground">{node.label}</span>
      </div>
      <div className="flex h-[150px] items-center justify-center bg-[radial-gradient(circle,_rgba(148,163,184,0.28)_1px,_transparent_1px)] bg-[length:12px_12px]">
        <span className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm">
          <Workflow className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-border/70 px-3 py-2 text-[8.5px] text-muted-foreground">
        <span>{node.footerLeft}</span>
        <span>{node.footerRight}</span>
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  conversation: FlowNodeCard,
  workAgent: WorkAgentNodeCard,
  workflowPreview: WorkflowPreviewNode,
};

const initialNodes: Node<ConversationNodeData>[] = [
  {
    id: "trigger",
    type: "conversation",
    position: { x: 0, y: 260 },
    data: {
      label: "Trigger",
      tone: "green",
      kind: "trigger",
      compact: true,
      channelType: "Website",
    },
  },
  {
    id: "welcome",
    type: "conversation",
    position: { x: 220, y: 250 },
    data: {
      label: "Send Message",
      detail: "Hey! Welcome to Kapture chat!",
      tone: "blue",
      kind: "message",
    },
  },
  {
    id: "email",
    type: "conversation",
    position: { x: 470, y: 250 },
    data: {
      label: "Wait for message",
      detail: "Enter your email id",
      tone: "pink",
      kind: "wait",
    },
  },
  {
    id: "query-options",
    type: "conversation",
    position: { x: 720, y: 245 },
    data: {
      label: "Options",
      detail: "Please select the query type",
      eyebrow: "Branches",
      tone: "violet",
      kind: "options",
    },
  },
  {
    id: "past-api",
    type: "conversation",
    position: { x: 1040, y: 110 },
    data: {
      label: "Request an API",
      detail: "https://demoweb.kapturecrm.com…",
      tone: "amber",
      kind: "api",
    },
  },
  {
    id: "logic",
    type: "conversation",
    position: { x: 1280, y: 160 },
    data: {
      label: "Logic",
      detail: "If Expression 1  ·  No Match",
      eyebrow: "Branches",
      tone: "amber",
      kind: "logic",
    },
  },
  {
    id: "ticket-action",
    type: "conversation",
    position: { x: 1515, y: 150 },
    data: {
      label: "Custom Action",
      detail: "optionList",
      tone: "blue",
      kind: "action",
    },
  },
  {
    id: "past-options",
    type: "conversation",
    position: { x: 1760, y: 190 },
    data: {
      label: "Options",
      detail: "Please find the past tickets",
      tone: "violet",
      kind: "options",
    },
  },
  {
    id: "rating",
    type: "conversation",
    position: { x: 1990, y: 190 },
    data: {
      label: "Rate ticket",
      detail: "Please rate our support",
      tone: "amber",
      kind: "rating",
    },
  },
  {
    id: "rating-transition",
    type: "conversation",
    position: { x: 2210, y: 218 },
    data: { label: "transition", tone: "pink", kind: "transition" },
  },
  {
    id: "end",
    type: "conversation",
    position: { x: 2335, y: 206 },
    data: { label: "End of Flow", tone: "pink", kind: "end", compact: true },
  },
  {
    id: "not-found",
    type: "conversation",
    position: { x: 1515, y: 330 },
    data: {
      label: "Send Message",
      detail: "No tickets found",
      tone: "blue",
      kind: "message",
    },
  },
  {
    id: "support-agent",
    type: "conversation",
    position: { x: 1760, y: 340 },
    data: {
      label: "Connect to Agent",
      tone: "green",
      kind: "connect",
      compact: true,
    },
  },
  {
    id: "category-api",
    type: "conversation",
    position: { x: 950, y: 430 },
    data: {
      label: "Request an API",
      detail: "https://demoweb.kapturecrm.com…",
      tone: "amber",
      kind: "api",
    },
  },
  {
    id: "category-action",
    type: "conversation",
    position: { x: 1190, y: 430 },
    data: {
      label: "Custom Action",
      detail: "categoriesList",
      tone: "blue",
      kind: "action",
    },
  },
  {
    id: "dynamic-options",
    type: "conversation",
    position: { x: 1430, y: 550 },
    data: {
      label: "Dynamic Options",
      detail: "The categories are",
      tone: "violet",
      kind: "options",
    },
  },
  {
    id: "form",
    type: "conversation",
    position: { x: 1680, y: 560 },
    data: {
      label: "Form Associate Value",
      detail: "Please fill the required data.",
      tone: "blue",
      kind: "action",
    },
  },
  {
    id: "form-transition",
    type: "conversation",
    position: { x: 1915, y: 588 },
    data: { label: "transition", tone: "pink", kind: "transition" },
  },
  {
    id: "form-agent",
    type: "conversation",
    position: { x: 2040, y: 575 },
    data: {
      label: "Connect to Agent",
      tone: "green",
      kind: "connect",
      compact: true,
    },
  },
];

const edgeLabelStyle = { fill: "#ffffff", fontWeight: 600, fontSize: 9 };
const edgeLabelBgStyle = { fill: "#C72B65", fillOpacity: 1 };

const initialEdges: Edge[] = [
  ["trigger", "welcome"],
  ["welcome", "email"],
  ["email", "query-options"],
].map(([source, target]) => ({
  id: `${source}-${target}`,
  source,
  target,
  type: "smoothstep",
  style: { stroke: "#8F94A5", strokeWidth: 1.35 },
}));

initialEdges.push(
  {
    id: "query-past",
    source: "query-options",
    target: "past-api",
    type: "smoothstep",
    label: "Show my past tickets",
    labelStyle: edgeLabelStyle,
    labelBgStyle: edgeLabelBgStyle,
    labelBgPadding: [7, 4],
    labelBgBorderRadius: 4,
    style: { stroke: "#C72B65", strokeWidth: 1.4 },
  },
  {
    id: "past-logic",
    source: "past-api",
    target: "logic",
    type: "smoothstep",
    style: { stroke: "#8F94A5", strokeWidth: 1.35 },
  },
  {
    id: "logic-action",
    source: "logic",
    target: "ticket-action",
    type: "smoothstep",
    label: "If Expression 1",
    labelStyle: edgeLabelStyle,
    labelBgStyle: edgeLabelBgStyle,
    labelBgPadding: [7, 4],
    labelBgBorderRadius: 4,
    style: { stroke: "#C72B65", strokeWidth: 1.4 },
  },
  {
    id: "action-options",
    source: "ticket-action",
    target: "past-options",
    type: "smoothstep",
    style: { stroke: "#8F94A5", strokeWidth: 1.35 },
  },
  {
    id: "options-rating",
    source: "past-options",
    target: "rating",
    type: "smoothstep",
    style: { stroke: "#8F94A5", strokeWidth: 1.35 },
  },
  {
    id: "rating-transition",
    source: "rating",
    target: "rating-transition",
    type: "smoothstep",
    style: { stroke: "#C72B65", strokeWidth: 1.4 },
  },
  {
    id: "transition-end",
    source: "rating-transition",
    target: "end",
    type: "smoothstep",
    style: { stroke: "#C72B65", strokeWidth: 1.4 },
  },
  {
    id: "logic-not-found",
    source: "logic",
    target: "not-found",
    type: "smoothstep",
    label: "No Match",
    labelStyle: edgeLabelStyle,
    labelBgStyle: edgeLabelBgStyle,
    labelBgPadding: [7, 4],
    labelBgBorderRadius: 4,
    style: { stroke: "#C72B65", strokeWidth: 1.4 },
  },
  {
    id: "not-found-agent",
    source: "not-found",
    target: "support-agent",
    type: "smoothstep",
    style: { stroke: "#8F94A5", strokeWidth: 1.35 },
  },
  {
    id: "query-categories",
    source: "query-options",
    target: "category-api",
    type: "smoothstep",
    label: "Show Categories",
    labelStyle: edgeLabelStyle,
    labelBgStyle: edgeLabelBgStyle,
    labelBgPadding: [7, 4],
    labelBgBorderRadius: 4,
    style: { stroke: "#C72B65", strokeWidth: 1.4 },
  },
  {
    id: "category-api-action",
    source: "category-api",
    target: "category-action",
    type: "smoothstep",
    style: { stroke: "#8F94A5", strokeWidth: 1.35 },
  },
  {
    id: "category-dynamic",
    source: "category-action",
    target: "dynamic-options",
    type: "smoothstep",
    label: "transition",
    labelStyle: edgeLabelStyle,
    labelBgStyle: edgeLabelBgStyle,
    labelBgPadding: [7, 4],
    labelBgBorderRadius: 4,
    style: { stroke: "#C72B65", strokeWidth: 1.4 },
  },
  {
    id: "dynamic-form",
    source: "dynamic-options",
    target: "form",
    type: "smoothstep",
    label: "transition",
    labelStyle: edgeLabelStyle,
    labelBgStyle: edgeLabelBgStyle,
    labelBgPadding: [7, 4],
    labelBgBorderRadius: 4,
    style: { stroke: "#C72B65", strokeWidth: 1.4 },
  },
  {
    id: "form-transition-edge",
    source: "form",
    target: "form-transition",
    type: "smoothstep",
    style: { stroke: "#C72B65", strokeWidth: 1.4 },
  },
  {
    id: "form-agent-edge",
    source: "form-transition",
    target: "form-agent",
    type: "smoothstep",
    style: { stroke: "#C72B65", strokeWidth: 1.4 },
  },
);

const workAgentNodes: Node<ConversationNodeData>[] = [
  {
    id: "work-trigger",
    type: "conversation",
    position: { x: 0, y: 330 },
    data: {
      label: "Trigger",
      tone: "green",
      kind: "trigger",
      compact: true,
      channelType: "Website",
    },
  },
  {
    id: "work-send-message",
    type: "conversation",
    position: { x: 220, y: 320 },
    data: {
      label: "Send Message",
      detail: "Hey! Welcome",
      tone: "blue",
      kind: "message",
    },
  },
  {
    id: "conversation-ai",
    type: "workAgent",
    position: { x: 500, y: 210 },
    data: {
      label: "Conversation AI",
      subtitle: "Your prompt goes here",
      tone: "blue",
      kind: "agent",
      wide: true,
      provider: "Chat GPT",
      temperature: "0.3",
      rows: [
        { label: "Knowledge Base", warning: true },
        { label: "Actions", warning: true },
        {
          label: "Sub Agent",
          values: [
            "agent_guild_agent",
            "Technical Support Agent 178998804434",
            "Technical Support Agent 1789988639679",
          ],
        },
        { label: "Structure Output", warning: true },
        { label: "Post Action", warning: true },
        { label: "Human Input", warning: true },
      ],
      sourceHandles: [
        { id: "guild", top: "31%" },
        { id: "support-primary", top: "56%" },
        { id: "support-secondary", top: "76%" },
      ],
    },
  },
  {
    id: "agent-guild",
    type: "workAgent",
    position: { x: 975, y: 70 },
    data: {
      label: "agent_guild_agent",
      subtitle: "Your prompt goes here",
      tone: "blue",
      kind: "agent",
      provider: "Chat GPT",
      temperature: "0.3",
      rows: [
        { label: "Knowledge Base", warning: true },
        { label: "Actions", warning: true },
        { label: "Sub Agent", values: ["njunj"] },
      ],
      sourceHandles: [{ id: "nested-flow", top: "51%" }],
    },
  },
  {
    id: "nested-workflow",
    type: "workflowPreview",
    position: { x: 1375, y: 20 },
    data: {
      label: "njunj",
      tone: "blue",
      kind: "preview",
      footerLeft: "05-10-2026 10:29:41 am +05:30",
      footerRight: "v1.5.0  ·  Stable Version",
    },
  },
  {
    id: "support-primary",
    type: "workAgent",
    position: { x: 1115, y: 355 },
    data: {
      label: "Technical Support Agent 178998804434",
      subtitle: "Your prompt goes here",
      tone: "pink",
      kind: "agent",
      provider: "Vitos",
      temperature: "0.3",
      rows: [
        { label: "Knowledge Base", warning: true },
        { label: "Actions", warning: true },
        { label: "Sub Agent" },
      ],
    },
  },
  {
    id: "support-secondary",
    type: "workAgent",
    position: { x: 1165, y: 650 },
    data: {
      label: "Technical Support Agent 1789988639679",
      subtitle: "Your prompt goes here",
      tone: "pink",
      kind: "agent",
      provider: "Vitos",
      temperature: "0.3",
      rows: [
        { label: "Knowledge Base", warning: true },
        { label: "Actions", warning: true },
        { label: "Sub Agent" },
      ],
    },
  },
];

const workAgentEdges: Edge[] = [
  {
    id: "work-trigger-message",
    source: "work-trigger",
    target: "work-send-message",
    type: "default",
    style: { stroke: "#8F94A5", strokeWidth: 1.5 },
  },
  {
    id: "work-message-conversation",
    source: "work-send-message",
    target: "conversation-ai",
    type: "default",
    style: { stroke: "#8F94A5", strokeWidth: 1.5 },
  },
  {
    id: "conversation-guild",
    source: "conversation-ai",
    sourceHandle: "guild",
    target: "agent-guild",
    type: "default",
    label: "agent_guild_agent",
    labelStyle: edgeLabelStyle,
    labelBgStyle: edgeLabelBgStyle,
    labelBgPadding: [7, 4],
    labelBgBorderRadius: 4,
    style: { stroke: "#8F94A5", strokeWidth: 1.5 },
  },
  {
    id: "guild-preview",
    source: "agent-guild",
    sourceHandle: "nested-flow",
    target: "nested-workflow",
    type: "default",
    label: "njunj",
    labelStyle: edgeLabelStyle,
    labelBgStyle: edgeLabelBgStyle,
    labelBgPadding: [7, 4],
    labelBgBorderRadius: 4,
    style: { stroke: "#8F94A5", strokeWidth: 1.5 },
  },
  {
    id: "conversation-support-primary",
    source: "conversation-ai",
    sourceHandle: "support-primary",
    target: "support-primary",
    type: "default",
    label: "Technical Support Agent 178998804434",
    labelStyle: edgeLabelStyle,
    labelBgStyle: edgeLabelBgStyle,
    labelBgPadding: [7, 4],
    labelBgBorderRadius: 4,
    style: { stroke: "#8F94A5", strokeWidth: 1.5 },
  },
  {
    id: "conversation-support-secondary",
    source: "conversation-ai",
    sourceHandle: "support-secondary",
    target: "support-secondary",
    type: "default",
    label: "Technical Support Agent 1789988639679",
    labelStyle: edgeLabelStyle,
    labelBgStyle: edgeLabelBgStyle,
    labelBgPadding: [7, 4],
    labelBgBorderRadius: 4,
    style: { stroke: "#8F94A5", strokeWidth: 1.5 },
  },
];

function CanvasToolbar() {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const [zoom, setZoom] = useState(50);

  const updateZoom = useCallback(() => {
    requestAnimationFrame(() => setZoom(Math.round(getZoom() * 100)));
  }, [getZoom]);

  return (
    <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
      <div className="flex h-9 items-center overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <button
          type="button"
          aria-label="Select nodes"
          className="flex h-full w-9 items-center justify-center bg-muted/45 text-foreground"
        >
          <MousePointer2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Undo"
          className="flex h-full w-9 items-center justify-center text-muted-foreground hover:bg-hover"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Redo"
          className="flex h-full w-9 items-center justify-center text-muted-foreground hover:bg-hover"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-2 shadow-sm">
        <span className="mr-1 text-[11px] font-semibold text-foreground">Stable</span>
        <span className="relative h-5 w-9 rounded-full bg-[#F5D8E3]">
          <span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
        </span>
      </div>

      <div className="flex h-9 items-center overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => {
            zoomIn({ duration: 180 });
            updateZoom();
          }}
          className="flex h-full w-9 items-center justify-center text-foreground hover:bg-hover"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => {
            zoomOut({ duration: 180 });
            updateZoom();
          }}
          className="flex h-full w-9 items-center justify-center text-foreground hover:bg-hover"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Fit flow to view"
          onClick={() => {
            fitView({ padding: 0.12, duration: 250 });
            updateZoom();
          }}
          className="flex h-full w-9 items-center justify-center text-foreground hover:bg-hover"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <span className="min-w-12 px-2 text-center font-mono text-[10px] text-muted-foreground">
          {zoom}%
        </span>
        <button
          type="button"
          aria-label="Lock canvas"
          className="flex h-full w-9 items-center justify-center text-foreground hover:bg-hover"
        >
          <Lock className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function LeftToolDock() {
  const tools = [
    { label: "Run flow", Icon: Play },
    { label: "Debug", Icon: Bug },
    { label: "Components", Icon: Box },
    { label: "Version history", Icon: History },
    { label: "Connections", Icon: Workflow },
    { label: "Canvas settings", Icon: SlidersHorizontal },
  ];

  return (
    <div className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {tools.map(({ label, Icon }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          title={label}
          className="flex h-9 w-9 items-center justify-center border-b border-border/60 text-foreground transition last:border-b-0 hover:bg-hover hover:text-primary"
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

function SendMessageConfigPanel({ onClose }: { onClose: () => void }) {
  const [channel, setChannel] = useState("WhatsApp");
  const [configuration, setConfiguration] = useState("919380947884");
  const [receiver, setReceiver] = useState("");
  const [withSubscription, setWithSubscription] = useState(false);
  const [messageMode, setMessageMode] = useState<"text" | "voice">("text");
  const [messageBody, setMessageBody] = useState("Hey! Welcome");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  return (
    <aside
      aria-label="Send Message configuration"
      className="absolute inset-y-0 right-0 z-40 flex w-full max-w-[430px] flex-col border-l border-border bg-card shadow-[-12px_0_32px_rgba(15,23,42,0.12)] sm:w-[430px]"
    >
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="flex-1 text-[15px] font-semibold text-foreground">Send Message</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Send Message configuration"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-hover hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid h-11 shrink-0 grid-cols-3 border-b border-border bg-muted/15 px-3">
        <button
          type="button"
          className="border-b-2 border-blue-500 text-[12px] font-semibold text-blue-600"
        >
          <span className="inline-flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Setup
          </span>
        </button>
        <button type="button" className="text-[12px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5" /> Output
          </span>
        </button>
        <button type="button" className="text-[12px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" /> About
          </span>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#FAFBFF] p-3 [scrollbar-color:#D9DFEB_transparent]">
        <section className="rounded-xl border border-blue-100 bg-white px-3 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-5 border-l-2 border-blue-500" aria-hidden="true" />
            <h3 className="text-[13px] font-semibold text-[#333A50]">Summary</h3>
          </div>
          <p className="mt-1.5 pl-3 text-[11px] leading-5 text-muted-foreground">
            Sends a one-way message and continues the flow.
          </p>
        </section>

        <section className="mt-3 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="h-5 border-l-2 border-blue-500" aria-hidden="true" />
            <h3 className="text-[13px] font-semibold text-[#333A50]">Delivery</h3>
          </div>

          <label className="mt-3 block text-[12px] font-semibold text-[#333A50]">
            Channel
            <select
              value={channel}
              onChange={(event) => {
                const nextChannel = event.target.value;
                setChannel(nextChannel);
                setConfiguration(
                  nextChannel === "Website" ? "kaptureqa · autoqa.com" : "919380947884",
                );
              }}
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-white px-3 text-[12px] font-normal text-foreground outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option>WhatsApp</option>
              <option>Website</option>
              <option>Chat</option>
              <option>SMS</option>
            </select>
          </label>

          <label className="mt-3 block text-[12px] font-semibold text-[#333A50]">
            Configuration
            <select
              value={configuration}
              onChange={(event) => setConfiguration(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-white px-3 text-[12px] font-normal text-foreground outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {channel === "Website" ? (
                <>
                  <option>kaptureqa · autoqa.com</option>
                  <option>Website qa · www.abc.com</option>
                  <option>newqa · autoqa.com</option>
                </>
              ) : (
                <>
                  <option>919380947884</option>
                  <option>Default WhatsApp configuration</option>
                </>
              )}
            </select>
          </label>
          <p className="mt-1 text-[10px] text-muted-foreground">Resolves to {channel}</p>

          {channel !== "Website" && (
            <>
              <label className="mt-3 block text-[12px] font-semibold text-[#333A50]">
                Receiver
                <input
                  value={receiver}
                  onChange={(event) => setReceiver(event.target.value)}
                  placeholder="Enter email, phone number, or {{$variable}}"
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-white px-3 font-mono text-[11px] font-normal text-foreground outline-none transition placeholder:text-muted-foreground focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#333A50]">With Subscription</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={withSubscription}
                  onClick={() => setWithSubscription((value) => !value)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition",
                    withSubscription ? "bg-blue-500" : "bg-slate-200",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                      withSubscription ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </button>
              </div>
            </>
          )}
        </section>

        <section className="mt-3 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="h-5 border-l-2 border-blue-500" aria-hidden="true" />
            <h3 className="text-[13px] font-semibold text-[#333A50]">Message</h3>
          </div>

          <div className="mt-3 grid grid-cols-2 rounded-lg border border-border bg-muted/20 p-1">
            {(["text", "voice"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setMessageMode(mode)}
                className={cn(
                  "h-8 rounded-md text-[11px] font-semibold capitalize transition",
                  messageMode === mode
                    ? "border border-blue-200 bg-blue-50 text-blue-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode === "voice" ? "Voice Note" : "Text"}
              </button>
            ))}
          </div>

          <label className="mt-3 block text-[12px] font-semibold text-[#333A50]">
            Message Body
            <div className="mt-1.5 overflow-hidden rounded-lg border border-border bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <div className="flex h-9 items-center gap-4 border-b border-border px-3 text-[11px] font-semibold text-foreground">
                <span className="text-[15px]">B</span>
                <span className="text-[15px] italic">I</span>
                <span className="text-[15px] underline">U</span>
                <span className="font-medium">Normal</span>
              </div>
              <textarea
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                rows={5}
                className="w-full resize-none px-3 py-2 text-[12px] font-normal text-foreground outline-none"
              />
            </div>
          </label>

          <label className="mt-3 block text-[12px] font-semibold text-[#333A50]">
            Attachment URL
            <input
              value={attachmentUrl}
              onChange={(event) => setAttachmentUrl(event.target.value)}
              placeholder="https://…/invoice.pdf or {{uploadedFileUrl}}"
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-white px-3 font-mono text-[11px] font-normal text-foreground outline-none transition placeholder:text-muted-foreground focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </section>
      </div>
    </aside>
  );
}

function TriggerConfigPanel({ onClose }: { onClose: () => void }) {
  const [channelType, setChannelType] = useState("Website");
  const [channel, setChannel] = useState("kaptureqa · autoqa.com");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [defaultChannelOpen, setDefaultChannelOpen] = useState(true);
  const [responseOpen, setResponseOpen] = useState(false);

  return (
    <aside
      aria-label="Trigger configuration"
      className="absolute inset-y-0 right-0 z-40 flex w-full max-w-[430px] flex-col border-l border-border bg-card shadow-[-12px_0_32px_rgba(15,23,42,0.12)] sm:w-[430px]"
    >
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Zap className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="flex-1 text-[15px] font-semibold text-foreground">Trigger</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Trigger configuration"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-hover hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid h-11 shrink-0 grid-cols-3 border-b border-border bg-muted/15 px-3">
        <button
          type="button"
          className="border-b-2 border-emerald-500 text-[12px] font-semibold text-emerald-600"
        >
          <span className="inline-flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Setup
          </span>
        </button>
        <button type="button" className="text-[12px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5" /> Output
          </span>
        </button>
        <button type="button" className="text-[12px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" /> About
          </span>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#FAFBFF] p-3 [scrollbar-color:#D9DFEB_transparent]">
        <section className="rounded-xl border border-emerald-100 bg-white px-3 py-3 shadow-sm">
          <button
            type="button"
            onClick={() => setSummaryOpen((value) => !value)}
            className="flex w-full items-center gap-2"
          >
            <span className="h-5 border-l-2 border-emerald-500" aria-hidden="true" />
            <h3 className="text-[13px] font-semibold text-[#333A50]">Summary</h3>
            <span className="flex-1 truncate text-left text-[11px] text-muted-foreground">
              Starts the flow when an event occurs
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                summaryOpen && "rotate-180",
              )}
            />
          </button>
        </section>

        <section className="mt-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setDefaultChannelOpen((value) => !value)}
            className="flex w-full items-center gap-2 border-b border-border pb-3"
          >
            <span className="h-5 border-l-2 border-emerald-500" aria-hidden="true" />
            <h3 className="flex-1 text-left text-[13px] font-semibold text-[#333A50]">
              Default Channel
            </h3>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
              Optional
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                defaultChannelOpen && "rotate-180",
              )}
            />
          </button>

          {defaultChannelOpen && (
            <>
              <label className="mt-3 block text-[12px] font-semibold text-[#333A50]">
                Channel Type
                <select
                  value={channelType}
                  onChange={(event) => {
                    const nextChannelType = event.target.value;
                    setChannelType(nextChannelType);
                    setChannel(
                      nextChannelType === "Website" ? "kaptureqa · autoqa.com" : "123456789",
                    );
                  }}
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-white px-3 text-[12px] font-normal text-foreground outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  <option>WhatsApp</option>
                  <option>Website</option>
                  <option>Chat</option>
                  <option>SMS</option>
                </select>
              </label>

              <label className="mt-3 block text-[12px] font-semibold text-[#333A50]">
                Channel
                <select
                  value={channel}
                  onChange={(event) => setChannel(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-white px-3 text-[12px] font-normal text-foreground outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  {channelType === "Website" ? (
                    <>
                      <option>kaptureqa · autoqa.com</option>
                      <option>Website qa · www.abc.com</option>
                      <option>newqa · autoqa.com</option>
                    </>
                  ) : (
                    <>
                      <option>123456789</option>
                      <option>Default {channelType} configuration</option>
                    </>
                  )}
                </select>
              </label>
              <p className="mt-1 text-[10px] text-muted-foreground">Resolves to {channelType}</p>
            </>
          )}
        </section>

        <section className="mt-3 rounded-xl border border-emerald-100 bg-white px-3 py-3 shadow-sm">
          <button
            type="button"
            onClick={() => setResponseOpen((value) => !value)}
            className="flex w-full items-center gap-2"
          >
            <span className="h-5 border-l-2 border-emerald-500" aria-hidden="true" />
            <h3 className="flex-1 text-left text-[13px] font-semibold text-[#333A50]">
              Response &amp; Event Data
            </h3>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                responseOpen && "rotate-180",
              )}
            />
          </button>
          {responseOpen && (
            <p className="mt-2 pl-3 text-[11px] leading-5 text-muted-foreground">
              Define what gets passed downstream when this trigger fires.
            </p>
          )}
        </section>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-700 px-4 text-[12px] font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Save
          </button>
        </div>

        <div className="mt-4">
          <span className="text-[12px] font-medium text-foreground">Additional Settings</span>
          <div className="mt-1.5 h-11 w-full rounded-lg border border-border bg-white" />
        </div>
      </div>

      <div className="flex h-10 shrink-0 items-center justify-between border-t border-border px-4">
        <span className="text-[11px] text-muted-foreground">v{FLOW_VERSION}</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#C72B65] px-2.5 py-1 text-[10px] font-semibold text-white">
            <RefreshCw className="h-3 w-3" /> Latest Version
          </span>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}

function BuilderInner({
  agent,
  workspaceName,
  onBack,
  onCreateChannel,
  onWebsiteSelected,
}: {
  agent: Agent;
  workspaceName: string;
  onBack: () => void;
  onCreateChannel: () => void;
  onWebsiteSelected: (website: { name: string; domain: string }) => void;
}) {
  const isWorkAgent = agent.type === "workflow";
  const [nodes, setNodes, onNodesChange] = useNodesState(
    isWorkAgent ? workAgentNodes : initialNodes,
  );
  const [edges, , onEdgesChange] = useEdgesState(isWorkAgent ? workAgentEdges : initialEdges);
  const [saved, setSaved] = useState(false);
  const [running, setRunning] = useState(false);
  const [showDeploymentSettings, setShowDeploymentSettings] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const minimapColor = useCallback((node: Node) => {
    const data = node.data as ConversationNodeData;
    return data.tone === "green"
      ? "#10b981"
      : data.tone === "blue"
        ? "#3b82f6"
        : data.tone === "amber"
          ? "#f59e0b"
          : data.tone === "violet"
            ? "#8b5cf6"
            : "#C72B65";
  }, []);

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      const data = node.data as ConversationNodeData;
      const hasPanel = node.id === "work-send-message" || data.kind === "trigger";
      setNodes((current) => current.map((item) => ({ ...item, selected: item.id === node.id })));
      setSelectedNodeId(hasPanel ? node.id : null);
    },
    [setNodes],
  );

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const selectedNodeData = selectedNode?.data as ConversationNodeData | undefined;

  const breadcrumbWorkspace = workspaceName || "Kapture CX";

  return (
    <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-white">
      <header className="flex h-14 shrink-0 items-center border-b border-border bg-card px-5">
        <nav className="flex min-w-0 items-center gap-2 text-[13px]" aria-label="Agent breadcrumb">
          <PanelLeftClose className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="truncate text-muted-foreground">{breadcrumbWorkspace}</span>
          <span className="text-border">/</span>
          <span className="text-muted-foreground">AI Agents</span>
          <span className="text-border">/</span>
          <span className="truncate font-medium text-[#C72B65]">{agent.name}</span>
        </nav>
        <div className="flex-1" />
        <span className="flex h-9 w-12 items-center justify-center rounded-full border border-[#C72B65] bg-card shadow-sm">
          <img src={vitosLogo} alt="Vitos" className="h-7 w-7 rounded-full" />
        </span>
      </header>

      {showDeploymentSettings ? (
        agent.subType === "voice" && agent.voiceMode === "multi" ? (
          <MultiVoiceDeploymentSettings
            agent={agent}
            onBack={() => setShowDeploymentSettings(false)}
            onCreateChannel={onCreateChannel}
          />
        ) : (
          <WebsiteDeploymentSettings
            agent={agent}
            onBack={() => setShowDeploymentSettings(false)}
            onNext={onWebsiteSelected}
          />
        )
      ) : (
        <div className="relative min-h-0 flex-1 bg-white">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to agents"
            className="absolute left-5 top-5 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-hover"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="absolute left-1/2 top-5 z-30 flex -translate-x-1/2 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 max-w-[320px] items-center gap-2 rounded-full border border-border bg-card px-4 text-[14px] font-semibold text-[#C72B65] shadow-sm"
            >
              <span className="truncate">{agent.name}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSaved(true);
                window.setTimeout(() => setSaved(false), 1600);
              }}
              aria-label="Save flow"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-hover"
            >
              {saved ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              aria-label="Deploy agent"
              title="Deploy"
              onClick={() => setShowDeploymentSettings(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-hover"
            >
              <Rocket className="h-4 w-4" />
            </button>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={() => {
              setNodes((current) => current.map((node) => ({ ...node, selected: false })));
              setSelectedNodeId(null);
            }}
            onInit={(instance) => {
              requestAnimationFrame(async () => {
                await instance.fitView({
                  padding: isWorkAgent ? 0.1 : 0.02,
                  minZoom: 0.38,
                  maxZoom: 0.72,
                });
                const viewport = instance.getViewport();
                await instance.setViewport(
                  { ...viewport, y: viewport.y - (isWorkAgent ? 30 : 90) },
                  { duration: 0 },
                );
              });
            }}
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
              gap={18}
              size={1.2}
              color="rgba(148, 151, 166, 0.42)"
            />
            <MiniMap
              nodeColor={minimapColor}
              maskColor="rgba(247, 247, 249, 0.7)"
              className="!bottom-12 !right-4 !h-[92px] !w-[150px] !rounded-lg !border !border-border !bg-card !shadow-sm"
              pannable
              zoomable
            />
          </ReactFlow>

          {isWorkAgent && selectedNodeId === "work-send-message" && (
            <SendMessageConfigPanel
              onClose={() => {
                setSelectedNodeId(null);
                setNodes((current) =>
                  current.map((node) =>
                    node.id === "work-send-message" ? { ...node, selected: false } : node,
                  ),
                );
              }}
            />
          )}

          {selectedNodeId && selectedNodeData?.kind === "trigger" && (
            <TriggerConfigPanel
              onClose={() => {
                setSelectedNodeId(null);
                setNodes((current) =>
                  current.map((node) =>
                    node.id === selectedNodeId ? { ...node, selected: false } : node,
                  ),
                );
              }}
            />
          )}

          <LeftToolDock />
          <CanvasToolbar />

          <div className="absolute bottom-4 right-4 z-20 w-[150px] rounded-md border border-border bg-card px-2 py-1 font-mono text-[10px] text-muted-foreground shadow-sm">
            0.5
          </div>

          <button
            type="button"
            onClick={() => setRunning((value) => !value)}
            aria-label={running ? "Stop test conversation" : "Test conversation"}
            className={cn(
              "absolute bottom-4 left-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-[#18131B] shadow-lg transition",
              running ? "border-emerald-500" : "border-[#C72B65]",
            )}
          >
            {running ? (
              <Sparkles className="h-4 w-4 text-emerald-400" />
            ) : (
              <Bot className="h-5 w-5 text-[#F45A93]" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

type VoiceDirection = "outbound" | "inbound";

type VoiceChannel = {
  id: string;
  name: string;
  number?: string;
  provider: "Twilio" | "Exotel" | "SIP";
  direction: VoiceDirection | "both";
};

const VOICE_CHANNELS: VoiceChannel[] = [
  {
    id: "default-synthesizer",
    name: "Default Synthesizer",
    provider: "Twilio",
    direction: "outbound",
  },
  {
    id: "testing",
    name: "testing",
    provider: "Twilio",
    direction: "both",
  },
  {
    id: "exotel-test",
    name: "test",
    number: "+91 80471 10288",
    provider: "Exotel",
    direction: "outbound",
  },
  {
    id: "twilio-test-screen",
    name: "Twilio Test screen",
    number: "+1 415 523 8812",
    provider: "Twilio",
    direction: "both",
  },
  {
    id: "support-sip",
    name: "Support SIP Line",
    number: "99239293476",
    provider: "SIP",
    direction: "both",
  },
  {
    id: "sales-sip",
    name: "Sales SIP Line",
    number: "77777777",
    provider: "SIP",
    direction: "outbound",
  },
  {
    id: "sip-3-primary",
    name: "SIP-3",
    number: "999999921",
    provider: "SIP",
    direction: "inbound",
  },
  {
    id: "sip-3-secondary",
    name: "SIP-3 Backup",
    number: "666666666",
    provider: "SIP",
    direction: "inbound",
  },
  {
    id: "test21-primary",
    name: "test21",
    number: "+91 992392934",
    provider: "SIP",
    direction: "both",
  },
  {
    id: "test21-secondary",
    name: "test21 Backup",
    number: "992392934",
    provider: "SIP",
    direction: "inbound",
  },
];

const PROVIDER_TONES: Record<VoiceChannel["provider"], string> = {
  Twilio: "border-rose-200 bg-rose-50 text-rose-600",
  Exotel: "border-slate-200 bg-white text-slate-700",
  SIP: "border-sky-200 bg-sky-50 text-sky-700",
};

type InboundProvider = {
  id: string;
  name: string;
  tone: string;
};

const INBOUND_PROVIDERS: InboundProvider[] = [
  { id: "twilio", name: "Twilio", tone: "border-rose-200 bg-rose-50 text-rose-600" },
  { id: "exotel", name: "Exotel", tone: "border-slate-200 bg-white text-slate-700" },
  {
    id: "tata-teleservice",
    name: "Tata Teleservice Limited",
    tone: "border-blue-200 bg-blue-50 text-blue-700",
  },
  { id: "ozonetel", name: "Ozonetel", tone: "border-cyan-200 bg-cyan-50 text-cyan-700" },
  { id: "string", name: "string", tone: "border-amber-200 bg-amber-50 text-amber-700" },
  { id: "vi", name: "vi", tone: "border-red-200 bg-red-50 text-red-600" },
  {
    id: "sip-integration",
    name: "SIP Integration",
    tone: "border-sky-200 bg-sky-50 text-sky-700",
  },
];

function MultiVoiceDeploymentSettings({
  agent,
  onBack,
  onCreateChannel,
}: {
  agent: Agent;
  onBack: () => void;
  onCreateChannel: () => void;
}) {
  const [direction, setDirection] = useState<VoiceDirection>("outbound");
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [selectedInboundProvider, setSelectedInboundProvider] = useState<string | null>(null);
  const [inboundProviderOpen, setInboundProviderOpen] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const visibleChannels = VOICE_CHANNELS.filter(
    (channel) => channel.direction === direction || channel.direction === "both",
  );
  const inboundProvider = INBOUND_PROVIDERS.find(
    (provider) => provider.id === selectedInboundProvider,
  );

  const toggleChannel = (id: string) => {
    setSelectedChannels((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setDeployed(false);
  };

  return (
    <main className="min-h-0 flex-1 bg-[#FAFAFA] p-4 sm:p-5">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-[1800px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to flow builder"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-foreground transition hover:text-[#C72B65]"
          >
            <ArrowLeft className="h-4 w-4 text-[#C72B65]" />
            Deploy
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-4">
          <fieldset>
            <legend className="text-[13px] font-semibold text-[#333A50]">
              Choose type of the agent
            </legend>
            <div
              className="mt-2 grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="Call direction"
            >
              {(["outbound", "inbound"] as const).map((option) => {
                const checked = direction === option;
                const DirectionIcon = option === "outbound" ? PhoneOutgoing : PhoneIncoming;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => {
                      setDirection(option);
                      setSelectedChannels(new Set());
                      setSelectedInboundProvider(null);
                      setInboundProviderOpen(option === "inbound");
                      setDeployed(false);
                    }}
                    className={cn(
                      "inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-[14px] font-medium capitalize transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30",
                      checked
                        ? "border-[#C72B65] bg-[#FCEAF1] text-[#C72B65] shadow-[0_0_0_2px_rgba(199,43,101,0.09)]"
                        : "border-border bg-card text-[#333A50] hover:border-[#C72B65]/35 hover:bg-[#FDF8FA]",
                    )}
                  >
                    <DirectionIcon className="h-4 w-4" />
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {direction === "outbound" ? (
            <>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-[14px] font-semibold text-[#333A50]">Configure Channels</h2>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Select the channels where {agent.name} is required.
                  </p>
                </div>
                <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                  {visibleChannels.length} outbound channels
                </span>
              </div>

              <div className="mt-2 min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-[#FAFAFB] p-3 [scrollbar-color:#F2D6E1_transparent]">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={onCreateChannel}
                    className="flex min-h-[66px] items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#C72B65] bg-[#FDF8FA] text-[13px] font-medium text-[#C72B65] transition hover:bg-[#FCEAF1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30"
                  >
                    <Plus className="h-4 w-4" />
                    Create New
                  </button>

                  {visibleChannels.map((channel) => {
                    const checked = selectedChannels.has(channel.id);
                    return (
                      <button
                        key={channel.id}
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => toggleChannel(channel.id)}
                        className={cn(
                          "group flex min-h-[66px] items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30",
                          checked
                            ? "border-[#C72B65] bg-[#FDF8FA] shadow-[0_0_0_2px_rgba(199,43,101,0.07)]"
                            : "border-border hover:border-[#C72B65]/30 hover:shadow-sm",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                            PROVIDER_TONES[channel.provider],
                          )}
                        >
                          <Phone className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-[#333A50]">
                            {channel.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[10.5px] text-muted-foreground">
                            {channel.provider}
                            {channel.number ? ` · ${channel.number}` : ""}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                            checked
                              ? "border-[#C72B65] bg-[#C72B65] text-white"
                              : "border-slate-300 bg-card group-hover:border-[#C72B65]/50",
                          )}
                        >
                          {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-3 min-h-0 flex-1">
              <h2 className="text-[14px] font-semibold text-[#333A50]">Inbound</h2>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                Select the telephony provider from the supported Telephony list to fetch your bot
                inbound URL.
              </p>

              <div className="relative mt-2">
                <button
                  type="button"
                  role="combobox"
                  aria-label="Telephony provider"
                  aria-expanded={inboundProviderOpen}
                  aria-controls="inbound-provider-options"
                  onClick={() => setInboundProviderOpen((open) => !open)}
                  className={cn(
                    "flex h-11 w-full items-center justify-between rounded-xl border bg-card px-3 text-left text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/25",
                    inboundProviderOpen || inboundProvider
                      ? "border-[#C72B65]/50"
                      : "border-border hover:border-[#C72B65]/35",
                  )}
                >
                  <span
                    className={cn(
                      "flex min-w-0 items-center gap-2.5",
                      !inboundProvider && "text-muted-foreground",
                    )}
                  >
                    {inboundProvider && (
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                          inboundProvider.tone,
                        )}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <span className="truncate">{inboundProvider?.name ?? "Select options"}</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      inboundProviderOpen && "rotate-180",
                    )}
                  />
                </button>

                {inboundProviderOpen && (
                  <div
                    id="inbound-provider-options"
                    role="listbox"
                    aria-label="Supported telephony providers"
                    className="absolute inset-x-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-xl border border-border bg-card py-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]"
                  >
                    {INBOUND_PROVIDERS.map((provider) => {
                      const selected = provider.id === selectedInboundProvider;
                      return (
                        <button
                          key={provider.id}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => {
                            setSelectedInboundProvider(provider.id);
                            setInboundProviderOpen(false);
                            setDeployed(false);
                          }}
                          className={cn(
                            "flex h-10 w-full items-center gap-3 px-3 text-left text-[13px] text-[#333A50] transition hover:bg-[#FDF3F7]",
                            selected && "bg-[#FDF3F7]",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                              provider.tone,
                            )}
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{provider.name}</span>
                          {selected && (
                            <Check className="h-4 w-4 text-[#C72B65]" strokeWidth={2.5} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <div className="min-w-0">
              {deployed ? (
                <p
                  role="status"
                  className="flex items-center gap-2 text-[11.5px] font-medium text-emerald-700"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {direction === "inbound"
                    ? `Inbound setup requested from ${inboundProvider?.name}.`
                    : `Multi Voice agent deployed to ${selectedChannels.size} channel${selectedChannels.size === 1 ? "" : "s"}.`}
                </p>
              ) : (
                <p className="truncate text-[11.5px] text-muted-foreground">
                  {direction === "inbound"
                    ? inboundProvider
                      ? `${inboundProvider.name} selected`
                      : "Select a telephony provider to continue."
                    : selectedChannels.size > 0
                      ? `${selectedChannels.size} channel${selectedChannels.size === 1 ? "" : "s"} selected`
                      : "Select at least one outbound channel to deploy."}
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={
                direction === "inbound" ? !selectedInboundProvider : selectedChannels.size === 0
              }
              onClick={() => setDeployed(true)}
              className="inline-flex h-9 min-w-28 items-center justify-center gap-2 rounded-lg bg-[#C72B65] px-4 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#A92355] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/35 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              <Rocket className="h-3.5 w-3.5" />
              {direction === "inbound" ? "Continue" : "Deploy"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

type WebsiteConfiguration = {
  id: string;
  name: string;
  domain: string;
  sessions: number;
  logoUrl?: string;
};

const WEBSITE_CONFIGURATIONS: WebsiteConfiguration[] = [
  { id: "kaptureqa", name: "kaptureqa", domain: "autoqa.com", sessions: 1 },
  { id: "website-qa", name: "Website qa", domain: "www.abc.com", sessions: 1 },
  { id: "newqa", name: "newqa", domain: "autoqa.com", sessions: 1 },
  { id: "test", name: "test", domain: "weee.com", sessions: 1 },
  {
    id: "arun",
    name: "Arun Manickam R",
    domain: "https://rscviutwwgfcpbsdvnbj.supabase…",
    sessions: 4,
  },
  { id: "new-website-1", name: "New website", domain: "web.com", sessions: 1 },
  {
    id: "new-website-2",
    name: "new website",
    domain: "https://democrm.kapturecrm.com/",
    sessions: 1,
  },
];

function WebsiteDeploymentSettings({
  agent,
  onBack,
  onNext,
}: {
  agent: Agent;
  onBack: () => void;
  onNext: (website: WebsiteConfiguration) => void;
}) {
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [websiteConfigurations, setWebsiteConfigurations] = useState(WEBSITE_CONFIGURATIONS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [websiteName, setWebsiteName] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const selected = websiteConfigurations.find((website) => website.id === selectedWebsite);

  useEffect(() => {
    if (agent.type === "workflow" && websiteConfigurations.length > 0) {
      const firstWebsite = websiteConfigurations[0];
      onNext(firstWebsite);
    }
  }, []);

  const closeCreatePanel = () => {
    setIsCreateOpen(false);
    setWebsiteName("");
    setWebsiteLink("");
    setLogoUrl("");
  };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-[#FAFAFA] p-4 sm:p-5">
      <section className="mx-auto min-h-full w-full max-w-[1800px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex h-14 items-center border-b border-border px-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to flow builder"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-foreground transition hover:text-[#C72B65]"
          >
            <ArrowLeft className="h-4 w-4 text-[#C72B65]" />
            Deploy In Website
          </button>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-semibold text-[#333A50]">
                Choose one Website configuration from your list
              </h2>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Select where {agent.name} should be available to website visitors.
              </p>
            </div>
            <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
              {websiteConfigurations.length} configurations
            </span>
          </div>

          <div className="mt-3 max-h-[300px] overflow-y-auto rounded-xl bg-[#FAFAFB] p-3 [scrollbar-color:#F2D6E1_transparent]">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex min-h-[128px] items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#C72B65] bg-card text-[13px] font-medium text-[#C72B65] transition hover:bg-[#FDF3F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30"
              >
                <Plus className="h-4 w-4" />
                Create New
              </button>

              {websiteConfigurations.map((website) => {
                const checked = selectedWebsite === website.id;
                return (
                  <button
                    key={website.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setSelectedWebsite(website.id)}
                    className={cn(
                      "relative min-h-[128px] rounded-xl border bg-card p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30",
                      checked
                        ? "border-[#C72B65] shadow-[0_0_0_2px_rgba(199,43,101,0.10)]"
                        : "border-border hover:border-[#C72B65]/35 hover:shadow-sm",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full border",
                        checked
                          ? "border-[#C72B65] bg-[#C72B65] text-white"
                          : "border-slate-300 bg-card",
                      )}
                    >
                      {checked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Globe2 className="h-4 w-4" />
                    </span>
                    <p className="mt-2 truncate pr-6 text-[15px] font-medium text-[#333A50]">
                      {website.name}
                    </p>
                    <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                      {website.domain}
                    </p>
                    <div className="mt-2 border-t border-border pt-2 text-[12px] text-muted-foreground">
                      <span className="font-medium text-blue-600">{website.sessions}</span> Active
                      Sessions
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="min-w-0">
              {selected ? (
                <p className="truncate text-[11.5px] text-muted-foreground">
                  Selected: <span className="font-semibold text-foreground">{selected.name}</span>
                  <span className="mx-1.5">•</span>
                  {selected.domain}
                </p>
              ) : (
                <p className="text-[11.5px] text-muted-foreground">
                  Select a website configuration to continue.
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={!selectedWebsite}
              onClick={() => selected && onNext(selected)}
              className="inline-flex h-9 min-w-24 items-center justify-center gap-1.5 rounded-lg bg-[#C72B65] px-4 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#A92355] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/35 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
          <button
            type="button"
            aria-label="Close website configuration"
            onClick={closeCreatePanel}
            className="absolute inset-0 cursor-default bg-slate-950/45"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="website-configuration-title"
            className="relative z-10 flex h-full w-full max-w-[470px] flex-col bg-card shadow-[-12px_0_36px_rgba(15,23,42,0.18)]"
          >
            <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-border px-5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Globe2 className="h-[18px] w-[18px]" />
                </span>
                <h2
                  id="website-configuration-title"
                  className="truncate text-[18px] font-semibold text-[#333A50]"
                >
                  Website Configuration
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={closeCreatePanel}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition hover:bg-hover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={(event) => {
                event.preventDefault();
                const name = websiteName.trim();
                if (!name) return;

                const createdWebsite: WebsiteConfiguration = {
                  id: `website-${Date.now()}`,
                  name,
                  domain: websiteLink.trim() || "Website link not provided",
                  sessions: 0,
                  logoUrl: logoUrl.trim() || undefined,
                };

                onNext(createdWebsite);
              }}
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
                <h3 className="text-[15px] font-semibold text-[#333A50]">Configure</h3>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Fill out your required website integration details below.
                </p>

                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="text-[12px] font-medium text-[#333A50]">
                      Name <span className="text-[#C72B65]">*</span>
                    </span>
                    <input
                      autoFocus
                      required
                      value={websiteName}
                      onChange={(event) => setWebsiteName(event.target.value)}
                      placeholder="Enter the website name"
                      className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-3 text-[12px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[#C72B65] focus:ring-2 focus:ring-[#C72B65]/10"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[12px] font-medium text-[#333A50]">Website Link</span>
                    <input
                      type="text"
                      inputMode="url"
                      value={websiteLink}
                      onChange={(event) => setWebsiteLink(event.target.value)}
                      placeholder="Enter the website link"
                      className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-3 text-[12px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[#C72B65] focus:ring-2 focus:ring-[#C72B65]/10"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[12px] font-medium text-[#333A50]">Logo</span>
                    <span className="relative mt-2 block">
                      <input
                        type="text"
                        inputMode="url"
                        value={logoUrl}
                        onChange={(event) => setLogoUrl(event.target.value)}
                        placeholder="Enter the logo URL"
                        className="h-10 w-full rounded-lg border border-border bg-card px-3 pr-10 text-[12px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[#C72B65] focus:ring-2 focus:ring-[#C72B65]/10"
                      />
                      <Upload className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex shrink-0 justify-end gap-3 border-t border-border px-5 py-5">
                <button
                  type="button"
                  onClick={closeCreatePanel}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-4 text-[12px] font-medium text-[#C72B65] transition hover:bg-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!websiteName.trim()}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[#C72B65] bg-[#FDF3F7] px-4 text-[12px] font-medium text-[#C72B65] transition hover:bg-[#FBE6EE] disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
                >
                  Submit
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </main>
  );
}

export const FLOW_VERSION = "1.5.4";

export function ConversationFlowBuilder(props: {
  agent: Agent;
  workspaceName: string;
  onBack: () => void;
  onCreateChannel: () => void;
  onWebsiteSelected: (website: { name: string; domain: string }) => void;
}) {
  return (
    <ReactFlowProvider>
      <BuilderInner {...props} />
    </ReactFlowProvider>
  );
}
