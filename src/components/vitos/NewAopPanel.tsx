import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Ticket,
  ShoppingCart,
  User as UserIcon,
  FileText,
  Bell,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  Settings,
  Zap,
  ChevronDown,
} from "lucide-react";

type EntityKey = "ticket" | "order" | "employee" | "lead" | "alert" | "custom";
type ColType = "text" | "number" | "date" | "select" | "boolean";

const ENTITY_TEMPLATES: {
  key: EntityKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconText: string;
}[] = [
  {
    key: "ticket",
    label: "Ticket",
    icon: Ticket,
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
  },
  {
    key: "order",
    label: "Order",
    icon: ShoppingCart,
    iconBg: "bg-sky-100",
    iconText: "text-sky-600",
  },
  {
    key: "employee",
    label: "Employee",
    icon: UserIcon,
    iconBg: "bg-violet-100",
    iconText: "text-violet-600",
  },
  {
    key: "lead",
    label: "Lead",
    icon: FileText,
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
  },
  {
    key: "alert",
    label: "Alert",
    icon: Bell,
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
  },
  {
    key: "custom",
    label: "Custom",
    icon: Plus,
    iconBg: "bg-muted",
    iconText: "text-muted-foreground",
  },
];

interface Column {
  id: string;
  name: string;
  type: ColType;
  enabled: boolean;
}
interface State {
  id: string;
  name: string;
}

const DEFAULT_COLUMNS: Record<EntityKey, Omit<Column, "id">[]> = {
  ticket: [
    { name: "ticket_id", type: "text", enabled: true },
    { name: "subject", type: "text", enabled: true },
    { name: "priority", type: "text", enabled: true },
    { name: "assigned_to", type: "text", enabled: true },
    { name: "created_date", type: "date", enabled: true },
  ],
  order: [
    { name: "order_id", type: "text", enabled: true },
    { name: "amount", type: "number", enabled: true },
    { name: "status", type: "select", enabled: true },
  ],
  employee: [
    { name: "full_name", type: "text", enabled: true },
    { name: "department", type: "select", enabled: true },
    { name: "joined_at", type: "date", enabled: true },
  ],
  lead: [
    { name: "name", type: "text", enabled: true },
    { name: "source", type: "select", enabled: true },
    { name: "score", type: "number", enabled: true },
  ],
  alert: [
    { name: "title", type: "text", enabled: true },
    { name: "severity", type: "select", enabled: true },
  ],
  custom: [],
};

const uid = () => Math.random().toString(36).slice(2);

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate?: (data: {
    name: string;
    entity: EntityKey;
    description: string;
    states: string[];
    columns: Column[];
  }) => void;
}

const ACCENT = "#7a1a3a";

export function NewAopPanel({ open, onClose, onCreate }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [entity, setEntity] = useState<EntityKey>("ticket");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [columns, setColumns] = useState<Column[]>(
    DEFAULT_COLUMNS.ticket.map((c) => ({ ...c, id: uid() })),
  );
  const [states, setStates] = useState<State[]>([]);
  const [showStateConfig, setShowStateConfig] = useState(false);

  useEffect(() => {
    setColumns(DEFAULT_COLUMNS[entity].map((c) => ({ ...c, id: uid() })));
  }, [entity]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setStep(1);
      setShowStateConfig(false);
    }
  }, [open]);

  const enabledColumns = columns.filter((c) => c.enabled && c.name.trim());
  const nameOk = name.trim().length > 0;
  const canContinueStep1 = nameOk;
  const canCreate = nameOk && enabledColumns.length > 0;

  const updateColumn = (id: string, patch: Partial<Column>) =>
    setColumns((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const addColumn = () =>
    setColumns((cs) => [...cs, { id: uid(), name: "", type: "text", enabled: true }]);

  const addState = () => setStates((ss) => [...ss, { id: uid(), name: "" }]);
  const updateState = (id: string, val: string) =>
    setStates((ss) => ss.map((s) => (s.id === id ? { ...s, name: val } : s)));
  const removeState = (id: string) => setStates((ss) => ss.filter((s) => s.id !== id));

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate?.({
      name,
      entity,
      description,
      states: states.map((s) => s.name.trim()).filter(Boolean),
      columns: enabledColumns,
    });
    onClose();
  };

  const stepMeta = {
    1: {
      eyebrow: "STEP 1 OF 3",
      title: "Create your data table",
      sub: "This table defines what your agents will read and act on. Start from a template or build your own from scratch.",
    },
    2: {
      eyebrow: "STEP 2 OF 3",
      title: "Configure your entity",
      sub: "Set up lifecycle states and the data columns your agents will use.",
    },
    3: {
      eyebrow: "STEP 3 OF 3",
      title: "Looks good — ready to create?",
      sub: "Review your setup. You can refine everything after creation.",
    },
  }[step];

  const selectedTemplate = ENTITY_TEMPLATES.find((t) => t.key === entity)!;

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
        aria-label="New AOP"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[460px] flex-col bg-background shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <header className="px-5 pb-3.5 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div
                className="text-[10px] font-semibold tracking-[0.14em]"
                style={{ color: ACCENT }}
              >
                {stepMeta.eyebrow}
              </div>
              <h2 className="mt-1 text-[17px] font-semibold leading-snug tracking-tight text-foreground">
                {stepMeta.title}
              </h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                {stepMeta.sub}
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
          </div>
        </header>

        {/* Stepper */}
        <div className="border-y border-border bg-card/30 px-5 py-2.5">
          <ol className="flex items-center gap-1.5">
            {[1, 2, 3].map((n, i) => {
              const labels = ["Data table", "Configure", "Review"];
              const isCurrent = step === n;
              const isDone = step > n;
              return (
                <li key={n} className="flex flex-1 items-center gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-semibold transition ${
                        isDone
                          ? "text-white"
                          : isCurrent
                            ? "border-[1.5px] bg-background"
                            : "bg-muted text-muted-foreground"
                      }`}
                      style={
                        isDone
                          ? { backgroundColor: ACCENT }
                          : isCurrent
                            ? { borderColor: ACCENT, color: ACCENT }
                            : undefined
                      }
                    >
                      {isDone ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : n}
                    </span>
                    <span
                      className={`text-[12px] font-medium ${
                        isCurrent || isDone ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {labels[i]}
                    </span>
                  </div>
                  {i < 2 && <div className="h-px flex-1 bg-border" />}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4">
          {step === 1 && (
            <>
              <section>
                <h3 className="text-[13px] font-semibold text-foreground">
                  Pick a template as starting point
                </h3>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Pre-built templates with columns and states ready to go.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {ENTITY_TEMPLATES.map((t) => {
                    const Icon = t.icon;
                    const selected = entity === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setEntity(t.key)}
                        className={`group flex flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-xs transition ${
                          selected ? "border-transparent" : "border-border bg-card hover:bg-hover"
                        }`}
                        style={
                          selected
                            ? {
                                backgroundColor: "#fbe8ee",
                                borderColor: ACCENT,
                              }
                            : undefined
                        }
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-md ${t.iconBg} ${t.iconText}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span
                          className="text-[12px] font-medium"
                          style={selected ? { color: ACCENT } : undefined}
                        >
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="mt-5">
                <label htmlFor="aop-name" className="text-[12.5px] font-semibold text-foreground">
                  Name
                </label>
                <input
                  id="aop-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. support_tickets"
                  className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
                />
              </section>

              <section className="mt-4">
                <label htmlFor="aop-desc" className="text-[12.5px] font-semibold text-foreground">
                  Description <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id="aop-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this AOP handle?"
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
                />
              </section>
            </>
          )}

          {step === 2 && (
            <>
              {/* States */}
              <section>
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-foreground">States</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStateConfig(true);
                      if (states.length === 0) addState();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[11.5px] font-medium text-foreground transition hover:bg-hover"
                  >
                    <Settings className="h-3 w-3" />
                    Configure
                  </button>
                </div>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Lifecycle stages your agents use to track progress and trigger actions.
                </p>

                {!showStateConfig && states.length === 0 ? (
                  <div className="mt-2.5 flex items-start gap-2 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2.5 text-[12px] text-foreground">
                    <Zap className="mt-0.5 h-3 w-3 shrink-0" style={{ color: ACCENT }} />
                    <span>
                      No states yet.{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setShowStateConfig(true);
                          addState();
                        }}
                        className="font-medium underline-offset-2 hover:underline"
                        style={{ color: ACCENT }}
                      >
                        Configure
                      </button>{" "}
                      to add stages like open, in_review, resolved.
                    </span>
                  </div>
                ) : (
                  <div className="mt-2.5 space-y-1.5">
                    {states.map((s, idx) => (
                      <div
                        key={s.id}
                        className="group flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-medium text-muted-foreground">
                          {idx + 1}
                        </span>
                        <input
                          value={s.name}
                          onChange={(e) => updateState(s.id, e.target.value)}
                          placeholder="state_name"
                          className="flex-1 bg-transparent px-1 py-0.5 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeState(s.id)}
                          aria-label="Remove state"
                          className="rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-hover hover:text-destructive group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addState}
                      className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground transition hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" /> Add state
                    </button>
                  </div>
                )}
              </section>

              {/* Columns */}
              <section className="mt-6">
                <h3 className="text-[13px] font-semibold text-foreground">Columns</h3>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Data fields agents can read and write on each record.
                </p>

                <div className="mt-3 grid grid-cols-[1fr_96px_56px_40px] items-center gap-2 border-b border-border pb-1.5 text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <div>Name</div>
                  <div>Type</div>
                  <div>Value</div>
                  <div className="text-right">On</div>
                </div>

                <div className="divide-y divide-border">
                  {columns.map((c) => (
                    <div
                      key={c.id}
                      className="grid grid-cols-[1fr_96px_56px_40px] items-center gap-2 py-2"
                    >
                      <input
                        value={c.name}
                        onChange={(e) => updateColumn(c.id, { name: e.target.value })}
                        placeholder="column_name"
                        className="rounded border border-transparent bg-transparent px-2 py-1 text-[12.5px] text-foreground placeholder:text-muted-foreground transition hover:border-border hover:bg-card focus:border-border focus:bg-card focus:outline-none focus:ring-2 focus:ring-foreground/10"
                      />
                      <div className="relative">
                        <select
                          value={c.type}
                          onChange={(e) => updateColumn(c.id, { type: e.target.value as ColType })}
                          className="w-full appearance-none rounded border border-border bg-card px-2 py-1 pr-6 text-[11px] text-foreground focus:outline-none"
                        >
                          <option value="text">text</option>
                          <option value="number">number</option>
                          <option value="date">date</option>
                          <option value="select">select</option>
                          <option value="boolean">boolean</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        NULL
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={c.enabled}
                          onClick={() => updateColumn(c.id, { enabled: !c.enabled })}
                          className="relative inline-flex h-4 w-7 items-center rounded-full transition"
                          style={{
                            backgroundColor: c.enabled ? ACCENT : "hsl(var(--muted))",
                          }}
                        >
                          <span
                            className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${
                              c.enabled ? "translate-x-[14px]" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addColumn}
                  className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground transition hover:text-foreground"
                >
                  <Plus className="h-3 w-3" /> Add column
                </button>
              </section>
            </>
          )}

          {step === 3 && (
            <>
              <section>
                <h3 className="text-[13px] font-semibold text-foreground">
                  Here's what we'll create
                </h3>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Everything can be edited once your AOP is live.
                </p>

                <div className="mt-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selectedTemplate.iconBg} ${selectedTemplate.iconText}`}
                    >
                      <selectedTemplate.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold text-foreground">
                        {name || "Untitled"}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {selectedTemplate.label} entity · Draft
                      </div>
                      {description && (
                        <div className="mt-1 text-[12px] italic text-muted-foreground">
                          {description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="my-3 h-px bg-border" />

                  <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                    States
                  </div>
                  <div className="mt-1.5">
                    {states.filter((s) => s.name.trim()).length === 0 ? (
                      <div className="text-[12px] italic text-muted-foreground">
                        None configured — add after creation
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {states
                          .filter((s) => s.name.trim())
                          .map((s) => (
                            <span
                              key={s.id}
                              className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-foreground"
                            >
                              {s.name}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="my-3 h-px bg-border" />

                  <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Columns
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {enabledColumns.length === 0 ? (
                      <div className="text-[12px] italic text-muted-foreground">
                        No columns enabled
                      </div>
                    ) : (
                      enabledColumns.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-foreground"
                        >
                          {c.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div
                  className="mt-3 rounded-lg border px-3.5 py-3"
                  style={{ backgroundColor: "#f7f1ec", borderColor: "#ecdfd3" }}
                >
                  <div className="text-[12.5px] font-semibold text-foreground">
                    What happens next
                  </div>
                  <div className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
                    Your AOP is created in Draft. Connect agents and configure trigger logic from
                    the detail page whenever you're ready.
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-2 border-t border-border bg-card/50 px-5 py-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground transition hover:bg-hover"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 && !canContinueStep1}
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="rounded-md px-4 py-1.5 text-[12.5px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: ACCENT }}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={!canCreate}
              onClick={handleCreate}
              className="rounded-md px-4 py-1.5 text-[12.5px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: ACCENT }}
            >
              Create Entity
            </button>
          )}
        </footer>
      </aside>
    </>,
    document.body,
  );
}
