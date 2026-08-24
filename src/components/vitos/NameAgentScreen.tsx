import { useEffect, useState } from "react";
import buildLogo from "@/assets/build-logo.png";
import { ArrowLeft, Cpu, Wand2, UserCog, Zap, Bot, MoreHorizontal, Check } from "lucide-react";

export type NameAgentVariant = "workflow" | "copilot";
export type CopilotSubtype = "copilot" | "copilot-actions" | "agent-initiated" | "other";

interface Props {
  variant?: NameAgentVariant;
  onProceed?: (data: { name: string; description: string; subtype?: CopilotSubtype }) => void;
  onBack?: () => void;
}

const PINK = "#c0386b";

export function NameAgentScreen({ variant = "workflow", onProceed, onBack }: Props) {
  const isCopilot = variant === "copilot";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subtype, setSubtype] = useState<CopilotSubtype | null>(isCopilot ? "copilot" : null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const trimmedName = name.trim();
  const canProceed = trimmedName.length > 0 && (!isCopilot || !!subtype);

  const badge = isCopilot
    ? {
        Icon: Wand2,
        label: "Copilot agent",
        color: "text-amber-700",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      }
    : {
        Icon: Cpu,
        label: "Workflow agent",
        color: "text-sky-700",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
      };

  return (
    <div className={`mx-auto w-full max-w-2xl px-2 ${mounted ? "animate-fade-up" : "opacity-0"}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1 -ml-2 text-sm text-muted-foreground transition hover:bg-hover hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}
      <img src={buildLogo} alt="Build" className="mb-4 h-10 w-10" />
      <div
        className={`mb-3 inline-flex items-center gap-1.5 rounded-full border ${badge.border} ${badge.bg} px-2.5 py-1 text-[11px] font-medium ${badge.color}`}
      >
        <badge.Icon className="h-3 w-3" />
        {badge.label}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        What would you like to name your agent?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Give it a name your team will recognise. You can tweak everything else once you're inside
        the builder.
      </p>

      <div className="mt-8 space-y-4">
        <div>
          <label htmlFor="agent-name" className="block text-sm font-semibold text-foreground">
            Agent name
          </label>
          <input
            id="agent-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 60))}
            maxLength={60}
            autoFocus
            placeholder={isCopilot ? "e.g. Sales deck sidekick" : "e.g. Refund resolver"}
            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {isCopilot && (
          <div>
            <label className="block text-sm font-semibold text-foreground">Sub type</label>
            <p className="mt-1 text-[12px] text-muted-foreground">
              How much rope does this agent get? You can change this later.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  key: "copilot" as const,
                  label: "Copilot",
                  hint: "Suggests and drafts — a human confirms before it acts",
                  Icon: UserCog,
                  color: "#c0386b",
                  bg: "rgba(192,56,107,0.10)",
                },
                {
                  key: "copilot-actions" as const,
                  label: "Copilot Actions",
                  hint: "Executes specific actions on behalf of the user with approval",
                  Icon: Zap,
                  color: "#0ea5e9",
                  bg: "rgba(14,165,233,0.10)",
                },
                {
                  key: "agent-initiated" as const,
                  label: "Agent Initiated Copilot",
                  hint: "Agent kicks off proactively and loops in a human when needed",
                  Icon: Bot,
                  color: "#7c3aed",
                  bg: "rgba(124,58,237,0.10)",
                },
                {
                  key: "other" as const,
                  label: "Other",
                  hint: "Custom setup — configure behaviour inside the builder",
                  Icon: MoreHorizontal,
                  color: "#64748b",
                  bg: "rgba(100,116,139,0.10)",
                },
              ].map(({ key, label, hint, Icon, color, bg }) => {
                const isSel = subtype === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSubtype(key)}
                    className={`group relative flex items-start gap-3 rounded-xl bg-white p-3.5 text-left transition-all duration-200 ${
                      isSel ? "shadow-md -translate-y-0.5" : "hover:shadow-sm hover:-translate-y-px"
                    }`}
                    style={{ border: isSel ? `1.5px solid ${PINK}` : "0.5px solid hsl(0 0% 90%)" }}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: bg, color }}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold leading-tight text-foreground">
                        {label}
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                        {hint}
                      </span>
                    </span>
                    {isSel && (
                      <span
                        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-white"
                        style={{ background: PINK }}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div>
          <label htmlFor="agent-desc" className="block text-sm font-semibold text-foreground">
            Short description <span className="font-normal text-muted-foreground">— optional</span>
          </label>
          <textarea
            id="agent-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 280))}
            maxLength={280}
            rows={3}
            placeholder={
              isCopilot
                ? "One line about what this copilot will help with."
                : "One line about what this workflow will handle."
            }
            className="mt-2 w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end">
        <button
          type="button"
          onClick={() =>
            canProceed &&
            onProceed?.({
              name: trimmedName,
              description: description.trim(),
              subtype: isCopilot ? (subtype ?? undefined) : undefined,
            })
          }
          disabled={!canProceed}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition active:scale-[0.99] ${
            canProceed
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "bg-[#B22257]/30 text-[#F0CEDB]/70 cursor-not-allowed"
          }`}
          style={canProceed ? { backgroundColor: PINK } : undefined}
        >
          Let's build
        </button>
      </div>
    </div>
  );
}
