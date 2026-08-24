import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  File as FileIcon,
  Globe,
  Info,
  Plus,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CardShell, Field, inputCls } from "./RestApiFlow";

type SourceKind = "file" | "url";
type Retrieval = "vector" | "keyword" | "hybrid" | "multi";
type ChunkStrategy = "recursive" | "semantic" | "llm";

interface DraftSource {
  id: string;
  kind: SourceKind;
  name: string;
  meta: string;
  type: "PDF" | "DOCX" | "CSV" | "XLSX" | "PPTX" | "URL";
  chunkSize: number;
  chunkOverlap: number;
  strategy: "Recursive" | "Semantic" | "LLM";
  addedAt: string;
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

const DUMMY_SOURCES: DraftSource[] = [
  {
    id: uid(),
    kind: "file",
    name: "https://kapture-p-v2.s3.ap-southeast-1.wasabisys.com/8400/knowledgebase/0726/17836848090150yz1e696y8j/use-cases.csv",
    meta: "CSV · 46 KB",
    type: "CSV",
    chunkSize: 512,
    chunkOverlap: 72,
    strategy: "Semantic",
    addedAt: "2026-07-10",
  },
  {
    id: uid(),
    kind: "file",
    name: "https://kapture-p-v2.s3.ap-southeast-1.wasabisys.com/8400/knowledgebase/0726/17836848094430vse57cwegh/use-cases.xlsx",
    meta: "XLSX · 212 KB",
    type: "XLSX",
    chunkSize: 512,
    chunkOverlap: 72,
    strategy: "Semantic",
    addedAt: "2026-07-10",
  },
  {
    id: uid(),
    kind: "file",
    name: "https://kapture-p-v2.s3.ap-southeast-1.wasabisys.com/8400/knowledgebase/0726/17836848098210abc12def34/product-faq.pdf",
    meta: "PDF · 1.2 MB",
    type: "PDF",
    chunkSize: 512,
    chunkOverlap: 72,
    strategy: "Recursive",
    addedAt: "2026-07-09",
  },
  {
    id: uid(),
    kind: "file",
    name: "https://kapture-p-v2.s3.ap-southeast-1.wasabisys.com/8400/knowledgebase/0726/17836848101250ghij56klmn/refund-policy.docx",
    meta: "DOCX · 84 KB",
    type: "DOCX",
    chunkSize: 512,
    chunkOverlap: 72,
    strategy: "Recursive",
    addedAt: "2026-07-09",
  },
  {
    id: uid(),
    kind: "url",
    name: "https://help.acme.com/getting-started",
    meta: "Website URL",
    type: "URL",
    chunkSize: 1024,
    chunkOverlap: 100,
    strategy: "Semantic",
    addedAt: "2026-07-08",
  },
  {
    id: uid(),
    kind: "file",
    name: "https://kapture-p-v2.s3.ap-southeast-1.wasabisys.com/8400/knowledgebase/0726/17836848105770opqr78stuv/shipping-guidelines.pdf",
    meta: "PDF · 640 KB",
    type: "PDF",
    chunkSize: 256,
    chunkOverlap: 40,
    strategy: "Recursive",
    addedAt: "2026-07-08",
  },
  {
    id: uid(),
    kind: "file",
    name: "https://kapture-p-v2.s3.ap-southeast-1.wasabisys.com/8400/knowledgebase/0726/17836848110090wxyz90abcd/onboarding-playbook.pptx",
    meta: "PPTX · 3.4 MB",
    type: "PPTX",
    chunkSize: 512,
    chunkOverlap: 72,
    strategy: "LLM",
    addedAt: "2026-07-07",
  },
  {
    id: uid(),
    kind: "url",
    name: "https://acme.com/security/compliance",
    meta: "Website URL",
    type: "URL",
    chunkSize: 1024,
    chunkOverlap: 100,
    strategy: "Semantic",
    addedAt: "2026-07-06",
  },
];

export function NewKnowledgeFlow({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sources, setSources] = useState<DraftSource[]>(DUMMY_SOURCES);
  const [urlInputOpen, setUrlInputOpen] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [retrieval, setRetrieval] = useState<Retrieval>("vector");
  const [topK, setTopK] = useState(5);
  const [scoreThreshold, setScoreThreshold] = useState(0.7);
  const [strategy, setStrategy] = useState<ChunkStrategy>("recursive");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [chunkSize, setChunkSize] = useState(512);
  const [chunkOverlap, setChunkOverlap] = useState(72);
  const [sourcesView, setSourcesView] = useState<"filled" | "empty">("filled");

  const canSubmit = name.trim().length > 0 && description.trim().length > 0;

  const removeSource = (id: string) => setSources((s) => s.filter((x) => x.id !== id));

  const commitUrls = () => {
    const urls = urlValue
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0) return;
    setSources((s) => [
      ...s,
      ...urls.map((u) => ({
        id: uid(),
        kind: "url" as const,
        name: u,
        meta: "Website URL",
        type: "URL" as const,
        chunkSize: 512,
        chunkOverlap: 72,
        strategy: "Semantic" as const,
        addedAt: new Date().toISOString().slice(0, 10),
      })),
    ]);
    setUrlValue("");
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <header className="flex items-center gap-2.5 border-b border-border bg-card px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:bg-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-[13px] font-semibold tracking-tight text-foreground">
            New knowledge base
          </h2>
          <span className="text-muted-foreground/40">·</span>
          <p className="truncate text-[11.5px] text-muted-foreground">
            Knowledge <span className="mx-1.5 text-muted-foreground/60">→</span> New
            {name && (
              <>
                <span className="mx-1.5 text-muted-foreground/60">→</span>
                <span className="font-mono">{name}</span>
              </>
            )}
          </p>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-col">
        <div className="w-full flex-1 px-6 py-4">
          <p className="text-left text-[12.5px] text-muted-foreground">
            Add the sources your agents will ground answers on, and tune how content is retrieved
            and chunked.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:grid-flow-dense lg:items-stretch [&>*]:h-full [&_section]:h-full">
            <CardShell
              dense
              title="Basic Metadata"
              footer="Metadata serves as context prompts for LLM retrieval boundaries."
            >
              <Field
                label="Name"
                sublabel="(shown to agents)"
                hint="The LLM reads this to decide when to pull from this knowledge base."
              >
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product FAQ"
                  className={inputCls}
                />
              </Field>
              <Field
                label="Description"
                sublabel="(one sentence)"
                hint={
                  <>
                    <span className="font-semibold text-foreground">Be specific</span> — the agent
                    reads this to choose when to consult this knowledge base.
                  </>
                }
              >
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Answers to the most common product questions surfaced by customer-facing agents."
                  rows={2}
                  className={cn(inputCls, "resize-y")}
                />
              </Field>
            </CardShell>

            {/* Right column row 1 — aligned to Basic Metadata */}
            <div className="lg:col-start-2 lg:row-start-1 flex">
              <UploadCard
                urlInputOpen={urlInputOpen}
                setUrlInputOpen={setUrlInputOpen}
                urlValue={urlValue}
                setUrlValue={setUrlValue}
                commitUrls={commitUrls}
              />
            </div>

            <CardShell dense title="Retrieval">
              <Field
                label="Retrieval type"
                hint="How the agent finds relevant chunks at query time."
              >
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {RETRIEVAL_OPTIONS.map((r) => {
                    const selected = retrieval === r.key;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setRetrieval(r.key)}
                        className={cn(
                          "flex items-start gap-2 rounded-lg border p-2.5 text-left transition",
                          selected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-[#e8e6e1] bg-card hover:bg-[#f4f3f1]/60",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                            selected ? "border-primary" : "border-border",
                          )}
                        >
                          {selected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-semibold text-foreground">
                            {r.label}
                          </div>
                          <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                            {r.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <Field label="Top K" hint="Chunks returned per query.">
                  <input
                    type="number"
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    min={1}
                    className={inputCls}
                  />
                </Field>
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      Score threshold
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </span>
                  }
                  hint="Minimum match score, 0–1."
                >
                  <input
                    type="number"
                    step="0.05"
                    value={scoreThreshold}
                    onChange={(e) => setScoreThreshold(Number(e.target.value))}
                    min={0}
                    max={1}
                    className={inputCls}
                  />
                </Field>
              </div>
            </CardShell>

            <CardShell dense title="Chunking">
              <Field
                label="Strategy"
                hint="How content is split before embedding. Applied to new sources. Default: Recursive."
              >
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                  {STRATEGY_OPTIONS.map((s) => {
                    const selected = strategy === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setStrategy(s.key)}
                        className={cn(
                          "flex items-start gap-2 rounded-lg border p-2.5 text-left transition",
                          selected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-[#e8e6e1] bg-card hover:bg-[#f4f3f1]/60",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                            selected ? "border-primary" : "border-border",
                          )}
                        >
                          {selected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-semibold text-foreground">
                            {s.label}
                          </div>
                          <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                            {s.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <div className="overflow-hidden rounded-xl border border-[#e8e6e1] bg-card">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((v) => !v)}
                  className="flex w-full items-center justify-between bg-[#f4f3f1]/50 px-3.5 py-2.5 text-left"
                >
                  <span className="text-[13px] font-semibold text-foreground">Advanced</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition",
                      advancedOpen ? "" : "-rotate-90",
                    )}
                  />
                </button>
                {advancedOpen && (
                  <div className="flex flex-col gap-4 px-3.5 py-3.5">
                    <Field
                      label="Chunk size"
                      hint="Larger keeps context; smaller sharpens precision."
                    >
                      <div className="relative">
                        <select
                          value={chunkSize}
                          onChange={(e) => setChunkSize(Number(e.target.value))}
                          className={cn(inputCls, "appearance-none pr-9")}
                        >
                          {[128, 256, 512, 1024, 2048].map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </Field>
                    <Field
                      label={
                        <span className="flex w-full items-center justify-between">
                          <span>Chunk overlap</span>
                          <span className="text-[12px] font-semibold text-primary">
                            {chunkOverlap}
                          </span>
                        </span>
                      }
                      hint="Content repeated between consecutive chunks to preserve context across boundaries."
                    >
                      <input
                        type="range"
                        min={20}
                        max={100}
                        value={chunkOverlap}
                        onChange={(e) => setChunkOverlap(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="mt-1 flex justify-between text-[10.5px] text-muted-foreground">
                        <span>20</span>
                        <span>40</span>
                        <span>60</span>
                        <span>80</span>
                        <span>100</span>
                      </div>
                    </Field>
                  </div>
                )}
              </div>
            </CardShell>

            {/* Right column rows 2-3 — aligned to Retrieval + Chunking combined */}
            <div className="lg:col-start-2 lg:row-start-2 lg:row-span-2 relative min-h-0">
              <div className="lg:absolute lg:inset-0 flex">
                <ExistingSourcesCard
                  view={sourcesView}
                  onViewChange={setSourcesView}
                  sources={sources}
                  onRemove={removeSource}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-card px-7 py-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert("Draft saved")}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-hover"
            >
              Save as draft
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => {
                alert("Knowledge base created");
                onBack();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Create Knowledge
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}

type FileTone = { label: string; accent: string };

const FILE_TONES: Record<"PDF" | "DOC" | "CSV" | "XLSX" | "PPTX", FileTone> = {
  PDF: { label: "PDF", accent: "#e11d48" },
  DOC: { label: "DOC", accent: "#2563eb" },
  CSV: { label: "CSV", accent: "#10b981" },
  XLSX: { label: "XLSX", accent: "#047857" },
  PPTX: { label: "PPTX", accent: "#f97316" },
};

const FILE_TONE_LIST: FileTone[] = [
  FILE_TONES.PDF,
  FILE_TONES.DOC,
  FILE_TONES.CSV,
  FILE_TONES.XLSX,
  FILE_TONES.PPTX,
];

function FileTile({
  tone,
  emphasize = false,
  labelRounded = "rounded",
}: {
  tone: FileTone;
  emphasize?: boolean;
  labelRounded?: string;
}) {
  const w = emphasize ? 68 : 56;
  const h = emphasize ? 86 : 74;
  return (
    <div
      className="flex flex-col justify-between rounded-[16px] border border-slate-200/90 bg-white"
      style={{
        width: w,
        height: h,
        padding: emphasize ? 8 : 7,
        boxShadow: emphasize
          ? "0 16px 32px rgba(15,23,42,0.075), 0 3px 6px rgba(15,23,42,0.02)"
          : "0 8px 20px rgba(15,23,42,0.055)",
      }}
    >
      <div className={emphasize ? "space-y-1.5" : "space-y-1"}>
        <div className="h-[2px] w-6 rounded bg-slate-200" />
        <div className="h-[2px] w-8 rounded bg-slate-100" />
        <div className="h-[2px] w-5 rounded bg-slate-100" />
      </div>
      <div
        className={cn(
          "select-none py-[3px] text-center font-black tracking-[0.1em] text-white shadow-sm",
          labelRounded,
          emphasize ? "text-[9px]" : "text-[8px]",
        )}
        style={{ background: tone.accent }}
      >
        {tone.label}
      </div>
    </div>
  );
}

function FilePill({ tone }: { tone: FileTone }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-md px-2 py-[3px] text-[9.5px] font-extrabold tracking-[0.08em] text-white shadow-[0_2px_6px_-2px_rgba(15,23,42,0.25)]"
      style={{ background: tone.accent }}
    >
      {tone.label}
    </span>
  );
}

function UploadCard({
  urlInputOpen,
  setUrlInputOpen,
  urlValue,
  setUrlValue,
  commitUrls,
}: {
  urlInputOpen: boolean;
  setUrlInputOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  urlValue: string;
  setUrlValue: (v: string) => void;
  commitUrls: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#e8e6e1] bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
          KB Sources
        </div>
        <button
          type="button"
          onClick={() => setUrlInputOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-card px-2.5 py-1 text-[11.5px] font-medium text-primary transition hover:bg-primary/5"
        >
          <Plus className="h-3 w-3" />
          Add New Source
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-[12.5px] font-semibold text-foreground">
          Upload the files or website links the bot will use to answer questions.{" "}
          <span className="text-primary">*</span>
        </div>

        {urlInputOpen && (
          <input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onBlur={commitUrls}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitUrls();
              }
            }}
            placeholder="Comma-separated URLs, e.g. https://example.com/doc1, https://example.com/doc2"
            className={inputCls}
          />
        )}

        <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#e5c8cd] bg-[#fbf5f5] px-5 py-4 text-center transition hover:bg-[#f7ecec]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e6e1] bg-card">
            <UploadCloud className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <div className="text-[12.5px] font-semibold text-foreground">
            Drop or click to ingest contextual models
          </div>
          <div className="text-[11px] text-muted-foreground">
            Supports CSV, PDF, XLSX, DOCX or target domain URLs
          </div>
          <input type="file" className="hidden" multiple />
        </label>
      </div>
    </div>
  );
}

function ExistingSourcesCard({
  view,
  onViewChange,
  sources,
  onRemove,
}: {
  view: "filled" | "empty";
  onViewChange: (v: "filled" | "empty") => void;
  sources: DraftSource[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-[#e8e6e1] bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Existing Sources
        </div>
        <div className="inline-flex items-center rounded-full border border-[#e8e6e1] bg-card p-0.5 text-[10.5px] font-semibold tracking-[0.08em]">
          {(["filled", "empty"] as const).map((k) => {
            const active = view === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => onViewChange(k)}
                className={cn(
                  "rounded-full px-2.5 py-1 uppercase transition",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col gap-3">
        {view === "filled" ? (
          <ExistingSourcesTable sources={sources} onRemove={onRemove} />
        ) : (
          <EmptySourcesIllustration />
        )}

        <p className="mt-auto border-t border-dashed border-[#e8e6e1] pt-2.5 text-[11px] leading-relaxed text-muted-foreground">
          All data synced inside this matrix uses vector embeddings isolated to the current tenant
          partition.
        </p>
      </div>
    </div>
  );
}

function EmptySourcesIllustration() {
  return _EmptySourcesIllustration();
}

function ExistingSourcesTable({
  sources,
  onRemove,
}: {
  sources: DraftSource[];
  onRemove: (id: string) => void;
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const allSelected = sources.length > 0 && sources.every((s) => selected[s.id]);
  const toggleAll = () => {
    if (allSelected) setSelected({});
    else setSelected(Object.fromEntries(sources.map((s) => [s.id, true])));
  };
  const toggleOne = (id: string) => setSelected((p) => ({ ...p, [id]: !p[id] }));

  const typeAccent: Record<DraftSource["type"], string> = {
    PDF: "#e11d48",
    DOCX: "#2563eb",
    CSV: "#10b981",
    XLSX: "#047857",
    PPTX: "#f97316",
    URL: "#6366f1",
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border border-[#e8e6e1] bg-card">
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-[11.5px]">
          <thead className="sticky top-0 z-10 bg-[#f7f6f3]">
            <tr className="text-left uppercase tracking-[0.06em] text-[10px] text-muted-foreground">
              <th className="w-8 px-2.5 py-2 font-semibold">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-3 w-3 accent-primary"
                />
              </th>
              <th className="px-2 py-2 font-semibold">Type</th>
              <th className="px-2 py-2 font-semibold">Source URL</th>
              <th className="px-2 py-2 font-semibold text-right">Chunk size</th>
              <th className="px-2 py-2 font-semibold text-right">Overlap</th>
              <th className="px-2 py-2 font-semibold">Strategy</th>
              <th className="px-2 py-2 font-semibold">Added at</th>
              <th className="w-8 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-t border-[#eeece7] transition hover:bg-[#faf9f7]">
                <td className="px-2.5 py-2 align-middle">
                  <input
                    type="checkbox"
                    checked={!!selected[s.id]}
                    onChange={() => toggleOne(s.id)}
                    className="h-3 w-3 accent-primary"
                  />
                </td>
                <td className="px-2 py-2 align-middle">
                  <span
                    className="inline-flex items-center rounded px-1.5 py-[2px] text-[9.5px] font-extrabold tracking-[0.08em] text-white"
                    style={{ background: typeAccent[s.type] }}
                  >
                    {s.type}
                  </span>
                </td>
                <td className="max-w-[240px] px-2 py-2 align-middle">
                  <a
                    href={s.kind === "url" ? s.name : "#"}
                    className="block truncate text-[11.5px] text-primary hover:underline"
                    title={s.name}
                  >
                    {s.name}
                  </a>
                </td>
                <td className="px-2 py-2 text-right align-middle tabular-nums text-foreground">
                  {s.chunkSize}
                </td>
                <td className="px-2 py-2 text-right align-middle tabular-nums text-foreground">
                  {s.chunkOverlap}
                </td>
                <td className="px-2 py-2 align-middle text-foreground">{s.strategy}</td>
                <td className="px-2 py-2 align-middle tabular-nums text-muted-foreground">
                  {s.addedAt}
                </td>
                <td className="px-2 py-2 align-middle">
                  <button
                    type="button"
                    onClick={() => onRemove(s.id)}
                    aria-label="Remove source"
                    className="rounded-md p-1 text-muted-foreground transition hover:bg-[#f4f3f1] hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function _EmptySourcesIllustration() {
  // Orbiting file tiles around a central hub. Angles are measured
  // clockwise from top (12 o'clock). Radii tuned so tiles orbit without
  // clipping the hub or the canvas edges.
  const orbit: {
    tone: FileTone;
    anim: string;
    tilt: number;
    lift: number; // px vertical offset for fan feel
    emphasize?: boolean;
  }[] = [
    { tone: FILE_TONES.CSV, anim: "animate-kb-float-csv", tilt: -8, lift: 14 },
    { tone: FILE_TONES.PDF, anim: "animate-kb-float-pdf", tilt: 0, lift: -6, emphasize: true },
    { tone: FILE_TONES.DOC, anim: "animate-kb-float-doc", tilt: 8, lift: 14 },
  ];

  const placeholders: { tone: FileTone; titleW: string; metaW: string }[] = [
    { tone: FILE_TONES.PDF, titleW: "62%", metaW: "34%" },
    { tone: FILE_TONES.DOC, titleW: "74%", metaW: "40%" },
    { tone: FILE_TONES.CSV, titleW: "50%", metaW: "28%" },
    { tone: FILE_TONES.XLSX, titleW: "66%", metaW: "36%" },
  ];

  const CANVAS_H = 170;

  return (
    <div
      className="relative flex flex-1 min-h-0 flex-col items-stretch gap-4 overflow-hidden rounded-xl border border-[#ece9e3] p-5"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.07) 1.2px, transparent 0)",
        backgroundSize: "18px 18px",
        backgroundPosition: "center",
      }}
    >
      {/* Constellation */}
      <div
        className="relative mx-auto flex w-full items-center justify-center gap-3 sm:gap-5"
        style={{ height: CANVAS_H }}
        aria-hidden="true"
      >
        {/* Fanned tiles */}
        {orbit.map((o) => {
          const emphasize = !!o.emphasize;
          const w = emphasize ? 76 : 64;
          const h = emphasize ? 98 : 84;
          return (
            <div
              key={`tile-${o.tone.label}`}
              className={cn("relative shrink-0 origin-center", o.anim)}
              style={{
                transform: `translateY(${o.lift}px) rotate(${o.tilt}deg)`,
                width: w,
                height: h,
                zIndex: emphasize ? 2 : 1,
              }}
            >
              <FileTile
                tone={o.tone}
                emphasize={emphasize}
                labelRounded={emphasize ? "rounded-lg" : "rounded"}
              />
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <div className="text-[13px] font-semibold text-foreground">
          Your sources will appear here
        </div>
        <div className="mx-auto mt-1 max-w-[280px] text-[11.5px] leading-relaxed text-muted-foreground">
          Connect docs, help centers and files — each source is chunked, embedded and routed through
          this knowledge hub.
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {placeholders.map((p) => (
          <div
            key={`${p.tone.label}-${p.titleW}-${p.metaW}`}
            className="flex items-center gap-2.5 rounded-lg border border-dashed border-[#e2dfd9] bg-white/70 px-2.5 py-1.5 backdrop-blur-[1px]"
          >
            <FilePill tone={p.tone} />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1">
              <span className="block h-1.5 rounded-full bg-[#e4e1db]" style={{ width: p.titleW }} />
              <span className="block h-1.5 rounded-full bg-[#ecebe6]" style={{ width: p.metaW }} />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#e8e6e1] bg-white px-1.5 py-[2px] text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-[#c9c6bd]" />
              Idle
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
