import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Bot, Check, Plus, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Setup screen scale (shared with TestSetupCard in PromptPlayground):
 *   type     11 caps eyebrow · 12 helper/meta · 13 body, labels, controls · 14 sub-titles · 16 card title
 *   radius   8px controls and chips · 12px cards · full only for status dots and avatars
 *   height   36px inputs and buttons · 32px choice chips
 *   colour   brand only for the primary action, selected/active state and focus; everything else neutral
 */

type Fact = { id: number; label: string; value: string };

type Config = {
  goal: string;
  facts: Fact[];
  mood: string;
  difficulty: string;
  success: string;
  constraints: string[];
  length: string;
  formality: string;
  grammar: string;
  language: string;
  locale: string;
};

const MOODS = ["Calm", "Polite", "Confused", "Frustrated", "Impatient"];

const DIFFICULTIES = [
  { value: "Cooperative", hint: "Answers readily and accepts reasonable solutions." },
  { value: "Normal", hint: "Asks follow-ups and expects clear answers." },
  {
    value: "Demanding",
    hint: "Won't take no. Pushes back on deflections and keeps pursuing the goal.",
  },
];

const CONSTRAINT_IDEAS = ["Insist on a refund", "Never share an OTP", "Pretend you're in a hurry"];

const LOCALES = ["en-IN", "en-GB", "en-US", "hi-IN"];

const STEPS = [
  { key: "objective", label: "Objective" },
  { key: "facts", label: "Facts" },
  { key: "personality", label: "Personality" },
  { key: "style", label: "Style" },
] as const;

const initialConfig = (): Config => ({
  goal: "",
  facts: [{ id: 1, label: "", value: "" }],
  mood: "Calm",
  difficulty: "Normal",
  success: "",
  constraints: [],
  length: "Brief",
  formality: "Casual",
  grammar: "Proper",
  language: "English",
  locale: "en-IN",
});

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30 focus-visible:ring-offset-1";

const inputBase =
  "w-full rounded-lg border border-border bg-card text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-foreground/20 focus:border-[#C72B65]/50 focus:ring-2 focus:ring-[#C72B65]/10";

const ghostButton = cn(
  "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
  focusRing,
);

const primaryButton = cn(
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C72B65] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#A92355] disabled:cursor-not-allowed disabled:bg-[#C72B65]/40",
  focusRing,
);

const filledFacts = (config: Config) =>
  config.facts.filter((fact) => fact.label.trim() && fact.value.trim());

/** Stacked label above its control, used for free-text fields. */
function Field({
  label,
  optional,
  hint,
  fill = false,
  children,
}: {
  label: string;
  optional?: boolean;
  hint?: string;
  /** Stretch to the row height so side-by-side fields line up exactly. */
  fill?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", fill && "flex h-full flex-col")}>
      <div className="mb-2 flex h-5 items-baseline gap-1.5">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        {optional && <span className="text-[12px] text-muted-foreground">Optional</span>}
      </div>
      {children}
      {hint && <p className="mt-2 text-[12px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Label in a fixed left column, control on the right: keeps choice rows on one grid. */
function Row({
  label,
  optional,
  hint,
  children,
}: {
  label: string;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[128px_minmax(0,1fr)] sm:gap-6">
      <div className="sm:pt-1.5">
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        {optional && <p className="text-[12px] text-muted-foreground">Optional</p>}
      </div>
      <div className="min-w-0">
        {children}
        {hint && <p className="mt-2 text-[12px] leading-snug text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

function ChoiceChips({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option)}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-[13px] transition-colors",
              focusRing,
              active
                ? "border-[#C72B65] bg-[#C72B65]/[0.04] font-medium text-[#C72B65]"
                : "border-border bg-card text-foreground/80 hover:border-foreground/25 hover:text-foreground",
            )}
          >
            {active && <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />}
            {option}
          </button>
        );
      })}
    </div>
  );
}

type MoodStyle = {
  dot: string;
  banner: string;
  blobA: string;
  blobB: string;
  face: string;
  ink: string;
  adjective: string;
};

const MOODS_STYLE: Record<string, MoodStyle> = {
  Calm: {
    dot: "bg-emerald-500",
    banner: "from-emerald-50 via-white to-white",
    blobA: "bg-emerald-200/70",
    blobB: "bg-[#FBE7EF]",
    face: "#D1FAE5",
    ink: "#047857",
    adjective: "calm",
  },
  Polite: {
    dot: "bg-sky-500",
    banner: "from-sky-50 via-white to-white",
    blobA: "bg-sky-200/70",
    blobB: "bg-[#FBE7EF]",
    face: "#E0F2FE",
    ink: "#0369A1",
    adjective: "polite",
  },
  Confused: {
    dot: "bg-amber-500",
    banner: "from-amber-50 via-white to-white",
    blobA: "bg-amber-200/70",
    blobB: "bg-[#FBE7EF]",
    face: "#FEF3C7",
    ink: "#B45309",
    adjective: "confused",
  },
  Frustrated: {
    dot: "bg-red-500",
    banner: "from-rose-50 via-white to-white",
    blobA: "bg-rose-200/70",
    blobB: "bg-orange-100",
    face: "#FFE4E6",
    ink: "#BE123C",
    adjective: "frustrated",
  },
  Impatient: {
    dot: "bg-orange-500",
    banner: "from-orange-50 via-white to-white",
    blobA: "bg-orange-200/70",
    blobB: "bg-[#FBE7EF]",
    face: "#FFEDD5",
    ink: "#C2410C",
    adjective: "impatient",
  },
};

const DIFFICULTY_PHRASE: Record<string, string> = {
  Cooperative: "who's easy to help",
  Normal: "who expects clear answers",
  Demanding: "who won't take no for an answer",
};

const DIFFICULTY_LEVEL: Record<string, number> = { Cooperative: 1, Normal: 2, Demanding: 3 };

/** Simple illustrated face whose brows and mouth follow the chosen mood. */
function MoodFace({ mood }: { mood: string }) {
  const tone = MOODS_STYLE[mood] ?? MOODS_STYLE.Calm;
  const mouth: Record<string, string> = {
    Calm: "M19 30 Q24 33.5 29 30",
    Polite: "M18 29 Q24 35 30 29",
    Confused: "M18.5 31 Q21 29 23.5 31 T28.5 31",
    Frustrated: "M19 32.5 Q24 28.5 29 32.5",
    Impatient: "M19 31 L29 31",
  };
  const brows: Record<string, string> = {
    Calm: "M16 18.5 L20.5 18 M27.5 18 L32 18.5",
    Polite: "M16 18 Q18.3 16.8 20.5 17.6 M27.5 17.6 Q29.7 16.8 32 18",
    Confused: "M16 18.5 L20.5 18.5 M27.5 16.8 Q30 15.6 32 17.4",
    Frustrated: "M16 17 L20.8 19 M27.2 19 L32 17",
    Impatient: "M16 18.2 L20.8 18.8 M27.2 18.8 L32 18.2",
  };
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill={tone.face} className="transition-[fill] duration-300" />
      <g
        fill="none"
        stroke={tone.ink}
        strokeWidth="1.8"
        strokeLinecap="round"
        className="transition-[stroke] duration-300"
      >
        <path d={brows[mood] ?? brows.Calm} />
        <path d={mouth[mood] ?? mouth.Calm} />
      </g>
      <circle cx="18.5" cy="23" r="1.7" fill={tone.ink} />
      <circle cx="29.5" cy="23" r="1.7" fill={tone.ink} />
      {mood === "Polite" && (
        <>
          <circle cx="14.5" cy="28" r="2.2" fill="#F9A8D4" opacity="0.55" />
          <circle cx="33.5" cy="28" r="2.2" fill="#F9A8D4" opacity="0.55" />
        </>
      )}
    </svg>
  );
}

/** A two-ended dial: the dot sits on the chosen side. */
function VoiceDial({ left, right, value }: { left: string; right: string; value: string }) {
  const onRight = value === right;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-2 text-[12px]">
      <span
        className={cn(
          "truncate",
          onRight ? "text-muted-foreground" : "font-medium text-foreground",
        )}
      >
        {left}
      </span>
      <span className="relative h-1 rounded-full bg-border" aria-hidden="true">
        <span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-card bg-[#C72B65] shadow-sm transition-[left] duration-300 ease-out motion-reduce:transition-none"
          style={{ left: onRight ? "calc(100% - 10px)" : "0px" }}
        />
      </span>
      <span
        className={cn(
          "truncate text-right",
          onRight ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {right}
      </span>
    </div>
  );
}

function CardSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 [&+&]:border-t [&+&]:border-border/70">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function Placeholder({ width, label }: { width: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("h-2 rounded-full bg-border", width)} aria-hidden="true" />
      <span className="text-[12px] text-muted-foreground/80">{label}</span>
    </div>
  );
}

/** Profile card for the simulated customer: a character sheet that reacts as the form changes. */
function PersonaCard({ config }: { config: Config }) {
  const facts = filledFacts(config);
  const tone = MOODS_STYLE[config.mood] ?? MOODS_STYLE.Calm;
  const level = DIFFICULTY_LEVEL[config.difficulty] ?? 2;
  const summary = `A ${tone.adjective} customer ${DIFFICULTY_PHRASE[config.difficulty] ?? ""}.`;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_24px_-16px_rgba(16,24,40,0.24)]">
      <div
        className={cn(
          "relative h-11 overflow-hidden bg-gradient-to-br transition-colors duration-500",
          tone.banner,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute -left-6 -top-10 h-28 w-28 rounded-full blur-2xl transition-colors duration-500",
            tone.blobA,
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute -top-6 right-6 h-20 w-20 rounded-full blur-2xl transition-colors duration-500",
            tone.blobB,
          )}
        />
        <span className="absolute right-3 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-medium text-foreground/80 ring-1 ring-black/5 backdrop-blur">
          <Bot className="h-3 w-3 text-[#C72B65]" aria-hidden="true" />
          AI customer
        </span>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-end gap-2.5">
          <span className="relative z-10 -mt-5 block h-11 w-11 shrink-0 rounded-full bg-card p-[2px] shadow-[0_2px_6px_rgba(16,24,40,0.12)]">
            <MoodFace mood={config.mood} />
          </span>
          <p className="truncate pb-0.5 text-[14px] font-semibold text-foreground">
            Simulated customer
          </p>
        </div>
        <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">{summary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1">
          <span className="inline-flex h-5 items-center gap-1.5 rounded-full bg-muted px-2 text-[11px] text-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
            {config.mood}
          </span>
          <span
            className="inline-flex h-5 items-center gap-1.5 rounded-full bg-muted px-2 text-[11px] text-foreground"
            title={`Difficulty: ${config.difficulty}`}
          >
            <span className="flex items-end gap-[2px]" aria-hidden="true">
              {[1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  className={cn(
                    "w-[3px] rounded-sm transition-colors duration-200",
                    bar === 1 ? "h-1.5" : bar === 2 ? "h-2" : "h-2.5",
                    bar <= level ? "bg-[#C72B65]" : "bg-foreground/15",
                  )}
                />
              ))}
            </span>
            {config.difficulty}
          </span>
          <span className="inline-flex h-5 items-center rounded-full bg-muted px-2 text-[11px] text-foreground">
            {config.language} · {config.locale}
          </span>
        </div>
      </div>

      <div className="border-t border-border/70">
        <CardSection label="Goal">
          {config.goal.trim() ? (
            <div className="relative pl-4">
              <span
                aria-hidden="true"
                className="absolute -top-0.5 left-0 font-serif text-[22px] leading-none text-[#C72B65]/35"
              >
                “
              </span>
              <p className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground">
                {config.goal.trim()}
              </p>
            </div>
          ) : (
            <Placeholder width="w-24" label="Add a goal" />
          )}
          {config.success.trim() && (
            <p className="mt-2 flex gap-1.5 rounded-md bg-emerald-50/70 px-2 py-1.5 text-[12px] leading-snug text-emerald-900">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>
                <span className="font-medium">Resolved: </span>
                {config.success.trim()}
              </span>
            </p>
          )}
        </CardSection>

        <CardSection label={facts.length ? `Knows · ${facts.length}` : "Knows"}>
          {facts.length ? (
            <dl className="space-y-1">
              {facts.map((fact) => (
                <div key={fact.id} className="flex items-baseline gap-2 text-[12px]">
                  <dt className="shrink-0 text-muted-foreground">{fact.label}</dt>
                  <span
                    className="min-w-3 flex-1 border-b border-dotted border-border"
                    aria-hidden="true"
                  />
                  <dd className="min-w-0 truncate font-mono font-medium text-foreground">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <Placeholder width="w-16" label="Add a fact" />
          )}
        </CardSection>

        {config.constraints.length > 0 && (
          <CardSection label="House rules">
            <ul className="space-y-1">
              {config.constraints.map((constraint) => (
                <li key={constraint} className="flex gap-2 text-[12px] text-foreground">
                  <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rotate-45 bg-[#C72B65]" />
                  {constraint}
                </li>
              ))}
            </ul>
          </CardSection>
        )}

        <CardSection label="Voice">
          <div className="space-y-1">
            <VoiceDial left="Brief" right="Chatty" value={config.length} />
            <VoiceDial left="Formal" right="Casual" value={config.formality} />
            <VoiceDial left="Proper" right="Casual with typos" value={config.grammar} />
          </div>
        </CardSection>
      </div>
    </article>
  );
}

function Preview({
  config,
  checks,
}: {
  config: Config;
  checks: { label: string; done: boolean; optional?: boolean }[];
}) {
  const done = checks.filter((check) => check.done && !check.optional).length;
  const required = checks.filter((check) => !check.optional).length;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
        <h2 className="text-[14px] font-semibold text-foreground">Test customer preview</h2>
        <span
          className={cn(
            "text-[12px] tabular-nums",
            done === required ? "font-medium text-emerald-700" : "text-muted-foreground",
          )}
        >
          {done === required ? "Ready to save" : `${done} of ${required} required`}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <PersonaCard config={config} />
      </div>
    </div>
  );
}

export type SavedCustomer = {
  goal: string;
  facts: { label: string; value: string }[];
  mood: string;
  difficulty: string;
};

export function BotCustomerConfig({
  onSavedChange,
  previewTarget,
}: {
  onSavedChange: (customer: SavedCustomer | null) => void;
  /** Side panel element the live preview renders into. */
  previewTarget: HTMLElement | null;
}) {
  const [config, setConfig] = useState<Config>(initialConfig);
  const [constraintDraft, setConstraintDraft] = useState("");
  const [nextFactId, setNextFactId] = useState(2);
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));

  // A fresh form has nothing saved yet, so the parent must not keep an older saved customer.
  useEffect(() => {
    onSavedChange(null);
  }, [onSavedChange]);

  const go = (next: number) => {
    const target = Math.max(0, Math.min(STEPS.length - 1, next));
    setStep(target);
    setVisited((current) => new Set(current).add(target));
  };

  const update = <K extends keyof Config>(key: K, value: Config[K]) => {
    setSaved(false);
    onSavedChange(null);
    setConfig((current) => ({ ...current, [key]: value }));
  };
  const difficulty = DIFFICULTIES.find((item) => item.value === config.difficulty);

  const addConstraint = (text: string) => {
    const value = text.trim();
    if (!value || config.constraints.some((c) => c.toLowerCase() === value.toLowerCase())) return;
    update("constraints", [...config.constraints, value]);
    setConstraintDraft("");
  };
  const updateFact = (id: number, patch: Partial<Fact>) =>
    update(
      "facts",
      config.facts.map((fact) => (fact.id === id ? { ...fact, ...patch } : fact)),
    );

  const hasGoal = config.goal.trim().length > 0;
  const hasFact = filledFacts(config).length > 0;
  const checks = [
    { label: "Goal", done: hasGoal },
    { label: "At least one fact", done: hasFact },
    { label: "Success criteria", done: config.success.trim().length > 0, optional: true },
  ];
  const ready = hasGoal && hasFact;
  const stepDone = [hasGoal, hasFact, visited.has(2), visited.has(3)];
  const last = step === STEPS.length - 1;

  return (
    <>
      <div className="flex min-w-0 flex-col">
        <nav aria-label="Configuration steps" className="border-b border-border px-6 py-4">
          <ol className="flex items-center">
            {STEPS.map((item, index) => {
              const active = index === step;
              const done = stepDone[index] && !active;
              return (
                <li key={item.key} className="flex min-w-0 flex-1 items-center last:flex-none">
                  <button
                    type="button"
                    onClick={() => go(index)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "group flex shrink-0 cursor-pointer items-center gap-2 rounded-lg py-1 pr-1.5",
                      focusRing,
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold tabular-nums transition-colors duration-200",
                        active
                          ? "border-[#C72B65] bg-[#C72B65] text-white"
                          : done
                            ? "border-[#C72B65] bg-card text-[#C72B65]"
                            : "border-border bg-card text-muted-foreground group-hover:border-foreground/30",
                      )}
                    >
                      {done ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
                    </span>
                    <span
                      className={cn(
                        "text-[13px] transition-colors",
                        active
                          ? "font-medium text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mx-3 h-px min-w-4 flex-1 transition-colors duration-300",
                        stepDone[index] ? "bg-[#C72B65]/50" : "bg-border",
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div key={step} className="min-h-[272px] flex-1 animate-fade-up space-y-5 px-6 py-5">
          {step === 0 && (
            // Side by side on one grid row, so both columns always share the same height.
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Goal" hint="What the customer wants, in their own words." fill>
                <textarea
                  value={config.goal}
                  onChange={(event) => update("goal", event.target.value)}
                  rows={5}
                  placeholder="Find out why my payment failed and get it fixed."
                  className={cn(
                    inputBase,
                    "min-h-[120px] flex-1 resize-none px-3 py-2 leading-relaxed",
                  )}
                />
              </Field>
              <Field
                label="Success criteria"
                optional
                hint="What a resolved conversation looks like."
                fill
              >
                <textarea
                  value={config.success}
                  onChange={(event) => update("success", event.target.value)}
                  rows={5}
                  placeholder="Receive the exact reason for the failed payment and a clear next step."
                  className={cn(
                    inputBase,
                    "min-h-[120px] flex-1 resize-none px-3 py-2 leading-relaxed",
                  )}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <Field
              label="What the customer knows"
              hint="Shared when the agent asks, so verification questions get accurate answers."
            >
              <div className="space-y-2">
                {config.facts.map((fact) => (
                  <div
                    key={fact.id}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_36px] gap-2"
                  >
                    <input
                      value={fact.label}
                      onChange={(event) => updateFact(fact.id, { label: event.target.value })}
                      placeholder="Label, e.g. Order ID"
                      aria-label="Fact label"
                      className={cn(inputBase, "h-9 px-3")}
                    />
                    <input
                      value={fact.value}
                      onChange={(event) => updateFact(fact.id, { value: event.target.value })}
                      placeholder="Value, e.g. ORD-48213"
                      aria-label="Fact value"
                      className={cn(inputBase, "h-9 px-3")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          "facts",
                          config.facts.length > 1
                            ? config.facts.filter((item) => item.id !== fact.id)
                            : [{ ...fact, label: "", value: "" }],
                        )
                      }
                      aria-label="Remove fact"
                      className={cn(
                        "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        focusRing,
                      )}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    update("facts", [...config.facts, { id: nextFactId, label: "", value: "" }]);
                    setNextFactId((id) => id + 1);
                  }}
                  className={cn(ghostButton, "-ml-3 text-foreground")}
                >
                  <Plus className="h-4 w-4" />
                  Add fact
                </button>
              </div>
            </Field>
          )}

          {step === 2 && (
            <>
              <Row label="Mood">
                <ChoiceChips
                  label="Mood"
                  value={config.mood}
                  onChange={(value) => update("mood", value)}
                  options={MOODS}
                />
              </Row>
              <Row label="Difficulty" hint={difficulty?.hint}>
                <ChoiceChips
                  label="Difficulty"
                  value={config.difficulty}
                  onChange={(value) => update("difficulty", value)}
                  options={DIFFICULTIES.map((item) => item.value)}
                />
              </Row>
              <Row label="Constraints" optional>
                <div className="rounded-lg border border-border bg-card px-1.5 py-1 transition-colors focus-within:border-[#C72B65]/50 focus-within:ring-2 focus-within:ring-[#C72B65]/10 hover:border-foreground/20">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {config.constraints.map((constraint) => (
                      <span
                        key={constraint}
                        className="inline-flex h-7 items-center gap-1 rounded-md bg-muted pl-2 pr-1 text-[13px] text-foreground"
                      >
                        {constraint}
                        <button
                          type="button"
                          aria-label={`Remove ${constraint}`}
                          onClick={() =>
                            update(
                              "constraints",
                              config.constraints.filter((item) => item !== constraint),
                            )
                          }
                          className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={constraintDraft}
                      onChange={(event) => setConstraintDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addConstraint(constraintDraft);
                        } else if (
                          event.key === "Backspace" &&
                          !constraintDraft &&
                          config.constraints.length
                        ) {
                          update("constraints", config.constraints.slice(0, -1));
                        }
                      }}
                      placeholder={
                        config.constraints.length ? "Add another" : "Type a rule and press Enter"
                      }
                      aria-label="Add a constraint"
                      className="h-7 min-w-[160px] flex-1 bg-transparent px-1.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/70"
                    />
                  </div>
                </div>
                {CONSTRAINT_IDEAS.some((idea) => !config.constraints.includes(idea)) && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="mr-0.5 text-[12px] text-muted-foreground">Try</span>
                    {CONSTRAINT_IDEAS.filter((idea) => !config.constraints.includes(idea)).map(
                      (idea) => (
                        <button
                          key={idea}
                          type="button"
                          onClick={() => addConstraint(idea)}
                          className={cn(
                            "inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-dashed border-border px-2 text-[12px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground",
                            focusRing,
                          )}
                        >
                          <Plus className="h-3 w-3" />
                          {idea}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </Row>
            </>
          )}

          {step === 3 && (
            <>
              <Row label="Response length">
                <ChoiceChips
                  label="Response length"
                  value={config.length}
                  onChange={(value) => update("length", value)}
                  options={["Brief", "Chatty"]}
                />
              </Row>
              <Row label="Formality">
                <ChoiceChips
                  label="Formality"
                  value={config.formality}
                  onChange={(value) => update("formality", value)}
                  options={["Formal", "Casual"]}
                />
              </Row>
              <Row label="Grammar">
                <ChoiceChips
                  label="Grammar"
                  value={config.grammar}
                  onChange={(value) => update("grammar", value)}
                  options={["Proper", "Casual with typos"]}
                />
              </Row>
              <Row label="Language">
                <ChoiceChips
                  label="Language"
                  value={config.language}
                  onChange={(value) => update("language", value)}
                  options={["English", "Hindi", "Hinglish"]}
                />
              </Row>
              <Row label="Locale">
                <ChoiceChips
                  label="Locale"
                  value={config.locale}
                  onChange={(value) => update("locale", value)}
                  options={LOCALES}
                />
              </Row>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-3">
          {step === 0 ? (
            <button
              type="button"
              onClick={() => {
                setConfig(initialConfig());
                setConstraintDraft("");
                setSaved(false);
                onSavedChange(null);
              }}
              className={cn(ghostButton, "-ml-3")}
            >
              Reset
            </button>
          ) : (
            <button type="button" onClick={() => go(step - 1)} className={cn(ghostButton, "-ml-3")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
          <div className="flex items-center gap-3">
            {last && !ready && (
              <span className="text-[12px] text-muted-foreground">
                Add a goal and a fact to save
              </span>
            )}
            {last ? (
              <button
                type="button"
                disabled={!ready}
                onClick={() => {
                  setSaved(true);
                  onSavedChange({
                    goal: config.goal.trim(),
                    facts: filledFacts(config).map(({ label, value }) => ({
                      label: label.trim(),
                      value: value.trim(),
                    })),
                    mood: config.mood,
                    difficulty: config.difficulty,
                  });
                }}
                className={primaryButton}
              >
                {saved && <Check className="h-4 w-4" />}
                {saved ? "Saved" : "Save customer"}
              </button>
            ) : (
              <button type="button" onClick={() => go(step + 1)} className={primaryButton}>
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {previewTarget &&
        createPortal(
          <section aria-label="Test customer preview" className="flex h-full min-h-0 flex-col">
            <Preview config={config} checks={checks} />
          </section>,
          previewTarget,
        )}
    </>
  );
}
