import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History,
  Clock,
  Info,
  Loader2,
  TrendingDown,
  User,
  X,
  XCircle,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type RunCase = {
  id: string;
  title: string;
  opener: string;
  followUps: string[];
  tags: string[];
};

export type Rating = "good" | "fair" | "poor";
export type RunMessage = { role: "user" | "bot"; text: string; rating?: Rating };
export type RunStatus = "queued" | "running" | "passed" | "failed";

const METRICS = [
  { key: "instructions", label: "Instructions" },
  { key: "resolution", label: "Resolution" },
  { key: "grounding", label: "Grounding" },
  { key: "empathy", label: "Empathy" },
  { key: "precision", label: "Precision" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];
type Scores = Record<MetricKey, number>;
type Fix = { agent: string; category: string; description: string; severity: "high" | "medium" };

export type CaseOutcome = {
  replies: { text: string; rating: Rating }[];
  scores: Scores;
  issues: string[];
  strengths: string[];
  fixes: Fix[];
};

const PASS_MARK = 70;

const SCRIPTED: Record<string, CaseOutcome> = {
  "uc-onboarding": {
    replies: [
      {
        text: "Great! I can see you're logged into the app. Let's move forward with your loan application. Are you ready to proceed with the next step?",
        rating: "poor",
      },
      {
        text: "Perfect. Tap 'Upload documents' on the home screen and add your PAN first, then Aadhaar and your bank statements.",
        rating: "poor",
      },
      {
        text: "Let's start with confirming your personal details on the profile screen, and I'll guide you through each step after that.",
        rating: "fair",
      },
    ],
    scores: { instructions: 33, resolution: 67, grounding: 33, empathy: 75, precision: 67 },
    issues: [
      "All turns misrouted to undeclared 'agent_guild_agent' node",
      "Entry router never invoked; loan-onboarding intent not detected",
      "Bot hallucinated ability to verify app login state",
      "Onboarding UI details fabricated without grounding",
      "Onboarding Specialist never reached despite clear user intent",
    ],
    strengths: [
      "Bot tone was friendly and encouraging throughout",
      "Responses were relevant to the user's stated intent",
      "Language matched user's English throughout",
    ],
    fixes: [
      {
        agent: "agent_guild_agent",
        category: "routing",
        severity: "high",
        description:
          "The entry router's card lacks an explicit fallback rule to intercept sessions handled by undeclared nodes, so the router was bypassed entirely and loan-onboarding intent was never forwarded to the Onboarding Specialist.",
      },
      {
        agent: "agent_guild_agent",
        category: "quality",
        severity: "high",
        description:
          "The Onboarding Specialist's card does not prohibit claiming real-time visibility into the customer's app state, nor does it require UI instructions to be grounded in the verbatim script.",
      },
    ],
  },
  "uc-rates": {
    replies: [
      {
        text: "Your final rate depends on your credit profile, but offers for your loan type currently range from 10.5% to 18% per annum. I can share your exact rate once the credit check is done.",
        rating: "good",
      },
      {
        text: "Yes, there's a one-time processing fee of 2% of the loan amount plus GST. There are no other hidden charges.",
        rating: "good",
      },
      {
        text: "At 12% per annum, your EMI for ₹2,40,000 over 36 months would be about ₹7,971. Shall we continue with your application?",
        rating: "good",
      },
    ],
    scores: { instructions: 92, resolution: 85, grounding: 88, empathy: 90, precision: 86 },
    issues: ["Did not confirm the user was comfortable before steering back to onboarding"],
    strengths: [
      "Pricing explained clearly without over-promising a rate",
      "EMI calculation was accurate and grounded",
      "Guided the user back to onboarding naturally",
    ],
    fixes: [],
  },
  "uc-wrong-doc": {
    replies: [
      {
        text: "Thanks for uploading! It looks like this is an electricity bill, but for this step we need your PAN card.",
        rating: "good",
      },
      {
        text: "Utility bills work as address proof, but identity verification needs your PAN. You can upload it from the same screen.",
        rating: "fair",
      },
      {
        text: "No need to start again, your progress is saved. Just replace the document and continue.",
        rating: "fair",
      },
    ],
    scores: { instructions: 75, resolution: 58, grounding: 70, empathy: 82, precision: 60 },
    issues: [
      "Did not explain where exactly to replace the uploaded document",
      "Missed confirming the PAN upload was received successfully",
    ],
    strengths: [
      "Caught the document mismatch immediately",
      "Reassured the user that progress was saved",
    ],
    fixes: [
      {
        agent: "kyc_verification_agent",
        category: "resolution",
        severity: "medium",
        description:
          "The KYC agent's card has no step to confirm a re-uploaded document was accepted, so conversations end before verification is complete.",
      },
    ],
  },
  "uc-language": {
    replies: [
      {
        text: "Sure, I can check that for you. Your application is currently under KYC review.",
        rating: "good",
      },
      {
        text: "Bilkul! Ab se main Hindi mein baat karungi. Aapka application abhi KYC review mein hai.",
        rating: "good",
      },
      {
        text: "Bas aapke pichhle teen mahine ke bank statements chahiye. Main aapko upload link bhej rahi hoon.",
        rating: "good",
      },
    ],
    scores: { instructions: 88, resolution: 84, grounding: 86, empathy: 90, precision: 80 },
    issues: [],
    strengths: [
      "Switched to Hindi seamlessly when asked",
      "Kept application context across the language switch",
    ],
    fixes: [],
  },
  "uc-resume": {
    replies: [
      {
        text: "No problem! Let's start your application again from the beginning.",
        rating: "poor",
      },
      {
        text: "Yes, please upload all your documents again so we can continue.",
        rating: "poor",
      },
      { text: "Great, let's begin with your personal details.", rating: "fair" },
    ],
    scores: { instructions: 55, resolution: 40, grounding: 48, empathy: 70, precision: 50 },
    issues: [
      "Saved onboarding progress was ignored",
      "User was asked to re-upload documents that were already verified",
    ],
    strengths: ["Tone stayed polite and patient"],
    fixes: [
      {
        agent: "onboarding_specialist",
        category: "memory",
        severity: "high",
        description:
          "The Onboarding Specialist does not read the saved session state, so returning users always restart from step one.",
      },
    ],
  },
};

function hash(value: string) {
  return [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9973, 7);
}

export function outcomeFor(item: RunCase): CaseOutcome {
  const scripted = SCRIPTED[item.id];
  if (scripted) return scripted;
  const seed = hash(item.id);
  const score = (offset: number) => 55 + ((seed * (offset + 3)) % 41);
  const scores: Scores = {
    instructions: score(1),
    resolution: score(2),
    grounding: score(3),
    empathy: score(4),
    precision: score(5),
  };
  const turns = 1 + item.followUps.length;
  const generic = [
    "Thanks for reaching out! Let me look into that for you.",
    "Got it. Here's what you need to do next, step by step.",
    "That's all sorted. Is there anything else I can help you with?",
  ];
  const ratings: Rating[] = ["good", "fair", "good"];
  return {
    replies: Array.from({ length: turns }, (_, i) => ({
      text: generic[i % generic.length],
      rating: ratings[(seed + i) % ratings.length],
    })),
    scores,
    issues: ["Responses were generic and did not reference the user's specific request"],
    strengths: ["Tone stayed polite and helpful"],
    fixes: [],
  };
}

export type RunRecord = {
  id: string;
  finishedAt: number;
  cases: RunCase[];
  transcripts: Record<string, RunMessage[]>;
  statuses: Record<string, RunStatus>;
};

export function completedRun(id: string, cases: RunCase[], finishedAt: number): RunRecord {
  const transcripts: Record<string, RunMessage[]> = {};
  const statuses: Record<string, RunStatus> = {};
  cases.forEach((item) => {
    const outcome = outcomeFor(item);
    transcripts[item.id] = userTurns(item).flatMap((text, i) => {
      const reply = outcome.replies[i] ?? outcome.replies[outcome.replies.length - 1];
      return [
        { role: "user" as const, text },
        { role: "bot" as const, text: reply.text, rating: reply.rating },
      ];
    });
    statuses[item.id] = casePassed(outcome) ? "passed" : "failed";
  });
  return { id, finishedAt, cases, transcripts, statuses };
}

export function runScore(cases: RunCase[]) {
  if (cases.length === 0) return 0;
  return Math.round(
    cases.reduce((sum, item) => sum + caseScore(outcomeFor(item)), 0) / cases.length,
  );
}

export type RunOption = { id: string; title: string; meta: string; score: number };

export function RunHistoryPicker({
  options,
  selectedId,
  onSelect,
}: {
  options: RunOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === selectedId) ?? options[0];
  if (!selected) return null;
  return (
    <div className="relative">
      {open && (
        <button
          type="button"
          aria-label="Close run history"
          className="fixed inset-0 z-20 cursor-default"
          onClick={() => setOpen(false)}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card pl-3 pr-2.5 text-[13px] font-medium text-foreground shadow-sm transition hover:bg-muted"
      >
        <History className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{selected.title}</span>
        <span className="hidden text-muted-foreground sm:inline">· {selected.meta}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 w-72 rounded-xl border border-border bg-card p-1 shadow-lg animate-fade-up">
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Run history
          </p>
          {options.map((option) => {
            const t = tone(option.score);
            const active = option.id === selected.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition",
                  active ? "bg-[#FBE7EF]/70" : "hover:bg-muted",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-foreground">
                    {option.title}
                  </span>
                  <span className="block truncate text-[11.5px] text-muted-foreground">
                    {option.meta}
                  </span>
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11.5px] font-semibold tabular-nums",
                    t.tile,
                    t.text,
                  )}
                >
                  {option.score}%
                </span>
                {active && <Check className="h-3.5 w-3.5 shrink-0 text-[#C72B65]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function caseScore(outcome: CaseOutcome) {
  const values = METRICS.map((m) => outcome.scores[m.key]);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function casePassed(outcome: CaseOutcome) {
  return caseScore(outcome) >= PASS_MARK;
}

export function userTurns(item: RunCase) {
  return [item.opener, ...item.followUps];
}

function tone(score: number) {
  if (score < 50)
    return {
      text: "text-red-600",
      bar: "bg-red-500",
      tile: "border-red-200 bg-red-50",
      label: "Bad",
      ring: "#EF4444",
    };
  if (score < 75)
    return {
      text: "text-amber-600",
      bar: "bg-amber-500",
      tile: "border-amber-200 bg-amber-50",
      label: "Fair",
      ring: "#F59E0B",
    };
  return {
    text: "text-emerald-600",
    bar: "bg-emerald-500",
    tile: "border-emerald-200 bg-emerald-50",
    label: "Good",
    ring: "#10B981",
  };
}

function overallLabel(score: number) {
  if (score < 50) return { label: "Poor", cls: "border-red-200 bg-red-50 text-red-600" };
  if (score < 75) return { label: "Fair", cls: "border-amber-200 bg-amber-50 text-amber-700" };
  return { label: "Good", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" };
}

const RATING_META: Record<Rating, { label: string; cls: string; bubble: string; Icon: typeof X }> =
  {
    poor: {
      label: "Poor",
      cls: "border-red-200 bg-red-50 text-red-600",
      bubble: "border-red-200 bg-red-50/70",
      Icon: X,
    },
    fair: {
      label: "Fair",
      cls: "border-amber-200 bg-amber-50 text-amber-700",
      bubble: "border-amber-200 bg-amber-50/60",
      Icon: Info,
    },
    good: {
      label: "Good",
      cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
      bubble: "border-emerald-200 bg-emerald-50/60",
      Icon: Check,
    },
  };

const STATUS_META: Record<RunStatus, { label: string; cls: string }> = {
  queued: { label: "Queued", cls: "border-border bg-muted/50 text-muted-foreground" },
  running: { label: "Running", cls: "border-blue-200 bg-blue-50 text-blue-600" },
  passed: { label: "Passed", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  failed: { label: "Failed", cls: "border-red-200 bg-red-50 text-red-600" },
};

function StatusIcon({ status }: { status: RunStatus }) {
  if (status === "running")
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    );
  if (status === "passed")
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-4 w-4" />
      </span>
    );
  if (status === "failed")
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
        <X className="h-4 w-4" />
      </span>
    );
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Clock className="h-3.5 w-3.5" />
    </span>
  );
}

function SmallTags({ tags }: { tags: string[] }) {
  return (
    <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export function TestRunView({
  cases,
  statuses,
  transcripts,
  typingId,
  progress,
  expanded,
  onToggle,
  onToggleAll,
  headerRight,
}: {
  headerRight?: React.ReactNode;
  cases: RunCase[];
  statuses: Record<string, RunStatus>;
  transcripts: Record<string, RunMessage[]>;
  typingId: string | null;
  progress: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  const tailRef = useRef<HTMLDivElement>(null);
  const messageCount = Object.values(transcripts).reduce((sum, list) => sum + list.length, 0);

  useEffect(() => {
    tailRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messageCount, typingId]);

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-semibold text-foreground">
            Test run <span className="font-normal text-muted-foreground">({cases.length})</span>
          </h2>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#C72B65] transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[12.5px] font-semibold tabular-nums text-[#C72B65]">
            {progress}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          <button
            type="button"
            onClick={onToggleAll}
            title="Expand or collapse conversations"
            aria-label="Expand or collapse conversations"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition hover:bg-muted"
          >
            <MessageIcon />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 rounded-2xl border border-border bg-muted/30 p-5">
        {cases.map((item) => {
          const status = statuses[item.id] ?? "queued";
          const messages = transcripts[item.id] ?? [];
          const open = expanded.has(item.id);
          const meta = STATUS_META[status];
          return (
            <article
              key={item.id}
              className={cn(
                "overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors",
                status === "running" ? "border-blue-200" : "border-border",
              )}
            >
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                aria-expanded={open}
                className={cn(
                  "flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors",
                  status === "running" ? "bg-blue-50/60" : "hover:bg-muted/30",
                )}
              >
                <StatusIcon status={status} />
                <span className="min-w-0 truncate text-[14px] font-semibold text-foreground">
                  {item.title}
                </span>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    meta.cls,
                  )}
                >
                  {status === "running" && (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                  )}
                  {meta.label}
                </span>
                <span className="flex-1" />
                <SmallTags tags={item.tags} />
                <ChevronUp
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    !open && "rotate-180",
                  )}
                />
              </button>

              {open && (
                <div className="space-y-4 border-t border-border/70 px-5 py-5">
                  {messages.length === 0 && status === "queued" && (
                    <p className="text-[12.5px] text-muted-foreground">
                      Waiting for earlier use cases to finish…
                    </p>
                  )}
                  {messages.map((message, i) =>
                    message.role === "user" ? (
                      <div key={i} className="flex items-end gap-2.5 animate-fade-up">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FBE7EF] text-[#C72B65]">
                          <User className="h-3.5 w-3.5" />
                        </span>
                        <p className="max-w-[75%] rounded-2xl border border-border bg-card px-4 py-2.5 text-[13px] leading-relaxed text-foreground shadow-sm">
                          {message.text}
                        </p>
                      </div>
                    ) : (
                      <div key={i} className="flex flex-col items-end gap-1.5 animate-fade-up">
                        {message.rating && <RatingChips rating={message.rating} />}
                        <div className="flex items-end gap-2.5">
                          <p
                            className={cn(
                              "max-w-[75vw] rounded-2xl border px-4 py-2.5 text-[13px] leading-relaxed text-foreground sm:max-w-[640px]",
                              message.rating
                                ? RATING_META[message.rating].bubble
                                : "border-border bg-card",
                            )}
                          >
                            {message.text}
                          </p>
                          <BotAvatar />
                        </div>
                      </div>
                    ),
                  )}
                  {typingId === item.id && (
                    <div className="flex items-end justify-end gap-2.5">
                      <span className="inline-flex items-center gap-1 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C72B65]/70" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C72B65]/70 [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C72B65]/70 [animation-delay:300ms]" />
                      </span>
                      <BotAvatar />
                    </div>
                  )}
                  {status === "running" && <div ref={tailRef} className="h-px scroll-mb-6" />}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BotAvatar() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C72B65] text-white">
      <Bot className="h-3.5 w-3.5" />
    </span>
  );
}

function RatingChips({ rating }: { rating: Rating }) {
  const meta = RATING_META[rating];
  const Icon = meta.Icon;
  return (
    <div className="mr-10 flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
          meta.cls,
        )}
      >
        <Icon className="h-3 w-3" />
        {meta.label}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
        <BarChart3 className="h-3 w-3" />
        Score
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        <Info className="h-3 w-3" />
        Details
      </span>
    </div>
  );
}

function SignalBars({ score }: { score: number }) {
  const filled = Math.max(1, Math.ceil(score / 20));
  const t = tone(score);
  return (
    <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn("w-1 rounded-full", i < filled ? t.bar : "bg-muted")}
          style={{ height: `${30 + i * 17}%` }}
        />
      ))}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  return (
    <span className="relative flex h-28 w-28 items-center justify-center">
      <svg viewBox="0 0 104 104" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="52" cy="52" r={radius} fill="none" stroke="#EEF0F3" strokeWidth="8" />
        <circle
          cx="52"
          cy="52"
          r={radius}
          fill="none"
          stroke={tone(score).ring}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="text-center">
        <span className="block text-[26px] font-semibold leading-none text-foreground">
          {score}
        </span>
        <span className="text-[11px] text-muted-foreground">/100</span>
      </span>
    </span>
  );
}

export function TestResultsView({ cases, header }: { cases: RunCase[]; header?: React.ReactNode }) {
  const rows = cases.map((item) => {
    const outcome = outcomeFor(item);
    return { item, outcome, score: caseScore(outcome), passed: casePassed(outcome) };
  });
  const [open, setOpen] = useState<Set<string>>(() => {
    const firstFailed = rows.find((row) => !row.passed) ?? rows[0];
    return new Set(firstFailed ? [firstFailed.item.id] : []);
  });
  const overall = Math.round(rows.reduce((sum, row) => sum + row.score, 0) / (rows.length || 1));
  const passed = rows.filter((row) => row.passed).length;
  const failed = rows.length - passed;
  const averages = METRICS.map((metric) => ({
    ...metric,
    value: Math.round(
      rows.reduce((sum, row) => sum + row.outcome.scores[metric.key], 0) / (rows.length || 1),
    ),
  }));
  const focus = averages.reduce((low, metric) => (metric.value < low.value ? metric : low));
  const best = averages.reduce((high, metric) => (metric.value > high.value ? metric : high));
  const fixes = rows.flatMap((row) => row.outcome.fixes);
  const worst = rows.reduce((low, row) => (row.score < low.score ? row : low), rows[0]);
  const overallMeta = overallLabel(overall);

  const summary = `${passed} of ${rows.length} use ${rows.length === 1 ? "case" : "cases"} passed. The prompt was strongest on ${best.label.toLowerCase()} (${best.value}%) and weakest on ${focus.label.toLowerCase()} (${focus.value}%).${
    worst && worst.outcome.issues[0]
      ? ` The lowest-scoring case, "${worst.item.title}", failed mainly because: ${worst.outcome.issues[0].charAt(0).toLowerCase()}${worst.outcome.issues[0].slice(1)}.`
      : ""
  }`;

  const stats = [
    {
      value: rows.length,
      label: "Total Scenarios",
      hint: "across all cases",
      cls: "text-foreground",
    },
    {
      value: passed,
      label: "Passed",
      hint: `${Math.round((passed / (rows.length || 1)) * 100)}% pass rate`,
      cls: "text-emerald-600",
    },
    { value: failed, label: "Failed", hint: "need improvement", cls: "text-red-600" },
    {
      value: rows.length,
      label: "Use Cases",
      hint: `${passed} fully passed`,
      cls: "text-foreground",
    },
  ];

  return (
    <div className="space-y-5 p-6 animate-fade-up">
      {header}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <ScoreRing score={overall} />
          <span className="text-[13px] text-muted-foreground">Overall Score</span>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[12px] font-semibold",
              overallMeta.cls,
            )}
          >
            {overallMeta.label}
          </span>
        </div>
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <span className={cn("text-[32px] font-semibold leading-none", stat.cls)}>
              {stat.value}
            </span>
            <span className="mt-3 text-[14px] font-semibold text-foreground">{stat.label}</span>
            <span className="mt-0.5 text-[12.5px] text-muted-foreground">{stat.hint}</span>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              Avg scores
            </h3>
            <div className="mt-4 space-y-4">
              {averages.map((metric) => {
                const t = tone(metric.value);
                return (
                  <div key={metric.key}>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-foreground">{metric.label}</span>
                      <span className={cn("font-semibold tabular-nums", t.text)}>
                        {metric.value}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", t.bar)}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <h3 className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-amber-700">
              <TrendingDown className="h-3.5 w-3.5" />
              Focus area
            </h3>
            <p className="mt-3 text-[15px] font-semibold text-amber-900">{focus.label}</p>
            <p className="text-[24px] font-semibold text-amber-600">{focus.value}%</p>
            <p className="mt-1 text-[12.5px] text-amber-800">
              Primary area to focus prompt improvements on.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              Summary
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{summary}</p>
          </section>
        </div>

        <div className="space-y-4">
          <h3 className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Use case breakdown — {rows.length} {rows.length === 1 ? "case" : "cases"}
          </h3>
          {rows.map(({ item, outcome, score, passed: ok }) => {
            const isOpen = open.has(item.id);
            const t = tone(score);
            return (
              <article
                key={item.id}
                className={cn(
                  "overflow-hidden rounded-2xl border shadow-sm",
                  ok ? "border-emerald-200 bg-card" : "border-red-200 bg-card",
                )}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpen((current) => {
                      const next = new Set(current);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    })
                  }
                  className={cn(
                    "flex w-full items-center gap-3 px-5 py-4 text-left",
                    ok ? "bg-emerald-50/50" : "bg-red-50/60",
                  )}
                >
                  {ok ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold text-foreground">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-muted-foreground">
                      {ok ? 1 : 0}/1 scenarios passed
                    </span>
                  </span>
                  <SignalBars score={score} />
                  <span className={cn("w-12 text-right text-[17px] font-semibold", t.text)}>
                    {score}%
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card/80">
                    <ChevronUp
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        !isOpen && "rotate-180",
                      )}
                    />
                  </span>
                </button>

                {isOpen && (
                  <div className="space-y-5 border-t border-border/70 px-5 py-5">
                    <div>
                      <h4 className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Score breakdown
                      </h4>
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {METRICS.map((metric) => {
                          const value = outcome.scores[metric.key];
                          const mt = tone(value);
                          return (
                            <div
                              key={metric.key}
                              className={cn("rounded-xl border px-3 py-3 text-center", mt.tile)}
                            >
                              <p className={cn("text-[20px] font-semibold", mt.text)}>{value}</p>
                              <p className="text-[11px] text-muted-foreground">{metric.label}</p>
                              <p className={cn("mt-1 text-[11px] font-semibold", mt.text)}>
                                {mt.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Scenario results (1)
                      </h4>
                      <div
                        className={cn(
                          "mt-3 flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]",
                          ok
                            ? "border-emerald-100 bg-emerald-50/40"
                            : "border-red-100 bg-red-50/50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                            ok ? "bg-emerald-500" : "bg-red-500",
                          )}
                        />
                        <span className="shrink-0 text-muted-foreground">Scenario 1</span>
                        <span className="text-foreground">{item.opener}</span>
                      </div>
                    </div>

                    {outcome.issues.length > 0 && (
                      <div className="rounded-xl border border-red-100 bg-red-50/60 px-4 py-4">
                        <h4 className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-red-600">
                          <XCircle className="h-3.5 w-3.5" />
                          Issues
                        </h4>
                        <ul className="mt-2.5 space-y-1.5">
                          {outcome.issues.map((issue) => (
                            <li key={issue} className="flex gap-2 text-[13px] text-red-700">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {outcome.strengths.length > 0 && (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-4">
                        <h4 className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Strengths
                        </h4>
                        <ul className="mt-2.5 space-y-1.5">
                          {outcome.strengths.map((strength) => (
                            <li key={strength} className="flex gap-2 text-[13px] text-emerald-800">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {fixes.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-amber-700">
                Agents needing fixes ({fixes.length})
              </h3>
              <div className="mt-3 space-y-3">
                {fixes.map((fix, i) => (
                  <div key={i} className="rounded-xl border border-amber-200 bg-card px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-mono text-[13px] font-semibold text-foreground">
                        {fix.agent}
                      </p>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                          fix.severity === "high"
                            ? "border-red-200 bg-red-50 text-red-600"
                            : "border-amber-200 bg-amber-50 text-amber-700",
                        )}
                      >
                        {fix.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-[12.5px] font-medium text-amber-700">{fix.category}</p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                      {fix.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
