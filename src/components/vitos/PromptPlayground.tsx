import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Asterisk,
  Bookmark,
  CalendarDays,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  CornerDownRight,
  FlaskConical,
  GripVertical,
  History,
  MessageSquare,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  RunHistoryButton,
  RunHistoryPanel,
  TestResultsView,
  TestRunView,
  caseScore,
  casePassed,
  completedRun,
  outcomeFor,
  runScore,
  userTurns,
  type RunMessage,
  type RunRecord,
  type RunStatus,
} from "./PromptTestRun";

const BRAND = "#C72B65";

const MODELS = [
  { id: "haiku", label: "Claude Haiku 4.5 (Fast)" },
  { id: "sonnet", label: "Claude Sonnet 5.5 (Balanced)" },
  { id: "opus", label: "Claude Opus 5.5 (Most capable)" },
];

type UseCase = {
  id: string;
  title: string;
  description: string;
  opener: string;
  followUps: string[];
  tags: string[];
};

const USE_CASE_LIBRARY: UseCase[] = [
  {
    id: "uc-onboarding",
    title: "Cooperative Customer Completes Full Loan Onboarding Flow",
    description:
      "A new user with clear loan-onboarding intent moves smoothly through in-app onboarding, sharing the required information at each stage, confirming documents, verifying personal details, accepting terms and submitting the application.",
    opener:
      "Hi, I downloaded the app and got a loan offer. I'm ready to complete the onboarding right now if that's possible.",
    followUps: [
      "Yes, I have all my documents ready. I've got my PAN, Aadhaar and recent bank statements. Should I start uploading them now?",
      "That sounds good. I'm logged into the app, so whenever you're ready I can go through the steps. What do I need to do first?",
    ],
    tags: ["Transactional", "Medium"],
  },
  {
    id: "uc-rates",
    title: "Hesitant User Asks About Interest Rates Before Proceeding",
    description:
      "The customer is interested but wants to understand the interest rate, processing fee and EMI before sharing any documents. The agent should explain clearly and guide them back to onboarding.",
    opener: "Before I share anything, what interest rate will I actually get on this loan?",
    followUps: [
      "Is there a processing fee on top of that? I don't want any surprises later.",
      "Okay, and what would my EMI be for 36 months?",
    ],
    tags: ["Informational", "Easy"],
  },
  {
    id: "uc-wrong-doc",
    title: "User Uploads the Wrong Document Type During KYC",
    description:
      "The user uploads a utility bill when the flow asks for a PAN card. The agent should catch the mismatch, explain what is needed and help the user retry without losing progress.",
    opener: "I've uploaded my document, can you check if everything is fine?",
    followUps: [
      "Oh, I thought the electricity bill would work as ID proof.",
      "Okay, I'll upload my PAN card instead. Will I have to start again?",
    ],
    tags: ["Error recovery", "Hard"],
  },
  {
    id: "uc-language",
    title: "Customer Switches to Hindi Mid-Conversation",
    description:
      "The conversation starts in English, then the customer switches to Hindi. The agent should continue in Hindi while keeping the onboarding context intact.",
    opener: "Hi, I want to know the status of my loan application.",
    followUps: [
      "Kya aap Hindi mein baat kar sakte hain? Mujhe aasaan lagega.",
      "Theek hai, mujhe aur kaun se documents dene honge?",
    ],
    tags: ["Multilingual", "Medium"],
  },
  {
    id: "uc-resume",
    title: "User Drops Off and Resumes Onboarding the Next Day",
    description:
      "The customer leaves halfway through onboarding and returns a day later. The agent should recognise the saved progress and continue from the last completed step.",
    opener: "I started my loan application yesterday but had to stop in the middle.",
    followUps: [
      "Do I need to upload my documents again?",
      "Great, let's continue from where I left off.",
    ],
    tags: ["Edge case", "Hard"],
  },
];

type SavedCase = { item: UseCase; savedAt: number; result?: number };

const SEED_RESULTS = [92, 88, 95, 76, 90, 84, 97, 81, 93, 86, 79, 91, 89, 94];

const DAY = 24 * 60 * 60 * 1000;

function seedSavedCases(): SavedCase[] {
  return seedEntries().map((entry, i) => ({
    ...entry,
    result: SEED_RESULTS[i % SEED_RESULTS.length],
  }));
}

function daysAgoAt(daysAgo: number, hour: number, minute: number) {
  const date = new Date(Date.now() - daysAgo * DAY);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
}

function seedRuns(): RunRecord[] {
  const savedItems = seedEntries().map((entry) => entry.item);
  const pick = (ids: string[]) => savedItems.filter((item) => ids.includes(item.id));
  return [
    completedRun(
      "run-seed-1",
      pick(["saved-cibil", "saved-human", "saved-bank-change"]),
      daysAgoAt(4, 11, 20),
    ),
    completedRun("run-seed-2", USE_CASE_LIBRARY.slice(0, 2), daysAgoAt(1, 16, 35)),
    completedRun(
      "run-seed-3",
      pick([
        "saved-fraud",
        "saved-rejection",
        "saved-otp",
        "saved-coapplicant",
        "saved-salary-slip",
        "saved-topup",
        "saved-prepay",
        "saved-emi-date",
        "saved-address",
        "saved-language-tamil",
      ]),
      daysAgoAt(1, 18, 5),
    ),
  ];
}

function seedEntries(): SavedCase[] {
  const now = Date.now();
  const at = (daysAgo: number, hour: number, minute: number) => {
    const date = new Date(now - daysAgo * DAY);
    date.setHours(hour, minute, 0, 0);
    return date.getTime();
  };
  return [
    {
      savedAt: at(1, 16, 20),
      item: {
        id: "saved-tenure",
        title: "Customer Requests a Longer Loan Tenure",
        description:
          "After seeing the EMI, the customer asks to stretch the tenure from 36 to 48 months. The agent should explain the impact on total interest and update the offer.",
        opener: "The EMI is a bit high for me. Can I take this loan for 48 months instead?",
        followUps: [
          "How much extra interest would I pay overall?",
          "Okay, let's go with 48 months.",
        ],
        tags: ["Transactional", "Medium"],
      },
    },
    {
      savedAt: at(4, 11, 5),
      item: {
        id: "saved-cibil",
        title: "Applicant Disputes Their Credit Score",
        description:
          "The applicant believes their credit score is wrong and is upset about the offered rate. The agent should stay calm, explain how the score was pulled and share the dispute process.",
        opener: "My CIBIL score can't be that low. Why is my interest rate so high?",
        followUps: ["Where did you even get this score from?", "How do I raise a correction?"],
        tags: ["Escalation", "Hard"],
      },
    },
    {
      savedAt: at(4, 9, 40),
      item: {
        id: "saved-human",
        title: "User Asks to Speak to a Human Agent",
        description:
          "Midway through onboarding the user asks for a human. The agent should acknowledge the request, try to resolve quickly, and hand over with context if the user insists.",
        opener: "I don't want to talk to a bot. Can you connect me to a real person?",
        followUps: ["No, I'd still prefer a person, please."],
        tags: ["Handoff", "Easy"],
      },
    },
    {
      savedAt: at(9, 15, 30),
      item: {
        id: "saved-bank-change",
        title: "Customer Changes Disbursement Bank Account",
        description:
          "Just before disbursement the customer wants the funds sent to a different bank account. The agent should verify the new account and confirm the change.",
        opener: "Can you send the loan amount to my SBI account instead of HDFC?",
        followUps: ["Here's the new account number and IFSC.", "Will this delay my disbursement?"],
        tags: ["Transactional", "Medium"],
      },
    },
    {
      savedAt: at(6, 9, 0),
      item: {
        id: "saved-prepay",
        title: "Customer Asks About Prepayment Charges",
        description:
          "The customer wants to close the loan early and asks about foreclosure charges. The agent should explain the charges and lock-in period clearly.",
        opener: "If I repay the loan after a year, will there be any penalty?",
        followUps: ["What if I only prepay part of it?"],
        tags: ["Informational", "Easy"],
      },
    },
    {
      savedAt: at(6, 9, 47),
      item: {
        id: "saved-coapplicant",
        title: "Applicant Wants to Add a Co-Applicant",
        description:
          "To get a higher amount, the applicant wants to add their spouse as a co-applicant. The agent should explain the required documents and next steps.",
        opener: "Can I add my wife as a co-applicant to get a bigger loan?",
        followUps: ["What documents will she need?"],
        tags: ["Transactional", "Medium"],
      },
    },
    {
      savedAt: at(6, 10, 34),
      item: {
        id: "saved-otp",
        title: "User Doesn't Receive the OTP",
        description:
          "The user is stuck at mobile verification because the OTP never arrives. The agent should troubleshoot and offer a resend or alternate verification.",
        opener: "I've been waiting but the OTP still hasn't come.",
        followUps: ["I already tried resending twice."],
        tags: ["Error recovery", "Easy"],
      },
    },
    {
      savedAt: at(6, 11, 21),
      item: {
        id: "saved-salary-slip",
        title: "Self-Employed User Has No Salary Slips",
        description:
          "A self-employed applicant can't provide salary slips. The agent should offer ITR and bank statements as alternate income proof.",
        opener: "I run my own shop, so I don't have salary slips. Can I still apply?",
        followUps: ["I have my last two years of ITR."],
        tags: ["Edge case", "Medium"],
      },
    },
    {
      savedAt: at(6, 12, 8),
      item: {
        id: "saved-rejection",
        title: "Applicant Asks Why the Loan Was Rejected",
        description:
          "The applicant's loan was rejected and they want to know why. The agent should share the permissible reason and suggest how to improve eligibility.",
        opener: "Why was my loan application rejected?",
        followUps: ["What can I do to get approved next time?"],
        tags: ["Escalation", "Hard"],
      },
    },
    {
      savedAt: at(6, 12, 55),
      item: {
        id: "saved-emi-date",
        title: "Customer Wants to Change the EMI Date",
        description:
          "The customer's salary arrives on the 10th and they want the EMI date moved. The agent should check if the change is allowed and confirm the new date.",
        opener: "My salary comes on the 10th, can my EMI be on the 12th instead of the 5th?",
        followUps: ["Will there be any extra charge for this?"],
        tags: ["Transactional", "Easy"],
      },
    },
    {
      savedAt: at(6, 13, 42),
      item: {
        id: "saved-fraud",
        title: "User Reports a Suspicious Call About Their Loan",
        description:
          "The user received a call asking for their OTP in the company's name. The agent should warn them, confirm the company never asks for OTPs, and escalate.",
        opener:
          "Someone called me saying they're from your bank and asked for my OTP. Is that you?",
        followUps: ["I almost shared it. What should I do now?"],
        tags: ["Escalation", "Hard"],
      },
    },
    {
      savedAt: at(6, 14, 29),
      item: {
        id: "saved-address",
        title: "Applicant's Current Address Differs From Aadhaar",
        description:
          "The applicant recently moved and their Aadhaar shows an old address. The agent should explain how to submit current address proof.",
        opener: "My Aadhaar has my old address. Is that a problem?",
        followUps: ["I have a rent agreement for the new place."],
        tags: ["Edge case", "Medium"],
      },
    },
    {
      savedAt: at(6, 15, 16),
      item: {
        id: "saved-topup",
        title: "Existing Customer Asks for a Top-Up Loan",
        description:
          "An existing borrower with good repayment history asks for a top-up. The agent should check eligibility and explain the offer.",
        opener: "I already have a loan with you. Can I get some extra amount on top?",
        followUps: ["How quickly can it be disbursed?"],
        tags: ["Transactional", "Medium"],
      },
    },
    {
      savedAt: at(6, 16, 3),
      item: {
        id: "saved-language-tamil",
        title: "Customer Prefers to Continue in Tamil",
        description:
          "The customer asks to continue in Tamil. The agent should switch language and continue the onboarding without losing context.",
        opener: "Can we talk in Tamil please?",
        followUps: ["Ennoda documents ellam ready-aa irukku."],
        tags: ["Multilingual", "Medium"],
      },
    },
  ];
}

function dayLabel(timestamp: number) {
  const start = (value: number) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };
  const diff = Math.round((start(Date.now()) - start(timestamp)) / DAY);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(timestamp).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Stage = { title: string; detail: (step: number, total: number) => string };

const STAGES: Stage[] = [
  {
    title: "Compiling agent structure",
    detail: (step) => `Compiling agent ${step} of 2…`,
  },
  {
    title: "Drafting scenarios",
    detail: (step, total) => `Drafting use case ${step} of ${total}…`,
  },
  {
    title: "Writing conversations",
    detail: () => "Adding opening messages and follow-ups…",
  },
];

type PanelMode = "closed" | "generating" | "results" | "manual";

export function PromptPlayground({ active, onBack }: { active: boolean; onBack: () => void }) {
  const [model, setModel] = useState(MODELS[0].id);
  const [count, setCount] = useState(3);
  const [panel, setPanel] = useState<PanelMode>("closed");
  const [generated, setGenerated] = useState<UseCase[]>([]);
  const [added, setAdded] = useState<UseCase[]>([]);
  const [progress, setProgress] = useState(0);
  const [round, setRound] = useState(0);
  const [panelWidth, setPanelWidth] = useState(520);
  const [saved, setSaved] = useState<SavedCase[]>(seedSavedCases);
  const [editing, setEditing] = useState<UseCase | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const generating = panel === "generating";

  const [view, setView] = useState<"cases" | "run" | "results">("cases");
  const [runId, setRunId] = useState(0);
  const [runCases, setRunCases] = useState<UseCase[]>([]);
  const [runStatuses, setRunStatuses] = useState<Record<string, RunStatus>>({});
  const [transcripts, setTranscripts] = useState<Record<string, RunMessage[]>>({});
  const [typingId, setTypingId] = useState<string | null>(null);
  const [messagesDone, setMessagesDone] = useState(0);
  const [runDone, setRunDone] = useState(false);
  const [runHistory, setRunHistory] = useState<RunRecord[]>(seedRuns);
  const [selectedRunId, setSelectedRunId] = useState(
    () => runHistory[runHistory.length - 1]?.id ?? "",
  );
  const liveRun = runId !== 0 && !runDone;
  const selectedRun =
    runHistory.find((record) => record.id === selectedRunId) ?? runHistory[runHistory.length - 1];
  const runOptions = runHistory
    .map((record, i) => ({
      id: record.id,
      title: `Run #${i + 1}`,
      meta: `${dayLabel(record.finishedAt)}, ${new Date(record.finishedAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })} · ${record.cases.length} ${record.cases.length === 1 ? "case" : "cases"}`,
      score: runScore(record.cases),
      cases: record.cases,
    }))
    .reverse();
  const [historyOpen, setHistoryOpen] = useState(false);
  const selectedOption = runOptions.find((option) => option.id === selectedRun?.id);
  const historyButton = (
    <RunHistoryButton
      count={runOptions.length}
      open={historyOpen}
      onClick={() => setHistoryOpen((open) => !open)}
    />
  );
  const [focusCase, setFocusCase] = useState<string | null>(null);
  const selectedRunIndex = runHistory.findIndex((record) => record.id === selectedRun?.id);
  const previousRun = selectedRunIndex > 0 ? runHistory[selectedRunIndex - 1] : undefined;
  const selectRun = (id: string) => {
    setSelectedRunId(id);
  };
  const closeHistory = useCallback(() => setHistoryOpen(false), []);
  const [returned, setReturned] = useState(false);
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (active && added.length > 0) {
      setReturned(true);
      setView(liveRun ? "run" : "cases");
    }
  }
  const totalMessages = runCases.reduce((sum, item) => sum + userTurns(item).length * 2, 0);
  const runProgress = totalMessages ? Math.round((messagesDone / totalMessages) * 100) : 0;

  useEffect(() => {
    if (runId === 0) return;
    let cancelled = false;
    const timers: number[] = [];
    const schedule = (fn: () => void, ms: number) =>
      timers.push(window.setTimeout(() => !cancelled && fn(), ms));
    let done = 0;
    const push = (id: string, message: RunMessage) =>
      setTranscripts((current) => ({ ...current, [id]: [...(current[id] ?? []), message] }));
    const steps: (() => number)[] = [];
    runCases.forEach((item) => {
      const outcome = outcomeFor(item);
      steps.push(() => {
        setRunStatuses((current) => ({ ...current, [item.id]: "running" }));
        return 500;
      });
      userTurns(item).forEach((text, i) => {
        steps.push(() => {
          push(item.id, { role: "user", text });
          setMessagesDone(++done);
          setTypingId(item.id);
          return 1500;
        });
        steps.push(() => {
          const reply = outcome.replies[i] ?? outcome.replies[outcome.replies.length - 1];
          setTypingId(null);
          push(item.id, { role: "bot", text: reply.text, rating: reply.rating });
          setMessagesDone(++done);
          return 700;
        });
      });
      steps.push(() => {
        setRunStatuses((current) => ({
          ...current,
          [item.id]: casePassed(outcome) ? "passed" : "failed",
        }));
        return 600;
      });
    });
    steps.push(() => {
      setRunDone(true);
      const record = completedRun(`run-${runId}`, runCases, Date.now());
      setRunHistory((current) => [...current, record]);
      setSelectedRunId(record.id);
      const tested = new Map(runCases.map((item) => [item.id, caseScore(outcomeFor(item))]));
      setSaved((current) =>
        current.map((entry) =>
          tested.has(entry.item.id) ? { ...entry, result: tested.get(entry.item.id) } : entry,
        ),
      );
      return 900;
    });
    steps.push(() => {
      setView("results");
      setRunId(0);
      setTypingId(null);
      setMessagesDone(0);
      setRunDone(false);
      return 0;
    });
    const run = (i: number) => {
      if (i >= steps.length) return;
      const delay = steps[i]();
      schedule(() => run(i + 1), delay);
    };
    schedule(() => run(0), 400);
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [runId, runCases]);

  const resetRun = () => {
    setRunId(0);
    setRunCases([]);
    setRunStatuses({});
    setTranscripts({});
    setTypingId(null);
    setMessagesDone(0);
    setRunDone(false);
  };

  const startTesting = () => {
    resetRun();
    setPanel("closed");
    setEditing(null);
    setRunCases(added);
    setRunStatuses(Object.fromEntries(added.map((item) => [item.id, "queued" as RunStatus])));
    setView("run");
    setRunId(Date.now());
  };
  const addedIds = new Set(added.map((item) => item.id));

  useEffect(() => {
    if (!generating) return;
    const startedAt = Date.now();
    const duration = 3600;
    const id = window.setInterval(() => {
      const value = Math.min(100, Math.round(((Date.now() - startedAt) / duration) * 100));
      setProgress(value);
      if (value >= 100) {
        window.clearInterval(id);
        const offset = round % USE_CASE_LIBRARY.length;
        const rotated = [...USE_CASE_LIBRARY.slice(offset), ...USE_CASE_LIBRARY.slice(0, offset)];
        setGenerated(rotated.slice(0, count));
        setPanel("results");
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [generating, count, round]);

  const startGenerating = () => {
    setProgress(0);
    setGenerated([]);
    setPanel("generating");
  };

  const addCase = (item: UseCase) =>
    setAdded((current) => (current.some((c) => c.id === item.id) ? current : [...current, item]));

  const stageIndex = Math.min(STAGES.length - 1, Math.floor(progress / 34));
  const stage = STAGES[stageIndex];
  const stageStep =
    stageIndex === 0
      ? Math.min(2, Math.floor((progress / 34) * 2))
      : Math.min(count, Math.max(1, Math.ceil(((progress - 34) / 33) * count)));

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const onMove = (move: PointerEvent) => {
      const box = bodyRef.current?.getBoundingClientRect();
      if (!box) return;
      setPanelWidth(Math.min(720, Math.max(380, box.right - move.clientX)));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col bg-muted/20 p-4 sm:p-5", !active && "hidden")}>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-4 py-2.5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to builder"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/35"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-[14px] font-semibold leading-5 text-foreground">
              Prompt test and analysis
            </h1>
            <p className="text-[12px] leading-4 text-muted-foreground">
              Simulate real use cases, analyze results, and improve prompt quality.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-border bg-muted/40 p-0.5">
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#C72B65] px-3 text-[12px] font-medium text-white shadow-sm">
              <FlaskConical className="h-3 w-3" />
              Test Prompt
            </span>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium text-muted-foreground transition hover:text-foreground"
            >
              <Pencil className="h-3 w-3" />
              Build Prompt
            </button>
          </div>
        </header>

        <div ref={bodyRef} className="relative flex min-h-0 flex-1">
          <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {view === "run" && (liveRun || selectedRun) ? (
              <TestRunView
                cases={liveRun ? runCases : selectedRun.cases}
                statuses={liveRun ? runStatuses : selectedRun.statuses}
                transcripts={liveRun ? transcripts : selectedRun.transcripts}
                typingId={liveRun ? typingId : null}
                progress={liveRun ? runProgress : 100}
                focusId={liveRun ? null : focusCase}
                headerRight={
                  liveRun ? (
                    <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 text-[12.5px] font-medium text-blue-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                      Live run
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <span className="text-[12.5px] text-muted-foreground">
                        <span className="font-medium text-foreground">{selectedOption?.title}</span>{" "}
                        · {selectedOption?.meta}
                      </span>
                      {historyButton}
                    </span>
                  )
                }
              />
            ) : view === "results" && selectedRun ? (
              <TestResultsView
                key={selectedRun.id}
                cases={selectedRun.cases}
                previousScore={previousRun ? runScore(previousRun.cases) : undefined}
                onViewConversation={(id) => {
                  setFocusCase(id);
                  setView("run");
                }}
                header={
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-[15px] font-semibold text-foreground">Run results</h2>
                      <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                        <span className="font-medium text-foreground">{selectedOption?.title}</span>{" "}
                        · {selectedOption?.meta}
                      </p>
                    </div>
                    {historyButton}
                  </div>
                }
              />
            ) : added.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <EmptyStateCard
                  dimmed={generating}
                  model={model}
                  onModelChange={setModel}
                  count={count}
                  onCountChange={setCount}
                  onGenerate={startGenerating}
                  onManual={() => {
                    setEditing(null);
                    setPanel("manual");
                  }}
                />
              </div>
            ) : (
              <AddedCasesList
                cases={added}
                saved={saved}
                recent={returned}
                busy={generating}
                onToggleSave={(item) =>
                  setSaved((current) =>
                    current.some((entry) => entry.item.id === item.id)
                      ? current.filter((entry) => entry.item.id !== item.id)
                      : [...current, { item, savedAt: Date.now() }],
                  )
                }
                onAddSaved={addCase}
                onEdit={(item) => {
                  setEditing(item);
                  setPanel("manual");
                }}
                onRemove={(id) => setAdded((current) => current.filter((c) => c.id !== id))}
                onClearAll={() => {
                  setAdded([]);
                  setReturned(false);
                }}
                onGenerate={startGenerating}
                onManual={() => {
                  setEditing(null);
                  setPanel("manual");
                }}
              />
            )}

            {generating && view === "cases" && (
              <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-6">
                <ProgressToast
                  progress={progress}
                  title={stage.title}
                  detail={stage.detail(stageStep, count)}
                />
              </div>
            )}
          </div>

          {historyOpen && ((view === "run" && !liveRun) || view === "results") && (
            <RunHistoryPanel
              options={runOptions}
              selectedId={selectedRun?.id ?? ""}
              onSelect={selectRun}
              onClose={closeHistory}
            />
          )}

          {view === "cases" && panel !== "closed" && (
            <>
              <button
                type="button"
                aria-label="Resize panel"
                onPointerDown={startResize}
                className="group relative w-px shrink-0 cursor-col-resize bg-border"
              >
                <span className="absolute left-1/2 top-1/2 flex h-7 w-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition group-hover:text-foreground">
                  <GripVertical className="h-3 w-3" />
                </span>
              </button>
              <aside
                style={{ width: panelWidth }}
                className="flex min-h-0 max-w-[60%] shrink-0 flex-col bg-card animate-slide-in"
              >
                {panel === "manual" ? (
                  <ManualCasePanel
                    key={editing?.id ?? "new"}
                    initial={editing}
                    onClose={() => {
                      setEditing(null);
                      setPanel("closed");
                    }}
                    onSave={(item) => {
                      if (editing) {
                        setAdded((current) => current.map((c) => (c.id === item.id ? item : c)));
                      } else {
                        addCase(item);
                      }
                      setEditing(null);
                      setPanel("closed");
                    }}
                  />
                ) : (
                  <GeneratePanel
                    loading={generating}
                    count={count}
                    cases={generated}
                    addedIds={addedIds}
                    onAdd={addCase}
                    onAddAll={() => {
                      generated.forEach(addCase);
                      setPanel("closed");
                    }}
                    onRegenerate={() => {
                      setRound((value) => value + 1);
                      startGenerating();
                    }}
                    onClose={() => setPanel("closed")}
                  />
                )}
              </aside>
            </>
          )}
        </div>

        <footer className="relative flex shrink-0 items-center justify-center border-t border-border px-4 py-2">
          <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
            {(
              [
                { key: "cases", title: "Use cases", Icon: ClipboardList, enabled: true },
                {
                  key: "run",
                  title: "Test run",
                  Icon: Save,
                  enabled: liveRun || runHistory.length > 0,
                },
                {
                  key: "results",
                  title: "Results",
                  Icon: BarChart3,
                  enabled: runHistory.length > 0,
                },
              ] as const
            ).map(({ key, title, Icon, enabled }) => (
              <button
                key={key}
                type="button"
                title={title}
                aria-label={title}
                aria-pressed={view === key}
                disabled={!enabled}
                onClick={() => {
                  setFocusCase(null);
                  setView(key);
                }}
                className={cn(
                  "inline-flex h-7 w-9 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-40",
                  view === key
                    ? "text-white shadow-sm"
                    : "text-muted-foreground hover:bg-card hover:text-foreground",
                )}
                style={view === key ? { backgroundColor: BRAND } : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
          <div className="absolute right-4 flex items-center gap-2">
            {view === "cases" && (
              <button
                type="button"
                onClick={startTesting}
                disabled={added.length === 0 || generating}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#C72B65] px-3.5 text-[12.5px] font-medium text-white shadow-sm transition hover:bg-[#A92355] disabled:cursor-not-allowed disabled:bg-[#C72B65]/45 disabled:shadow-none"
              >
                Start Testing
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            {view === "run" &&
              (!liveRun ? (
                <button
                  type="button"
                  onClick={() => setView("results")}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#C72B65] px-3.5 text-[12.5px] font-medium text-white shadow-sm transition hover:bg-[#A92355]"
                >
                  View results
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    resetRun();
                    setView("cases");
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-red-300 bg-card px-3.5 text-[12.5px] font-medium text-red-600 transition hover:bg-red-50"
                >
                  <span className="h-3 w-3 rounded-[3px] bg-red-500" />
                  Stop
                </button>
              ))}
            {view === "results" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    resetRun();
                    setView("cases");
                  }}
                  className="inline-flex h-8 items-center rounded-full bg-[#C72B65] px-3.5 text-[12.5px] font-medium text-white shadow-sm transition hover:bg-[#A92355]"
                >
                  New Test
                </button>
              </>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[12px] font-medium text-foreground/80">{children}</span>
  );
}

function SelectField({
  value,
  onChange,
  options,
  icon,
  label,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  const current = options.find((option) => option.value === value);
  return (
    <div className="relative flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[13px] text-foreground shadow-sm transition focus-within:border-[#C72B65]/40 focus-within:ring-2 focus-within:ring-[#C72B65]/10 hover:border-foreground/20">
      {icon}
      <span className="min-w-0 flex-1 truncate">{current?.label}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function EmptyStateCard({
  dimmed,
  model,
  onModelChange,
  count,
  onCountChange,
  onGenerate,
  onManual,
}: {
  dimmed: boolean;
  model: string;
  onModelChange: (value: string) => void;
  count: number;
  onCountChange: (value: number) => void;
  onGenerate: () => void;
  onManual: () => void;
}) {
  const uploadRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className={cn(
        "w-full max-w-[520px] overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.12)] transition-opacity duration-300",
        dimmed && "pointer-events-none opacity-50",
      )}
    >
      <div className="px-6 pb-6 pt-7 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBE7EF] text-[#C72B65] ring-4 ring-[#FBE7EF]/50">
          <ClipboardList className="h-[18px] w-[18px]" />
        </span>
        <h2 className="mt-3.5 text-[15px] font-semibold text-foreground">No use cases yet</h2>
        <p className="mx-auto mt-1 max-w-[340px] text-[12.5px] leading-5 text-muted-foreground">
          Define how you want to test your prompt. Add cases manually or let AI generate them.
        </p>

        <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
          <label className="block">
            <FieldLabel>Model</FieldLabel>
            <SelectField
              label="Model"
              value={model}
              onChange={onModelChange}
              options={MODELS.map((item) => ({ value: item.id, label: item.label }))}
              icon={<Asterisk className="h-3.5 w-3.5 shrink-0 text-[#D97757]" strokeWidth={2.5} />}
            />
          </label>
          <label className="block">
            <FieldLabel>How many use cases?</FieldLabel>
            <SelectField
              label="How many use cases"
              value={String(count)}
              onChange={(value) => onCountChange(Number(value))}
              options={[1, 2, 3, 4, 5].map((n) => ({
                value: String(n),
                label: `${n} ${n === 1 ? "case" : "cases"}`,
              }))}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#C72B65] text-[13px] font-medium text-white shadow-sm transition hover:bg-[#A92355] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate with AI
          </button>
          <button
            type="button"
            onClick={onManual}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-[13px] font-medium text-foreground shadow-sm transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/35"
          >
            <Pencil className="h-3.5 w-3.5" />
            Manually add
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-2.5">
        <span className="text-[12px] text-muted-foreground">Already have cases?</span>
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          title="Upload CSV or JSON"
          className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[12px] font-medium text-foreground transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/35"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload CSV or JSON
        </button>
        <input ref={uploadRef} type="file" accept=".csv,.json" className="sr-only" />
      </div>
    </div>
  );
}

function ProgressToast({
  progress,
  title,
  detail,
}: {
  progress: number;
  title: string;
  detail: string;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full max-w-[440px] items-center gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-[#FBE7EF] px-5 py-4 shadow-lg shadow-black/5 animate-fade-up"
    >
      <span className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="#FBE7EF" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={BRAND}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
            className="transition-[stroke-dashoffset] duration-200 ease-out"
          />
        </svg>
        <span className="text-[15px] font-semibold tabular-nums text-[#C72B65]">{progress}%</span>
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-[#C72B65]">{title}</p>
        <p className="mt-1 truncate text-[13px] text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function GeneratePanel({
  loading,
  count,
  cases,
  addedIds,
  onAdd,
  onAddAll,
  onRegenerate,
  onClose,
}: {
  loading: boolean;
  count: number;
  cases: UseCase[];
  addedIds: Set<string>;
  onAdd: (item: UseCase) => void;
  onAddAll: () => void;
  onRegenerate: () => void;
  onClose: () => void;
}) {
  const addedCount = cases.filter((item) => addedIds.has(item.id)).length;
  return (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-[14.5px] font-semibold text-foreground">Generate use cases</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
        {loading ? (
          <span className="flex items-center gap-2.5 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C72B65]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C72B65]/70 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C72B65]/40 [animation-delay:300ms]" />
            </span>
            Generating
          </span>
        ) : (
          <>
            <span className="flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {cases.length} use {cases.length === 1 ? "case" : "cases"} ready
            </span>
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground transition hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
        {loading
          ? Array.from({ length: count }, (_, i) => (
              <div
                key={i}
                className="space-y-3 rounded-xl border border-border bg-muted/20 p-5"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-full animate-pulse rounded-full bg-muted/80" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted/80" />
                <div className="flex gap-2 pt-1">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                </div>
              </div>
            ))
          : cases.map((item, i) => (
              <UseCaseCard
                key={item.id}
                item={item}
                added={addedIds.has(item.id)}
                onAdd={() => onAdd(item)}
                delay={i * 90}
              />
            ))}
      </div>

      {!loading && (
        <div className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3.5">
          <span className="text-[13px] text-muted-foreground">
            {addedCount} of {cases.length} added
          </span>
          <button
            type="button"
            onClick={onAddAll}
            disabled={addedCount === cases.length}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#C72B65] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#A92355] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            {addedCount === cases.length ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {addedCount === cases.length ? "All added" : "Add all"}
          </button>
        </div>
      )}
    </>
  );
}

function UseCaseCard({
  item,
  added,
  onAdd,
  delay,
}: {
  item: UseCase;
  added: boolean;
  onAdd: () => void;
  delay: number;
}) {
  return (
    <article
      className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14px] font-semibold leading-snug text-foreground">{item.title}</h3>
        <button
          type="button"
          onClick={onAdd}
          disabled={added}
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-3 text-[12.5px] font-medium transition",
            added
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-[#C72B65]/50 text-[#C72B65] hover:border-[#C72B65] hover:bg-[#FBE7EF]",
          )}
        >
          {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {added ? "Added" : "Add"}
        </button>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{item.description}</p>
      <div className="mt-3 flex gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C72B65]" />
        <p className="text-[12.5px] leading-relaxed text-foreground">&ldquo;{item.opener}&rdquo;</p>
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {item.followUps.map((line) => (
          <li key={line} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
            <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {line}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function CaseIconButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/35",
        active
          ? "border-[#C72B65]/40 bg-[#FBE7EF] text-[#C72B65]"
          : "border-[#C72B65]/30 bg-card text-[#C72B65] hover:border-[#C72B65]/60 hover:bg-[#FBE7EF]",
      )}
    >
      {children}
    </button>
  );
}

function CaseCardBody({ item }: { item: UseCase }) {
  return (
    <>
      {item.description && (
        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      )}
      <div className="mt-3 flex gap-2.5 rounded-xl border border-border bg-muted/30 px-3.5 py-3">
        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#C72B65]" />
        <p className="text-[13px] leading-relaxed text-foreground">&ldquo;{item.opener}&rdquo;</p>
      </div>
      {item.followUps.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {item.followUps.map((line) => (
            <li
              key={line}
              className="flex gap-2 text-[12.5px] leading-relaxed text-muted-foreground"
            >
              <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {line}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function CaseTags({ tags }: { tags: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11.5px] text-muted-foreground"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function SavedDatesCalendar({
  selected,
  defaultMonth,
  savedDays,
  onSelect,
  onAllDates,
}: {
  selected: Date | undefined;
  defaultMonth: Date;
  savedDays: Date[];
  onSelect: (date: Date | undefined) => void;
  onAllDates: () => void;
}) {
  return (
    <>
      <Calendar
        mode="single"
        selected={selected}
        defaultMonth={defaultMonth}
        onSelect={onSelect}
        disabled={{ after: new Date() }}
        modifiers={{ hasSaved: savedDays }}
        modifiersClassNames={{
          hasSaved:
            "relative after:pointer-events-none after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-[#C72B65]",
        }}
      />
      <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
        <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C72B65]" />
          Has saved use cases
        </span>
        <button
          type="button"
          onClick={onAllDates}
          className="text-[12px] font-medium text-[#C72B65] hover:underline"
        >
          All dates
        </button>
      </div>
    </>
  );
}

function AddedCasesList({
  cases,
  saved,
  recent,
  busy,
  onToggleSave,
  onAddSaved,
  onEdit,
  onRemove,
  onClearAll,
  onGenerate,
  onManual,
}: {
  cases: UseCase[];
  saved: SavedCase[];
  recent: boolean;
  busy: boolean;
  onToggleSave: (item: UseCase) => void;
  onAddSaved: (item: UseCase) => void;
  onEdit: (item: UseCase) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onGenerate: () => void;
  onManual: () => void;
}) {
  const [menu, setMenu] = useState<"add" | "more" | null>(null);
  const [view, setView] = useState<"cases" | "saved">("cases");
  const [pickedDate, setPickedDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [groupCalendar, setGroupCalendar] = useState<string | null>(null);
  const savedDays = saved.map((entry) => new Date(entry.savedAt));
  const visibleSaved = pickedDate
    ? saved.filter((entry) => isSameDay(entry.savedAt, pickedDate))
    : saved;
  const addedIds = new Set(cases.map((item) => item.id));
  const showSaved = view === "saved";
  const groups = [...visibleSaved]
    .sort((a, b) => b.savedAt - a.savedAt)
    .reduce<{ label: string; day: number; entries: SavedCase[] }[]>((acc, entry) => {
      const label = dayLabel(entry.savedAt);
      const last = acc[acc.length - 1];
      if (last?.label === label) last.entries.push(entry);
      else acc.push({ label, day: entry.savedAt, entries: [entry] });
      return acc;
    }, []);
  const menuItem =
    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-foreground transition hover:bg-muted";

  return (
    <div className={cn("flex flex-1 flex-col p-6 transition-opacity", busy && "opacity-60")}>
      {menu && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 cursor-default"
          onClick={() => setMenu(null)}
        />
      )}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {showSaved ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("cases")}
              aria-label="Back to use cases"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-[15px] font-semibold text-foreground">
              Saved use cases ({visibleSaved.length})
            </h2>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <h2 className="text-[15px] font-semibold text-foreground">
              Use cases ({cases.length})
            </h2>
            {recent && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C72B65]/25 bg-[#FBE7EF] px-2.5 py-1 text-[11.5px] font-medium text-[#C72B65] animate-fade-up">
                <History className="h-3 w-3" />
                Recent use cases
              </span>
            )}
          </div>
        )}
        {showSaved ? (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Filter saved use cases by date"
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border pl-2.5 text-[12.5px] font-medium transition",
                  pickedDate ? "pr-1" : "pr-3",
                  pickedDate
                    ? "border-[#C72B65]/40 bg-[#FBE7EF] text-[#C72B65]"
                    : "border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {pickedDate
                  ? pickedDate.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "All dates"}
                {pickedDate ? (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Clear date"
                    onClick={(event) => {
                      event.stopPropagation();
                      setPickedDate(undefined);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        setPickedDate(undefined);
                      }
                    }}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-[#C72B65]/10"
                  >
                    <X className="h-3 w-3" />
                  </span>
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto rounded-xl p-0">
              <SavedDatesCalendar
                selected={pickedDate}
                defaultMonth={pickedDate ?? new Date()}
                savedDays={savedDays}
                onSelect={(date) => {
                  setPickedDate(date);
                  setCalendarOpen(false);
                }}
                onAllDates={() => {
                  setPickedDate(undefined);
                  setCalendarOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView(showSaved ? "cases" : "saved")}
              aria-pressed={showSaved}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition",
                showSaved
                  ? "border-[#C72B65]/40 bg-[#FBE7EF] text-[#C72B65]"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              <Bookmark className={cn("h-3.5 w-3.5", showSaved && "fill-current")} />
              Saved use cases ({saved.length})
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenu(menu === "add" ? null : "add")}
                disabled={busy}
                aria-expanded={menu === "add"}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#C72B65] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#A92355] disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                Add more
              </button>
              {menu === "add" && (
                <div className="absolute right-0 top-full z-30 mt-1.5 w-48 rounded-xl border border-border bg-card p-1 shadow-lg animate-fade-up">
                  <button
                    type="button"
                    className={menuItem}
                    onClick={() => {
                      setMenu(null);
                      setView("cases");
                      onGenerate();
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#C72B65]" />
                    Generate with AI
                  </button>
                  <button
                    type="button"
                    className={menuItem}
                    onClick={() => {
                      setMenu(null);
                      setView("cases");
                      onManual();
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    Add manually
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenu(menu === "more" ? null : "more")}
                aria-label="More actions"
                aria-expanded={menu === "more"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menu === "more" && (
                <div className="absolute right-0 top-full z-30 mt-1.5 w-52 rounded-xl border border-border bg-card p-1 shadow-lg animate-fade-up">
                  <button
                    type="button"
                    className={cn(menuItem, "text-red-600 hover:bg-red-50")}
                    onClick={() => {
                      setMenu(null);
                      onClearAll();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove all use cases
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 rounded-2xl border border-border bg-muted/30 p-5">
        {showSaved ? (
          groups.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              {pickedDate ? (
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Bookmark className="h-5 w-5 text-muted-foreground" />
              )}
              <p className="text-[13.5px] font-semibold text-foreground">
                {pickedDate ? "Nothing saved on this day" : "No saved use cases yet"}
              </p>
              <p className="max-w-xs text-[12.5px] text-muted-foreground">
                {pickedDate
                  ? "Pick a date with a dot in the calendar, or view all dates."
                  : "Save a use case from your test list to reuse it in future runs."}
              </p>
              {pickedDate && (
                <button
                  type="button"
                  onClick={() => setPickedDate(undefined)}
                  className="mt-1 text-[12.5px] font-medium text-[#C72B65] hover:underline"
                >
                  Show all dates
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <section key={group.label} className="animate-fade-up">
                  <div className="mb-3 flex items-center gap-2">
                    <Popover
                      open={groupCalendar === group.label}
                      onOpenChange={(open) => setGroupCalendar(open ? group.label : null)}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label={`${group.label}, open calendar`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-[12px] font-semibold uppercase tracking-wider text-foreground shadow-sm transition hover:border-[#C72B65]/40 hover:text-[#C72B65] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30 data-[state=open]:border-[#C72B65]/40 data-[state=open]:text-[#C72B65]"
                        >
                          <CalendarDays className="h-3.5 w-3.5 text-[#C72B65]" />
                          {group.label}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto rounded-xl p-0">
                        <SavedDatesCalendar
                          selected={pickedDate ?? new Date(group.day)}
                          defaultMonth={pickedDate ?? new Date(group.day)}
                          savedDays={savedDays}
                          onSelect={(date) => {
                            if (date) setPickedDate(date);
                            setGroupCalendar(null);
                          }}
                          onAllDates={() => {
                            setPickedDate(undefined);
                            setGroupCalendar(null);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
                      {group.entries.length}
                    </span>
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                  </div>
                  <div className="grid items-start gap-4 xl:grid-cols-2">
                    {group.entries.map(({ item, savedAt, result }) => {
                      const inRun = addedIds.has(item.id);
                      return (
                        <article
                          key={item.id}
                          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[14px] font-semibold leading-snug text-foreground">
                                {item.title}
                              </h4>
                              <CaseTags tags={item.tags} />
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                              <CaseIconButton
                                label="Remove from saved"
                                onClick={() => onToggleSave(item)}
                                active
                              >
                                <Bookmark className="h-3.5 w-3.5 fill-current" />
                              </CaseIconButton>
                              <button
                                type="button"
                                onClick={() => onAddSaved(item)}
                                disabled={inRun}
                                className={cn(
                                  "inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-[12px] font-medium transition",
                                  inRun
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-[#C72B65]/50 text-[#C72B65] hover:border-[#C72B65] hover:bg-[#FBE7EF]",
                                )}
                              >
                                {inRun ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  <Plus className="h-3.5 w-3.5" />
                                )}
                                {inRun ? "In test" : "Add to test"}
                              </button>
                            </div>
                          </div>
                          <CaseCardBody item={item} />
                          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-2.5">
                            <p className="text-[11.5px] text-muted-foreground">
                              Saved at{" "}
                              {new Date(savedAt).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                            {result !== undefined && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11.5px] text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Results
                                <span className="font-semibold tabular-nums">{result}%</span>
                              </span>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )
        ) : (
          <div className="grid items-start gap-4 xl:grid-cols-2">
            {cases.map((item, i) => {
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm animate-fade-up"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FBE7EF] text-[11.5px] font-semibold text-[#C72B65]">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-semibold leading-snug text-foreground">
                        {item.title}
                      </h3>
                      <CaseTags tags={item.tags} />
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <CaseIconButton label="Edit use case" onClick={() => onEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </CaseIconButton>
                      <CaseIconButton label="Delete use case" onClick={() => onRemove(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </CaseIconButton>
                    </div>
                  </div>
                  <CaseCardBody item={item} />
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ManualCasePanel({
  initial,
  onClose,
  onSave,
}: {
  initial: UseCase | null;
  onClose: () => void;
  onSave: (item: UseCase) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [opener, setOpener] = useState(initial?.opener ?? "");
  const inputCls =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-[#C72B65]/40 focus:ring-2 focus:ring-[#C72B65]/10";
  const valid = title.trim() && opener.trim();
  return (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-[14.5px] font-semibold text-foreground">
          {initial ? "Edit use case" : "Add a use case"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <label className="block space-y-1.5">
          <span className="text-[12px] font-medium text-foreground">
            Title <span className="text-[#C72B65]">*</span>
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Customer asks to change loan tenure"
            className={inputCls}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[12px] font-medium text-foreground">Scenario</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Describe who the customer is and what they want."
            className={cn(inputCls, "resize-none")}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[12px] font-medium text-foreground">
            Opening message <span className="text-[#C72B65]">*</span>
          </span>
          <textarea
            value={opener}
            onChange={(event) => setOpener(event.target.value)}
            rows={3}
            placeholder="The first thing the customer says."
            className={cn(inputCls, "resize-none")}
          />
        </label>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-5 py-3.5">
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-full border border-border bg-card px-4 text-[13px] font-medium text-foreground transition hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={() =>
            onSave({
              id: initial?.id ?? `manual-${Date.now()}`,
              title: title.trim(),
              description: description.trim(),
              opener: opener.trim(),
              followUps: initial?.followUps ?? [],
              tags: initial?.tags ?? ["Custom", "Medium"],
            })
          }
          className="h-9 rounded-full bg-[#C72B65] px-4 text-[13px] font-semibold text-white transition hover:bg-[#A92355] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {initial ? "Save changes" : "Add use case"}
        </button>
      </div>
    </>
  );
}
