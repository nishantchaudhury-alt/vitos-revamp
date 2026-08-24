import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Upload, ChevronDown, Info } from "lucide-react";

type SourceType = "PDF" | "URL" | "CSV" | "XLSX" | "TXT" | "DOCX";
type Retrieval = "vector" | "keyword" | "hybrid" | "multi";
type ChunkStrategy = "recursive" | "semantic" | "llm";

interface DraftSource {
  id: string;
  type: SourceType;
  value: string;
}
interface IndexedSource {
  id: string;
  type: SourceType;
  path: string;
  chunk: number;
  overlap: number;
  strategy: string;
  added: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initialName?: string;
  initialDescription?: string;
  indexed?: IndexedSource[];
  onSubmit?: (data: {
    name: string;
    description: string;
    sources: DraftSource[];
    retrieval: Retrieval;
    topK: number;
    scoreThreshold: number;
    strategy: ChunkStrategy;
    chunkSize: number;
    chunkOverlap: number;
  }) => void;
}

const uid = () => Math.random().toString(36).slice(2);

const RETRIEVAL_OPTIONS: { key: Retrieval; label: string; sub: string }[] = [
  {
    key: "vector",
    label: "Vector search",
    sub: "Ranks chunks by semantic similarity using embeddings.",
  },
  { key: "keyword", label: "Keyword search", sub: "Matches exact terms and phrases in the text." },
  {
    key: "hybrid",
    label: "Hybrid search",
    sub: "Blends vector and keyword results into one ranking.",
  },
  {
    key: "multi",
    label: "Multi hybrid search",
    sub: "Hybrid retrieval tuned across multiple strategies.",
  },
];

const STRATEGY_OPTIONS: { key: ChunkStrategy; label: string; sub: string }[] = [
  { key: "recursive", label: "Recursive", sub: "Splits on structure, then size." },
  { key: "semantic", label: "Semantic", sub: "Groups related sentences." },
  { key: "llm", label: "LLM", sub: "Context-aware chunks via LLM." },
];

const SOURCE_TYPES: SourceType[] = ["PDF", "URL", "CSV", "XLSX", "TXT", "DOCX"];

const SOURCE_TONE: Record<SourceType, string> = {
  PDF: "bg-rose-50 text-rose-700 border-rose-200/70",
  URL: "bg-sky-50 text-sky-700 border-sky-200/70",
  CSV: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
  XLSX: "bg-blue-50 text-blue-700 border-blue-200/70",
  TXT: "bg-slate-50 text-slate-700 border-slate-200/70",
  DOCX: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
};

export function NewKnowledgePanel({
  open,
  onClose,
  mode = "create",
  initialName = "",
  initialDescription = "",
  indexed = [],
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [sources, setSources] = useState<DraftSource[]>([{ id: uid(), type: "PDF", value: "" }]);
  const [retrieval, setRetrieval] = useState<Retrieval>("vector");
  const [topK, setTopK] = useState(5);
  const [scoreThreshold, setScoreThreshold] = useState(0.7);
  const [strategy, setStrategy] = useState<ChunkStrategy>("recursive");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [chunkSize, setChunkSize] = useState(512);
  const [chunkOverlap, setChunkOverlap] = useState(72);
  const [indexedOpen, setIndexedOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setDescription(initialDescription);
    setSources([{ id: uid(), type: "PDF", value: "" }]);
    setRetrieval("vector");
    setTopK(5);
    setScoreThreshold(0.7);
    setStrategy("recursive");
    setAdvancedOpen(false);
    setChunkSize(512);
    setChunkOverlap(72);
    setIndexedOpen(true);
  }, [open, initialName, initialDescription]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const canSubmit = name.trim().length > 0 && description.trim().length > 0;

  const addSource = () => setSources((s) => [...s, { id: uid(), type: "PDF", value: "" }]);
  const removeSource = (id: string) => setSources((s) => s.filter((x) => x.id !== id));
  const updateSource = (id: string, patch: Partial<DraftSource>) =>
    setSources((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.({
      name,
      description,
      sources: sources.filter((s) => s.value.trim()),
      retrieval,
      topK,
      scoreThreshold,
      strategy,
      chunkSize,
      chunkOverlap,
    });
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-label={mode === "edit" ? "Edit knowledge base" : "New knowledge base"}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col bg-background shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
              {mode === "edit" ? "Edit knowledge base" : "New knowledge base"}
            </h2>
            <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
              {mode === "edit" && initialName
                ? initialName
                : "Add sources, tune retrieval, and configure chunking."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-md border border-border p-1.5 text-muted-foreground transition hover:bg-hover hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5">
          {/* 01 Details */}
          <SectionHeader index="01" title="Details" />
          <div className="mt-2.5">
            <label className="text-[12.5px] font-semibold text-foreground">
              Name <span className="text-primary">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product FAQ"
              className="mt-1.5 w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="mt-3">
            <label className="text-[12.5px] font-semibold text-foreground">
              Description <span className="text-primary">*</span>
            </label>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
              The AI agent reads this to decide when to pull from this knowledge base. Be specific
              about what it contains.
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What does this knowledge base cover?"
              className="mt-1.5 w-full resize-none rounded-md border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Divider />

          {/* 02 Sources */}
          <SectionHeader index="02" title="Sources" required />
          {indexed.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-md border border-border bg-card">
              <button
                type="button"
                onClick={() => setIndexedOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 bg-muted/30 px-3 py-2 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold text-foreground">
                    Indexed sources
                  </span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                    {indexed.length}
                  </span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition ${indexedOpen ? "" : "-rotate-90"}`}
                />
              </button>
              {indexedOpen && (
                <ul className="divide-y divide-border">
                  {indexed.map((s) => (
                    <li key={s.id} className="flex items-start gap-3 px-3 py-2.5">
                      <span
                        className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold ${SOURCE_TONE[s.type] ?? SOURCE_TONE.TXT}`}
                      >
                        {s.type}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-mono text-[12px] text-foreground">
                          {s.path}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          chunk <span className="text-foreground">{s.chunk}</span> · overlap{" "}
                          <span className="text-foreground">{s.overlap}</span> ·{" "}
                          <span className="text-foreground">{s.strategy}</span> · added {s.added}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove indexed source"
                        className="rounded-md p-1 text-muted-foreground transition hover:bg-hover hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-2.5">
            <div className="text-[12.5px] font-semibold text-foreground">Add sources</div>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              Add URLs or file paths as sources for this knowledge base.
            </p>
            <div className="mt-1.5 space-y-1.5">
              {sources.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={s.type}
                      onChange={(e) => updateSource(s.id, { type: e.target.value as SourceType })}
                      className="appearance-none rounded-md border border-border bg-card px-2.5 py-1.5 pr-7 text-[12px] font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {SOURCE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <input
                    value={s.value}
                    onChange={(e) => updateSource(s.id, { value: e.target.value })}
                    placeholder="Paste a URL or upload a file..."
                    className="flex-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    aria-label="Upload file"
                    className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition hover:bg-hover hover:text-foreground"
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSource(s.id)}
                    aria-label="Remove source"
                    className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition hover:bg-hover hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSource}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-primary transition hover:opacity-80"
            >
              <Plus className="h-3 w-3" /> Add another source
            </button>
          </div>

          <Divider />

          {/* 03 Retrieval */}
          <SectionHeader index="03" title="Retrieval" />
          <div className="mt-2.5">
            <div className="text-[12.5px] font-semibold text-foreground">
              Retrieval type <span className="text-primary">*</span>
            </div>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              How the agent finds relevant chunks at query time.
            </p>
            <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {RETRIEVAL_OPTIONS.map((r) => {
                const selected = retrieval === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRetrieval(r.key)}
                    className={`flex items-start gap-2 rounded-md border p-2.5 text-left transition ${
                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card hover:bg-hover"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                        selected ? "border-primary" : "border-border"
                      }`}
                    >
                      {selected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold text-foreground">{r.label}</div>
                      <div className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
                        {r.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[12.5px] font-semibold text-foreground">
                Top K <span className="text-primary">*</span>
              </label>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Chunks returned per query.</p>
              <input
                type="number"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                min={1}
                className="mt-1.5 w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-[12.5px] font-semibold text-foreground">
                Score threshold
                <Info className="h-3 w-3 text-muted-foreground" />
              </label>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Min. match score, 0–1.</p>
              <input
                type="number"
                step="0.05"
                value={scoreThreshold}
                onChange={(e) => setScoreThreshold(Number(e.target.value))}
                min={0}
                max={1}
                className="mt-1.5 w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <Divider />

          {/* 04 Chunking */}
          <SectionHeader index="04" title="Chunking" />
          <div className="mt-2.5">
            <div className="text-[12.5px] font-semibold text-foreground">
              Strategy <span className="text-primary">*</span>
            </div>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              How content is split before embedding. Applied to new sources. Default: Recursive.
            </p>
            <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
              {STRATEGY_OPTIONS.map((s) => {
                const selected = strategy === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStrategy(s.key)}
                    className={`flex items-start gap-2 rounded-md border p-2.5 text-left transition ${
                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card hover:bg-hover"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                        selected ? "border-primary" : "border-border"
                      }`}
                    >
                      {selected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold text-foreground">{s.label}</div>
                      <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                        {s.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced */}
          <div className="mt-3 overflow-hidden rounded-md border border-border bg-card">
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className="flex w-full items-center justify-between bg-muted/30 px-3 py-2 text-left"
            >
              <span className="text-[12.5px] font-semibold text-foreground">Advanced</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition ${advancedOpen ? "" : "-rotate-90"}`}
              />
            </button>
            {advancedOpen && (
              <div className="space-y-3 px-3 py-2.5">
                <div>
                  <label className="text-[12.5px] font-semibold text-foreground">Chunk size</label>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Max size per chunk. Larger keeps context; smaller sharpens precision.
                  </p>
                  <div className="relative mt-1.5">
                    <select
                      value={chunkSize}
                      onChange={(e) => setChunkSize(Number(e.target.value))}
                      className="w-full appearance-none rounded-md border border-border bg-background px-2.5 py-1.5 pr-8 text-[12.5px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {[128, 256, 512, 1024, 2048].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[12.5px] font-semibold text-foreground">
                      Chunk overlap
                    </label>
                    <span className="text-[12px] font-semibold text-primary">{chunkOverlap}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Content repeated between consecutive chunks to preserve context across
                    boundaries.
                  </p>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={chunkOverlap}
                    onChange={(e) => setChunkOverlap(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-[10.5px] text-muted-foreground">
                    <span>20</span>
                    <span>40</span>
                    <span>60</span>
                    <span>80</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-card/40 px-4 py-2.5">
          <p className="text-[11.5px] text-muted-foreground">Changes re-index affected sources.</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground transition hover:bg-hover"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mode === "edit" ? "Save changes" : "Create knowledge"}
            </button>
          </div>
        </footer>
      </aside>
    </>,
    document.body,
  );
}

function SectionHeader({
  index,
  title,
  required,
}: {
  index: string;
  title: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-muted-foreground">
        {index}
      </span>
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </span>
      {required && <span className="text-primary">*</span>}
    </div>
  );
}

function Divider() {
  return <div className="my-4 h-px w-full bg-border" />;
}
