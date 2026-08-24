import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  FileText,
  Globe,
  HelpCircle,
  BookOpen,
  TableProperties,
  LayoutGrid,
  MessageSquare,
  Send,
  X,
  Sparkles,
  Copy,
  Check,
  Terminal,
  ChevronDown,
} from "lucide-react";
import { PageContainer } from "./PageContainer";
import { NewKnowledgeFlow } from "./NewKnowledgeFlow";
import { createPortal } from "react-dom";

interface KnowledgeItem {
  id: string;
  name: string;
  description: string;
  type: {
    label: string;
    tone: "amber" | "violet" | "sky" | "emerald" | "slate";
    icon: "file" | "url" | "faq" | "book";
  };
  status: { label: string; tone: "active" | "draft" };
  usedIn: number;
  modified: string;
}

const KNOWLEDGE: KnowledgeItem[] = [
  {
    id: "1",
    name: "Product FAQ",
    description: "Answers to the most common product questions surfaced by customer-facing agents.",
    type: { label: "FAQ", tone: "violet", icon: "faq" },
    status: { label: "Active", tone: "active" },
    usedIn: 4,
    modified: "2 days ago",
  },
  {
    id: "2",
    name: "Onboarding Handbook",
    description: "Step-by-step onboarding playbook used by concierge and copilot agents.",
    type: { label: "Document", tone: "amber", icon: "file" },
    status: { label: "Active", tone: "active" },
    usedIn: 2,
    modified: "1 week ago",
  },
  {
    id: "3",
    name: "Help Center",
    description: "Crawled public help center articles kept in sync every 24 hours.",
    type: { label: "URL", tone: "sky", icon: "url" },
    status: { label: "Active", tone: "active" },
    usedIn: 6,
    modified: "3 hours ago",
  },
  {
    id: "4",
    name: "Refund Policy",
    description: "Reference policy grounding for billing and support agent responses.",
    type: { label: "Document", tone: "amber", icon: "file" },
    status: { label: "Active", tone: "active" },
    usedIn: 3,
    modified: "5 days ago",
  },
  {
    id: "5",
    name: "Loan Product Catalog",
    description: "Structured catalog of loan products, eligibility rules and pricing tiers.",
    type: { label: "Document", tone: "emerald", icon: "book" },
    status: { label: "Active", tone: "active" },
    usedIn: 5,
    modified: "2 weeks ago",
  },
  {
    id: "6",
    name: "Compliance Snippets",
    description: "Regulatory disclaimers agents must include in specific jurisdictions.",
    type: { label: "Snippet", tone: "slate", icon: "file" },
    status: { label: "Draft", tone: "draft" },
    usedIn: 0,
    modified: "1 month ago",
  },
  {
    id: "7",
    name: "Docs Site",
    description: "Live developer documentation crawled for API-oriented copilots.",
    type: { label: "URL", tone: "sky", icon: "url" },
    status: { label: "Active", tone: "active" },
    usedIn: 2,
    modified: "6 days ago",
  },
];

const TYPE_TONES = {
  amber: "bg-amber-50 text-amber-700 border-amber-200/70",
  violet: "bg-violet-50 text-violet-700 border-violet-200/70",
  sky: "bg-sky-50 text-sky-700 border-sky-200/70",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
  slate: "bg-slate-50 text-slate-700 border-slate-200/70",
};

const ICON_TONES = {
  amber: "bg-amber-100 text-amber-700",
  violet: "bg-violet-100 text-violet-700",
  sky: "bg-sky-100 text-sky-700",
  emerald: "bg-emerald-100 text-emerald-700",
  slate: "bg-slate-100 text-slate-600",
};

const STATUS_TONES = {
  active: { dot: "bg-emerald-500", cls: "border-emerald-200/70 bg-emerald-50 text-emerald-700" },
  draft: { dot: "bg-muted-foreground", cls: "border-border bg-muted text-muted-foreground" },
};

const ICON_MAP = {
  file: FileText,
  url: Globe,
  faq: HelpCircle,
  book: BookOpen,
} as const;

export function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [items] = useState<KnowledgeItem[]>(KNOWLEDGE);
  const [viewMode, setViewMode] = useState<"rows" | "cards">("rows");
  const [isCreating, setIsCreating] = useState(false);
  const [chatKb, setChatKb] = useState<KnowledgeItem | null>(null);
  const [viewKb, setViewKb] = useState<KnowledgeItem | null>(null);

  const filtered = useMemo(
    () => items.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  if (isCreating) {
    return (
      <PageContainer fullWidth>
        <NewKnowledgeFlow onBack={() => setIsCreating(false)} />
      </PageContainer>
    );
  }

  if (chatKb) {
    return (
      <PageContainer fullWidth>
        <NewKnowledgeFlow onBack={() => setChatKb(null)} />
        <FloatingKnowledgeChat kb={chatKb} onClose={() => setChatKb(null)} />
      </PageContainer>
    );
  }

  return (
    <PageContainer fullWidth>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Knowledge</h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
          Manage the documents, URLs and reference material your agents ground answers in — one
          place for every knowledge source your workspace uses.
        </p>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3">
          <div className="flex w-64 items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter knowledge..."
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            New Knowledge
          </button>
          <div className="flex items-center rounded-md border border-border bg-background p-0.5">
            <button
              type="button"
              aria-label="Rows view"
              onClick={() => setViewMode("rows")}
              className={`rounded px-2 py-1.5 transition ${
                viewMode === "rows"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableProperties className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Cards view"
              onClick={() => setViewMode("cards")}
              className={`rounded px-2 py-1.5 transition ${
                viewMode === "cards"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {viewMode === "rows" ? (
          <>
            {/* Column headers */}
            <div className="grid grid-cols-[minmax(0,1fr)_110px_110px_90px_130px_90px_120px] items-center gap-4 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div>Knowledge</div>
              <div>Type</div>
              <div>Status</div>
              <div>Used In</div>
              <div>Last Modified</div>
              <div className="text-center">DETAILS</div>
              <div className="text-center">ACTION</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
              {filtered.map((p) => {
                const Icon = ICON_MAP[p.type.icon];
                const status = STATUS_TONES[p.status.tone];
                return (
                  <div
                    key={p.id}
                    className="group grid grid-cols-[minmax(0,1fr)_110px_110px_90px_130px_90px_120px] items-center gap-4 px-4 py-3 transition hover:bg-hover"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${ICON_TONES[p.type.tone]}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-foreground">
                          {p.name}
                        </div>
                        <div className="mt-0.5 truncate text-[11.5px] leading-snug text-muted-foreground">
                          {p.description}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${TYPE_TONES[p.type.tone]}`}
                      >
                        <Icon className="h-2.5 w-2.5" />
                        {p.type.label}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.cls}`}
                      >
                        <span className={`h-1 w-1 rounded-full ${status.dot}`} />
                        {p.status.label}
                      </span>
                    </div>

                    <div className="text-[12px] text-muted-foreground">
                      {p.usedIn} {p.usedIn === 1 ? "agent" : "agents"}
                    </div>

                    <div className="text-[12px] text-muted-foreground">{p.modified}</div>

                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        aria-label="View details"
                        onClick={() => setViewKb(p)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium text-foreground transition hover:bg-hover"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                    </div>

                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setChatKb(p)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium text-foreground transition hover:bg-hover"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Try it out
                      </button>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No knowledge matches "{query}".
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const Icon = ICON_MAP[p.type.icon];
              const status = STATUS_TONES[p.status.tone];
              return (
                <div
                  key={p.id}
                  className="flex flex-col rounded-xl border border-border bg-background p-4 transition hover:border-foreground/20 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${ICON_TONES[p.type.tone]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-foreground">{p.name}</div>
                      <div className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
                        {p.description}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${TYPE_TONES[p.type.tone]}`}
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {p.type.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.cls}`}
                    >
                      <span className={`h-1 w-1 rounded-full ${status.dot}`} />
                      {p.status.label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {p.usedIn} {p.usedIn === 1 ? "agent" : "agents"}
                    </span>
                  </div>

                  <div className="mt-3 text-[12px] text-muted-foreground">
                    Last modified {p.modified}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewKb(p)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-hover"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatKb(p)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-hover"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Try it out
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                No knowledge matches &quot;{query}&quot;.
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2.5 text-[11.5px] text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            <span className="font-semibold text-foreground">{items.length}</span> entries
          </div>
        </div>
      </div>

      {viewKb && <KnowledgeCurlPanel kb={viewKb} onClose={() => setViewKb(null)} />}
    </PageContainer>
  );
}

function KnowledgeCurlPanel({ kb, onClose }: { kb: KnowledgeItem; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const workspaceId = "ws_84002025_kapture";
  const kbId = `kb_${kb.id.padStart(6, "0")}`;
  const sessionId = "291a84d5-b9c1-4b75-88dc-b2a56f5c88f0";
  const curl = `curl -X 'POST' \\
  'https://api.lovable.dev/v1/knowledge/query' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Workspace-Id: ${workspaceId}' \\
  -d '{
    "kb_id": "${kbId}",
    "query": "Hi",
    "session_id": "${sessionId}"
  }'`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(curl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-4 py-3">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Terminal className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-[13px] font-semibold leading-tight text-foreground">
                {kb.name}
              </div>
              <div className="text-[11.5px] text-muted-foreground">Read-only API reference</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground hover:bg-hover hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Identifiers
            </div>
            <dl className="space-y-1.5 text-[12px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Workspace ID</dt>
                <dd className="font-mono text-foreground">{workspaceId}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">KB ID</dt>
                <dd className="font-mono text-foreground">{kbId}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Endpoint</dt>
                <dd className="font-mono text-foreground">POST /v1/knowledge/query</dd>
              </div>
            </dl>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-[#0f172a]">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                Generated cURL
              </div>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white transition hover:bg-white/20"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="max-h-[360px] overflow-auto px-3 py-3 text-[11.5px] leading-relaxed text-emerald-200">
              <code>{curl}</code>
            </pre>
          </div>

          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            Use this command from your API testing tool or scripts. Replace the{" "}
            <span className="font-mono">query</span> value with your own input to ground responses
            in this knowledge base.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-4 py-2.5">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy cURL"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type ChatMsg = { role: "user" | "assistant"; text: string };

function FloatingKnowledgeChat({ kb, onClose }: { kb: KnowledgeItem; onClose: () => void }) {
  const [open, setOpen] = useState(true);
  const suggestions = useMemo(
    () => [
      `What is ${kb.name} about?`,
      `Summarize the key points in ${kb.name}.`,
      `What questions can this knowledge base answer?`,
      `Give me an example scenario grounded in ${kb.name}.`,
    ],
    [kb.name],
  );
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `Based on "${kb.name}", here's what I found:\n\n${dummyAnswer(kb, text)}`,
        },
      ]);
      setTyping(false);
    }, 700);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {open && (
        <div className="pointer-events-auto flex h-[560px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-up">
          {/* Header */}
          <div className="flex items-start justify-between bg-gradient-to-r from-primary to-primary/80 px-4 py-3 text-primary-foreground">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-white/15">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-[13px] font-semibold leading-tight">Chat with {kb.name}</div>
                <div className="text-[11px] opacity-90">
                  Ask anything grounded in this knowledge base
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Minimize"
                className="rounded-md p-1 text-primary-foreground/90 hover:bg-white/15"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-primary-foreground/90 hover:bg-white/15"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-2.5 overflow-y-auto bg-muted/20 px-3 py-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center pt-2 text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="mt-2 text-[13px] font-semibold text-primary">
                  Welcome to AI Knowledge Chat
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  Try one of these, or ask your own question
                </div>
                <div className="mt-3 flex w-full flex-col gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-md border border-border bg-background px-2.5 py-1.5 text-left text-[12px] text-foreground transition hover:border-primary/40 hover:bg-hover"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-1.5 text-[12.5px] leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-background text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-background px-3 py-2 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Suggestions strip (persistent after first message) */}
          {messages.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto border-t border-border bg-card px-2.5 py-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[10.5px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-1.5 border-t border-border bg-card px-2.5 py-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Hide chat" : "Open chat"}
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow ring-1 ring-primary/20 transition hover:opacity-90 active:scale-95"
      >
        <MessageSquare className="h-4 w-4" />
      </button>
    </div>,
    document.body,
  );
}

function dummyAnswer(kb: KnowledgeItem, q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("summar")) {
    return `${kb.description}\n\nKey themes: eligibility, common workflows, and edge cases used by ${kb.usedIn} active agents.`;
  }
  if (lower.includes("example") || lower.includes("scenario")) {
    return `A customer reaches out about a topic covered in ${kb.name}. The agent grounds its reply in this KB, citing the relevant section, and confirms the resolution before closing.`;
  }
  if (lower.includes("questions") || lower.includes("answer")) {
    return `This KB can answer questions about policies, product details, and process flows described in ${kb.name}. It is currently used by ${kb.usedIn} ${kb.usedIn === 1 ? "agent" : "agents"}.`;
  }
  return `${kb.description}\n\n(This is a sandboxed preview — responses are illustrative and do not affect live agents.)`;
}
