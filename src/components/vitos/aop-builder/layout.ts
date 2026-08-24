import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import { ORCHESTRATOR, type AgentNode, type RootNode, type RuleNode, type StateNode } from "./data";

// Single source of truth for rule card sizing — mirrored by the RuleNode render.
export const AGENT_W = 210;
export const AGENT_GAP = 14;
export const RULE_PAD = 14;
export const RULE_HEIGHT = 148;
export const ruleWidth = (agentCount: number) =>
  RULE_PAD * 2 + agentCount * AGENT_W + Math.max(agentCount - 1, 0) * AGENT_GAP;

const ROOT_SIZE = { width: 216, height: 92 };
const STATE_SIZE = { width: 210, height: 88 };

export interface FlatNodeData {
  name: string;
  sub?: string;
  chips?: string[];
  health?: StateNode["health"];
  agentCount?: number;
  ruleCount?: number;
  trigger?: string;
  prio?: string;
  kind?: AgentNode["kind"];
  parentStateId?: string;
  width?: number;
  height?: number;
  ruleIndex?: number;
  agents?: AgentNode[];
  [key: string]: unknown;
}

export function buildGraph(root: RootNode = ORCHESTRATOR): {
  nodes: Node<FlatNodeData>[];
  edges: Edge[];
} {
  // Three visual ranks: root → state → rule (rule renders its agents inline).
  const nodes: Node<FlatNodeData>[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: root.id,
    type: "root",
    position: { x: 0, y: 0 },
    data: { name: root.name, sub: root.sub, chips: [...root.chips] },
  });

  for (const state of [...root.children].reverse()) {
    const agentCount = state.children.reduce((n, r) => n + r.children.length, 0);
    nodes.push({
      id: state.id,
      type: "state",
      position: { x: 0, y: 0 },
      data: {
        name: state.name,
        health: state.health,
        agentCount,
        ruleCount: state.children.length,
        stateId: state.id,
      },
    });
    edges.push({ id: `${root.id}-${state.id}`, source: root.id, target: state.id });

    state.children.forEach((rule, ri) => {
      const w = ruleWidth(Math.max(1, rule.children.length));
      nodes.push({
        id: rule.id,
        type: "rule",
        position: { x: 0, y: 0 },
        data: {
          name: rule.name,
          trigger: rule.trigger,
          health: state.health,
          ruleIndex: ri + 1,
          agents: rule.children,
          width: w,
          height: RULE_HEIGHT,
          parentStateId: state.id,
        },
        style: { width: w },
      });
      edges.push({
        id: `${state.id}-${rule.id}`,
        source: state.id,
        target: rule.id,
        label: rule.trigger,
      });
    });
  }

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB",
    nodesep: 80,
    ranksep: 130,
    marginx: 40,
    marginy: 40,
    ranker: "network-simplex",
  });
  g.setDefaultEdgeLabel(() => ({}));

  const sizeFor = (n: Node<FlatNodeData>) => {
    if (n.type === "root") return ROOT_SIZE;
    if (n.type === "state") return STATE_SIZE;
    return { width: n.data.width ?? 240, height: n.data.height ?? RULE_HEIGHT };
  };

  for (const n of nodes) {
    const s = sizeFor(n);
    g.setNode(n.id, { width: s.width, height: s.height });
  }
  for (const e of edges) g.setEdge(e.source, e.target);

  dagre.layout(g);

  const positioned = nodes.map((n) => {
    const d = g.node(n.id);
    const s = sizeFor(n);
    return { ...n, position: { x: d.x - s.width / 2, y: d.y - s.height / 2 } };
  });

  return { nodes: positioned, edges };
}
