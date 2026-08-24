export type Health = "good" | "warn" | "alert" | "neutral";
export type NodeKind = "root" | "state" | "rule" | "agent";
export type AgentKind = "Conversational" | "Workflow" | "Agent-as-API";

export interface AgentNode {
  id: string;
  type: "agent";
  name: string;
  kind: AgentKind;
  prio: string;
}
export interface RuleNode {
  id: string;
  type: "rule";
  name: string;
  trigger: string;
  prio: string;
  children: AgentNode[];
}
export interface StateNode {
  id: string;
  type: "state";
  name: string;
  health: Health;
  children: RuleNode[];
}
export interface RootNode {
  id: string;
  type: "root";
  name: string;
  sub: string;
  chips: string[];
  children: StateNode[];
}

export const ORCHESTRATOR: RootNode = {
  id: "root",
  type: "root",
  name: "bank_loan_leads",
  sub: "Orchestrator",
  chips: ["Voice", "Concurrent"],
  children: [
    {
      id: "s1",
      type: "state",
      name: "Lead Captured",
      health: "good",
      children: [
        {
          id: "r1",
          type: "rule",
          name: "Form Drop-Off",
          trigger: "immediately",
          prio: "P1",
          children: [
            {
              id: "a1",
              type: "agent",
              name: "Lead Verification Agent",
              kind: "Conversational",
              prio: "P1",
            },
          ],
        },
      ],
    },
    {
      id: "s2",
      type: "state",
      name: "Application Submitted",
      health: "neutral",
      children: [
        {
          id: "r2",
          type: "rule",
          name: "New Application",
          trigger: "immediately",
          prio: "P1",
          children: [
            {
              id: "a2",
              type: "agent",
              name: "Document Collection Agent",
              kind: "Workflow",
              prio: "P1",
            },
            { id: "a3", type: "agent", name: "Reminder Agent 24H", kind: "Workflow", prio: "P2" },
          ],
        },
      ],
    },
    {
      id: "s3",
      type: "state",
      name: "Document Collection",
      health: "warn",
      children: [
        {
          id: "r3",
          type: "rule",
          name: "Docs Pending",
          trigger: "immediately",
          prio: "P1",
          children: [
            {
              id: "a4",
              type: "agent",
              name: "Document Collection Agent",
              kind: "Workflow",
              prio: "P1",
            },
            { id: "a5", type: "agent", name: "Reminder Agent 24H", kind: "Workflow", prio: "P2" },
          ],
        },
      ],
    },
    {
      id: "s4",
      type: "state",
      name: "Documents Failed",
      health: "alert",
      children: [
        {
          id: "r4",
          type: "rule",
          name: "Retry Collection",
          trigger: "immediately",
          prio: "P1",
          children: [
            {
              id: "a6",
              type: "agent",
              name: "Document Collection Agent",
              kind: "Workflow",
              prio: "P1",
            },
            { id: "a7", type: "agent", name: "Reminder Agent 24H", kind: "Workflow", prio: "P2" },
          ],
        },
      ],
    },
    {
      id: "s5",
      type: "state",
      name: "Verification In Progress",
      health: "neutral",
      children: [
        {
          id: "r5",
          type: "rule",
          name: "Run KYC",
          trigger: "immediately",
          prio: "P1",
          children: [
            {
              id: "a8",
              type: "agent",
              name: "KYC Confirmation Agent",
              kind: "Agent-as-API",
              prio: "P1",
            },
            {
              id: "a9",
              type: "agent",
              name: "Credit Assessment Agent",
              kind: "Agent-as-API",
              prio: "P2",
            },
          ],
        },
      ],
    },
    {
      id: "s6",
      type: "state",
      name: "Underwriting",
      health: "neutral",
      children: [
        {
          id: "r6",
          type: "rule",
          name: "Assess Risk",
          trigger: "immediately",
          prio: "P1",
          children: [
            {
              id: "a10",
              type: "agent",
              name: "Customer Notification Agent",
              kind: "Workflow",
              prio: "P1",
            },
            {
              id: "a11",
              type: "agent",
              name: "HITL Underwriter Agent",
              kind: "Conversational",
              prio: "P2",
            },
          ],
        },
      ],
    },
    {
      id: "s7",
      type: "state",
      name: "Loan Approved",
      health: "good",
      children: [
        {
          id: "r7",
          type: "rule",
          name: "On Approval",
          trigger: "immediately",
          prio: "P1",
          children: [
            {
              id: "a12",
              type: "agent",
              name: "Sanction Letter Agent",
              kind: "Workflow",
              prio: "P1",
            },
          ],
        },
      ],
    },
    {
      id: "s8",
      type: "state",
      name: "Loan Rejected",
      health: "alert",
      children: [
        {
          id: "r8",
          type: "rule",
          name: "On Rejection",
          trigger: "immediately",
          prio: "P1",
          children: [
            {
              id: "a13",
              type: "agent",
              name: "Rejection Notification Agent",
              kind: "Workflow",
              prio: "P1",
            },
          ],
        },
      ],
    },
    {
      id: "s9",
      type: "state",
      name: "Sanction Sent",
      health: "neutral",
      children: [
        {
          id: "r9",
          type: "rule",
          name: "Await Signature",
          trigger: "immediately",
          prio: "P1",
          children: [
            {
              id: "a14",
              type: "agent",
              name: "HITL Letter Signature Agent",
              kind: "Conversational",
              prio: "P1",
            },
          ],
        },
      ],
    },
    {
      id: "s10",
      type: "state",
      name: "Loan Disbursed",
      health: "good",
      children: [
        {
          id: "r10",
          type: "rule",
          name: "Create Account",
          trigger: "immediately",
          prio: "P1",
          children: [
            {
              id: "a15",
              type: "agent",
              name: "Loan Account Creation Agent",
              kind: "Agent-as-API",
              prio: "P1",
            },
          ],
        },
      ],
    },
    { id: "s11", type: "state", name: "All State", health: "good", children: [] },
  ],
};

export const HEALTH_DOT: Record<Health, string> = {
  good: "bg-emerald-500 ring-emerald-500/20",
  warn: "bg-amber-500 ring-amber-500/20",
  alert: "bg-rose-500 ring-rose-500/20",
  neutral: "bg-muted-foreground/50 ring-muted-foreground/15",
};
