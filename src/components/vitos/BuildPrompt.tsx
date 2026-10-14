import { useState } from "react";
import {
  Asterisk,
  Bot,
  ChevronDown,
  Crown,
  GitFork,
  History,
  Save,
  ShieldCheck,
  WandSparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PromptAgent = {
  id: string;
  name: string;
  role: "Agent" | "Sub agent";
  main?: boolean;
  prompt: string;
};

const SEED_AGENTS: PromptAgent[] = [
  {
    id: "conversation",
    name: "Conversation AI Node",
    role: "Agent",
    main: true,
    prompt: `You are the Primary Agent for "test-123", a simple appointment-booking voice bot. Your job is to greet the caller, understand their intent through natural conversation, and route them appropriately.

RESPONSIBILITY:
- Answer the call with a warm, brief greeting (e.g., "Hi, thanks for calling test-123! How can I help you today?").
- Engage in general conversation to understand what the caller needs.
- Identify as quickly as possible whether the caller wants to book, reschedule, cancel, or otherwise manage an appointment.
- You do not have tools or knowledge bases of your own for scheduling tasks; you exist only to greet, triage, and hand off.
- Do not attempt to collect detailed appointment information yourself (date, time, service specifics) — that is the scheduling sub-agent's job. Keep your own turns short and focused on identifying intent.

HANDOFF RULES:
- As soon as the caller expresses any intent to book, reschedule, or manage an appointment, immediately hand off the conversation to the "scheduling_agent". Do not delay the handoff by trying to gather appointment details yourself.
- You may only hand off to "scheduling_agent". No other agent handoff target exists or is permitted.
- Once you hand off to the scheduling_agent, you do not expect or receive control back from it — the scheduling_agent is terminal and will end the call itself after booking is complete.
- If the caller's request is unrelated to appointment booking and cannot be resolved by simple greeting/small talk, politely clarify that this bot's purpose is appointment booking and try to redirect the conversation toward scheduling; if the caller has no scheduling need, politely close the conversation.

BEHAVIORAL BOUNDARIES:
- Do not invent, promise, or perform appointment bookings, cancellations, or rescheduling yourself — these actions belong exclusively to the scheduling_agent.
- Do not claim access to tools or knowledge bases; you have none assigned.
- Keep every reply to one or two short sentences, in the caller's language.`,
  },
  {
    id: "scheduling",
    name: "Scheduling Agent MA 1cc183…",
    role: "Sub agent",
    prompt: `You are the Scheduling Agent for "test-123". You receive the call from the primary agent once the caller wants to book, reschedule or cancel an appointment.

RESPONSIBILITY:
- Confirm the service the caller needs, then collect a preferred date and time.
- Offer the nearest available slots and confirm the final choice back to the caller.
- Reschedule or cancel an existing appointment when asked, after confirming the booking reference.

CLOSING THE CALL:
- Once the appointment is confirmed, summarise it in one sentence and end the call politely.
- You are terminal: never hand the conversation back to the primary agent.

BEHAVIORAL BOUNDARIES:
- Never offer a slot that was not returned by the calendar tool.
- If no slot works, offer to take a callback request instead of guessing.`,
  },
];

const MODEL_OPTIONS = [
  { id: "haiku", label: "Claude Haiku 4.5 (Fast)" },
  { id: "sonnet", label: "Claude Sonnet 5.5 (Balanced)" },
  { id: "opus", label: "Claude Opus 5.5 (Most capable)" },
];

const hideScrollbar = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const iconButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30 disabled:cursor-not-allowed disabled:opacity-40";

export function BuildPromptView() {
  const [saved, setSaved] = useState<Record<string, string>>(() =>
    Object.fromEntries(SEED_AGENTS.map((agent) => [agent.id, agent.prompt])),
  );
  const [drafts, setDrafts] = useState<Record<string, string>>(saved);
  const [selectedId, setSelectedId] = useState(SEED_AGENTS[0].id);
  const [model, setModel] = useState(MODEL_OPTIONS[0].id);

  const selected = SEED_AGENTS.find((agent) => agent.id === selectedId) ?? SEED_AGENTS[0];
  const dirtyIds = SEED_AGENTS.filter((agent) => drafts[agent.id] !== saved[agent.id]).map(
    (agent) => agent.id,
  );
  const dirty = dirtyIds.length > 0;
  const selectedDirty = dirtyIds.includes(selected.id);
  const currentModel = MODEL_OPTIONS.find((option) => option.id === model);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-0 flex-1 md:grid-cols-[260px_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]">
        <aside
          aria-label="Agent tree"
          className="flex min-h-0 flex-col border-b border-border md:border-b-0 md:border-r"
        >
          <div className="flex shrink-0 items-center gap-2.5 border-b border-border bg-muted/30 px-4 py-3">
            <GitFork className="h-4 w-4 text-[#C72B65]" />
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-foreground">Agent Tree</p>
              <p className="text-[11px] text-muted-foreground">{SEED_AGENTS.length} agents</p>
            </div>
          </div>
          <div className={cn("min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3", hideScrollbar)}>
            {SEED_AGENTS.map((agent) => {
              const active = agent.id === selected.id;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedId(agent.id)}
                  aria-current={active}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30",
                    active
                      ? "border-[#C72B65]/40 bg-[#FBE7EF]/60"
                      : "border-transparent hover:bg-muted/60",
                  )}
                >
                  {agent.main ? (
                    <Crown className="h-4 w-4 shrink-0 text-[#C72B65]" />
                  ) : (
                    <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[13px]",
                        active ? "font-semibold text-foreground" : "font-medium text-foreground/90",
                      )}
                    >
                      {agent.name}
                    </span>
                    <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {agent.role}
                    </span>
                  </span>
                  {dirtyIds.includes(agent.id) && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                      title="Unsaved changes"
                    />
                  )}
                  {agent.main && (
                    <span className="shrink-0 rounded-md border border-[#C72B65]/30 bg-card px-1.5 py-px text-[11px] font-semibold text-[#C72B65]">
                      MAIN
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col">
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-3">
            <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground">
              <span className="h-2 w-2 rounded-full bg-[#C72B65]/60" />
              Your prompt
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setSaved((current) => ({ ...current, [selected.id]: drafts[selected.id] }))
                }
                disabled={!selectedDirty}
                aria-label="Save this prompt"
                title="Save this prompt"
                className={iconButton}
              >
                <Save className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Version history"
                title="Version history"
                className={iconButton}
              >
                <History className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <textarea
            key={selected.id}
            value={drafts[selected.id]}
            onChange={(event) =>
              setDrafts((current) => ({ ...current, [selected.id]: event.target.value }))
            }
            spellCheck={false}
            aria-label={`Prompt for ${selected.name}`}
            className={cn(
              "min-h-0 flex-1 resize-none bg-transparent px-5 pb-4 text-[13px] leading-[1.7] text-foreground outline-none",
              hideScrollbar,
            )}
          />
        </section>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-border px-4 py-2.5">
        <button
          type="button"
          onClick={() => setSaved(drafts)}
          disabled={!dirty}
          className="inline-flex h-9 w-[236px] items-center justify-center gap-2 rounded-lg bg-[#C72B65] text-[13px] font-medium text-white shadow-sm transition hover:bg-[#A92355] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/40 disabled:cursor-not-allowed disabled:bg-[#C72B65]/35 disabled:shadow-none"
        >
          <Save className="h-3.5 w-3.5" />
          Save all{dirtyIds.length > 1 ? ` (${dirtyIds.length})` : ""}
        </button>

        <div className="relative flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[13px] text-foreground shadow-sm transition focus-within:ring-2 focus-within:ring-[#C72B65]/15 hover:border-foreground/20">
          <Asterisk className="h-3.5 w-3.5 shrink-0 text-[#D97757]" strokeWidth={2.5} />
          <span>{currentModel?.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            aria-label="Model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {MODEL_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <span className="flex-1" />

        <button
          type="button"
          aria-label="Refine prompt"
          className="group inline-flex h-9 items-center rounded-lg border border-border bg-card px-[9px] text-foreground shadow-sm transition-[background-color,border-color,color] duration-200 hover:border-[#C72B65]/35 hover:bg-[#FBE7EF] hover:text-[#C72B65] focus:outline-none focus-visible:border-[#C72B65]/35 focus-visible:bg-[#FBE7EF] focus-visible:text-[#C72B65] focus-visible:ring-2 focus-visible:ring-[#C72B65]/30"
        >
          <WandSparkles className="h-4 w-4 shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-[13px] font-semibold opacity-0 transition-[max-width,opacity,margin] duration-200 ease-out group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-[100px] group-focus-visible:opacity-100 motion-reduce:transition-none">
            Refine Prompt
          </span>
        </button>
        <div className="inline-flex h-9 overflow-hidden rounded-lg bg-[#C72B65] text-white shadow-sm">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 text-[13px] font-medium transition hover:bg-[#A92355] focus:outline-none focus-visible:bg-[#A92355]"
          >
            <Zap className="h-3.5 w-3.5" />
            Optimize
          </button>
          <button
            type="button"
            aria-label="Optimization checks"
            title="Optimization checks"
            className="inline-flex w-9 items-center justify-center border-l border-white/25 transition hover:bg-[#A92355] focus:outline-none focus-visible:bg-[#A92355]"
          >
            <ShieldCheck className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
