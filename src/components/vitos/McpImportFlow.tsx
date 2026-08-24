import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ----------------- shared styles ----------------- */
const inputCls =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";
const PINK = "#8B1E48";

type Stage = 1 | 2 | 3;
type Transport = "http" | "sse";
type AuthType = "none" | "bearer" | "apikey" | "basic" | "oauth" | "custom";
type SideEffect = "read" | "write" | "dest";
type DataClass = "pii" | "sensitive" | "public";

type KV = { id: string; key: string; value: string };
const uid = () => Math.random().toString(36).slice(2, 9);

type DiscoveredTool = {
  id: string;
  name: string;
  description: string;
  hint: SideEffect;
  inputSchema: string;
  outputSchema: string;
};

const MOCK_TOOLS: DiscoveredTool[] = [
  {
    id: "t1",
    name: "get_leave_balance",
    description: "Returns remaining leave balance for an employee.",
    hint: "read",
    inputSchema: `{\n  "employee_id": "string"\n}`,
    outputSchema: `{\n  "casual": "number",\n  "sick": "number",\n  "earned": "number"\n}`,
  },
  {
    id: "t2",
    name: "get_attendance_summary",
    description: "Returns monthly attendance summary for an employee.",
    hint: "read",
    inputSchema: `{\n  "employee_id": "string",\n  "month": "string"\n}`,
    outputSchema: `{\n  "present": "number",\n  "absent": "number"\n}`,
  },
  {
    id: "t3",
    name: "get_employee_details",
    description: "Fetches profile details for an employee by id.",
    hint: "read",
    inputSchema: `{\n  "employee_id": "string"\n}`,
    outputSchema: `{\n  "name": "string",\n  "email": "string",\n  "department": "string"\n}`,
  },
  {
    id: "t4",
    name: "apply_leave",
    description: "Files a new leave request on behalf of an employee.",
    hint: "write",
    inputSchema: `{\n  "employee_id": "string",\n  "from": "date",\n  "to": "date",\n  "type": "string"\n}`,
    outputSchema: `{\n  "request_id": "string",\n  "status": "string"\n}`,
  },
  {
    id: "t5",
    name: "delete_leave_request",
    description: "Permanently deletes a leave request by id.",
    hint: "dest",
    inputSchema: `{\n  "request_id": "string"\n}`,
    outputSchema: `{\n  "ok": "boolean"\n}`,
  },
];

/* ----------------- Root ----------------- */
export function McpImportFlow({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>(1);

  // Stage 1
  const [connName, setConnName] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("mcp:connName") ?? "";
  });
  const [serverUrl, setServerUrl] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("mcp:serverUrl") ?? "";
  });
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("mcp:connName", connName);
  }, [connName]);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("mcp:serverUrl", serverUrl);
  }, [serverUrl]);
  const [transport, setTransport] = useState<Transport>("http");
  const [authType, setAuthType] = useState<AuthType>("none");
  const [bearer, setBearer] = useState("");
  const [apiKeyName, setApiKeyName] = useState("");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [basicUser, setBasicUser] = useState("");
  const [basicPass, setBasicPass] = useState("");
  const [oauthClientId, setOauthClientId] = useState("");
  const [oauthClientSecret, setOauthClientSecret] = useState("");
  const [oauthTokenUrl, setOauthTokenUrl] = useState("");
  const [customHeaders, setCustomHeaders] = useState<KV[]>([{ id: uid(), key: "", value: "" }]);
  const [extraHeaders, setExtraHeaders] = useState<KV[]>([{ id: uid(), key: "", value: "" }]);
  const [showExtra, setShowExtra] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [timeout, setTimeoutVal] = useState(30);
  const [connecting, setConnecting] = useState(false);
  const [connError, setConnError] = useState<{ status: number; body: string } | null>(null);

  // Stage 2
  const [tools] = useState<DiscoveredTool[]>(MOCK_TOOLS);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // Stage 3
  type ToolClassification = {
    displayName: string;
    slug: string;
    descHuman: string;
    descAi: string;
    sideEffect: SideEffect | null;
    dataClass: DataClass | null;
    tags: string;
    touched: { sideEffect?: boolean; dataClass?: boolean };
  };
  const [classifications, setClassifications] = useState<Record<string, ToolClassification>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const selectedTools = useMemo(() => tools.filter((t) => selected[t.id]), [tools, selected]);
  const selectedCount = selectedTools.length;

  const handleConnect = () => {
    setConnError(null);
    if (!connName.trim() || !serverUrl.trim()) return;
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      // Initialize default selections (read-only checked)
      const init: Record<string, boolean> = {};
      MOCK_TOOLS.forEach((t) => (init[t.id] = t.hint === "read"));
      setSelected(init);
      setStage(2);
    }, 900);
  };

  const goToStage3 = () => {
    const next: Record<string, ToolClassification> = { ...classifications };
    selectedTools.forEach((t) => {
      if (!next[t.id]) {
        next[t.id] = {
          displayName: t.name,
          slug: t.name.replace(/[^a-z0-9]+/gi, "_").toLowerCase(),
          descHuman: t.description,
          descAi: t.description,
          sideEffect: t.hint,
          dataClass: null,
          tags: "",
          touched: { sideEffect: true },
        };
      }
    });
    setClassifications(next);
    setStage(3);
  };

  const invalidTools = useMemo(() => {
    return selectedTools.filter((t) => {
      const c = classifications[t.id];
      return !c || !c.sideEffect || !c.dataClass;
    });
  }, [selectedTools, classifications]);

  return (
    <div className="mt-5 rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-border bg-muted/40 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:bg-hover"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>All APIs</span>
              <ChevronRight className="h-3 w-3" />
              <span>New</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">MCP Import</span>
            </div>
            <h3 className="mt-0.5 text-base font-semibold text-foreground">Connect MCP server</h3>
            <p className="text-xs text-muted-foreground">
              Import tools from an external MCP server as callable Vitos APIs
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5D3DF] bg-[#FDE8EF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8B1E48]">
          <Plug className="h-3 w-3" /> MCP
        </span>
      </div>

      {/* Stage indicator */}
      <StageIndicator stage={stage} />

      <div className="px-6 py-6">
        {stage === 1 && (
          <Stage1
            connName={connName}
            setConnName={setConnName}
            serverUrl={serverUrl}
            setServerUrl={setServerUrl}
            transport={transport}
            setTransport={setTransport}
            authType={authType}
            setAuthType={setAuthType}
            bearer={bearer}
            setBearer={setBearer}
            apiKeyName={apiKeyName}
            setApiKeyName={setApiKeyName}
            apiKeyValue={apiKeyValue}
            setApiKeyValue={setApiKeyValue}
            basicUser={basicUser}
            setBasicUser={setBasicUser}
            basicPass={basicPass}
            setBasicPass={setBasicPass}
            oauthClientId={oauthClientId}
            setOauthClientId={setOauthClientId}
            oauthClientSecret={oauthClientSecret}
            setOauthClientSecret={setOauthClientSecret}
            oauthTokenUrl={oauthTokenUrl}
            setOauthTokenUrl={setOauthTokenUrl}
            customHeaders={customHeaders}
            setCustomHeaders={setCustomHeaders}
            extraHeaders={extraHeaders}
            setExtraHeaders={setExtraHeaders}
            showExtra={showExtra}
            setShowExtra={setShowExtra}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            timeoutVal={timeout}
            setTimeoutVal={setTimeoutVal}
            connecting={connecting}
            connError={connError}
            onCancel={onBack}
            onConnect={handleConnect}
          />
        )}

        {stage === 2 && (
          <Stage2
            connName={connName}
            tools={tools}
            selected={selected}
            setSelected={setSelected}
            selectedCount={selectedCount}
            onBack={() => setStage(1)}
            onNext={goToStage3}
          />
        )}

        {stage === 3 && (
          <Stage3
            selectedTools={selectedTools}
            classifications={classifications}
            setClassifications={setClassifications}
            expanded={expanded}
            setExpanded={setExpanded}
            invalidTools={invalidTools}
            onBack={() => setStage(2)}
            onDone={onBack}
          />
        )}
      </div>
    </div>
  );
}

/* ----------------- Stage indicator ----------------- */
function StageIndicator({ stage }: { stage: Stage }) {
  const steps: { id: Stage; label: string }[] = [
    { id: 1, label: "Connect" },
    { id: 2, label: "Discover" },
    { id: 3, label: "Classify" },
  ];
  return (
    <div className="flex items-center justify-center gap-2 border-b border-border bg-muted/20 px-6 py-3">
      {steps.map((s, i) => {
        const isActive = s.id === stage;
        const isDone = s.id < stage;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                isDone && "border-[#8B1E48] bg-[#8B1E48] text-white",
                isActive && "border-[#8B1E48] bg-[#FDE8EF] text-[#8B1E48]",
                !isDone && !isActive && "border-border bg-card text-muted-foreground",
              )}
            >
              {isDone ? <Check className="h-3 w-3" /> : s.id}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                isActive ? "text-[#8B1E48]" : isDone ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="mx-2 h-px w-10 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

/* ----------------- Stage 1 ----------------- */
function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-[#8B1E48]">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function MaskedInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputCls, "pr-10 font-mono")}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-hover"
        aria-label={show ? "Hide" : "Show"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function KVEditor({ rows, setRows }: { rows: KV[]; setRows: (r: KV[]) => void }) {
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center gap-2">
          <input
            value={r.key}
            onChange={(e) =>
              setRows(rows.map((x) => (x.id === r.id ? { ...x, key: e.target.value } : x)))
            }
            placeholder="Header name"
            className={cn(inputCls, "flex-1 font-mono text-xs")}
          />
          <input
            value={r.value}
            onChange={(e) =>
              setRows(rows.map((x) => (x.id === r.id ? { ...x, value: e.target.value } : x)))
            }
            placeholder="Value"
            className={cn(inputCls, "flex-1 font-mono text-xs")}
          />
          <button
            type="button"
            onClick={() => setRows(rows.filter((x) => x.id !== r.id))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-hover"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows([...rows, { id: uid(), key: "", value: "" }])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-hover"
      >
        <Plus className="h-3.5 w-3.5" /> Add row
      </button>
    </div>
  );
}

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

interface Stage1Props {
  connName: string;
  setConnName: Setter<string>;
  serverUrl: string;
  setServerUrl: Setter<string>;
  transport: Transport;
  setTransport: Setter<Transport>;
  authType: AuthType;
  setAuthType: Setter<AuthType>;
  bearer: string;
  setBearer: Setter<string>;
  apiKeyName: string;
  setApiKeyName: Setter<string>;
  apiKeyValue: string;
  setApiKeyValue: Setter<string>;
  basicUser: string;
  setBasicUser: Setter<string>;
  basicPass: string;
  setBasicPass: Setter<string>;
  oauthClientId: string;
  setOauthClientId: Setter<string>;
  oauthClientSecret: string;
  setOauthClientSecret: Setter<string>;
  oauthTokenUrl: string;
  setOauthTokenUrl: Setter<string>;
  customHeaders: KV[];
  setCustomHeaders: Setter<KV[]>;
  extraHeaders: KV[];
  setExtraHeaders: Setter<KV[]>;
  showExtra: boolean;
  setShowExtra: Setter<boolean>;
  showAdvanced: boolean;
  setShowAdvanced: Setter<boolean>;
  timeoutVal: number;
  setTimeoutVal: Setter<number>;
  connecting: boolean;
  connError: { status: number; body: string } | null;
  onCancel: () => void;
  onConnect: () => void;
}

function Stage1(props: Stage1Props) {
  const {
    connName,
    setConnName,
    serverUrl,
    setServerUrl,
    transport,
    setTransport,
    authType,
    setAuthType,
    bearer,
    setBearer,
    apiKeyName,
    setApiKeyName,
    apiKeyValue,
    setApiKeyValue,
    basicUser,
    setBasicUser,
    basicPass,
    setBasicPass,
    oauthClientId,
    setOauthClientId,
    oauthClientSecret,
    setOauthClientSecret,
    oauthTokenUrl,
    setOauthTokenUrl,
    customHeaders,
    setCustomHeaders,
    extraHeaders,
    setExtraHeaders,
    showExtra,
    setShowExtra,
    showAdvanced,
    setShowAdvanced,
    timeoutVal,
    setTimeoutVal,
    connecting,
    connError,
    onCancel,
    onConnect,
  } = props;

  const urlValid = !serverUrl || /^https?:\/\//i.test(serverUrl);
  const canSubmit = !!connName.trim() && !!serverUrl.trim() && urlValid && !connecting;
  const disabledReason = !connName.trim()
    ? "Enter a connection name"
    : !serverUrl.trim()
      ? "Enter a server URL"
      : !urlValid
        ? "URL must start with http:// or https://"
        : "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Field label="Connection name" required>
        <input
          value={connName}
          onChange={(e) => setConnName(e.target.value)}
          placeholder="e.g. Keka MCP – Acme Corp"
          className={inputCls}
        />
      </Field>

      <Field label="Server URL" required hint="Must begin with https:// or http://">
        <input
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          placeholder="https://your-mcp-server.com/mcp"
          className={cn(inputCls, "font-mono", !urlValid && "border-red-400 focus:border-red-500")}
        />
        {connError && (
          <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="space-y-1">
                <div className="font-semibold text-amber-900">Connection failed</div>
                <div className="font-mono text-[11px] text-amber-800">
                  HTTP {connError.status} — {connError.body}
                </div>
                <div className="text-amber-700">
                  Check your URL, auth credentials, and that the server is reachable.
                </div>
              </div>
            </div>
          </div>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Transport type">
          <div className="relative">
            <select
              value={transport}
              onChange={(e) => setTransport(e.target.value as Transport)}
              className={cn(inputCls, "appearance-none pr-9")}
            >
              <option value="http">HTTP Streamable</option>
              <option value="sse">SSE (Deprecated)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          {transport === "sse" && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
              Deprecated
            </span>
          )}
        </Field>

        <Field label="Auth type">
          <div className="relative">
            <select
              value={authType}
              onChange={(e) => setAuthType(e.target.value as AuthType)}
              className={cn(inputCls, "appearance-none pr-9")}
            >
              <option value="none">None</option>
              <option value="bearer">Bearer token</option>
              <option value="apikey">API key</option>
              <option value="basic">Basic auth</option>
              <option value="oauth">OAuth 2.0</option>
              <option value="custom">Custom headers</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>
      </div>

      {authType === "bearer" && (
        <Field label="Bearer token">
          <MaskedInput value={bearer} onChange={setBearer} placeholder="eyJhbGci..." />
        </Field>
      )}
      {authType === "apikey" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Key name">
            <input
              value={apiKeyName}
              onChange={(e) => setApiKeyName(e.target.value)}
              placeholder="X-API-Key"
              className={cn(inputCls, "font-mono")}
            />
          </Field>
          <Field label="Key value">
            <MaskedInput value={apiKeyValue} onChange={setApiKeyValue} placeholder="••••••••" />
          </Field>
        </div>
      )}
      {authType === "basic" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Username">
            <input
              value={basicUser}
              onChange={(e) => setBasicUser(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Password">
            <MaskedInput value={basicPass} onChange={setBasicPass} />
          </Field>
        </div>
      )}
      {authType === "oauth" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Client ID">
              <input
                value={oauthClientId}
                onChange={(e) => setOauthClientId(e.target.value)}
                className={cn(inputCls, "font-mono")}
              />
            </Field>
            <Field label="Client secret">
              <MaskedInput value={oauthClientSecret} onChange={setOauthClientSecret} />
            </Field>
          </div>
          <Field label="Token URL">
            <input
              value={oauthTokenUrl}
              onChange={(e) => setOauthTokenUrl(e.target.value)}
              placeholder="https://auth.example.com/oauth/token"
              className={cn(inputCls, "font-mono")}
            />
          </Field>
        </div>
      )}
      {authType === "custom" && (
        <Field label="Custom headers">
          <KVEditor rows={customHeaders} setRows={setCustomHeaders} />
        </Field>
      )}

      {/* Additional headers */}
      <div className="rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setShowExtra(!showExtra)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
        >
          <span>Additional headers</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", showExtra && "rotate-180")} />
        </button>
        {showExtra && (
          <div className="border-t border-border px-4 py-3">
            <p className="mb-3 text-xs text-muted-foreground">
              Added to every request. Useful for tenant ID, client ID, etc.
            </p>
            <KVEditor rows={extraHeaders} setRows={setExtraHeaders} />
          </div>
        )}
      </div>

      {/* Advanced */}
      <div className="rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
        >
          <span>Advanced</span>
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")}
          />
        </button>
        {showAdvanced && (
          <div className="border-t border-border px-4 py-3">
            <Field label="Timeout (seconds)">
              <input
                type="number"
                value={timeoutVal}
                onChange={(e) => setTimeoutVal(Number(e.target.value))}
                className={cn(inputCls, "max-w-[180px]")}
              />
            </Field>
          </div>
        )}
      </div>

      {/* Footer CTAs */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-hover"
        >
          Cancel
        </button>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={onConnect}
            disabled={!canSubmit}
            title={disabledReason || undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition",
              canSubmit ? "bg-[#8B1E48] hover:bg-[#7a1a3f]" : "bg-[#8B1E48]/40 cursor-not-allowed",
            )}
          >
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Connecting…
              </>
            ) : (
              <>
                Connect & Discover <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          {!canSubmit && !connecting && disabledReason && (
            <span className="text-[11px] text-muted-foreground">{disabledReason}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------- Stage 2 ----------------- */
function SideEffectBadge({ kind }: { kind: SideEffect }) {
  const styles: Record<SideEffect, string> = {
    read: "border-border bg-muted text-foreground",
    write: "border-amber-300 bg-amber-50 text-amber-800",
    dest: "border-red-300 bg-red-50 text-red-700",
  };
  const label = kind === "dest" ? "dest" : kind;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        styles[kind],
      )}
    >
      {label}
    </span>
  );
}

function Stage2({
  connName,
  tools,
  selected,
  setSelected,
  selectedCount,
  onBack,
  onNext,
}: {
  connName: string;
  tools: DiscoveredTool[];
  selected: Record<string, boolean>;
  setSelected: (s: Record<string, boolean>) => void;
  selectedCount: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const toggle = (id: string) => setSelected({ ...selected, [id]: !selected[id] });
  const selectAllRead = () => {
    const next: Record<string, boolean> = {};
    tools.forEach((t) => (next[t.id] = t.hint === "read"));
    setSelected(next);
  };
  const selectAll = () => {
    const next: Record<string, boolean> = {};
    tools.forEach((t) => (next[t.id] = true));
    setSelected(next);
  };
  const clear = () => setSelected({});

  if (tools.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-xl border border-border bg-muted/30 px-6 py-10 text-center">
          <h4 className="text-base font-semibold text-foreground">
            No tools discovered on this server.
          </h4>
          <p className="mt-2 text-sm text-muted-foreground">
            The server connected successfully but returned an empty tool list. Check the server
            configuration or try a different endpoint.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#8B1E48] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back and edit connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#8B1E48]">
          <Check className="h-4 w-4" /> Connected to {connName || "MCP server"}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{tools.length} tools discovered</div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={selectAllRead}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-hover"
        >
          Select all read-only
        </button>
        <button
          onClick={selectAll}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-hover"
        >
          Select all
        </button>
        <button
          onClick={clear}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-hover"
        >
          Clear
        </button>
      </div>

      <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
        {tools.map((t) => {
          const checked = !!selected[t.id];
          return (
            <label
              key={t.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 cursor-pointer transition",
                checked ? "bg-[#FDE8EF]/30" : "hover:bg-hover",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(t.id)}
                className="h-4 w-4 accent-[#8B1E48]"
              />
              <span className="font-mono text-sm text-foreground">{t.name}</span>
              <span className="flex-1 truncate text-xs text-muted-foreground">{t.description}</span>
              <SideEffectBadge kind={t.hint} />
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-hover"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={selectedCount === 0}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition",
            selectedCount > 0
              ? "bg-[#8B1E48] hover:bg-[#7a1a3f]"
              : "bg-[#8B1E48]/40 cursor-not-allowed",
          )}
        >
          Import {selectedCount} selected as APIs <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ----------------- Stage 3 ----------------- */
type ToolClassification = {
  displayName: string;
  slug: string;
  descHuman: string;
  descAi: string;
  sideEffect: SideEffect | null;
  dataClass: DataClass | null;
  tags: string;
  touched: { sideEffect?: boolean; dataClass?: boolean };
};

const SIDE_EFFECT_LABELS: Record<SideEffect, string> = {
  read: "Read",
  write: "Write",
  dest: "Destructive",
};
const DATA_CLASS_LABELS: Record<DataClass, string> = {
  pii: "PII",
  sensitive: "Sensitive",
  public: "Public",
};

function Pills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | null;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              active
                ? "border-[#8B1E48] bg-[#FDE8EF] text-[#8B1E48]"
                : "border-border bg-card text-foreground hover:bg-hover",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Stage3({
  selectedTools,
  classifications,
  setClassifications,
  expanded,
  setExpanded,
  invalidTools,
  onBack,
  onDone,
}: {
  selectedTools: DiscoveredTool[];
  classifications: Record<string, ToolClassification>;
  setClassifications: (c: Record<string, ToolClassification>) => void;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  invalidTools: DiscoveredTool[];
  onBack: () => void;
  onDone: () => void;
}) {
  const [bulkSide, setBulkSide] = useState<SideEffect>("read");
  const [bulkData, setBulkData] = useState<DataClass>("pii");
  const [bulkAccess, setBulkAccess] = useState<"agent" | "external">("agent");
  const [showValidation, setShowValidation] = useState(false);
  const [published, setPublished] = useState(false);

  const updateTool = (id: string, patch: Partial<ToolClassification>) => {
    setClassifications({
      ...classifications,
      [id]: { ...classifications[id], ...patch },
    });
  };

  const applyBulk = () => {
    const next = { ...classifications };
    selectedTools.forEach((t) => {
      const c = next[t.id];
      if (!c) return;
      if (!c.touched.sideEffect) c.sideEffect = bulkSide;
      if (!c.touched.dataClass) c.dataClass = bulkData;
    });
    setClassifications(next);
  };

  const handlePublish = () => {
    if (invalidTools.length > 0) {
      setShowValidation(true);
      const first = invalidTools[0];
      const el = document.getElementById(`tool-row-${first.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setPublished(true);
    setTimeout(onDone, 1200);
  };

  if (published) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FDE8EF]">
          <Check className="h-6 w-6 text-[#8B1E48]" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Published {selectedTools.length} tools
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">Returning to All APIs…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Bulk edit bar */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">
            Bulk apply:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Side effect</span>
            <select
              value={bulkSide}
              onChange={(e) => setBulkSide(e.target.value as SideEffect)}
              className="rounded-md border border-border bg-card px-2 py-1 text-xs"
            >
              <option value="read">Read</option>
              <option value="write">Write</option>
              <option value="dest">Destructive</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Data class</span>
            <select
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value as DataClass)}
              className="rounded-md border border-border bg-card px-2 py-1 text-xs"
            >
              <option value="pii">PII</option>
              <option value="sensitive">Sensitive</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Access</span>
            <select
              value={bulkAccess}
              onChange={(e) => setBulkAccess(e.target.value as "agent" | "external")}
              className="rounded-md border border-border bg-card px-2 py-1 text-xs"
            >
              <option value="agent">Agent only</option>
              <option value="external">External</option>
            </select>
          </div>
          <button
            onClick={applyBulk}
            className="ml-auto rounded-lg bg-[#8B1E48] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#7a1a3f]"
          >
            Apply to all
          </button>
        </div>
      </div>

      {showValidation && invalidTools.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
          <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5" />
          {invalidTools.length} {invalidTools.length === 1 ? "tool has" : "tools have"} missing
          required fields — resolve before publishing.
        </div>
      )}

      {/* Tool rows */}
      <div className="space-y-2">
        {selectedTools.map((t) => {
          const c = classifications[t.id];
          if (!c) return null;
          const isExpanded = expanded === t.id;
          const isInvalid = !c.sideEffect || !c.dataClass;
          return (
            <div
              key={t.id}
              id={`tool-row-${t.id}`}
              className={cn(
                "rounded-xl border bg-card transition",
                showValidation && isInvalid
                  ? "border-amber-400 ring-1 ring-amber-200"
                  : "border-border",
              )}
            >
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : t.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-mono text-sm text-foreground">{t.name}</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                      c.sideEffect
                        ? "border-border bg-muted"
                        : "border-amber-300 bg-amber-50 text-amber-800",
                    )}
                  >
                    {c.sideEffect ? SIDE_EFFECT_LABELS[c.sideEffect] : "Side effect?"}
                  </span>
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                      c.dataClass
                        ? "border-border bg-muted"
                        : "border-amber-300 bg-amber-50 text-amber-800",
                    )}
                  >
                    {c.dataClass ? DATA_CLASS_LABELS[c.dataClass] : "Data class?"}
                  </span>
                  <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold">
                    Agent only
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="space-y-5 border-t border-border bg-muted/10 px-5 py-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Display name">
                      <input
                        value={c.displayName}
                        onChange={(e) => updateTool(t.id, { displayName: e.target.value })}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Slug">
                      <input
                        value={c.slug}
                        onChange={(e) => updateTool(t.id, { slug: e.target.value })}
                        className={cn(inputCls, "font-mono")}
                      />
                    </Field>
                  </div>

                  <Field label="Description for humans">
                    <textarea
                      value={c.descHuman}
                      onChange={(e) => updateTool(t.id, { descHuman: e.target.value })}
                      rows={2}
                      className={cn(inputCls, "resize-none")}
                    />
                  </Field>

                  <Field
                    label="Description for AI agents"
                    hint="The LLM reads this to decide when to call this tool."
                  >
                    <textarea
                      value={c.descAi}
                      onChange={(e) => updateTool(t.id, { descAi: e.target.value })}
                      rows={2}
                      className={cn(inputCls, "resize-none")}
                    />
                  </Field>

                  <Field label="Side effect" required>
                    <Pills
                      value={c.sideEffect}
                      onChange={(v) =>
                        updateTool(t.id, {
                          sideEffect: v,
                          touched: { ...c.touched, sideEffect: true },
                        })
                      }
                      options={[
                        { id: "read", label: "Read" },
                        { id: "write", label: "Write" },
                        { id: "dest", label: "Destructive" },
                      ]}
                    />
                  </Field>

                  <Field label="Data classification" required>
                    <Pills
                      value={c.dataClass}
                      onChange={(v) =>
                        updateTool(t.id, {
                          dataClass: v,
                          touched: { ...c.touched, dataClass: true },
                        })
                      }
                      options={[
                        { id: "pii", label: "PII" },
                        { id: "sensitive", label: "Sensitive" },
                        { id: "public", label: "Public" },
                      ]}
                    />
                  </Field>

                  <Field label="Tags">
                    <input
                      value={c.tags}
                      onChange={(e) => updateTool(t.id, { tags: e.target.value })}
                      placeholder="comma, separated, tags"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Input schema" hint="Auto-filled from MCP. Read-only.">
                      <pre className="max-h-40 overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] text-foreground">
                        {t.inputSchema}
                      </pre>
                    </Field>
                    <Field label="Output schema" hint="Auto-filled from MCP. Read-only.">
                      <pre className="max-h-40 overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] text-foreground">
                        {t.outputSchema}
                      </pre>
                    </Field>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-hover"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onDone}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-hover"
          >
            Save all as drafts
          </button>
          <button
            onClick={handlePublish}
            className="inline-flex items-center gap-2 rounded-lg bg-[#8B1E48] px-5 py-2 text-sm font-semibold text-white hover:bg-[#7a1a3f]"
          >
            Publish all <Check className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
