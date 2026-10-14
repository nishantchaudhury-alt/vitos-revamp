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
  Bot,
  MessageSquare,
  Minus,
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
import { BuildPromptView } from "./BuildPrompt";
import { BotCustomerConfig, type SavedCustomer } from "./BotCustomerConfig";
import { CaseLimitDialog } from "./CaseLimitDialog";
import { ViewHeader, ViewShell } from "./PlaygroundLayout";
import { btn, eyebrow, focusRing, panel } from "./playgroundStyles";
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

const NO_TYPING: Set<string> = new Set();

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

/** Hard cap on how many use cases one test can hold. */
const MAX_CASES = 10;

type PanelMode = "closed" | "generating" | "results" | "manual";

export function PromptPlayground({ active, onBack }: { active: boolean; onBack: () => void }) {
  const [model, setModel] = useState(MODELS[0].id);
  const [count, setCount] = useState(3);
  const [panel, setPanel] = useState<PanelMode>("closed");
  const [generated, setGenerated] = useState<UseCase[]>([]);
  const [added, setAdded] = useState<UseCase[]>([]);
  const addedRef = useRef(added);
  addedRef.current = added;
  const [progress, setProgress] = useState(0);
  const [round, setRound] = useState(0);
  const [panelWidth, setPanelWidth] = useState(440);
  const [saved, setSaved] = useState<SavedCase[]>(seedSavedCases);
  const [editing, setEditing] = useState<UseCase | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const generating = panel === "generating";

  const [view, setView] = useState<"cases" | "run" | "results">("cases");
  const [runId, setRunId] = useState(0);
  const [runCases, setRunCases] = useState<UseCase[]>([]);
  const [runStatuses, setRunStatuses] = useState<Record<string, RunStatus>>({});
  const [transcripts, setTranscripts] = useState<Record<string, RunMessage[]>>({});
  const [typingIds, setTypingIds] = useState<Set<string>>(() => new Set());
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
  const [mode, setMode] = useState<"test" | "build">("test");
  const [testMode, setTestMode] = useState<TestMode>("chat");
  const [botCustomer, setBotCustomer] = useState<SavedCustomer | null>(null);
  const closeHistory = useCallback(() => setHistoryOpen(false), []);
  const [returned, setReturned] = useState(false);
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    // Coming back: resume a live run, or open the latest run you made this session on the
    // Test run screen; otherwise land on your use cases.
    const latestOwnRun = [...runHistory].reverse().find((run) => !run.id.startsWith("run-seed"));
    if (active && liveRun) {
      setView("run");
    } else if (active && latestOwnRun) {
      setSelectedRunId(latestOwnRun.id);
      setFocusCase(null);
      setView("run");
    } else if (active && added.length > 0) {
      setReturned(true);
      setView("cases");
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
    let finished = 0;
    const push = (id: string, message: RunMessage) =>
      setTranscripts((current) => ({ ...current, [id]: [...(current[id] ?? []), message] }));
    const setTyping = (id: string, on: boolean) =>
      setTypingIds((current) => {
        const next = new Set(current);
        if (on) next.add(id);
        else next.delete(id);
        return next;
      });

    const finishRun = () => {
      schedule(() => {
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
        schedule(() => {
          setView("results");
          setRunId(0);
          setTypingIds(new Set());
          setMessagesDone(0);
          setRunDone(false);
        }, 900);
      }, 500);
    };

    // Every use case runs on its own timeline, started together and paced slightly differently
    // so the conversations progress side by side instead of in lockstep.
    runCases.forEach((item, index) => {
      const outcome = outcomeFor(item);
      const pace = 0.85 + ((index * 3) % 5) * 0.1;
      const steps: (() => number)[] = [];
      steps.push(() => {
        setRunStatuses((current) => ({ ...current, [item.id]: "running" }));
        return 450 * pace;
      });
      userTurns(item).forEach((text, i) => {
        steps.push(() => {
          push(item.id, { role: "user", text });
          setMessagesDone(++done);
          setTyping(item.id, true);
          return 1500 * pace;
        });
        steps.push(() => {
          const reply = outcome.replies[i] ?? outcome.replies[outcome.replies.length - 1];
          setTyping(item.id, false);
          push(item.id, { role: "bot", text: reply.text, rating: reply.rating });
          setMessagesDone(++done);
          return 700 * pace;
        });
      });
      steps.push(() => {
        setRunStatuses((current) => ({
          ...current,
          [item.id]: casePassed(outcome) ? "passed" : "failed",
        }));
        if (++finished === runCases.length) finishRun();
        return 0;
      });
      const run = (i: number) => {
        if (i >= steps.length) return;
        const delay = steps[i]();
        schedule(() => run(i + 1), delay);
      };
      schedule(() => run(0), 400 + index * 140);
    });
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
    setTypingIds(new Set());
    setMessagesDone(0);
    setRunDone(false);
  };

  // A saved test customer runs as a single conversation driven by its goal and known facts.
  const botCase = (customer: SavedCustomer): UseCase => ({
    id: "bot-customer",
    title: `Test customer: ${customer.goal.length > 52 ? `${customer.goal.slice(0, 50)}…` : customer.goal}`,
    description: customer.goal,
    opener: customer.goal,
    followUps: customer.facts
      .slice(0, 2)
      .map((fact) => `My ${fact.label.toLowerCase()} is ${fact.value}.`),
    tags: ["Bot-to-bot", `${customer.mood} · ${customer.difficulty}`],
  });
  const canStart = !generating && (testMode === "bot" ? botCustomer !== null : added.length > 0);

  const startTesting = () => {
    const cases = testMode === "bot" ? (botCustomer ? [botCase(botCustomer)] : []) : added;
    if (cases.length === 0) return;
    resetRun();
    setPanel("closed");
    setEditing(null);
    setRunCases(cases);
    setRunStatuses(Object.fromEntries(cases.map((item) => [item.id, "queued" as RunStatus])));
    setView("run");
    setRunId(Date.now());
  };
  const addedIds = new Set(added.map((item) => item.id));
  // Before anything is added, Chat setup shows generation inline in the setup card instead of the side panel.
  // Setup shows while there are no chat use cases yet, or whenever Bot-to-bot is the chosen method.
  const inSetup = view === "cases" && (added.length === 0 || testMode === "bot");
  const [previewSlot, setPreviewSlot] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!generating) return;
    const startedAt = Date.now();
    const duration = 3600;
    const id = window.setInterval(() => {
      const value = Math.min(100, Math.round(((Date.now() - startedAt) / duration) * 100));
      setProgress(value);
      if (value >= 100) {
        window.clearInterval(id);
        // Generated cases are always new: skip anything already in the test, and when the
        // example pool runs out, return labelled variants with fresh ids.
        const pool = [...USE_CASE_LIBRARY, ...seedEntries().map((entry) => entry.item)];
        const inTest = new Set(addedRef.current.map((item) => item.id));
        const unused = pool.filter((item) => !inTest.has(item.id));
        const source = unused.length > 0 ? unused : pool;
        const offset = (round * 3) % source.length;
        const rotated = [...source.slice(offset), ...source.slice(0, offset)];
        const runTag = Date.now().toString(36);
        setGenerated(
          Array.from({ length: count }, (_, i) => {
            const item = rotated[i % rotated.length];
            const repeat = Math.floor(i / rotated.length);
            const clash = inTest.has(item.id) || repeat > 0;
            return clash
              ? {
                  ...item,
                  id: `${item.id}-${runTag}-${i}`,
                  title: `${item.title} (variant ${repeat + 2})`,
                }
              : item;
          }),
        );
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

  // Every add goes through here so the 10 use case limit holds; overflow opens the limit dialog.
  const [limitRequest, setLimitRequest] = useState<UseCase[] | null>(null);
  const requestAdd = (items: UseCase[]) => {
    const fresh = items.filter((item) => !added.some((c) => c.id === item.id));
    if (fresh.length === 0) return true;
    if (added.length + fresh.length <= MAX_CASES) {
      setAdded([...added, ...fresh]);
      return true;
    }
    setLimitRequest(fresh);
    return false;
  };
  const addCase = (item: UseCase) => requestAdd([item]);

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
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
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
              {mode === "build" ? "Build and optimize your prompt" : "Prompt test and analysis"}
            </h1>
            <p className="text-[12px] leading-4 text-muted-foreground">
              {mode === "build"
                ? "Create prompts from scratch, test with real use cases, and refine for better results."
                : "Simulate real use cases, analyze results, and improve prompt quality."}
            </p>
          </div>
          <div
            role="tablist"
            aria-label="Prompt mode"
            className="inline-flex items-center rounded-full border border-border bg-muted/40 p-0.5"
          >
            {(
              [
                { key: "test", label: "Test Prompt", Icon: FlaskConical },
                { key: "build", label: "Build Prompt", Icon: Pencil },
              ] as const
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => setMode(key)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/35",
                  mode === key
                    ? "bg-[#C72B65] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
        </header>

        {mode === "build" && <BuildPromptView />}

        <div
          ref={bodyRef}
          className={cn("relative flex min-h-0 flex-1", mode === "build" && "hidden")}
        >
          <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {view === "run" && (liveRun || selectedRun) ? (
              <TestRunView
                cases={liveRun ? runCases : selectedRun.cases}
                statuses={liveRun ? runStatuses : selectedRun.statuses}
                transcripts={liveRun ? transcripts : selectedRun.transcripts}
                typingIds={liveRun ? typingIds : NO_TYPING}
                progress={liveRun ? runProgress : 100}
                focusId={liveRun ? null : focusCase}
                meta={
                  liveRun ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-blue-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                      Live
                    </span>
                  ) : (
                    `${selectedOption?.title} · ${selectedOption?.meta}`
                  )
                }
                headerRight={liveRun ? undefined : historyButton}
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
                  <ViewHeader
                    title="Run results"
                    meta={`${selectedOption?.title} · ${selectedOption?.meta}`}
                    actions={historyButton}
                  />
                }
              />
            ) : added.length === 0 || testMode === "bot" ? (
              <>
                <ViewShell>
                  <ViewHeader
                    title="Set up your test"
                    meta="Choose how the conversation is simulated, then add what to test."
                  />
                  <TestSetupCard
                    method={testMode}
                    onMethodChange={setTestMode}
                    dimmed={generating}
                    chatCount={added.length}
                    chat={
                      <ChatSetupBody
                        busy={generating}
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
                    }
                    bot={
                      <BotCustomerConfig
                        onSavedChange={setBotCustomer}
                        previewTarget={testMode === "bot" ? previewSlot : null}
                      />
                    }
                  />
                </ViewShell>
              </>
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
                count={count}
                onCountChange={setCount}
                method={testMode}
                onMethodChange={setTestMode}
                onNewTest={() => {
                  // Back to the first-time landing: empty Chat setup, nothing generated or open.
                  setAdded([]);
                  setGenerated([]);
                  setEditing(null);
                  setPanel("closed");
                  setReturned(false);
                  setFocusCase(null);
                  setTestMode("chat");
                  setCount(3);
                  setView("cases");
                }}
                onManual={() => {
                  setEditing(null);
                  setPanel("manual");
                }}
              />
            )}

            {limitRequest && (
              <CaseLimitDialog
                existing={added}
                incoming={limitRequest}
                max={MAX_CASES}
                onCancel={() => setLimitRequest(null)}
                onResolve={(next) => {
                  setAdded(next);
                  setLimitRequest(null);
                  setPanel((current) => (current === "results" ? "closed" : current));
                }}
              />
            )}

            {generating && view === "cases" && !inSetup && (
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

          {view === "cases" && (panel !== "closed" || inSetup) && (
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
                {inSetup && panel !== "manual" ? (
                  testMode === "bot" ? (
                    <div ref={setPreviewSlot} className="flex h-full min-h-0 flex-col" />
                  ) : (
                    <GeneratedPreview
                      state={generating ? "loading" : panel === "results" ? "ready" : "idle"}
                      count={count}
                      progress={progress}
                      stageTitle={stage.title}
                      stageDetail={stage.detail(stageStep, count)}
                      cases={generated}
                      addedIds={addedIds}
                      onAdd={addCase}
                      onAddAll={() => {
                        if (requestAdd(generated)) setPanel("closed");
                      }}
                      onRegenerate={() => {
                        setRound((value) => value + 1);
                        startGenerating();
                      }}
                    />
                  )
                ) : panel === "manual" ? (
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
                      if (requestAdd(generated)) setPanel("closed");
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

        <footer
          className={cn(
            "relative flex shrink-0 items-center justify-center border-t border-border px-4 py-2",
            mode === "build" && "hidden",
          )}
        >
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
                disabled={!canStart}
                className={btn.primary}
              >
                Start Testing
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            {view === "run" &&
              (!liveRun ? (
                <button type="button" onClick={() => setView("results")} className={btn.primary}>
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
                  className={btn.danger}
                >
                  <span className="h-3 w-3 rounded-[3px] bg-red-500" />
                  Stop
                </button>
              ))}
            {view === "results" && (
              <>
                <button type="button" className={btn.secondary}>
                  <Sparkles className="h-4 w-4" />
                  Enhance Prompt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetRun();
                    setView("cases");
                  }}
                  className={btn.primary}
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
  return <span className="mb-2 block text-[13px] font-medium text-foreground">{children}</span>;
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
    <div className="relative flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[13px] text-foreground transition focus-within:border-[#C72B65]/40 focus-within:ring-2 focus-within:ring-[#C72B65]/10 hover:border-foreground/20">
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

type TestMode = "chat" | "bot";

const TEST_METHODS = [
  {
    key: "chat",
    label: "Chat",
    description: "Run use cases you write or generate with AI.",
    Icon: MessageSquare,
  },
  {
    key: "bot",
    label: "Bot-to-bot",
    description: "An AI customer pursues a goal, unscripted.",
    Icon: Bot,
  },
] as const;

// One setup surface: the test method is a decision (choice cards), not navigation, so it reads
// differently from the Test/Build tabs above. Both bodies stay mounted to keep their input.
// Shares the type/radius/colour scale documented at the top of BotCustomerConfig.
/** Chat / Bot-to-bot switch, shared by the setup card and the use case list so it reads the same everywhere. */
function MethodTabs({
  method,
  onChange,
  disabled = false,
  chatCount = 0,
  bare = false,
  className,
}: {
  method: TestMode;
  onChange: (method: TestMode) => void;
  disabled?: boolean;
  chatCount?: number;
  /** Inline in a page header: no side padding and no description. */
  bare?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className={cn("flex items-center justify-between gap-4", !bare && "px-4")}>
        <div
          role="tablist"
          aria-label="Test method"
          className={cn(
            "flex items-center gap-1 transition-opacity duration-300",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          {TEST_METHODS.map(({ key, label, Icon }) => {
            const active = method === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                aria-disabled={disabled}
                onClick={() => onChange(key)}
                className={cn(
                  "relative inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium transition-colors duration-200",
                  bare ? "h-11 px-1 first:-ml-1 [&+&]:ml-4" : "h-12 px-3",
                  focusRing,
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn("h-4 w-4", active ? "text-[#C72B65]" : "text-current")}
                />
                {label}
                {key === "chat" && chatCount > 0 && (
                  <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                    {chatCount}
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-2 -bottom-px h-0.5 origin-center rounded-full bg-[#C72B65] transition-transform duration-300 ease-out motion-reduce:transition-none",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            );
          })}
        </div>
        {!bare && (
          <p className="hidden truncate text-[12px] text-muted-foreground sm:block">
            {TEST_METHODS.find((item) => item.key === method)?.description}
          </p>
        )}
      </div>
    </div>
  );
}

function TestSetupCard({
  method,
  onMethodChange,
  dimmed,
  chatCount,
  chat,
  bot,
}: {
  method: TestMode;
  onMethodChange: (method: TestMode) => void;
  dimmed: boolean;
  chatCount: number;
  chat: React.ReactNode;
  bot: React.ReactNode;
}) {
  return (
    <section aria-label="Test setup" className={cn(panel, "h-fit w-full overflow-hidden")}>
      <MethodTabs
        method={method}
        onChange={onMethodChange}
        disabled={dimmed}
        chatCount={chatCount}
      />
      <div className="border-t border-border">
        <div className={cn("animate-fade-up", method !== "chat" && "hidden")}>{chat}</div>
        <div className={cn("animate-fade-up", method !== "bot" && "hidden")}>{bot}</div>
      </div>
    </section>
  );
}

type GenerationState = "idle" | "loading" | "ready";

function ChatSetupBody({
  busy,
  model,
  onModelChange,
  count,
  onCountChange,
  onGenerate,
  onManual,
}: {
  busy: boolean;
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
        "flex min-w-0 flex-col transition-opacity duration-300",
        busy && "pointer-events-none opacity-60",
      )}
    >
      <div className="flex-1 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-foreground">Add use cases</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Generate them from your prompt, or write your own.
            </p>
          </div>
          <div className="w-[260px] max-w-full">
            <SelectField
              label="Model"
              value={model}
              onChange={onModelChange}
              options={MODELS.map((item) => ({ value: item.id, label: item.label }))}
              icon={<Asterisk className="h-3.5 w-3.5 shrink-0 text-[#D97757]" strokeWidth={2.5} />}
            />
          </div>
        </div>
        <div className="mt-5">
          <FieldLabel>Number of use cases</FieldLabel>
          <CaseCountPicker value={count} onChange={onCountChange} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          className={cn(btn.ghost, "-ml-3")}
        >
          <Upload className="h-4 w-4" />
          Upload CSV or JSON
        </button>
        <input ref={uploadRef} type="file" accept=".csv,.json" className="sr-only" />
        <div className="flex items-center gap-2">
          <button type="button" onClick={onManual} className={btn.secondary}>
            <Pencil className="h-4 w-4" />
            Write manually
          </button>
          <button type="button" onClick={onGenerate} className={btn.primary}>
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </button>
        </div>
      </div>
    </div>
  );
}

// Shared state tokens for illustrated choice tiles (method and case count), so both read as one family.
const choiceActive =
  "border-[#C72B65] bg-[#C72B65]/[0.03] [--accent:#C72B65] [--ink-soft:rgba(199,43,101,0.4)] [--ink:#C72B65] [--paper-a:#FDEFF4] [--paper-b:#FFF8FA] [--shadow:rgba(199,43,101,0.16)] [--well:rgba(199,43,101,0.06)] [--spread:1] [--sparkle:1]";
const choiceIdle =
  "border-border bg-card [--accent:rgba(24,24,27,0.2)] [--ink-soft:rgba(24,24,27,0.2)] [--ink:rgba(24,24,27,0.5)] [--paper-a:#F4F4F5] [--paper-b:#FAFAFA] [--shadow:rgba(24,24,27,0.06)] [--well:rgba(24,24,27,0.03)] [--spread:0.55] [--sparkle:0] hover:border-foreground/25 hover:[--spread:0.8]";

const CASE_COUNTS = [
  { value: 1, caption: "Quick check" },
  { value: 3, caption: "Balanced" },
  { value: 5, caption: "Broad" },
  { value: 10, caption: "Thorough" },
] as const;

// Fan angles per option; 10 is drawn as a squared-up stack instead of a fan.
const FANS: Record<number, number[]> = {
  1: [-3],
  3: [-12, 0, 12],
  5: [-20, -10, 0, 10, 20],
};

// Back cards alternate between two soft paper tints so the stack reads as separate sheets.
const PAPER = ["var(--paper-a)", "var(--paper-b)"];

/** One sheet: solid offset print shadow, ink outline, and a mini conversation on the top sheet. */
function Sheet({ top }: { top: boolean }) {
  return (
    <>
      <rect x="44.5" y="17.5" width="36" height="48" rx="4" className="fill-[var(--shadow)]" />
      <rect
        x="42"
        y="15"
        width="36"
        height="48"
        rx="4"
        strokeWidth="1.1"
        className={cn(
          "transition-[stroke,fill] duration-200",
          top ? "fill-white stroke-[var(--ink)]" : "stroke-[var(--ink-soft)]",
        )}
      />
      {top && (
        <g className="transition-[fill] duration-200">
          <rect x="47" y="21" width="16" height="6" rx="3" className="fill-foreground/12" />
          <rect x="57" y="30.5" width="16" height="6" rx="3" className="fill-[var(--accent)]" />
          <rect x="47" y="40" width="20" height="6" rx="3" className="fill-foreground/12" />
          <rect x="47" y="53" width="12" height="2" rx="1" className="fill-foreground/15" />
          <rect x="61" y="53" width="7" height="2" rx="1" className="fill-foreground/10" />
        </g>
      )}
    </>
  );
}

function CaseStackArt({ count }: { count: number }) {
  const fan = FANS[count];
  const layers = fan ? fan.length : 8;
  return (
    <svg viewBox="0 0 120 80" className="h-[80px] w-[120px] overflow-visible" aria-hidden="true">
      <ellipse
        cx="60"
        cy="72"
        rx={fan ? 14 + layers * 5 : 30}
        ry="2.6"
        className="fill-foreground/[0.06]"
      />
      {Array.from({ length: layers }, (_, i) => {
        const top = i === layers - 1;
        const style: React.CSSProperties = fan
          ? {
              transform: `rotate(calc(${fan[i]}deg * var(--spread)))`,
              transformOrigin: "60px 70px",
            }
          : {
              transform: `translate(calc(${(i - 4) * 2.2}px * var(--spread)), calc(${-(i - 4) * 2.4}px * var(--spread)))`,
            };
        return (
          <g
            key={i}
            style={{ ...style, fill: top ? undefined : PAPER[i % 2] }}
            className="transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
          >
            <Sheet top={top} />
          </g>
        );
      })}
      {/* Editorial sparkle, only on the selected option. */}
      <path
        d="M95 12l1.6 4.2 4.2 1.6-4.2 1.6L95 23.6l-1.6-4.2-4.2-1.6 4.2-1.6z"
        className="fill-[var(--accent)] opacity-[var(--sparkle)] transition-opacity duration-200"
      />
    </svg>
  );
}

const CUSTOM_MIN = 1;
const CUSTOM_MAX = 10;
const PRESET_COUNTS: number[] = CASE_COUNTS.map((option) => option.value);

/** Custom option art: a loose pair of sheets with a counter badge showing the chosen amount. */
function CustomStackArt({ value }: { value: number | null }) {
  const motion =
    "transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none";
  return (
    <svg viewBox="0 0 120 80" className="h-[80px] w-[120px] overflow-visible" aria-hidden="true">
      <ellipse cx="60" cy="72" rx="24" ry="2.6" className="fill-foreground/[0.06]" />
      <g
        className={motion}
        style={{ transform: "rotate(calc(-9deg * var(--spread)))", transformOrigin: "60px 70px" }}
      >
        <rect
          x="42"
          y="15"
          width="36"
          height="48"
          rx="4"
          strokeWidth="1.1"
          strokeDasharray="3 2.5"
          className="fill-[var(--paper-a)] stroke-[var(--ink-soft)]"
        />
      </g>
      <g
        className={motion}
        style={{ transform: "rotate(calc(5deg * var(--spread)))", transformOrigin: "60px 70px" }}
      >
        <rect x="44.5" y="17.5" width="36" height="48" rx="4" className="fill-[var(--shadow)]" />
        <rect
          x="42"
          y="15"
          width="36"
          height="48"
          rx="4"
          strokeWidth="1.1"
          className="fill-white stroke-[var(--ink)]"
        />
        <rect x="47" y="22" width="16" height="2.4" rx="1.2" className="fill-foreground/15" />
        <rect x="47" y="28" width="22" height="2" rx="1" className="fill-foreground/12" />
        <rect x="47" y="33" width="18" height="2" rx="1" className="fill-foreground/12" />
      </g>
      <g
        className={motion}
        style={{ transform: "translate(calc(2px * var(--spread)), calc(-2px * var(--spread)))" }}
      >
        <circle cx="80" cy="54" r="11" className="fill-[var(--accent)]" />
        <text x="80" y="58" textAnchor="middle" className="fill-white text-[11px] font-semibold">
          {value ?? "#"}
        </text>
      </g>
    </svg>
  );
}

// Editorial-style picker: each option is a small illustration of the stack it will produce,
// plus a Custom option with an inline stepper for any amount from 1 to 20.
function CaseCountPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  // Custom is tracked explicitly, so a custom amount that matches a preset (e.g. 5) stays "Custom".
  const [isCustom, setIsCustom] = useState(() => !PRESET_COUNTS.includes(value));
  const customActive = isCustom;
  const [customValue, setCustomValue] = useState(isCustom ? value : 7);
  const [draft, setDraft] = useState(String(isCustom ? value : 7));
  const clamp = (n: number) => Math.min(CUSTOM_MAX, Math.max(CUSTOM_MIN, Math.round(n)));
  const commit = (n: number) => {
    const next = clamp(Number.isFinite(n) ? n : customValue);
    setCustomValue(next);
    setDraft(String(next));
    onChange(next);
  };
  const tileBase =
    "group relative flex flex-col items-center rounded-lg border px-3 pb-3 pt-4 transition-colors duration-200";
  const footer = "mt-0.5 flex h-7 items-center justify-center";

  return (
    <div
      role="radiogroup"
      aria-label="Number of use cases"
      className="grid grid-cols-2 gap-2 sm:grid-cols-5"
    >
      {CASE_COUNTS.map((option) => {
        const active = !isCustom && option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              setIsCustom(false);
              onChange(option.value);
            }}
            className={cn(
              tileBase,
              "cursor-pointer",
              focusRing,
              active ? choiceActive : choiceIdle,
            )}
          >
            <CaseStackArt count={option.value} />
            <span className="mt-3 text-[13px] font-semibold tabular-nums text-foreground">
              {option.value} {option.value === 1 ? "case" : "cases"}
            </span>
            <span className={cn(footer, "text-[12px] text-muted-foreground")}>
              {option.caption}
            </span>
          </button>
        );
      })}

      <div className={cn(tileBase, customActive ? choiceActive : choiceIdle)}>
        {/* The whole tile selects Custom; the stepper sits above it so its buttons stay clickable. */}
        <button
          type="button"
          role="radio"
          aria-checked={customActive}
          aria-label={`Custom amount, ${customValue} cases`}
          onClick={() => {
            if (customActive) return;
            setIsCustom(true);
            onChange(customValue);
          }}
          className={cn("absolute inset-0 cursor-pointer rounded-lg", focusRing)}
        />
        <span className="pointer-events-none">
          <CustomStackArt value={customActive ? value : null} />
        </span>
        <span className="pointer-events-none mt-3 text-[13px] font-semibold text-foreground">
          Custom
        </span>
        {customActive ? (
          <div className={cn(footer, "relative z-10")}>
            <div className="inline-flex h-7 items-center rounded-md border border-border bg-card">
              <button
                type="button"
                onClick={() => commit(value - 1)}
                disabled={value <= CUSTOM_MIN}
                aria-label="Fewer use cases"
                className="flex h-full w-7 cursor-pointer items-center justify-center rounded-l-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-3 w-3" />
              </button>
              <input
                value={draft}
                inputMode="numeric"
                aria-label="Number of custom use cases"
                onChange={(event) =>
                  setDraft(event.target.value.replace(/[^0-9]/g, "").slice(0, 2))
                }
                onBlur={() => commit(Number(draft))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commit(Number(draft));
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    commit(value + 1);
                  }
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    commit(value - 1);
                  }
                }}
                className="h-full w-8 border-x border-border bg-transparent text-center text-[13px] font-semibold tabular-nums text-foreground outline-none focus:bg-[#C72B65]/[0.04]"
              />
              <button
                type="button"
                onClick={() => commit(value + 1)}
                disabled={value >= CUSTOM_MAX}
                aria-label="More use cases"
                className="flex h-full w-7 cursor-pointer items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <span className={cn(footer, "pointer-events-none text-[12px] text-muted-foreground")}>
            Any amount
          </span>
        )}
      </div>
    </div>
  );
}

// Right-hand column of the Chat setup: wireframes at rest, shimmer while generating, real cases when ready.
function GeneratedPreview({
  state,
  count,
  progress,
  stageTitle,
  stageDetail,
  cases,
  addedIds,
  onAdd,
  onAddAll,
  onRegenerate,
}: {
  state: GenerationState;
  count: number;
  progress: number;
  stageTitle: string;
  stageDetail: string;
  cases: UseCase[];
  addedIds: Set<string>;
  onAdd: (item: UseCase) => void;
  onAddAll: () => void;
  onRegenerate: () => void;
}) {
  const addedCount = cases.filter((item) => addedIds.has(item.id)).length;
  return (
    <section
      aria-label="Generated use cases"
      aria-busy={state === "loading"}
      className="flex h-full min-h-0 flex-col"
    >
      <div className="flex h-14 shrink-0 items-center border-b border-border px-5">
        <h2 className="text-[14px] font-semibold text-foreground">Generate use cases</h2>
      </div>
      <div className="flex min-h-[52px] shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3">
        {state === "loading" ? (
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[13px] font-medium text-foreground">{stageTitle}</p>
              <span className="text-[12px] font-medium tabular-nums text-[#C72B65]">
                {progress}%
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-[#C72B65] transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 truncate text-[12px] text-muted-foreground">{stageDetail}</p>
          </div>
        ) : state === "ready" ? (
          <>
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {cases.length} use {cases.length === 1 ? "case" : "cases"} ready
            </p>
            <button
              type="button"
              onClick={onRegenerate}
              className={cn(btn.ghost, "-mr-2 h-8 px-2")}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </>
        ) : (
          <p className={eyebrow}>Preview</p>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-muted/30 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {state === "ready"
          ? cases.map((item, i) => (
              <CompactCaseCard
                key={item.id}
                item={item}
                added={addedIds.has(item.id)}
                onAdd={() => onAdd(item)}
                delay={i * 80}
              />
            ))
          : Array.from({ length: count }, (_, i) => (
              <WireframeCard key={i} loading={state === "loading"} delay={i * 140} />
            ))}
        {state === "idle" && (
          <p className="pt-1 text-center text-[12px] text-muted-foreground">
            Pick a model and count, then generate. Use cases appear here.
          </p>
        )}
      </div>

      {state === "ready" && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-5 py-3">
          <span className="text-[12px] text-muted-foreground">
            {addedCount} of {cases.length} added
          </span>
          <button type="button" onClick={onAddAll} className={btn.primary}>
            <Plus className="h-4 w-4" />
            Add all
          </button>
        </div>
      )}
    </section>
  );
}

function WireframeCard({ loading, delay }: { loading: boolean; delay: number }) {
  const bar = cn("rounded-full bg-border/80", loading && "animate-pulse");
  return (
    <div
      aria-hidden="true"
      className={cn(
        "space-y-2.5 rounded-lg border bg-card p-3.5 transition-colors duration-300",
        loading ? "border-border" : "border-dashed border-border",
      )}
    >
      <div className={cn(bar, "h-2.5 w-2/3")} style={{ animationDelay: `${delay}ms` }} />
      <div className={cn(bar, "h-2 w-full")} style={{ animationDelay: `${delay + 60}ms` }} />
      <div className={cn(bar, "h-2 w-4/5")} style={{ animationDelay: `${delay + 120}ms` }} />
      <div className="flex gap-1.5 pt-0.5">
        <div className={cn(bar, "h-4 w-14")} style={{ animationDelay: `${delay + 180}ms` }} />
        <div className={cn(bar, "h-4 w-10")} style={{ animationDelay: `${delay + 240}ms` }} />
      </div>
    </div>
  );
}

function CompactCaseCard({
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
      className="rounded-lg border border-border bg-card p-3.5 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-[13px] font-semibold leading-snug text-foreground">{item.title}</h4>
        <button
          type="button"
          onClick={onAdd}
          disabled={added}
          aria-label={added ? `${item.title} added` : `Add ${item.title}`}
          className={cn(
            "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-md border px-2 text-[12px] font-medium transition-colors disabled:cursor-default",
            focusRing,
            added
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-border bg-card text-foreground hover:border-[#C72B65]/50 hover:text-[#C72B65]",
          )}
        >
          {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {added ? "Added" : "Add"}
        </button>
      </div>
      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
        {item.description}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-2 py-px text-[11px] text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
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
      className="pointer-events-auto flex w-full max-w-[440px] items-center gap-4 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card via-card to-[#FBE7EF] px-5 py-4 shadow-lg shadow-black/5 animate-fade-up"
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
        <span className="text-[16px] font-semibold tabular-nums text-[#C72B65]">{progress}%</span>
      </span>
      <div className="min-w-0">
        <p className="text-[16px] font-semibold text-[#C72B65]">{title}</p>
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
        <h2 className="text-[14px] font-semibold text-foreground">Generate use cases</h2>
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
          <span className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C72B65]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C72B65]/70 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C72B65]/40 [animation-delay:300ms]" />
            </span>
            Generating
          </span>
        ) : (
          <>
            <span className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {cases.length} use {cases.length === 1 ? "case" : "cases"} ready
            </span>
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition hover:text-foreground"
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
            "inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-3 text-[13px] font-medium transition",
            added
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-[#C72B65]/50 text-[#C72B65] hover:border-[#C72B65] hover:bg-[#FBE7EF]",
          )}
        >
          {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {added ? "Added" : "Add"}
        </button>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{item.description}</p>
      <div className="mt-3 flex gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C72B65]" />
        <p className="text-[13px] leading-relaxed text-foreground">&ldquo;{item.opener}&rdquo;</p>
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
        "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors",
        focusRing,
        active
          ? "bg-[#C72B65]/[0.06] text-[#C72B65]"
          : "text-muted-foreground hover:bg-[#C72B65]/[0.06] hover:text-[#C72B65]",
      )}
    >
      {children}
    </button>
  );
}

function CaseCardBody({ item }: { item: UseCase }) {
  const turns = [item.opener, ...item.followUps];
  return (
    <div className="flex flex-1 flex-col">
      {item.description && (
        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      )}
      <div className="mt-3 flex-1 rounded-lg bg-muted/40 px-3 py-2.5">
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          <MessageSquare className="h-3 w-3" aria-hidden="true" />
          Customer turns · {turns.length}
        </p>
        <ol className="relative space-y-2">
          <span aria-hidden="true" className="absolute bottom-2 left-[9px] top-2 w-px bg-border" />
          {turns.map((line, i) => (
            <li key={`${i}-${line}`} className="relative flex gap-2.5">
              <span
                className={cn(
                  "relative z-10 mt-px flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                  i === 0
                    ? "bg-[#C72B65] text-white"
                    : "bg-card text-muted-foreground ring-1 ring-border",
                )}
              >
                {i + 1}
              </span>
              <p
                className={cn(
                  "line-clamp-2 text-[13px] leading-relaxed",
                  i === 0 ? "font-medium text-foreground" : "text-foreground/75",
                )}
              >
                {i === 0 ? <>&ldquo;{line}&rdquo;</> : line}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const DIFFICULTY_DOT: Record<string, string> = {
  Easy: "bg-emerald-500",
  Medium: "bg-amber-500",
  Hard: "bg-red-500",
};

/** One quiet meta line: difficulty with a coloured dot, then the other tags. */
function CaseTags({ tags }: { tags: string[] }) {
  const difficulty = tags.find((tag) => tag in DIFFICULTY_DOT);
  const rest = tags.filter((tag) => tag !== difficulty);
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] text-muted-foreground">
      {difficulty && (
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", DIFFICULTY_DOT[difficulty])} />
          {difficulty}
        </span>
      )}
      {rest.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-2">
          {difficulty || rest.indexOf(tag) > 0 ? <span aria-hidden="true">·</span> : null}
          {tag}
        </span>
      ))}
    </p>
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
        <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
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

/** Menu marks drawn on one 24px grid: a fanned pair of cards with a plus badge. */
function AddCardsMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <rect
        x="3.5"
        y="5.5"
        width="10"
        height="13"
        rx="2"
        transform="rotate(-8 8.5 12)"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.4"
      />
      <rect
        x="7.5"
        y="4.5"
        width="10"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        className="fill-card"
      />
      <path
        d="M10 8.5h5M10 11h3.5"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="18" cy="18" r="4" className="fill-[#C72B65]" />
      <path d="M18 16.2v3.6M16.2 18h3.6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** A test flask with a spark: a fresh run from scratch. */
function NewTestMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M9.5 3.5h5M10.5 3.5v5.2l-4.6 8.1A2 2 0 0 0 7.6 20h8.8a2 2 0 0 0 1.7-3.2l-4.6-8.1V3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 14.5h8"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M18.2 2.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"
        className="fill-[#C72B65]"
      />
    </svg>
  );
}

/** Popover behind "Add more": how many to generate, how much room is left, or write one by hand. */
function AddMorePanel({
  used,
  count,
  onCountChange,
  onGenerate,
  onManual,
}: {
  used: number;
  count: number;
  onCountChange: (value: number) => void;
  onGenerate: () => void;
  onManual: () => void;
}) {
  const free = Math.max(0, MAX_CASES - used);
  const presets = [1, 3, 5, 10];
  const overflow = count > free;
  return (
    <div className="absolute right-0 top-full z-30 mt-1.5 w-[320px] rounded-xl border border-border bg-card p-4 shadow-lg animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold text-foreground">Add use cases</p>
        <span className="text-[12px] tabular-nums text-muted-foreground">
          {used}/{MAX_CASES} used
        </span>
      </div>
      <div className="mt-2 flex gap-0.5" aria-hidden="true">
        {Array.from({ length: MAX_CASES }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < used
                ? "bg-foreground/30"
                : i < used + count
                  ? i < MAX_CASES
                    ? "bg-[#C72B65]"
                    : "bg-red-400"
                  : "bg-muted",
            )}
          />
        ))}
      </div>

      <p className="mt-4 text-[13px] font-medium text-foreground">How many should AI generate?</p>
      <div role="radiogroup" aria-label="How many to generate" className="mt-2 flex gap-1.5">
        {presets.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={count === n}
            onClick={() => onCountChange(n)}
            className={cn(
              "h-8 flex-1 cursor-pointer rounded-lg border text-[13px] font-medium tabular-nums transition-colors",
              focusRing,
              count === n
                ? "border-[#C72B65] bg-[#C72B65]/[0.04] text-[#C72B65]"
                : "border-border text-foreground/80 hover:border-foreground/25",
            )}
          >
            {n}
          </button>
        ))}
        <label
          className={cn(
            "flex h-8 w-14 items-center rounded-lg border px-2 transition-colors focus-within:border-[#C72B65]",
            presets.includes(count) ? "border-border" : "border-[#C72B65] bg-[#C72B65]/[0.04]",
          )}
        >
          <span className="sr-only">Custom amount</span>
          <input
            inputMode="numeric"
            placeholder="#"
            value={presets.includes(count) ? "" : String(count)}
            onChange={(event) => {
              const n = Number(event.target.value.replace(/[^0-9]/g, ""));
              if (n) onCountChange(Math.min(MAX_CASES, Math.max(1, n)));
            }}
            className="w-full bg-transparent text-center text-[13px] font-medium tabular-nums text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>
      <p
        className={cn(
          "mt-2 text-[12px] leading-snug",
          overflow ? "text-amber-700" : "text-muted-foreground",
        )}
      >
        {free === 0
          ? `You're at the ${MAX_CASES} use case limit. You'll choose what to replace.`
          : overflow
            ? `Only ${free} ${free === 1 ? "slot is" : "slots are"} free. You'll choose what to keep.`
            : `${free} of ${MAX_CASES} slots free.`}
      </p>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onManual} className={cn(btn.secondary, "flex-1")}>
          <Pencil className="h-4 w-4" />
          Write
        </button>
        <button type="button" onClick={onGenerate} className={cn(btn.primary, "flex-[1.4]")}>
          <Sparkles className="h-4 w-4" />
          Generate {count}
        </button>
      </div>
    </div>
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
  count,
  onCountChange,
  method,
  onMethodChange,
  onNewTest,
}: {
  onNewTest: () => void;
  count: number;
  onCountChange: (value: number) => void;
  method: TestMode;
  onMethodChange: (method: TestMode) => void;
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
  const [menu, setMenu] = useState<"add" | "add-more" | "new-test" | "more" | null>(null);
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
    <ViewShell className={cn("transition-opacity", busy && "opacity-60")}>
      {menu && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 cursor-default"
          onClick={() => setMenu(null)}
        />
      )}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3",
          showSaved ? "min-h-9" : "-mt-2 border-b border-border",
        )}
      >
        {showSaved ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("cases")}
              aria-label="Back to use cases"
              className={cn(btn.ghost, "-ml-2 w-9 px-0")}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-[16px] font-semibold text-foreground">
              Saved use cases
              <span className="ml-1.5 font-normal tabular-nums text-muted-foreground">
                {visibleSaved.length}
              </span>
            </h2>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <h2 className="sr-only">Use cases</h2>
            <MethodTabs
              bare
              method={method}
              onChange={onMethodChange}
              disabled={busy}
              chatCount={cases.length}
            />
          </div>
        )}
        {showSaved ? (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Filter saved use cases by date"
                className={cn(
                  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border pl-3 text-[13px] font-medium transition-colors",
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
              className={btn.secondary}
            >
              <Bookmark className="h-4 w-4" />
              Saved use cases
              <span className="tabular-nums text-muted-foreground">{saved.length}</span>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setMenu(
                    menu === "add" || menu === "add-more" || menu === "new-test" ? null : "add",
                  )
                }
                disabled={busy}
                aria-haspopup="menu"
                aria-expanded={menu === "add" || menu === "add-more" || menu === "new-test"}
                className={btn.primary}
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
              {menu === "add" && (
                <div
                  role="menu"
                  aria-label="Add"
                  className="absolute right-0 top-full z-30 mt-1.5 w-64 rounded-xl border border-border bg-card p-1 shadow-lg animate-fade-up"
                >
                  {[
                    {
                      key: "add-more" as const,
                      Icon: AddCardsMark,
                      title: "Add more use cases",
                      body: "Generate or write more for this test",
                    },
                    {
                      key: "new-test" as const,
                      Icon: NewTestMark,
                      title: "New test",
                      body: "Start over from the setup screen",
                    },
                  ].map(({ key, Icon, title, body }) => (
                    <button
                      key={key}
                      type="button"
                      role="menuitem"
                      onClick={() => setMenu(key)}
                      className={cn(
                        "group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/70",
                        focusRing,
                      )}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground/70 transition-colors duration-200 group-hover:border-[#C72B65]/30 group-hover:bg-[#C72B65]/[0.05] group-hover:text-[#C72B65]">
                        <Icon aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium text-foreground">
                          {title}
                        </span>
                        <span className="block text-[12px] text-muted-foreground">{body}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {menu === "new-test" && (
                <div
                  role="alertdialog"
                  aria-label="Start a new test"
                  className="absolute right-0 top-full z-30 mt-1.5 w-[300px] rounded-xl border border-border bg-card p-4 shadow-lg animate-fade-up"
                >
                  <p className="text-[14px] font-semibold text-foreground">Start a new test?</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    Your {cases.length} use {cases.length === 1 ? "case" : "cases"} will be cleared
                    from this test. Saved use cases and past results stay.
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setMenu("add")} className={btn.ghost}>
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(null);
                        setView("cases");
                        onNewTest();
                      }}
                      className={btn.primary}
                    >
                      Start new test
                    </button>
                  </div>
                </div>
              )}
              {menu === "add-more" && (
                <AddMorePanel
                  used={cases.length}
                  count={count}
                  onCountChange={onCountChange}
                  onGenerate={() => {
                    setMenu(null);
                    setView("cases");
                    onGenerate();
                  }}
                  onManual={() => {
                    setMenu(null);
                    setView("cases");
                    onManual();
                  }}
                />
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenu(menu === "more" ? null : "more")}
                aria-label="More actions"
                aria-expanded={menu === "more"}
                className={btn.icon}
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

      <div className="flex-1">
        {showSaved ? (
          groups.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              {pickedDate ? (
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Bookmark className="h-5 w-5 text-muted-foreground" />
              )}
              <p className="text-[14px] font-semibold text-foreground">
                {pickedDate ? "Nothing saved on this day" : "No saved use cases yet"}
              </p>
              <p className="max-w-xs text-[13px] text-muted-foreground">
                {pickedDate
                  ? "Pick a date with a dot in the calendar, or view all dates."
                  : "Save a use case from your test list to reuse it in future runs."}
              </p>
              {pickedDate && (
                <button
                  type="button"
                  onClick={() => setPickedDate(undefined)}
                  className="mt-1 text-[13px] font-medium text-[#C72B65] hover:underline"
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
                  <div className="grid items-stretch gap-3 xl:grid-cols-2">
                    {group.entries.map(({ item, savedAt, result }) => {
                      const inRun = addedIds.has(item.id);
                      return (
                        <article key={item.id} className={cn(panel, "flex flex-col p-4")}>
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
                            <p className="text-[12px] text-muted-foreground">
                              Saved at{" "}
                              {new Date(savedAt).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                            {result !== undefined && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[12px] text-emerald-700">
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
          <div className="grid items-stretch gap-3 xl:grid-cols-2">
            {cases.map((item, i) => {
              return (
                <article
                  key={item.id}
                  className={cn(
                    panel,
                    "flex flex-col p-4 transition-shadow duration-200 animate-fade-up hover:shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_20px_-12px_rgba(16,24,40,0.2)]",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 font-mono text-[12px] font-medium tabular-nums text-muted-foreground/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 text-[14px] font-semibold leading-snug text-foreground">
                        {item.title}
                      </h3>
                      <CaseTags tags={item.tags} />
                    </div>
                    <div className="-mr-1.5 -mt-1 flex shrink-0 items-center">
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
      {/* Floats at the bottom left of the card area while you scroll, after returning to the playground. */}
      {recent && !showSaved && (
        <div className="pointer-events-none sticky bottom-3 z-10 mt-auto flex">
          <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-[#C72B65]/25 bg-card/95 px-3 py-1.5 text-[12px] font-medium text-[#C72B65] shadow-[0_6px_16px_-8px_rgba(16,24,40,0.3)] backdrop-blur animate-fade-up">
            <History className="h-3.5 w-3.5" />
            Recent use cases
          </span>
        </div>
      )}
    </ViewShell>
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
        <h2 className="text-[14px] font-semibold text-foreground">
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
