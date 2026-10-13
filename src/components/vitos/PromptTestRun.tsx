import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  History,
  Clock,
  Info,
  Loader2,
  Sparkles,
  X,
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
type Fix = {
  id: string;
  title: string;
  agent: string;
  category: string;
  description: string;
  severity: "high" | "medium";
  targets: MetricKey[];
};

export type CaseOutcome = {
  replies: { text: string; rating: Rating }[];
  scores: Scores;
  scenarios: number[];
  issues: string[];
  strengths: string[];
  fixes: Fix[];
};

const PASS_MARK = 70;

const FIXES: Record<string, Fix> = {
  "router-guardrails": {
    id: "router-guardrails",
    title: "Enforce router guardrails",
    agent: "agent_guard_agent",
    category: "routing",
    description:
      "block customer-facing output and re-route mismatched sessions in the runtime prompt.",
    severity: "high",
    targets: ["resolution", "instructions"],
  },
  "fallback-input": {
    id: "fallback-input",
    title: "Add fallback for unrecognizable input",
    agent: "agent_guard_agent",
    category: "quality",
    description: "forbid fabricated capabilities and ungrounded commitments on ambiguous input.",
    severity: "high",
    targets: ["precision", "grounding"],
  },
  "resume-session": {
    id: "resume-session",
    title: "Resume from saved progress",
    agent: "onboarding_specialist",
    category: "memory",
    description: "read saved session state so returning users continue from their last step.",
    severity: "high",
    targets: ["resolution", "instructions"],
  },
  "cite-policy": {
    id: "cite-policy",
    title: "Cite policy source before quoting",
    agent: "loan_policy_agent",
    category: "grounding",
    description: "require a matched policy card before stating rates, fees or eligibility terms.",
    severity: "medium",
    targets: ["grounding"],
  },
  handoff: {
    id: "handoff",
    title: "Clarify hand-off criteria",
    agent: "escalation_agent",
    category: "instructions",
    description: "define when to transfer to a human and what context to pass.",
    severity: "medium",
    targets: ["instructions", "resolution"],
  },
  "confirm-reupload": {
    id: "confirm-reupload",
    title: "Confirm re-uploaded documents",
    agent: "kyc_verification_agent",
    category: "resolution",
    description: "confirm a replaced document was accepted before closing the turn.",
    severity: "medium",
    targets: ["resolution", "precision"],
  },
  acknowledge: {
    id: "acknowledge",
    title: "Acknowledge before redirecting",
    agent: "support_agent",
    category: "empathy",
    description: "reflect the customer's concern back before steering them to the next step.",
    severity: "medium",
    targets: ["empathy"],
  },
};

const fixes = (...ids: string[]) => ids.map((id) => FIXES[id]);

const SCRIPTED: Record<string, Omit<CaseOutcome, "scenarios">> = {
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
    fixes: fixes("router-guardrails", "fallback-input"),
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
    fixes: fixes("confirm-reupload"),
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
    fixes: fixes("resume-session"),
  },
};

function hash(value: string) {
  return [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9973, 7);
}

// Overall level for the seeded 10-case batch, so the results page shows a realistic spread.
const BASE_SCORE: Record<string, number> = {
  "saved-fraud": 31,
  "saved-rejection": 39,
  "saved-otp": 50,
  "saved-coapplicant": 51,
  "saved-salary-slip": 57,
  "saved-topup": 64,
  "saved-prepay": 70,
  "saved-emi-date": 78,
  "saved-address": 83,
  "saved-language-tamil": 86,
};

// Resolution tends to lag and empathy to lead; offsets average to zero.
const BIAS: Scores = { instructions: 2, resolution: -9, grounding: -1, empathy: 11, precision: -3 };

const ISSUES: Record<MetricKey, string[]> = {
  resolution: [
    "No routing to the right specialist for this request",
    "Conversation ended without resolving the customer's request",
  ],
  precision: [
    "Answer was vague where the customer needed exact figures",
    "Claimed a capability the agent does not have",
  ],
  grounding: [
    "Quoted policy terms without a matched policy card",
    "Shared figures that are not in the knowledge base",
  ],
  instructions: [
    "Repeated hold phrase to the customer",
    "Skipped a required confirmation step from the prompt",
  ],
  empathy: [
    "Did not acknowledge the customer's frustration",
    "Redirected the customer before addressing their concern",
  ],
};

const STRENGTHS: Record<MetricKey, string> = {
  resolution: "Resolved the request within the conversation",
  precision: "Gave exact, correct figures",
  grounding: "Stayed grounded in the knowledge base",
  instructions: "Followed every required step in the prompt",
  empathy: "Acknowledged customer frustration",
};

const FIX_FOR: Record<MetricKey, string> = {
  resolution: "router-guardrails",
  precision: "fallback-input",
  grounding: "cite-policy",
  instructions: "handoff",
  empathy: "acknowledge",
};

function scenarioScores(id: string, score: number) {
  const offsets = hash(`${id}:scenarios`) % 2 ? [-6, -2, 1, 5] : [-4, 1, 3];
  return offsets.map((offset) => Math.max(0, Math.min(100, score + offset)));
}

export function outcomeFor(item: RunCase): CaseOutcome {
  const scripted = SCRIPTED[item.id];
  if (scripted) {
    const avg = Math.round(
      METRICS.reduce((sum, m) => sum + scripted.scores[m.key], 0) / METRICS.length,
    );
    return { ...scripted, scenarios: scenarioScores(item.id, avg) };
  }
  const seed = hash(item.id);
  const base = BASE_SCORE[item.id] ?? 45 + (seed % 45);
  const scores = Object.fromEntries(
    METRICS.map((m) => [
      m.key,
      Math.max(5, Math.min(99, base + BIAS[m.key] + (hash(`${item.id}:${m.key}`) % 9) - 4)),
    ]),
  ) as Scores;
  const ranked = [...METRICS].sort((a, b) => scores[a.key] - scores[b.key]);
  const weak = ranked.filter((m) => scores[m.key] < PASS_MARK);
  const strong = [...ranked].reverse().filter((m) => scores[m.key] >= PASS_MARK);
  const rate = (value: number): Rating =>
    value >= PASS_MARK ? "good" : value >= 50 ? "fair" : "poor";
  const turns = 1 + item.followUps.length;
  const generic = [
    "Thanks for reaching out! Let me look into that for you.",
    "Got it. Here's what you need to do next, step by step.",
    "That's all sorted. Is there anything else I can help you with?",
  ];
  return {
    replies: Array.from({ length: turns }, (_, i) => ({
      text: generic[i % generic.length],
      rating: rate(base + (i === 1 ? -6 : 3)),
    })),
    scores,
    scenarios: scenarioScores(item.id, base),
    issues: weak.slice(0, 3).map((m) => ISSUES[m.key][hash(`${item.id}:${m.key}:i`) % 2]),
    strengths: strong.length
      ? strong.slice(0, 2).map((m) => STRENGTHS[m.key])
      : ["Tone stayed polite and helpful"],
    // The weakest dimension's fix, plus one other weak dimension so cases differ.
    fixes: [
      ...new Set(
        [weak[0], weak.slice(1)[hash(`${item.id}:fix`) % Math.max(1, weak.length - 1)]]
          .filter(Boolean)
          .map((m) => FIX_FOR[m.key]),
      ),
    ].map((id) => FIXES[id]),
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

export type RunOption = {
  id: string;
  title: string;
  meta: string;
  score: number;
  cases: RunCase[];
};

export function RunHistoryButton({
  count,
  open,
  onClick,
}: {
  count: number;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Run history"
      aria-expanded={open}
      title="Run history"
      className={cn(
        "relative inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30",
        open
          ? "border-[#C72B65]/40 bg-[#FBE7EF] text-[#C72B65]"
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      <History className="h-3.5 w-3.5" />
      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C72B65] px-1 text-[9.5px] font-semibold tabular-nums text-white ring-2 ring-card">
        {count}
      </span>
    </button>
  );
}

export function RunHistoryPanel({
  options,
  selectedId,
  onSelect,
  onClose,
}: {
  options: RunOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside
      aria-label="Run history"
      className="absolute inset-y-0 right-0 z-20 flex w-[340px] max-w-full flex-col border-l border-border bg-card shadow-[-16px_0_40px_-16px_rgba(16,24,40,0.22)] animate-slide-in"
    >
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
        <History className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-[13.5px] font-semibold text-foreground">Run history</h3>
        <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium tabular-nums text-muted-foreground">
          {options.length}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close run history"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((option, i) => {
          const active = option.id === selectedId;
          const t = tone(option.score);
          const outcomes = option.cases.map((item) => outcomeFor(item));
          const scenarios = outcomes.reduce((sum, outcome) => sum + outcome.scenarios.length, 0);
          const scenariosPassed = outcomes.reduce(
            (sum, outcome) => sum + outcome.scenarios.filter((v) => v >= PASS_MARK).length,
            0,
          );
          const casesPassed = outcomes.filter(casePassed).length;
          const older = options[i + 1];
          const delta = older ? option.score - older.score : undefined;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              aria-current={active}
              className={cn(
                "w-full rounded-xl border p-3.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30",
                active
                  ? "border-[#C72B65]/45 bg-[#FBE7EF]/40 shadow-[0_0_0_3px_rgba(199,43,101,0.08)]"
                  : "border-border bg-card hover:border-foreground/20 hover:bg-muted/30",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
                    {option.title}
                    {i === 0 && (
                      <span className="rounded-full border border-border bg-card px-1.5 text-[10.5px] font-medium text-muted-foreground">
                        Latest
                      </span>
                    )}
                    {active && (
                      <span className="rounded-full bg-[#C72B65] px-1.5 text-[10.5px] font-medium text-white">
                        Viewing
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                    {option.meta}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn("text-[20px] font-semibold leading-none tabular-nums", t.text)}>
                    {option.score}
                    <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
                      /100
                    </span>
                  </p>
                  {delta !== undefined && (
                    <p
                      className={cn(
                        "mt-1 text-[11px] font-medium tabular-nums",
                        delta > 0
                          ? "text-emerald-700"
                          : delta < 0
                            ? "text-red-600"
                            : "text-muted-foreground",
                      )}
                    >
                      {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {Math.abs(delta)} vs prev
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-0.5" aria-hidden="true">
                {outcomes.map((outcome, j) => (
                  <span
                    key={j}
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      casePassed(outcome) ? "bg-emerald-500" : "bg-red-400",
                    )}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11.5px] text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">
                    {casesPassed}/{option.cases.length}
                  </span>{" "}
                  use cases passed
                </span>
                <span>
                  <span className="font-medium text-foreground">
                    {scenariosPassed}/{scenarios}
                  </span>{" "}
                  scenarios
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
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
  if (score < PASS_MARK)
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

const TAG_TONES = [
  "bg-amber-50 text-amber-800",
  "bg-sky-50 text-sky-700",
  "bg-violet-50 text-violet-700",
  "bg-emerald-50 text-emerald-700",
  "bg-rose-50 text-rose-700",
];

const tagTone = (tag: string) => TAG_TONES[hash(tag) % TAG_TONES.length];

const AVATAR_META: Record<RunStatus, { cls: string; accent: string }> = {
  queued: { cls: "bg-muted", accent: "#A3A7B0" },
  running: { cls: "bg-blue-50", accent: "#3B82F6" },
  passed: { cls: "bg-emerald-50", accent: "#10B981" },
  failed: { cls: "bg-red-50", accent: "#EF4444" },
};

// A tiny transcript card: grey lines for the conversation, the lead line and corner dot carry the status.
function CaseAvatar({ status, size = "md" }: { status: RunStatus; size?: "md" | "lg" }) {
  const { cls, accent } = AVATAR_META[status];
  const running = status === "running";
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
        size === "lg" ? "h-9 w-9" : "h-8 w-8",
        cls,
      )}
    >
      <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden="true">
        <rect
          x="8"
          y="5.5"
          width="16"
          height="20"
          rx="3.5"
          fill="#fff"
          stroke="#E2E4E9"
          className="drop-shadow-[0_1px_1.5px_rgba(16,24,40,0.08)]"
        />
        <g className={cn(running && "animate-pulse")}>
          <rect x="11" y="9.5" width="7" height="2" rx="1" fill={accent} />
          <rect x="11" y="13.5" width="10" height="1.6" rx="0.8" fill="#DFE1E6" />
          <rect x="11" y="16.75" width="8" height="1.6" rx="0.8" fill="#E6E7EB" />
          <rect x="11" y="20" width="9" height="1.6" rx="0.8" fill="#ECEDF0" />
        </g>
        <circle cx="24" cy="24.5" r="3.6" fill={accent} stroke="#fff" strokeWidth="1.6" />
        {running && (
          <circle cx="24" cy="24.5" r="3.6" fill="none" stroke={accent} strokeOpacity="0.5">
            <animate attributeName="r" values="3.6;6.5" dur="1.4s" repeatCount="indefinite" />
            <animate
              attributeName="stroke-opacity"
              values="0.5;0"
              dur="1.4s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </svg>
    </span>
  );
}

const STATUS_LINE: Record<RunStatus, { label: string; dot: string; text: string }> = {
  queued: { label: "Queued", dot: "bg-muted-foreground/50", text: "text-muted-foreground" },
  running: { label: "Running", dot: "bg-blue-500 animate-pulse", text: "text-blue-600" },
  passed: { label: "Passed", dot: "bg-emerald-500", text: "text-emerald-700" },
  failed: { label: "Failed", dot: "bg-red-500", text: "text-red-600" },
};

const hideScrollbar = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

// The tab outline shares one colour token; while the open case runs it breathes and the pane pings.
const RAIL_STYLES = `
  @property --rail-line { syntax: "<color>"; inherits: true; initial-value: #EBC6D4; }
  .rail-frame { --rail-line: #EBC6D4; }
  .rail-live { animation: rail-line 1.6s ease-in-out infinite; }
  .rail-live .rail-pane { animation: rail-ping 1.6s ease-out infinite; }
  @keyframes rail-line { 0%, 100% { --rail-line: #EBC6D4; } 50% { --rail-line: #D9628F; } }
  @keyframes rail-ping {
    0% { box-shadow: 0 0 0 0 rgba(199, 43, 101, 0.22); }
    80%, 100% { box-shadow: 0 0 0 9px rgba(199, 43, 101, 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .rail-live, .rail-live .rail-pane { animation: none; }
  }
`;

export function TestRunView({
  cases,
  statuses,
  transcripts,
  typingId,
  progress,
  headerRight,
  focusId = null,
}: {
  headerRight?: React.ReactNode;
  focusId?: string | null;
  cases: RunCase[];
  statuses: Record<string, RunStatus>;
  transcripts: Record<string, RunMessage[]>;
  typingId: string | null;
  progress: number;
}) {
  const runningId = cases.find((item) => statuses[item.id] === "running")?.id ?? null;
  const [selectedId, setSelectedId] = useState(() => focusId ?? runningId ?? cases[0]?.id ?? "");

  // Follow the live case as the run moves on, and honour jumps from the results page.
  const [followed, setFollowed] = useState(runningId);
  if (runningId !== followed) {
    setFollowed(runningId);
    if (runningId) setSelectedId(runningId);
  }
  const [lastFocus, setLastFocus] = useState(focusId);
  if (focusId !== lastFocus) {
    setLastFocus(focusId);
    if (focusId) setSelectedId(focusId);
  }

  const selected = cases.find((item) => item.id === selectedId) ?? cases[0];
  const liveSelected = !!selected && statuses[selected.id] === "running";

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6">
      <h2 className="sr-only">Test run, {cases.length} use cases</h2>
      <div className="mb-4 flex items-center justify-end gap-2">{headerRight}</div>

      <style>{RAIL_STYLES}</style>
      <div
        className={cn(
          "rail-frame grid min-h-[520px] flex-1 basis-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 p-3 shadow-sm md:grid-cols-[minmax(232px,288px)_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)] md:pl-0",
          liveSelected && "rail-live",
        )}
      >
        {/* The rail overlaps the pane's left border by 1px so the selected tab can open into it. */}
        <aside
          aria-label="Use cases"
          className={cn(
            "relative z-10 min-h-0 space-y-0.5 overflow-y-auto pb-8 pl-3 pt-2 md:-mr-px",
            hideScrollbar,
          )}
        >
          <div className="flex items-center justify-between gap-3 pb-4 pl-2.5 pr-3 pt-1.5">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Use cases
              <span className="rounded-full bg-card px-1.5 text-[10px] tabular-nums ring-1 ring-border">
                {cases.length}
              </span>
            </p>
            <div
              className="flex items-center gap-2"
              role="progressbar"
              aria-label="Run progress"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span className="h-1 w-14 overflow-hidden rounded-full bg-neutral-200">
                <span
                  className="block h-full rounded-full bg-[#C72B65] transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </span>
              <span className="w-8 text-right text-[11px] font-semibold tabular-nums text-[#C72B65]">
                {progress}%
              </span>
            </div>
          </div>
          {cases.map((item) => {
            const status = statuses[item.id] ?? "queued";
            const messages = transcripts[item.id] ?? [];
            const last = messages[messages.length - 1];
            const active = item.id === selected?.id;
            const done = status === "passed" || status === "failed";
            const score = done ? caseScore(outcomeFor(item)) : null;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                aria-current={active}
                className={cn(
                  "relative flex items-start gap-2.5 border px-2.5 py-2.5 text-left transition-[background-color,border-color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C72B65]/30",
                  active
                    ? // Selected tab merges into the conversation pane, with curved joins above and below.
                      "z-10 w-full rounded-l-xl border-[var(--rail-line)] bg-card md:rounded-r-none md:border-r-0 md:before:absolute md:before:-top-[17px] md:before:right-0 md:before:h-[17px] md:before:w-[17px] md:before:bg-[radial-gradient(circle_at_0_0,transparent_16px,var(--rail-line)_16px,var(--rail-line)_17px,#fff_17px)] md:before:content-[''] md:after:absolute md:after:-bottom-[17px] md:after:right-0 md:after:h-[17px] md:after:w-[17px] md:after:bg-[radial-gradient(circle_at_0_100%,transparent_16px,var(--rail-line)_16px,var(--rail-line)_17px,#fff_17px)] md:after:content-['']"
                    : "w-[calc(100%-0.75rem)] rounded-xl border-transparent hover:bg-card/60",
                )}
              >
                <CaseAvatar status={status} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      title={item.title}
                      className={cn(
                        "truncate text-[12.5px] leading-5",
                        active ? "font-semibold text-foreground" : "font-medium text-foreground/90",
                      )}
                    >
                      {item.title}
                    </span>
                    {status === "running" ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-blue-50 px-1.5 text-[10.5px] font-semibold leading-[18px] text-blue-600">
                        <span className="h-1 w-1 animate-pulse rounded-full bg-blue-500" />
                        Live
                      </span>
                    ) : score !== null ? (
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-1.5 text-[10.5px] font-semibold leading-[18px] tabular-nums",
                          tone(score).tile,
                          tone(score).text,
                        )}
                      >
                        {score}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10.5px] text-muted-foreground">Queued</span>
                    )}
                  </span>
                  <span className="block truncate text-[11.5px] leading-[18px] text-muted-foreground">
                    {typingId === item.id
                      ? "Agent is typing…"
                      : last
                        ? `${last.role === "bot" ? "Agent: " : ""}${last.text}`
                        : status === "queued"
                          ? "Waiting to start"
                          : "Starting conversation…"}
                  </span>
                  {item.tags.length > 0 && (
                    <span className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                      <span
                        className={cn("rounded px-1.5 py-px font-medium", tagTone(item.tags[0]))}
                      >
                        {item.tags[0]}
                      </span>
                      {item.tags[1]}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </aside>

        {selected && (
          <ConversationPane
            key={selected.id}
            item={selected}
            status={statuses[selected.id] ?? "queued"}
            messages={transcripts[selected.id] ?? []}
            typing={typingId === selected.id}
          />
        )}
      </div>
    </div>
  );
}

function ConversationPane({
  item,
  status,
  messages,
  typing,
}: {
  item: RunCase;
  status: RunStatus;
  messages: RunMessage[];
  typing: boolean;
}) {
  const threadRef = useRef<HTMLDivElement>(null);
  const line = STATUS_LINE[status];
  const done = status === "passed" || status === "failed";
  const score = done ? caseScore(outcomeFor(item)) : null;

  // Land on the latest message, then glide along as new ones arrive.
  const seen = useRef(false);
  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    thread.scrollTo({ top: thread.scrollHeight, behavior: seen.current ? "smooth" : "auto" });
    seen.current = true;
  }, [messages.length, typing]);

  return (
    <section className="rail-pane flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--rail-line)] bg-card animate-fade-up">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <CaseAvatar status={status} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-semibold text-foreground">{item.title}</h3>
          <p className={cn("flex items-center gap-1.5 text-[11.5px] font-medium", line.text)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", line.dot)} />
            {line.label}
            {score !== null && (
              <span className="font-normal text-muted-foreground">· score {score}</span>
            )}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div
        ref={threadRef}
        className={cn("min-h-0 flex-1 space-y-3.5 overflow-y-auto px-5 py-4", hideScrollbar)}
      >
        {messages.length === 0 && !typing ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Clock className="h-4 w-4" />
            </span>
            <p className="text-[12.5px] text-muted-foreground">
              {status === "running"
                ? "Starting conversation…"
                : "This use case starts when the earlier ones finish."}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, i) =>
              message.role === "user" ? (
                <div key={i} className="flex flex-col items-start gap-1 animate-fade-up">
                  <p className="max-w-[70%] rounded-2xl rounded-tl-md bg-muted/70 px-3.5 py-2 text-[12.5px] leading-relaxed text-foreground">
                    {message.text}
                  </p>
                  <span className="pl-1 text-[10.5px] text-muted-foreground">
                    Simulated customer
                  </span>
                </div>
              ) : (
                <div key={i} className="flex flex-col items-end gap-1 animate-fade-up">
                  <p
                    className={cn(
                      "max-w-[70%] rounded-2xl rounded-tr-md border px-3.5 py-2 text-[12.5px] leading-relaxed text-foreground",
                      message.rating
                        ? RATING_META[message.rating].bubble
                        : "border-[#C72B65]/15 bg-[#FBE7EF]/60",
                    )}
                  >
                    {message.text}
                  </p>
                  {message.rating ? (
                    <RatingChips rating={message.rating} />
                  ) : (
                    <span className="pr-1 text-[11px] text-muted-foreground">Agent</span>
                  )}
                </div>
              ),
            )}
            {typing && (
              <div className="flex justify-end">
                <span className="inline-flex items-center gap-1 rounded-2xl rounded-tr-md border border-[#C72B65]/15 bg-[#FBE7EF]/60 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C72B65]/70" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C72B65]/70 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C72B65]/70 [animation-delay:300ms]" />
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="shrink-0 border-t border-border px-4 py-2.5">
        <div className="flex h-9 items-center gap-2 rounded-full border border-border bg-muted/30 px-3.5 text-[12px] text-muted-foreground">
          {status === "running" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
              {typing ? "Agent is replying…" : "Simulated customer is replying…"}
            </>
          ) : done ? (
            <>
              {status === "passed" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              Test finished · {messages.filter((m) => m.role === "bot").length} agent replies scored
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5" />
              Waiting for earlier use cases to finish
            </>
          )}
          <span className="ml-auto text-[11px]">Read-only test conversation</span>
        </div>
      </footer>
    </section>
  );
}

function RatingChips({ rating }: { rating: Rating }) {
  const meta = RATING_META[rating];
  const Icon = meta.Icon;
  return (
    <div className="flex items-center gap-1.5">
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

type ResultRow = {
  item: RunCase;
  outcome: CaseOutcome;
  score: number;
  gap: number;
  scenariosPassed: number;
};

const RADAR_ORDER: MetricKey[] = [
  "instructions",
  "resolution",
  "grounding",
  "empathy",
  "precision",
];

const metricLabel = (key: MetricKey) => METRICS.find((m) => m.key === key)?.label ?? key;

const signed = (value: number) => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : "+0");

function gapText(gap: number) {
  if (gap >= 0) return "text-emerald-700";
  return tone(PASS_MARK + gap).text;
}

function ResultsSection({
  step,
  title,
  note,
  action,
  className,
  children,
}: {
  step: number;
  title: string;
  note?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={`results-step-${step}`}
      className={cn("flex min-w-0 flex-col rounded-2xl bg-muted/50 p-2", className)}
    >
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2 px-2 pb-2 pt-0.5">
        <div className="flex items-baseline gap-2">
          <span className="flex h-[18px] w-[18px] shrink-0 translate-y-[3px] items-center justify-center rounded-full bg-foreground text-[10.5px] font-semibold text-background">
            {step}
          </span>
          <h3 id={`results-step-${step}`} className="text-[13.5px] font-semibold text-foreground">
            {title}
          </h3>
          {note && <span className="text-[12px] text-muted-foreground">{note}</span>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ScoreDial({ score }: { score: number }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="18" cy="18" r={radius} fill="none" stroke="#EEF0F3" strokeWidth="4" />
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill="none"
        stroke={tone(score).ring}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - score / 100)}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}

const CARD_VARIANTS = {
  neutral: {
    card: "border-border bg-muted/30",
    value: "text-foreground",
    label: "text-foreground/80",
  },
  pass: {
    card: "border-emerald-200 bg-emerald-50/70",
    value: "text-emerald-700",
    label: "text-emerald-700",
  },
  fail: { card: "border-red-200 bg-red-50/70", value: "text-red-600", label: "text-red-600" },
};

function MetricCard({
  value,
  suffix,
  label,
  hint,
  hintClassName,
  valueClassName,
  accessory,
  variant = "neutral",
}: {
  value: number;
  suffix?: string;
  label: string;
  hint: React.ReactNode;
  hintClassName?: string;
  valueClassName?: string;
  accessory?: React.ReactNode;
  variant?: keyof typeof CARD_VARIANTS;
}) {
  const v = CARD_VARIANTS[variant];
  return (
    <div className={cn("flex flex-col rounded-xl border px-4 py-3.5", v.card)}>
      <div className="flex h-9 items-center justify-between gap-2">
        <span
          className={cn(
            "text-[26px] font-semibold leading-none tabular-nums",
            v.value,
            valueClassName,
          )}
        >
          {value}
          {suffix && (
            <span className="ml-0.5 text-[13px] font-medium text-muted-foreground">{suffix}</span>
          )}
        </span>
        {accessory}
      </div>
      <span className={cn("mt-2 text-[13px] font-medium", v.label)}>{label}</span>
      <span className={cn("mt-0.5 truncate text-[12px] text-muted-foreground", hintClassName)}>
        {hint}
      </span>
    </div>
  );
}

function ScoreRadar({ scores }: { scores: Scores }) {
  const width = 220;
  const center = width / 2;
  const middle = 84;
  const radius = 58;
  const point = (i: number, value: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / RADAR_ORDER.length;
    const r = (radius * value) / 100;
    return [center + r * Math.cos(angle), middle + r * Math.sin(angle)] as const;
  };
  const polygon = (values: number[]) =>
    values.map((value, i) => point(i, value).join(",")).join(" ");
  return (
    <figure className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${width} 166`}
        className="h-[166px] w-[220px]"
        role="img"
        aria-label={RADAR_ORDER.map((key) => `${metricLabel(key)} ${scores[key]}`).join(", ")}
      >
        <g>
          <polygon
            points={polygon(RADAR_ORDER.map(() => 100))}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
          {RADAR_ORDER.map((_, i) => {
            const [x, y] = point(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={middle}
                x2={x}
                y2={y}
                stroke="#EEF0F3"
                strokeWidth="1"
              />
            );
          })}
          <polygon
            points={polygon(RADAR_ORDER.map(() => PASS_MARK))}
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <polygon
            points={polygon(RADAR_ORDER.map((key) => scores[key]))}
            fill="#C72B65"
            fillOpacity="0.16"
            stroke="#C72B65"
            strokeWidth="1.5"
            strokeLinejoin="round"
            className="transition-all duration-500"
          />
          {RADAR_ORDER.map((key, i) => {
            const [x, y] = point(i, 100);
            const dx = x - center;
            return (
              <text
                key={key}
                x={x + (Math.abs(dx) < 4 ? 0 : dx > 0 ? 6 : -6)}
                y={y + (y < middle - 10 ? -7 : y > middle + 10 ? 13 : 4)}
                textAnchor={Math.abs(dx) < 4 ? "middle" : dx > 0 ? "start" : "end"}
                className="fill-muted-foreground text-[9.5px]"
              >
                {metricLabel(key)}
              </text>
            );
          })}
        </g>
      </svg>
      <figcaption className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded-full bg-[#C72B65]" />
          This case
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 border-t border-dashed border-muted-foreground" />
          Target {PASS_MARK}
        </span>
      </figcaption>
    </figure>
  );
}

function CasesFillerIllustration({ count }: { count: number }) {
  // Two stacked use-case cards with a miniature of the chart above and a pass-mark target.
  // Sized from the surrounding size container, so it grows with the empty space.
  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 180 124"
        className="w-[clamp(140px,min(64cqh,62cqw),300px)] max-w-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="cf-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F8EEF2" />
            <stop offset="100%" stopColor="#F8EEF2" stopOpacity="0" />
          </radialGradient>
          <filter id="cf-lift" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#101828" floodOpacity="0.07" />
          </filter>
        </defs>

        <circle cx="90" cy="64" r="58" fill="url(#cf-bg)" />
        <circle
          cx="90"
          cy="64"
          r="50"
          fill="none"
          stroke="#EADDE3"
          strokeDasharray="1.5 4"
          strokeLinecap="round"
        />

        <g transform="rotate(-8 74 66)">
          <rect x="40" y="34" width="76" height="58" rx="9" fill="#F5F5F7" stroke="#E5E6EA" />
          <rect x="50" y="45" width="30" height="4" rx="2" fill="#E6E7EB" />
          <rect x="50" y="53" width="20" height="4" rx="2" fill="#ECEDF0" />
        </g>

        <g transform="rotate(4 104 70)" filter="url(#cf-lift)">
          <rect x="60" y="38" width="88" height="64" rx="10" fill="#fff" stroke="#E3E4E9" />
          <rect x="70" y="48" width="40" height="5" rx="2.5" fill="#DFE1E6" />
          <rect x="70" y="57" width="24" height="4" rx="2" fill="#ECEDF0" />
          <rect x="122" y="46" width="16" height="10" rx="5" fill="#FBEAF0" />
          <line x1="104" x2="104" y1="67" y2="94" stroke="#CDD0D7" strokeDasharray="2 2" />
          <rect x="84" y="70" width="20" height="5" rx="2.5" fill="#F8C98A" />
          <rect x="104" y="79" width="28" height="5" rx="2.5" fill="#8FD9B6" />
          <rect x="94" y="88" width="10" height="4" rx="2" fill="#E6E7EB" />
        </g>

        <g>
          <circle cx="150" cy="36" r="13" fill="#fff" stroke="#F1D2DE" />
          <circle cx="150" cy="36" r="8" fill="none" stroke="#E9A9C1" strokeWidth="1.2" />
          <circle cx="150" cy="36" r="3" fill="#C72B65" />
        </g>

        <path d="M32 26l1.2 3.3 3.3 1.2-3.3 1.2-1.2 3.3-1.2-3.3-3.3-1.2 3.3-1.2z" fill="#E7BFD0" />
        <circle cx="148" cy="104" r="2" fill="#EADDE3" />
      </svg>
      <p className="mt-2 text-[clamp(11.5px,2.6cqh,13px)] text-muted-foreground">
        {count} use {count === 1 ? "case" : "cases"} in this run
      </p>
    </div>
  );
}

export function TestResultsView({
  cases,
  header,
  previousScore,
  onViewConversation,
}: {
  cases: RunCase[];
  header?: React.ReactNode;
  previousScore?: number;
  onViewConversation?: (caseId: string) => void;
}) {
  const rows: ResultRow[] = cases
    .map((item) => {
      const outcome = outcomeFor(item);
      const score = caseScore(outcome);
      return {
        item,
        outcome,
        score,
        gap: score - PASS_MARK,
        scenariosPassed: outcome.scenarios.filter((value) => value >= PASS_MARK).length,
      };
    })
    .sort((a, b) => a.gap - b.gap);

  const [selectedId, setSelectedId] = useState(() => rows[0]?.item.id ?? "");
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set());
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const count = rows.length || 1;
  const overall = Math.round(rows.reduce((sum, row) => sum + row.score, 0) / count);
  const totalScenarios = rows.reduce((sum, row) => sum + row.outcome.scenarios.length, 0);
  const passedScenarios = rows.reduce((sum, row) => sum + row.scenariosPassed, 0);
  const fullyPassed = rows.filter((row) => row.scenariosPassed === row.outcome.scenarios.length);
  const casesWithFailures = rows.length - fullyPassed.length;
  const below = rows.filter((row) => row.gap < 0).length;
  const at = rows.filter((row) => row.gap === 0).length;
  const averages = METRICS.map((metric) => ({
    ...metric,
    value: Math.round(rows.reduce((sum, row) => sum + row.outcome.scores[metric.key], 0) / count),
  })).sort((a, b) => a.value - b.value);
  const weakest = averages[0];
  const delta = previousScore === undefined ? undefined : overall - previousScore;

  const selectedIndex = Math.max(
    0,
    rows.findIndex((row) => row.item.id === selectedId),
  );
  const selected = rows[selectedIndex];
  const step = (direction: 1 | -1) =>
    setSelectedId(rows[(selectedIndex + direction + rows.length) % rows.length].item.id);

  // Merge each case's fixes into one list, ranked by how many use cases they touch.
  const fixList = Object.values(
    rows.reduce<Record<string, { fix: Fix; rows: ResultRow[]; issues: number }>>((acc, row) => {
      row.outcome.fixes.forEach((fix) => {
        const entry = (acc[fix.id] ??= { fix, rows: [], issues: 0 });
        entry.rows.push(row);
        entry.issues += Math.ceil(row.outcome.issues.length / row.outcome.fixes.length);
      });
      return acc;
    }, {}),
  )
    .map((entry) => ({
      ...entry,
      targets: entry.fix.targets
        .map((key) => ({
          key,
          gap: Math.round(
            entry.rows.reduce((sum, row) => sum + row.outcome.scores[key], 0) / entry.rows.length -
              PASS_MARK,
          ),
        }))
        .filter((target) => target.gap < 0),
    }))
    .sort(
      (a, b) =>
        b.rows.length - a.rows.length ||
        Number(b.fix.severity === "high") - Number(a.fix.severity === "high") ||
        b.issues - a.issues,
    );
  const chosen = fixList.filter((entry) => !excluded.has(entry.fix.id)).length;

  return (
    <div className="space-y-4 p-6 animate-fade-up">
      {header}

      <ResultsSection step={1} title="How did this run do?">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
            <MetricCard
              value={overall}
              suffix="/100"
              label="Overall score"
              valueClassName={tone(overall).text}
              accessory={<ScoreDial score={drawn ? overall : 0} />}
              hint={
                delta === undefined
                  ? "First run"
                  : delta === 0
                    ? "No change vs last run"
                    : `${delta > 0 ? "▲" : "▼"} ${Math.abs(delta)} vs last run`
              }
              hintClassName={cn(
                delta !== undefined && delta > 0 && "font-medium text-emerald-700",
                delta !== undefined && delta < 0 && "font-medium text-red-600",
              )}
            />
            <MetricCard
              value={totalScenarios}
              label="Total scenarios"
              hint={`across ${rows.length} use ${rows.length === 1 ? "case" : "cases"}`}
            />
            <MetricCard
              value={passedScenarios}
              label="Passed"
              hint={`${Math.round((passedScenarios / (totalScenarios || 1)) * 100)}% pass rate`}
              hintClassName="font-medium text-emerald-700/90"
              variant="pass"
            />
            <MetricCard
              value={totalScenarios - passedScenarios}
              label="Failed"
              hint={`in ${casesWithFailures} use ${casesWithFailures === 1 ? "case" : "cases"}`}
              hintClassName="font-medium text-red-600/90"
              variant="fail"
            />
            <MetricCard
              value={rows.length}
              label={rows.length === 1 ? "Use case" : "Use cases"}
              hint={`${fullyPassed.length} fully passed`}
            />
          </div>

          <p className="mt-4 text-[14px] text-foreground/80">
            {below > 0 ? (
              <>
                <span className="font-semibold text-foreground">
                  {below} of {rows.length}
                </span>{" "}
                use {rows.length === 1 ? "case" : "cases"} below target
              </>
            ) : (
              <span className="font-semibold text-foreground">All use cases on target</span>
            )}
            <span className="text-muted-foreground"> · </span>weakest:{" "}
            <span className="font-semibold text-foreground">{weakest.label}</span>
            <span className="text-muted-foreground"> · pass mark {PASS_MARK}</span>
          </p>

          <h4 className="mt-4 text-[11px] font-bold uppercase tracking-[0.08em] text-foreground">
            Avg score
          </h4>
          <div className="mt-2.5 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3 xl:grid-cols-5">
            {averages.map((metric) => {
              const t = tone(metric.value);
              return (
                <div key={metric.key}>
                  <p className="text-[12.5px] text-muted-foreground">{metric.label}</p>
                  <p className={cn("mt-0.5 text-[17px] font-semibold tabular-nums", t.text)}>
                    {metric.value}
                  </p>
                  <div className="relative mt-1.5 h-1 rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-700 ease-out",
                        t.bar,
                      )}
                      style={{ width: drawn ? `${metric.value}%` : 0 }}
                    />
                    <span
                      className="absolute -top-1 h-3 w-px bg-foreground/70"
                      style={{ left: `${PASS_MARK}%` }}
                      title={`Pass mark ${PASS_MARK}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ResultsSection>

      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <ResultsSection step={2} title="Which use cases are below target?">
          <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(80px,1fr)_36px_26px] items-end gap-3 px-2 pb-2 text-[10.5px] font-medium text-muted-foreground">
              <span>Use case</span>
              <span className="grid grid-cols-2">
                <span className="pr-1.5 text-right">below</span>
                <span className="pl-1.5">above</span>
              </span>
              <span className="text-right">Gap</span>
              <span className="text-right">Score</span>
            </div>
            <div
              className="space-y-0.5"
              role="listbox"
              aria-label="Use cases by distance from target"
            >
              {rows.map((row) => {
                const active = row.item.id === selected?.item.id;
                const width = `${(Math.min(Math.abs(row.gap), 50) / 50) * 50}%`;
                return (
                  <button
                    key={row.item.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => setSelectedId(row.item.id)}
                    className={cn(
                      "grid w-full grid-cols-[minmax(0,1.5fr)_minmax(80px,1fr)_36px_26px] items-center gap-3 rounded-lg px-2 py-[7px] text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30",
                      active ? "bg-muted" : "hover:bg-muted/50",
                    )}
                  >
                    <span
                      title={row.item.title}
                      className={cn(
                        "truncate text-[12.5px]",
                        active ? "font-semibold text-foreground" : "text-foreground/85",
                      )}
                    >
                      {row.item.title}
                    </span>
                    <span className="relative h-2.5">
                      <span className="absolute left-1/2 top-1/2 h-3.5 w-px -translate-y-1/2 bg-foreground/60" />
                      <span
                        className={cn(
                          "absolute top-0 h-full transition-[width] duration-700 ease-out",
                          row.gap < 0
                            ? cn("right-1/2 rounded-l-sm", tone(row.score).bar)
                            : "left-1/2 rounded-r-sm bg-emerald-500",
                        )}
                        style={{ width: drawn ? width : 0 }}
                      />
                    </span>
                    <span
                      className={cn(
                        "text-right text-[12px] font-semibold tabular-nums",
                        gapText(row.gap),
                      )}
                    >
                      {signed(row.gap)}
                    </span>
                    <span className="text-right text-[12px] tabular-nums text-muted-foreground">
                      {row.score}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="relative min-h-0 flex-1 [container-type:size]">
              <div className="absolute inset-0 hidden items-center justify-center px-4 [@container(min-height:130px)]:flex">
                <CasesFillerIllustration count={rows.length} />
              </div>
            </div>
            <p className="border-t border-border/70 px-2 pt-2.5 text-[11px] text-muted-foreground">
              Centre line = pass mark {PASS_MARK} · {below} below · {at} at ·{" "}
              {rows.length - below - at} above
            </p>
          </div>
        </ResultsSection>

        <ResultsSection step={3} title="Why did it score this way?">
          {selected && (
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-border/70 px-4 py-3">
                <div className="min-w-0">
                  <h4 className="truncate text-[15px] font-semibold text-foreground">
                    {selected.item.title}
                  </h4>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="flex gap-0.5" aria-hidden="true">
                      {selected.outcome.scenarios.map((value, i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1 w-2.5 rounded-full",
                            value >= PASS_MARK ? "bg-emerald-500" : "bg-red-500",
                          )}
                        />
                      ))}
                    </span>
                    <span className="text-[11.5px] text-muted-foreground">
                      {selected.scenariosPassed} of {selected.outcome.scenarios.length} scenarios
                      passed
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-[26px] font-semibold leading-none tabular-nums",
                        tone(selected.score).text,
                      )}
                    >
                      {selected.score}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {signed(selected.gap)} vs target
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="Previous use case"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-muted"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="Next use case"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-muted"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid items-center gap-4 px-4 py-3 sm:grid-cols-[220px_minmax(0,1fr)]">
                <ScoreRadar scores={selected.outcome.scores} />
                <div>
                  <p className="mb-1.5 text-[11.5px] text-muted-foreground">Distance from target</p>
                  <div className="space-y-1">
                    {RADAR_ORDER.map((key) => {
                      const value = selected.outcome.scores[key];
                      const gap = value - PASS_MARK;
                      return (
                        <div
                          key={key}
                          className="grid grid-cols-[84px_minmax(0,1fr)_34px_24px] items-center gap-2.5 py-1"
                        >
                          <span className="text-[12px] text-foreground/85">{metricLabel(key)}</span>
                          <span className="relative h-1.5">
                            <span
                              className={cn(
                                "absolute top-0 h-full rounded-full transition-all duration-500 ease-out",
                                gap < 0 ? tone(value).bar : "bg-emerald-500",
                              )}
                              style={{
                                left: `${Math.min(value, PASS_MARK)}%`,
                                width: `${Math.abs(gap)}%`,
                              }}
                            />
                            <span
                              className="absolute -top-[3px] h-3 w-px bg-foreground/70"
                              style={{ left: `${PASS_MARK}%` }}
                            />
                          </span>
                          <span
                            className={cn(
                              "text-right text-[12px] font-semibold tabular-nums",
                              gapText(gap),
                            )}
                          >
                            {signed(gap)}
                          </span>
                          <span className="text-right text-[11.5px] tabular-nums text-muted-foreground">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-auto grid border-t border-border/70 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <div className="px-4 py-3">
                  <h5 className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-red-600">
                    Issues · {selected.outcome.issues.length}
                  </h5>
                  {selected.outcome.issues.length ? (
                    <ul className="mt-2 space-y-1.5">
                      {selected.outcome.issues.map((issue) => (
                        <li key={issue} className="flex gap-2 text-[12.5px] text-foreground/85">
                          <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[12.5px] text-muted-foreground">No issues found.</p>
                  )}
                  {onViewConversation && (
                    <button
                      type="button"
                      onClick={() => onViewConversation(selected.item.id)}
                      className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[#C72B65] hover:underline"
                    >
                      View conversation
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="border-t border-border/70 px-4 py-3 sm:border-l sm:border-t-0">
                  <h5 className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                    Strengths · {selected.outcome.strengths.length}
                  </h5>
                  <ul className="mt-2 space-y-1.5">
                    {selected.outcome.strengths.map((strength) => (
                      <li key={strength} className="flex gap-2 text-[12.5px] text-foreground/85">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selected.outcome.scenarios.map((value, i) => (
                      <span
                        key={i}
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[11px] tabular-nums",
                          value >= PASS_MARK
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600",
                        )}
                      >
                        Scenario {i + 1} · {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </ResultsSection>
      </div>

      <ResultsSection
        step={4}
        title="What should I fix?"
        note={fixList.length ? "Ordered by use cases affected" : undefined}
        action={
          fixList.length > 0 && (
            <button
              type="button"
              disabled={chosen === 0}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#C72B65] px-3 text-[12.5px] font-medium text-white shadow-sm transition hover:bg-[#A92355] disabled:cursor-not-allowed disabled:bg-[#C72B65]/45"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Enhance prompt with {chosen === fixList.length ? "these" : chosen}{" "}
              {chosen === 1 ? "fix" : "fixes"}
            </button>
          )
        }
      >
        {fixList.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-[13px] text-foreground">
              Nothing to fix. Every use case met the pass mark of {PASS_MARK}.
            </p>
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {fixList.map(({ fix, rows: affected, issues, targets }) => {
              const included = !excluded.has(fix.id);
              return (
                <label
                  key={fix.id}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border bg-card p-3.5 shadow-sm transition",
                    included ? "border-border" : "border-dashed border-border opacity-60",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={included}
                    onChange={() =>
                      setExcluded((current) => {
                        const next = new Set(current);
                        if (next.has(fix.id)) next.delete(fix.id);
                        else next.add(fix.id);
                        return next;
                      })
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#C72B65]"
                    aria-label={`Include "${fix.title}"`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-foreground">
                        {fix.title}
                      </span>
                      <span
                        className={cn(
                          "rounded border px-1.5 py-px text-[9.5px] font-bold uppercase tracking-wider",
                          fix.severity === "high"
                            ? "border-red-200 bg-red-50 text-red-600"
                            : "border-amber-200 bg-amber-50 text-amber-700",
                        )}
                      >
                        {fix.severity === "high" ? "High" : "Med"}
                      </span>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                      <span className="font-mono text-[11.5px] text-foreground/80">
                        {fix.agent}
                      </span>{" "}
                      · {fix.category} — {fix.description}
                    </p>
                    <p className="mt-1.5 text-[11.5px] font-medium text-foreground/70">
                      Resolves {issues} {issues === 1 ? "issue" : "issues"} · {affected.length} use{" "}
                      {affected.length === 1 ? "case" : "cases"}
                    </p>
                  </div>
                  {targets.length > 0 && (
                    <div className="w-[118px] shrink-0">
                      <p className="text-[11px] text-muted-foreground">Targets</p>
                      <div className="mt-1 flex flex-col items-start gap-1">
                        {targets.map((target) => (
                          <span
                            key={target.key}
                            className={cn(
                              "rounded border px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                              tone(PASS_MARK + target.gap).tile,
                              tone(PASS_MARK + target.gap).text,
                            )}
                          >
                            {metricLabel(target.key)} {signed(target.gap)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </ResultsSection>
    </div>
  );
}
