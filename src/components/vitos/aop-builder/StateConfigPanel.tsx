import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  GripVertical,
  Pencil,
  Scale,
  Search,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import type { StateNode } from "./data";

type Frequency = "immediate" | "fixed" | "after";

interface Props {
  state: StateNode;
  onClose: () => void;
}

function shortId() {
  return `${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 6)}-${Math.random().toString(16).slice(2, 6)}...`;
}

const AVAILABLE_AGENTS = [
  "HITL Letter Signature Agent",
  "HITL Underwriter Approval Agent",
  "WhatsApp Payment Success Agent for collections",
  "Test Webhook",
  "WhatsApp Fallback Agent (PTP Broke)",
  "Field Allocation Agent",
  "Strict Recovery Agent",
  "WhatsApp Fallback Agent (DPD +10)",
  "WhatsApp Fallback Agent (DPD +5)",
  "WhatsApp Fallback Agent (DPD +1)",
  "PTP Trigger & Monitor",
  "Lead Verification Agent",
  "Document Collection Agent",
  "Reminder Agent 24H",
  "KYC Confirmation Agent",
  "Credit Assessment Agent",
  "Customer Notification Agent",
  "Sanction Letter Agent",
  "Rejection Notification Agent",
  "Loan Account Creation Agent",
];

export function StateConfigPanel({ state, onClose }: Props) {
  const [freq, setFreq] = useState<Frequency>("immediate");
  const [showSchedule, setShowSchedule] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const nextRuleIndex = state.children.length + 1;
  const ruleIds = useMemo(() => state.children.map(() => shortId()), [state.children]);

  const filteredAgents = useMemo(
    () =>
      AVAILABLE_AGENTS.filter((a) => a.toLowerCase().includes(agentSearch.trim().toLowerCase())),
    [agentSearch],
  );

  const toggleAgent = (name: string) => {
    setSelectedAgents((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name],
    );
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const freqCopy: Record<Frequency, string> = {
    immediate: "Run as soon as the rule triggers.",
    fixed: "Run on a fixed recurring schedule.",
    after: "Run once, after a specific delay following the trigger.",
  };

  return (
    <aside
      className="flex w-[380px] shrink-0 flex-col overflow-hidden bg-card animate-slide-in-right"
      style={{ animation: "slideInRight 220ms cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(24px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Scale className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">
          Schedule agent
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="text-[13px] font-semibold text-foreground">{state.name}</div>

        {/* Existing rules */}
        <div className="mt-3 space-y-2">
          {state.children.map((r, i) => (
            <div key={r.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center gap-2">
                <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 truncate text-[13px] font-semibold text-foreground">
                  Rule {i + 1}
                </span>
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-hover hover:text-foreground"
                  aria-label="Edit rule"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-hover hover:text-rose-600"
                  aria-label="Delete rule"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                triggers every after state changes
              </div>
              <div className="mt-1.5 rounded-md bg-muted/50 px-2 py-1 font-mono text-[10.5px] text-muted-foreground">
                {ruleIds[i]}
              </div>
            </div>
          ))}
        </div>

        {showSchedule && (
          <div className="mt-4 rounded-xl border border-border bg-background p-3">
            {/* Schedule agent N */}
            <div className="text-[13px] font-semibold text-foreground">
              Schedule agent {nextRuleIndex}
            </div>

            {/* Select AI Agents (step 1) */}
            <div className="mt-3">
              <div className="text-[12.5px] font-semibold text-foreground">
                Select AI Agents <span className="text-primary">*</span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                Drag to reorder priority. #1 = highest priority.
              </p>
              <button
                type="button"
                onClick={() => setAgentsOpen((v) => !v)}
                className="mt-2 flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[12.5px] text-foreground transition hover:bg-hover"
              >
                <span className={selectedAgents.length === 0 ? "text-muted-foreground" : ""}>
                  {selectedAgents.length === 0
                    ? "Select options"
                    : `${selectedAgents.length} agent${selectedAgents.length > 1 ? "s" : ""} selected`}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${agentsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {agentsOpen && (
                <div className="mt-2 overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={agentSearch}
                      onChange={(e) => setAgentSearch(e.target.value)}
                      placeholder="Search agents..."
                      className="flex-1 bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {filteredAgents.length === 0 ? (
                      <div className="px-3 py-2 text-[12px] text-muted-foreground">
                        No agents found
                      </div>
                    ) : (
                      filteredAgents.map((agent) => {
                        const active = selectedAgents.includes(agent);
                        return (
                          <button
                            key={agent}
                            type="button"
                            onClick={() => toggleAgent(agent)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12.5px] text-foreground transition hover:bg-hover"
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background"
                              }`}
                            >
                              {active && <Check className="h-3 w-3" />}
                            </span>
                            <span className="truncate">{agent}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {selectedAgents.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {selectedAgents.map((agent, i) => (
                    <li
                      key={agent}
                      className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5"
                    >
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10.5px] font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate text-[12px] text-foreground">{agent}</span>
                      <button
                        type="button"
                        onClick={() => toggleAgent(agent)}
                        aria-label={`Remove ${agent}`}
                        className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition hover:bg-hover hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Frequency (step 2) */}
            <div className="mt-4">
              <div className="text-[11.5px] font-medium text-foreground">
                Frequency <span className="text-primary">*</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <FrequencyChip
                  icon={<Zap className="h-3.5 w-3.5" />}
                  label="Immediate"
                  active={freq === "immediate"}
                  onClick={() => setFreq("immediate")}
                />
                <FrequencyChip
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Fixed"
                  active={freq === "fixed"}
                  onClick={() => setFreq("fixed")}
                />
                <FrequencyChip
                  icon={<CalendarDays className="h-3.5 w-3.5" />}
                  label="After"
                  active={freq === "after"}
                  onClick={() => setFreq("after")}
                />
              </div>
              <p className="mt-2 text-[11.5px] text-muted-foreground">{freqCopy[freq]}</p>
            </div>

            {/* Card actions */}
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowSchedule(false)}
                className="rounded-lg border border-border bg-background px-3.5 py-1.5 text-[13px] font-medium text-foreground transition hover:bg-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowSchedule(false)}
                className="rounded-lg bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Add Schedule button */}
        <button
          type="button"
          onClick={() => setShowSchedule(true)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12.5px] font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
        >
          <span className="text-base leading-none">+</span> Add Schedule
        </button>
      </div>
    </aside>
  );
}

function FrequencyChip({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-[12px] font-medium transition ${
        active
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border bg-background text-foreground hover:bg-hover"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
