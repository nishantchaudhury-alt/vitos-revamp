import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  BookOpen,
  Plug,
  Code2,
  BarChart3,
  Globe,
  Webhook,
  Database,
  Bot,
  Zap,
  Activity,
  Search,
  Filter as FilterIcon,
  Plus,
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  Copy,
  Play,
  Trash2,
  Check,
  Info,
  ChevronDown,
  KeyRound,
  Table,
  Lock,
  Users,
  ShoppingBag,
  Layers,
  Puzzle,
  Brackets,
  Variable,
  SlidersHorizontal,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import integrationsHeroBg from "@/assets/integrations-hero-bg.webp";
import apiHeroBg from "@/assets/api-hero-banner.webp";
import mcpHeroBg from "@/assets/mcp-hero-banner.png";
import { NewIntegrationFlow } from "@/components/vitos/NewIntegrationFlow";
import {
  ApiDetailPage,
  AuthenticationTab,
  PoliciesSection,
} from "@/components/vitos/ApiDetailPage";
import { RequestLogsTab } from "@/components/vitos/RequestLogsTab";
import {
  MCP_CREDENTIALS,
  MCP_HOW_TO_USE_URL,
  MCP_SERVER_URL,
  getMcpCredentialStatus,
  type McpCredential,
  toolsForScopes,
} from "@/components/vitos/mcpData";

const MCP_CREATED_CREDENTIALS_STORAGE_PREFIX = "vitos:mcp-created-credentials";

function getMcpStorageIdentity() {
  try {
    const savedSession = window.localStorage.getItem("vitos-onboarding-session");
    const session = savedSession ? (JSON.parse(savedSession) as Record<string, unknown>) : {};
    const email = typeof session.email === "string" ? session.email : "anonymous";
    const workspace =
      typeof session.workspaceName === "string" ? session.workspaceName : "default-workspace";
    return `${encodeURIComponent(email)}:${encodeURIComponent(workspace)}`;
  } catch {
    return "anonymous:default-workspace";
  }
}

function getMcpCreatedCredentialsStorageKey() {
  return `${MCP_CREATED_CREDENTIALS_STORAGE_PREFIX}:${getMcpStorageIdentity()}`;
}

function isStoredMcpCredential(value: unknown): value is McpCredential {
  if (!value || typeof value !== "object") return false;
  const credential = value as Partial<McpCredential>;
  return (
    typeof credential.id === "string" &&
    typeof credential.displayName === "string" &&
    typeof credential.subject === "string" &&
    (credential.type === "API Key" ||
      credential.type === "OAuth 2.0" ||
      credential.type === "JWT") &&
    (credential.status === "Active" || credential.status === "Revoked") &&
    typeof credential.provider === "string" &&
    typeof credential.rateLimit === "string" &&
    typeof credential.ipPolicy === "string" &&
    typeof credential.expiry === "string" &&
    Array.isArray(credential.scopes) &&
    credential.scopes.every((scope) => typeof scope === "string")
  );
}

export function IntegrationsPage() {
  const [isInFlow, setIsInFlow] = useState(false);
  const [sectionTab, setSectionTab] = useState<
    "apis" | "mcp" | "auth" | "policy" | "logs" | "observability"
  >("apis");
  const [credentialsIntent, setCredentialsIntent] = useState(0);
  const [mcpCredentials, setMcpCredentials] = useState<McpCredential[]>(MCP_CREDENTIALS);
  const [mcpSelectedCredentialId, setMcpSelectedCredentialId] = useState<string | null>(null);
  const [issuedMcpCredential, setIssuedMcpCredential] = useState<{
    credentialId: string;
    secret: string;
  } | null>(null);

  useEffect(() => {
    try {
      const savedCredentials = window.localStorage.getItem(getMcpCreatedCredentialsStorageKey());
      const parsedCredentials = savedCredentials ? (JSON.parse(savedCredentials) as unknown) : [];
      const createdCredentials = Array.isArray(parsedCredentials)
        ? parsedCredentials.filter(isStoredMcpCredential)
        : [];
      const credentials = [
        ...MCP_CREDENTIALS,
        ...createdCredentials.filter(
          (created) => !MCP_CREDENTIALS.some((fixture) => fixture.id === created.id),
        ),
      ];
      setMcpCredentials(credentials);
    } catch {
      // The access preview still works when browser storage is unavailable.
    }
  }, []);

  const selectMcpCredential = (credentialId: string) => {
    setMcpSelectedCredentialId(credentialId);
  };

  const openCredentialManagement = () => {
    setIsInFlow(false);
    setSectionTab("auth");
    setCredentialsIntent((n) => n + 1);
  };

  const showMcpSetup = () => {
    setMcpSelectedCredentialId(null);
    setIssuedMcpCredential(null);
  };

  const completeMcpCredentialCreation = (credential: McpCredential, secret: string) => {
    setMcpCredentials((current) => {
      const next = [...current.filter((item) => item.id !== credential.id), credential];
      try {
        const fixtureIds = new Set(MCP_CREDENTIALS.map((item) => item.id));
        window.localStorage.setItem(
          getMcpCreatedCredentialsStorageKey(),
          JSON.stringify(next.filter((item) => !fixtureIds.has(item.id))),
        );
      } catch {
        // The new credential still works for the current session.
      }
      return next;
    });
    setMcpSelectedCredentialId(credential.id);
    setIssuedMcpCredential({ credentialId: credential.id, secret });
    setIsInFlow(false);
    setSectionTab("mcp");
  };

  useEffect(() => {
    const handler = () => {
      setIsInFlow(false);
      setSectionTab("policy");
    };
    const credHandler = () => {
      setIsInFlow(false);
      setSectionTab("auth");
      setCredentialsIntent((n) => n + 1);
    };
    window.addEventListener("vitos:navigate-policy", handler);
    window.addEventListener("vitos:navigate-credentials", credHandler);
    return () => {
      window.removeEventListener("vitos:navigate-policy", handler);
      window.removeEventListener("vitos:navigate-credentials", credHandler);
    };
  }, []);

  const SECTION_TABS: {
    id: "apis" | "mcp" | "auth" | "policy" | "logs" | "observability";
    label: string;
  }[] = [
    { id: "apis", label: "APIs" },
    { id: "mcp", label: "MCP" },
    { id: "auth", label: "Authentication" },
    { id: "policy", label: "Policy" },
    { id: "logs", label: "Request Logs" },
    { id: "observability", label: "Observability" },
  ];
  return (
    <div className="flex flex-col gap-6 p-8">
      {!isInFlow && (
        <div className="inline-flex w-fit items-center gap-1 rounded-full bg-[#F3F1F3] p-1 border border-border/60">
          {SECTION_TABS.map((t) => {
            const active = sectionTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSectionTab(t.id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition",
                  active
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}
      {!isInFlow && (
        <>
          {(sectionTab === "apis" || sectionTab === "mcp") && (
            <IntegrationsHero variant={sectionTab === "apis" ? "apis" : "mcp"} />
          )}
          {sectionTab === "apis" && <CollectionConsumption />}
          {sectionTab === "mcp" && (
            <MCPSection
              credentials={mcpCredentials}
              selectedId={mcpSelectedCredentialId}
              onSelectCredential={selectMcpCredential}
              onCreateCredential={openCredentialManagement}
              onShowSetup={showMcpSetup}
              issuedCredential={issuedMcpCredential}
              onDismissIssuedCredential={() => setIssuedMcpCredential(null)}
            />
          )}
        </>
      )}
      {sectionTab === "apis" ? (
        <WorkflowIntegrations onFlowChange={setIsInFlow} />
      ) : sectionTab === "mcp" ? null : sectionTab === "auth" ? (
        <AuthenticationTab
          credentialsIntent={credentialsIntent}
          credentials={mcpCredentials}
          onCredentialCreated={completeMcpCredentialCreation}
        />
      ) : sectionTab === "policy" ? (
        <div className="pt-5">
          <PoliciesSection />
        </div>
      ) : sectionTab === "logs" ? (
        <RequestLogsTab />
      ) : (
        <PlaceholderSection
          title="Observability"
          description="Observability dashboards coming soon."
        />
      )}
    </div>
  );
}

function HeroCopyUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] pl-3 pr-1.5 py-1">
      <code className="max-w-[280px] truncate font-mono text-[11px] text-white/85">{url}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            /* clipboard may be blocked in preview */
          }
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-white/20"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy URL"}
      </button>
    </span>
  );
}

function CopyableUrl({ url, label = "Copy URL" }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
      <code className="flex-1 truncate font-mono text-[12px] text-foreground/80">{url}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            /* clipboard may be blocked in preview */
          }
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground transition hover:bg-hover"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : label}
      </button>
    </div>
  );
}

const TOOL_KIND_STYLES: Record<string, string> = {
  "Bound API":
    "border-[oklch(0.85_0.07_240)] bg-[oklch(0.96_0.03_240)] text-[oklch(0.45_0.15_240)]",
  "Bound Fn": "border-[oklch(0.85_0.07_300)] bg-[oklch(0.96_0.03_300)] text-[oklch(0.45_0.17_300)]",
  API: "border-border bg-muted/60 text-muted-foreground",
  Agent: "border-[oklch(0.85_0.07_165)] bg-[oklch(0.95_0.04_165)] text-[oklch(0.42_0.12_165)]",
  Query: "border-[oklch(0.86_0.07_60)] bg-[oklch(0.96_0.05_60)] text-[oklch(0.45_0.12_60)]",
};

function MCPSection({
  credentials,
  selectedId,
  onSelectCredential,
  onCreateCredential,
  onShowSetup,
  issuedCredential,
  onDismissIssuedCredential,
}: {
  credentials: McpCredential[];
  selectedId: string | null;
  onSelectCredential: (credentialId: string) => void;
  onCreateCredential: () => void;
  onShowSetup: () => void;
  issuedCredential: { credentialId: string; secret: string } | null;
  onDismissIssuedCredential: () => void;
}) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerButtonRef = useRef<HTMLButtonElement>(null);
  const pickerMenuRef = useRef<HTMLDivElement>(null);
  const pickerListRef = useRef<HTMLDivElement>(null);
  const credentialOptionRefs = useRef(new Map<string, HTMLButtonElement>());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPlacement, setPickerPlacement] = useState<"above" | "below">("below");
  const [pickerListMaxHeight, setPickerListMaxHeight] = useState(340);
  const [scopesOpen, setScopesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [configCopied, setConfigCopied] = useState(false);

  const selectedCandidate = credentials.find((credential) => credential.id === selectedId) ?? null;
  const selected =
    selectedCandidate && getMcpCredentialStatus(selectedCandidate) === "Active"
      ? selectedCandidate
      : null;
  const selectableCredentials = credentials.filter(
    (credential) => getMcpCredentialStatus(credential) === "Active",
  );
  const tools = selected ? toolsForScopes(selected.scopes) : [];
  const writeTools = tools.filter((tool) => tool.access === "Writes");
  const readOnlyTools = tools.filter((tool) => tool.access === "Read only");
  const issuedSecret =
    selected && issuedCredential?.credentialId === selected.id ? issuedCredential.secret : null;
  const clientConfig = issuedSecret
    ? JSON.stringify(
        {
          mcpServers: {
            vitos: {
              url: MCP_SERVER_URL,
              headers: { Authorization: `Bearer ${issuedSecret}` },
            },
          },
        },
        null,
        2,
      )
    : null;

  const selectCredential = (credentialId: string) => {
    onSelectCredential(credentialId);
    setPickerOpen(false);
    setScopesOpen(false);
    setToolsOpen(true);
    requestAnimationFrame(() => pickerButtonRef.current?.focus());
  };

  const moveCredentialFocus = (credentialId: string, direction: 1 | -1) => {
    const currentIndex = selectableCredentials.findIndex(
      (credential) => credential.id === credentialId,
    );
    if (currentIndex < 0 || selectableCredentials.length === 0) return;

    const nextIndex =
      (currentIndex + direction + selectableCredentials.length) % selectableCredentials.length;
    credentialOptionRefs.current.get(selectableCredentials[nextIndex].id)?.focus();
  };

  useLayoutEffect(() => {
    if (!pickerOpen || !pickerButtonRef.current || !pickerMenuRef.current) return;

    const buttonRect = pickerButtonRef.current.getBoundingClientRect();
    const desiredListHeight = Math.min(340, pickerListRef.current?.scrollHeight ?? 340);
    const desiredMenuHeight = 41 + desiredListHeight;
    const viewportGutter = 16;
    const triggerGap = 6;
    const roomBelow = window.innerHeight - buttonRect.bottom - viewportGutter - triggerGap;
    const roomAbove = buttonRect.top - viewportGutter - triggerGap;
    const nextPlacement =
      roomBelow < desiredMenuHeight && roomAbove > roomBelow ? "above" : "below";
    const availableRoom = nextPlacement === "above" ? roomAbove : roomBelow;

    setPickerPlacement(nextPlacement);
    setPickerListMaxHeight(Math.max(140, Math.min(340, availableRoom - 41)));
  }, [credentials.length, pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) return;

    const preferredCredentialId =
      selected?.id ??
      credentials.find((credential) => getMcpCredentialStatus(credential) === "Active")?.id;
    requestAnimationFrame(() => {
      if (preferredCredentialId) {
        credentialOptionRefs.current.get(preferredCredentialId)?.focus();
      }
    });

    const closePicker = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };
    const closePickerWithKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPickerOpen(false);
        pickerButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closePicker);
    document.addEventListener("keydown", closePickerWithKeyboard);
    return () => {
      document.removeEventListener("pointerdown", closePicker);
      document.removeEventListener("keydown", closePickerWithKeyboard);
    };
  }, [credentials, pickerOpen, selected?.id]);

  const renderCredentialPicker = (variant: "header" | "empty") => {
    const isHeader = variant === "header";

    return (
      <div
        ref={pickerRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPickerOpen(false);
          }
        }}
        className={cn(
          "relative min-w-0",
          isHeader ? "flex-1 lg:w-[240px] lg:flex-none" : "w-fit max-w-full",
        )}
      >
        <button
          ref={pickerButtonRef}
          type="button"
          aria-label={
            selected
              ? `Preview access for ${selected.displayName}`
              : "Choose a credential to preview access"
          }
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
          aria-controls="mcp-credential-picker"
          onClick={() => setPickerOpen((value) => !value)}
          className={cn(
            isHeader
              ? "flex h-8 w-full items-center gap-1.5 rounded-lg border bg-white px-2 text-left transition"
              : "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#B22257] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#9B1D4C]",
            isHeader &&
              (pickerOpen
                ? "border-[#C23469] ring-2 ring-[#FDECF2]"
                : "border-border hover:bg-hover"),
            !isHeader && pickerOpen && "ring-2 ring-[#E9CCD7] ring-offset-2",
          )}
        >
          {isHeader ? (
            <>
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#FDECF2]">
                <KeyRound className="h-3 w-3 text-[#B22257]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-foreground">
                  {selected?.displayName}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-muted-foreground transition",
                  pickerOpen && "rotate-180",
                )}
              />
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              Choose Credential
              <ChevronDown
                className={cn(
                  "ml-0.5 h-3.5 w-3.5 shrink-0 text-white/75 transition",
                  pickerOpen && "rotate-180",
                )}
              />
            </>
          )}
        </button>

        {pickerOpen ? (
          <div
            ref={pickerMenuRef}
            className={cn(
              "absolute z-50 overflow-hidden rounded-xl border border-border bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]",
              isHeader
                ? "left-0 w-full lg:left-auto lg:right-0 lg:w-[340px]"
                : "left-0 w-[340px] max-w-[calc(100vw-2rem)]",
              pickerPlacement === "above" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            )}
          >
            <div className="flex h-10 items-center justify-between border-b border-border px-3">
              <p className="text-xs font-semibold text-foreground">Choose credential</p>
              <span className="text-[10px] text-muted-foreground">
                {credentials.length} credentials
              </span>
            </div>
            <div
              ref={pickerListRef}
              id="mcp-credential-picker"
              role="listbox"
              aria-label="Choose a credential to preview"
              style={{ maxHeight: pickerListMaxHeight }}
              className="space-y-0.5 overflow-y-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {credentials.map((credential) => {
                const isSelected = credential.id === selectedId;
                const credentialStatus = getMcpCredentialStatus(credential);
                const isEligible = credentialStatus === "Active";
                const availableTools = toolsForScopes(credential.scopes);
                const availableWriteTools = availableTools.filter(
                  (tool) => tool.access === "Writes",
                );
                return (
                  <button
                    key={credential.id}
                    ref={(element) => {
                      if (element) {
                        credentialOptionRefs.current.set(credential.id, element);
                      } else {
                        credentialOptionRefs.current.delete(credential.id);
                      }
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={!isEligible}
                    onClick={() => selectCredential(credential.id)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        moveCredentialFocus(credential.id, 1);
                      } else if (event.key === "ArrowUp") {
                        event.preventDefault();
                        moveCredentialFocus(credential.id, -1);
                      } else if (event.key === "Home") {
                        event.preventDefault();
                        credentialOptionRefs.current
                          .get(selectableCredentials[0]?.id)
                          ?.focus();
                      } else if (event.key === "End") {
                        event.preventDefault();
                        credentialOptionRefs.current
                          .get(selectableCredentials[selectableCredentials.length - 1]?.id)
                          ?.focus();
                      }
                    }}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B22257]/35",
                      isSelected
                        ? "bg-[#FDECF2]/70 ring-1 ring-inset ring-[#E9CCD7]"
                        : "hover:bg-hover",
                      !isEligible && "cursor-not-allowed opacity-55 hover:bg-transparent",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                        isSelected ? "bg-white" : "bg-muted",
                      )}
                    >
                      <KeyRound
                        className={cn(
                          "h-3 w-3",
                          isSelected ? "text-[#B22257]" : "text-muted-foreground",
                        )}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold text-foreground">
                          {credential.displayName}
                        </span>
                        {credentialStatus !== "Active" ? (
                          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                            {credentialStatus}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
                        {credential.subject} · {credential.type}
                      </span>
                      <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="shrink-0">{availableTools.length} tools</span>
                        {availableWriteTools.length > 0 ? (
                          <span className="shrink-0 rounded-full border border-[oklch(0.88_0.08_70)] bg-[oklch(0.97_0.04_70)] px-1.5 py-0.5 text-[9px] font-medium text-[oklch(0.48_0.12_60)]">
                            {availableWriteTools.length} can write
                          </span>
                        ) : (
                          <span className="shrink-0">· Read only</span>
                        )}
                        <span className="ml-auto shrink-0 text-[9px]">
                          {credential.expiry === "—"
                            ? "No expiry"
                            : `Expires ${credential.expiry}`}
                        </span>
                      </span>
                    </span>
                    {isSelected ? (
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B22257]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      {/* Connection */}
      <section>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-5 py-4 sm:flex sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.94_0.04_165)]">
              <Brackets className="h-4.5 w-4.5 text-[oklch(0.5_0.13_165)]" />
            </span>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
                  MCP server
                </h2>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[oklch(0.86_0.07_165)] bg-[oklch(0.96_0.03_165)] px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.42_0.12_165)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.55_0.14_165)]" />
                  Live
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                One endpoint for every compatible MCP client.
              </p>
            </div>
          </div>
          <a
            href={MCP_HOW_TO_USE_URL}
            onClick={onShowSetup}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-hover"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Setup guide
          </a>
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Server URL
            </label>
            <span className="text-[11px] text-muted-foreground">Connection endpoint</span>
          </div>
          <CopyableUrl url={MCP_SERVER_URL} />
        </div>

        <dl className="grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { label: "Transport", value: "Streamable HTTP", icon: Zap },
            { label: "Authentication", value: "Bearer credential", icon: Lock },
            { label: "Access control", value: "Credential scopes", icon: KeyRound },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="px-5 py-3.5">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{value}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Credential access */}
      <section id="mcp-setup-guide" className="scroll-mt-6 border-t border-border">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-2.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Credential access
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Preview exactly what a client can discover and call before you configure it.
            </p>
          </div>

          {selected ? (
            <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-end xl:w-auto">
              {renderCredentialPicker("header")}
              <button
                type="button"
                onClick={onCreateCredential}
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" />
                New credential
              </button>
            </div>
          ) : null}
        </div>

        {!selected ? (
          <McpFirstRunState
            hasCredentials={credentials.length > 0}
            credentialAction={
              selectableCredentials.length > 0 ? (
                renderCredentialPicker("empty")
              ) : (
                <button
                  type="button"
                  onClick={onCreateCredential}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#B22257] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#9B1D4C]"
                >
                  <Plus className="h-4 w-4" />
                  Create Credential
                </button>
              )
            }
          />
        ) : (
          <>
            {issuedSecret && clientConfig ? (
              <div
                role="status"
                className="border-b border-[#D7EAE4] bg-[oklch(0.98_0.02_165)] px-5 py-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.92_0.06_165)]">
                      <ShieldCheck className="h-4.5 w-4.5 text-[oklch(0.42_0.12_165)]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground">
                        Credential ready — copy it now
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        This secret is shown once. The client config includes your MCP URL and
                        bearer credential.
                      </p>
                      <code className="mt-2 block max-w-xl truncate rounded-lg border border-[#D7EAE4] bg-white px-2.5 py-1.5 font-mono text-[11px] text-foreground">
                        {issuedSecret}
                      </code>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(clientConfig);
                        } catch {
                          // Clipboard access can be unavailable in preview environments.
                        }
                        setConfigCopied(true);
                        setTimeout(() => setConfigCopied(false), 1600);
                      }}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#B22257] px-3.5 text-[12px] font-semibold text-white transition hover:bg-[#9B1D4C]"
                    >
                      {configCopied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {configCopied ? "Config copied" : "Copy client config"}
                    </button>
                    <button
                      type="button"
                      onClick={onDismissIssuedCredential}
                      className="h-9 rounded-xl border border-border bg-white px-3.5 text-[12px] font-semibold text-foreground transition hover:bg-hover"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="rounded-b-2xl bg-muted/20 p-3 sm:p-4">
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
                <dl className="grid grid-cols-2 gap-px border-b border-border bg-border lg:grid-cols-5">
                  {[
                    { label: "Credential", value: selected.subject, mono: true },
                    { label: "Status", value: "Active", status: true },
                    { label: "Effective access", value: `${tools.length} tools` },
                    { label: "Write access", value: `${writeTools.length} tools`, warning: true },
                    {
                      label: "Expiry",
                      value: selected.expiry === "—" ? "No expiry" : selected.expiry,
                    },
                  ].map(({ label, value, mono, status, warning }) => (
                    <div key={label} className="min-w-0 bg-card px-5 py-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {label}
                      </dt>
                      <dd
                        className={cn(
                          "mt-1 flex items-center gap-1.5 truncate text-[13px] font-medium text-foreground",
                          mono && "font-mono text-[12px]",
                          warning && writeTools.length > 0 && "text-[oklch(0.48_0.12_60)]",
                        )}
                      >
                        {status ? (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.55_0.14_165)]" />
                        ) : null}
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-5 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Granted scopes
                  </span>
                  {(scopesOpen ? selected.scopes : selected.scopes.slice(0, 3)).map((scope) => (
                    <span
                      key={scope}
                      className="rounded-full border border-border bg-white px-2 py-0.5 font-mono text-[11px] text-foreground"
                    >
                      {scope}
                    </span>
                  ))}
                  {selected.scopes.length > 3 ? (
                    <button
                      type="button"
                      onClick={() => setScopesOpen((value) => !value)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B22257] transition hover:underline"
                    >
                      {scopesOpen ? "Show less" : `+${selected.scopes.length - 3} more`}
                    </button>
                  ) : null}
                  <span className="ml-auto hidden text-[10px] text-muted-foreground sm:inline">
                    {selected.type} · {selected.provider}
                  </span>
                </div>

                <button
                  type="button"
                  aria-expanded={toolsOpen}
                  onClick={() => setToolsOpen((value) => !value)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-hover"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-semibold text-foreground">
                        Effective tool access
                      </span>
                      <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {tools.length}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {readOnlyTools.length} read-only · {writeTools.length} can write
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                    {toolsOpen ? "Collapse" : "Expand"}
                    <ChevronDown className={cn("h-4 w-4 transition", toolsOpen && "rotate-180")} />
                  </span>
                </button>

                {toolsOpen ? (
                  tools.length === 0 ? (
                    <div className="border-t border-border px-4 py-8 text-center">
                      <p className="text-xs text-muted-foreground">
                        No tools match this credential's scopes. Update the scopes before connecting
                        the client.
                      </p>
                    </div>
                  ) : (
                    <ul className="border-t border-border">
                      {tools.map((tool) => (
                        <li
                          key={tool.name}
                          className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 transition last:border-b-0 hover:bg-hover"
                        >
                          <div className="min-w-0">
                            <div className="truncate font-mono text-[13px] font-semibold text-foreground">
                              {tool.name}
                            </div>
                            <div className="truncate font-mono text-[11px] text-muted-foreground">
                              {tool.meta}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2.5">
                            <span className="hidden rounded-full border border-border bg-muted/50 px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
                              {tool.scope}
                            </span>
                            <span
                              className={cn(
                                "hidden rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline-flex",
                                TOOL_KIND_STYLES[tool.kind] ??
                                  "border-border bg-muted/60 text-muted-foreground",
                              )}
                            >
                              {tool.kind}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  tool.access === "Writes"
                                    ? "bg-[oklch(0.7_0.16_60)]"
                                    : "bg-success",
                                )}
                              />
                              {tool.access}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )
                ) : null}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function McpFirstRunState({
  hasCredentials,
  credentialAction,
}: {
  hasCredentials: boolean;
  credentialAction: ReactNode;
}) {
  return (
    <div className="relative rounded-b-2xl px-5 py-8 sm:px-8 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_42%,rgba(253,236,242,0.95),transparent_48%)]" />
      </div>
      <div className="relative mx-auto grid max-w-4xl items-center gap-8 lg:grid-cols-[minmax(320px,0.95fr)_minmax(0,1fr)]">
        <McpAccessIllustration />

        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E9CCD7] bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9B1D4C]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Access setup
          </span>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
            {hasCredentials
              ? "Choose what this client can access"
              : "Connect your first MCP client"}
          </h3>
          <p className="mt-2 max-w-lg text-[13px] leading-5 text-muted-foreground">
            Credentials do more than sign in. Their scopes determine which Vitos tools the client
            can discover and call, including any tools that can write data.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {credentialAction}
            {!hasCredentials ? (
              <a
                href={MCP_HOW_TO_USE_URL}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-4 text-[13px] font-semibold text-foreground transition hover:bg-hover"
              >
                Learn how access works
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function McpAccessIllustration() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[2/1] w-full max-w-[420px] overflow-hidden rounded-[22px] border border-[#E9CCD7] bg-white/85 shadow-[0_18px_50px_rgba(93,35,59,0.1)]"
    >
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(rgba(178,34,87,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(178,34,87,0.08) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <span className="absolute left-4 top-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#A06A7D]">
        Access map
      </span>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 210" fill="none">
        <path d="M160 105H202" stroke="#DDA8BC" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M246 105C271 105 270 58 292 58" stroke="#DDA8BC" strokeWidth="2" />
        <path d="M246 105H292" stroke="#DDA8BC" strokeWidth="2" />
        <path d="M246 105C271 105 270 152 292 152" stroke="#DDA8BC" strokeWidth="2" />
        <circle cx="202" cy="105" r="3" fill="#B22257" />
        <circle cx="292" cy="58" r="3" fill="#B22257" />
        <circle cx="292" cy="105" r="3" fill="#B22257" />
        <circle cx="292" cy="152" r="3" fill="#B22257" />
      </svg>

      <div className="absolute left-[6%] top-[33%] w-[32%] rounded-xl border border-[#E9CCD7] bg-white p-3 shadow-sm">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#FDECF2]">
          <KeyRound className="h-3.5 w-3.5 text-[#B22257]" />
        </span>
        <p className="mt-2 truncate text-[11px] font-semibold text-foreground">Client credential</p>
        <p className="mt-0.5 truncate text-[9px] text-muted-foreground">Scoped identity</p>
      </div>

      <div className="absolute left-[48%] top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-[#DDA8BC] bg-[#B22257] shadow-[0_8px_24px_rgba(178,34,87,0.24)]">
        <ShieldCheck className="h-5 w-5 text-white" />
      </div>

      {[
        { label: "APIs", detail: "read", icon: Brackets, top: "22%" },
        { label: "Agents", detail: "allowed", icon: Bot, top: "45%" },
        { label: "Queries", detail: "blocked", icon: Search, top: "68%" },
      ].map(({ label, detail, icon: Icon, top }) => (
        <div
          key={label}
          className="absolute left-[70%] flex w-[25%] items-center gap-2 rounded-lg border border-[#E4DDE0] bg-white px-2 py-2 shadow-sm"
          style={{ top }}
        >
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted">
            <Icon className="h-3 w-3 text-muted-foreground" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[9px] font-semibold text-foreground">{label}</span>
            <span className="block truncate text-[8px] text-muted-foreground">{detail}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-white px-6 py-24 text-center">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function CollectionConsumption() {
  const items = [
    {
      icon: Plug,
      iconBg: "bg-[oklch(0.94_0.04_165)]",
      iconColor: "text-[oklch(0.5_0.13_165)]",
      title: "Rest API",
      badge: "OpenAPI 3.1",
      description:
        "Expose your collection as a clean REST endpoint. Auth, scopes, and rate limits stay the same.",
      value: "https://api.kapture.io/v1",
    },
    {
      icon: Globe,
      iconBg: "bg-[oklch(0.95_0.04_260)]",
      iconColor: "text-[oklch(0.55_0.18_260)]",
      title: "Cloud Function",
      badge: "Serverless",
      description:
        "Deploy serverless functions that extend your collection with custom logic and integrations.",
      value: "https://functions.kapture.io/v1",
    },
    {
      icon: Layers,
      iconBg: "bg-[oklch(0.95_0.05_300)]",
      iconColor: "text-[oklch(0.55_0.2_300)]",
      title: "Agents as API",
      badge: "Typed",
      description: "Expose any agent as a callable API for external apps, workflows, and services.",
      value: "@kapture/collection",
    },
  ];

  const [copied, setCopied] = useState<string | null>(null);
  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // ignore — clipboard may be blocked in preview iframe
    }
    setCopied(value);
    setTimeout(() => setCopied((c) => (c === value ? null : c)), 1500);
  };

  return (
    <section
      aria-label="Use this collection as"
      className="rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Use your collection as…
        </h2>
      </div>
      <div className="grid grid-cols-1 divide-y divide-border border-t border-border md:grid-cols-3 md:divide-x md:divide-y-0">
        {items.map((item) => {
          const Icon = item.icon;
          const isCopied = copied === item.value;
          return (
            <div key={item.title} className="relative flex flex-col gap-2 overflow-hidden p-4">
              {/* grid pattern overlay — same language as SolutionCard */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_75%)]"
              />
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-1">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                      item.iconBg,
                    )}
                  >
                    <Icon className={cn("h-3 w-3", item.iconColor)} />
                  </span>
                  <h3 className="truncate text-sm font-semibold text-foreground">{item.title}</h3>
                </div>
                <span className="shrink-0 rounded-full border border-border bg-muted/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {item.badge}
                </span>
              </div>
              <p className="relative text-xs leading-snug text-muted-foreground">
                {item.description}
              </p>
              <div className="relative mt-auto flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1">
                <code className="flex-1 truncate font-mono text-[11px] text-foreground/80">
                  {item.value}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(item.value)}
                  aria-label={`Copy ${item.title} address`}
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition hover:bg-hover hover:text-foreground"
                >
                  {isCopied ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type IntegrationTab = "api" | "agent-as-api" | "mcp";

type IntegrationCard = {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  preview: React.ReactNode;
};

/* ---------- Card preview visuals ---------- */

function EndpointPreview({
  method,
  path,
  accentClass = "bg-emerald-500",
}: {
  method: string;
  path: string;
  accentClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-0.5">
      <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
              accentClass,
            )}
          />
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", accentClass)} />
        </span>
        <span className="text-foreground">{method}</span>
        <span className="text-border">·</span>
        <span>200 OK</span>
      </div>
      <div className="font-mono text-[10.5px] leading-tight text-foreground/80 truncate">
        {path}
      </div>
    </div>
  );
}

function FlowPreview({ nodes }: { nodes: { color: string; label: string }[] }) {
  return (
    <div className="flex h-full items-center justify-center px-1 py-2">
      <div className="flex items-center gap-1.5">
        {nodes.map((n, i) => (
          <div key={n.label} className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-foreground shadow-sm">
              <span className={cn("h-1 w-1 rounded-full", n.color)} />
              {n.label}
            </span>
            {i < nodes.length - 1 && (
              <span className="relative h-px w-4 overflow-hidden bg-border animate-flow-line" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CodeBlockPreview({
  lines,
}: {
  lines: { text: string; tone?: "key" | "str" | "muted" }[];
}) {
  const toneClass = {
    key: "text-[oklch(0.55_0.2_300)]",
    str: "text-[oklch(0.5_0.14_160)]",
    muted: "text-muted-foreground",
  } as const;
  return (
    <div className="px-0.5 font-mono text-[10px] leading-[1.5]">
      {lines.map((l, i) => (
        <div key={i} className={cn("truncate", l.tone ? toneClass[l.tone] : "text-foreground/80")}>
          {l.text}
        </div>
      ))}
    </div>
  );
}

function MetricsPreview({ value, label, bars }: { value: string; label: string; bars: number[] }) {
  return (
    <div className="flex items-end justify-between gap-2 px-0.5">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground leading-none">{value}</span>
        <span className="mt-1 text-[9.5px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-end gap-[2px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-sm bg-gradient-to-t from-[#8B1E48] to-[#E5396B]"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    </div>
  );
}

type LogoItem = { name: string; icon: React.ReactNode };

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function SlackLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        fill="#36C5F0"
        d="M8.88 2a2.38 2.38 0 0 0 0 4.75h2.38V4.38A2.38 2.38 0 0 0 8.88 2zM8.88 8.33H2.38a2.38 2.38 0 0 0 0 4.75h6.5a2.38 2.38 0 0 0 0-4.75z"
      />
      <path
        fill="#2EB67D"
        d="M22 10.7a2.38 2.38 0 0 0-4.75 0v2.38h2.37A2.38 2.38 0 0 0 22 10.7zM15.67 10.7V4.38a2.38 2.38 0 0 0-4.75 0v6.32a2.38 2.38 0 0 0 4.75 0z"
      />
      <path
        fill="#ECB22E"
        d="M13.3 22a2.38 2.38 0 0 0 0-4.75h-2.38v2.37A2.38 2.38 0 0 0 13.3 22zM13.3 15.67h6.32a2.38 2.38 0 0 0 0-4.75H13.3a2.38 2.38 0 0 0 0 4.75z"
      />
      <path
        fill="#E01E5A"
        d="M2 13.3a2.38 2.38 0 0 0 4.75 0v-2.38H4.38A2.38 2.38 0 0 0 2 13.3zM8.33 13.3v6.32a2.38 2.38 0 0 0 4.75 0V13.3a2.38 2.38 0 0 0-4.75 0z"
      />
    </svg>
  );
}

function NotionLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        fill="#fff"
        stroke="#111"
        strokeWidth="1.7"
        d="M4.5 3.5 17.2 2.6l2.3 1.8v15.2l-2.4 1.8-12.6-.9-2-2.4V5.8l2-2.3z"
      />
      <path
        fill="#111"
        d="M8.35 8.15h1.95l4.05 6.15V8.15h1.7v8.2h-1.85l-4.15-6.32v6.32h-1.7v-8.2z"
      />
    </svg>
  );
}

function HubSpotLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        fill="#FF7A59"
        d="M17.5 8.3V6.45a2.2 2.2 0 1 0-1.45 0V8.3a5.02 5.02 0 0 0-2.2 1.28L8.88 5.72A2.45 2.45 0 1 0 7.75 7.1l4.88 3.79a5.07 5.07 0 0 0-.02 3.94l-1.5 1.5a2 2 0 1 0 1.17 1.17l1.35-1.35A5.08 5.08 0 1 0 17.5 8.3zm-.72 7.58a2.52 2.52 0 1 1 0-5.04 2.52 2.52 0 0 1 0 5.04z"
      />
    </svg>
  );
}

function MCPLogosPreview({ logos }: { logos: LogoItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-0.5">
      {logos.map((logo) => (
        <span
          key={logo.name}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-[10.5px] font-medium text-foreground shadow-sm"
        >
          {logo.icon}
          {logo.name}
        </span>
      ))}
    </div>
  );
}

const TAB_CONTENT: Partial<Record<IntegrationTab, IntegrationCard[]>> = {
  api: [
    {
      icon: Globe,
      iconBg: "bg-[oklch(0.95_0.04_260)]",
      iconColor: "text-[oklch(0.55_0.18_260)]",
      title: "REST endpoint",
      description: "Connect any REST API your team already uses — pass auth, headers, and params.",
      preview: <EndpointPreview method="GET" path="/v1/customers/{id}" />,
    },
    {
      icon: Code2,
      iconBg: "bg-[oklch(0.95_0.05_300)]",
      iconColor: "text-[oklch(0.55_0.2_300)]",
      title: "GraphQL",
      description: "Query GraphQL endpoints with typed schemas and turn them into agent tools.",
      preview: (
        <CodeBlockPreview
          lines={[
            { text: "query {", tone: "muted" },
            { text: "  user(id: $id) {", tone: "key" },
            { text: "    name email", tone: "str" },
            { text: "  }", tone: "key" },
          ]}
        />
      ),
    },
    {
      icon: Webhook,
      iconBg: "bg-[oklch(0.94_0.05_20)]",
      iconColor: "text-[oklch(0.6_0.2_20)]",
      title: "Webhook",
      description: "Trigger flows from incoming webhooks and forward payloads to your agents.",
      preview: (
        <FlowPreview
          nodes={[
            { color: "bg-rose-500", label: "Hook" },
            { color: "bg-violet-500", label: "Map" },
            { color: "bg-emerald-500", label: "Agent" },
          ]}
        />
      ),
    },
    {
      icon: Database,
      iconBg: "bg-[oklch(0.94_0.06_160)]",
      iconColor: "text-[oklch(0.5_0.14_160)]",
      title: "Analytics tool",
      description:
        "Turn a saved query or report on your CRM data into a tool your agents can call.",
      preview: (
        <MetricsPreview value="12.4k" label="rows / day" bars={[6, 10, 8, 14, 11, 18, 15]} />
      ),
    },
  ],
  "agent-as-api": [
    {
      icon: Bot,
      iconBg: "bg-[oklch(0.94_0.05_20)]",
      iconColor: "text-[oklch(0.6_0.2_20)]",
      title: "Agent endpoint",
      description: "Expose any of your agents as a callable API for external apps and services.",
      preview: (
        <EndpointPreview method="POST" path="/v1/agents/{name}/run" accentClass="bg-rose-500" />
      ),
    },
    {
      icon: Code2,
      iconBg: "bg-[oklch(0.95_0.05_300)]",
      iconColor: "text-[oklch(0.55_0.2_300)]",
      title: "Custom function",
      description: "Wrap your own REST endpoint, webhook, or script as a callable agent function.",
      preview: (
        <CodeBlockPreview
          lines={[
            { text: "function lookupOrder({", tone: "key" },
            { text: "  orderId: string", tone: "str" },
            { text: "}) {", tone: "key" },
            { text: "  return crm.fetch(...)", tone: "muted" },
          ]}
        />
      ),
    },
    {
      icon: Zap,
      iconBg: "bg-[oklch(0.95_0.04_260)]",
      iconColor: "text-[oklch(0.55_0.18_260)]",
      title: "Streaming output",
      description: "Return token-by-token streamed responses for low-latency conversational flows.",
      preview: (
        <FlowPreview
          nodes={[
            { color: "bg-rose-500", label: "Run" },
            { color: "bg-violet-500", label: "Stream" },
            { color: "bg-emerald-500", label: "Client" },
          ]}
        />
      ),
    },
    {
      icon: Activity,
      iconBg: "bg-[oklch(0.94_0.06_160)]",
      iconColor: "text-[oklch(0.5_0.14_160)]",
      title: "Usage analytics",
      description: "Track how external systems consume your agents with per-call observability.",
      preview: (
        <MetricsPreview value="98.6%" label="success rate" bars={[8, 12, 10, 14, 13, 16, 18]} />
      ),
    },
  ],
  mcp: [
    {
      icon: Plug,
      iconBg: "bg-[oklch(0.95_0.04_260)]",
      iconColor: "text-[oklch(0.55_0.18_260)]",
      title: "Third-party MCP",
      description: "Connect a tool your team already uses — Google, Kapture, Slack, and more.",
      preview: (
        <MCPLogosPreview
          logos={[
            { name: "Google", icon: <GoogleLogo /> },
            { name: "Slack", icon: <SlackLogo /> },
            { name: "Notion", icon: <NotionLogo /> },
            { name: "HubSpot", icon: <HubSpotLogo /> },
          ]}
        />
      ),
    },
    {
      icon: Code2,
      iconBg: "bg-[oklch(0.95_0.05_300)]",
      iconColor: "text-[oklch(0.55_0.2_300)]",
      title: "Custom function",
      description: "Wrap your own REST endpoint, webhook, or script as a callable function.",
      preview: (
        <CodeBlockPreview
          lines={[
            { text: "tool('refundOrder', {", tone: "key" },
            { text: "  input: OrderId,", tone: "str" },
            { text: "  run: refund", tone: "str" },
            { text: "})", tone: "key" },
          ]}
        />
      ),
    },
    {
      icon: Bot,
      iconBg: "bg-[#FEF3D9]",
      iconColor: "text-[#E07E24]",
      title: "Agent as MCP",
      description:
        "Wrap an entire agent — with its prompt, tools and logic — and expose it as MCP.",
      preview: (
        <FlowPreview
          nodes={[
            { color: "bg-rose-500", label: "Agent" },
            { color: "bg-violet-500", label: "Tools" },
            { color: "bg-emerald-500", label: "MCP" },
          ]}
        />
      ),
    },
    {
      icon: BarChart3,
      iconBg: "bg-[oklch(0.94_0.06_160)]",
      iconColor: "text-[oklch(0.5_0.14_160)]",
      title: "Analytics tool",
      description:
        "Turn a saved query or report on your CRM data into a tool your agents can call.",
      preview: (
        <MetricsPreview value="31.2k" label="calls / 24h" bars={[5, 9, 7, 12, 10, 15, 13]} />
      ),
    },
  ],
};

const TABS: { id: IntegrationTab; label: string }[] = [
  { id: "api", label: "REST API" },
  { id: "mcp", label: "MCP" },
  { id: "agent-as-api", label: "Agent as API" },
];

function WorkflowIntegrations({ onFlowChange }: { onFlowChange?: (v: boolean) => void } = {}) {
  const [isCreating, setIsCreating] = useState(false);
  const [activeRow, setActiveRow] = useState<StarterRow | null>(null);

  useEffect(() => {
    onFlowChange?.(isCreating || activeRow !== null);
  }, [isCreating, activeRow, onFlowChange]);

  if (isCreating) {
    return (
      <section aria-label="New integration">
        <NewIntegrationFlow onBack={() => setIsCreating(false)} />
      </section>
    );
  }

  if (activeRow) {
    return (
      <section aria-label="Integration detail">
        <ApiDetailPage row={activeRow} onBack={() => setActiveRow(null)} />
      </section>
    );
  }

  return (
    <IntegrationStarter
      onNewIntegration={() => setIsCreating(true)}
      onOpenRow={(row) => setActiveRow(row)}
    />
  );
}

/* ---------- Integration Starter (type picker + existing integrations) ---------- */

type ConsumerKey = "UI" | "AI" | "WF" | "EX";

type StarterRow = {
  name: string;
  status: "Published" | "Draft" | "Deprecated";
  tags: ("Read" | "Write" | "Destructive")[];
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  version: string;
  binding: { label: string; icon: React.ComponentType<{ className?: string }>; tone: string };
  owner: { name: string; sub?: string };
  consumers: ConsumerKey[];
  calls24h: number;
  errRate: number;
};

const STARTER_ROWS: StarterRow[] = [
  {
    name: "Search customers",
    status: "Published",
    tags: ["Read"],
    method: "GET",
    path: "/v1/customers/search",
    version: "v2.4.1",
    binding: { label: "REST", icon: Globe, tone: "text-[oklch(0.55_0.18_260)]" },
    owner: { name: "Platform", sub: "CRM" },
    consumers: ["UI", "AI", "WF", "EX"],
    calls24h: 18429,
    errRate: 0.4,
  },
  {
    name: "Triage support ticket",
    status: "Published",
    tags: ["Write"],
    method: "POST",
    path: "/v1/tickets/{id}/triage",
    version: "v3.0.0",
    binding: { label: "Agent as API", icon: Bot, tone: "text-[oklch(0.55_0.2_300)]" },
    owner: { name: "Support", sub: "AI" },
    consumers: ["UI", "AI", "WF"],
    calls24h: 6210,
    errRate: 1.8,
  },
  {
    name: "Issue refund",
    status: "Published",
    tags: ["Destructive"],
    method: "POST",
    path: "/v1/orders/{id}/refund",
    version: "v1.8.2",
    binding: { label: "Workflow", icon: Layers, tone: "text-[oklch(0.55_0.2_300)]" },
    owner: { name: "Finance" },
    consumers: ["UI", "AI", "WF"],
    calls24h: 312,
    errRate: 0.2,
  },
  {
    name: "Create Stripe charge",
    status: "Published",
    tags: ["Write"],
    method: "POST",
    path: "/v1/payments/charges",
    version: "v1.2.0",
    binding: { label: "REST", icon: Globe, tone: "text-[oklch(0.55_0.18_260)]" },
    owner: { name: "Payments" },
    consumers: ["UI", "AI", "WF", "EX"],
    calls24h: 4821,
    errRate: 0.9,
  },
  {
    name: "Query customer table",
    status: "Published",
    tags: ["Read"],
    method: "GET",
    path: "/v1/db/customers/query",
    version: "v1.6.0",
    binding: { label: "Database", icon: Database, tone: "text-[oklch(0.5_0.14_160)]" },
    owner: { name: "Data Platform", sub: "CRM" },
    consumers: ["UI", "AI", "WF"],
    calls24h: 9140,
    errRate: 0.3,
  },
  {
    name: "Upsert account record",
    status: "Published",
    tags: ["Write"],
    method: "POST",
    path: "/v1/db/accounts/upsert",
    version: "v1.2.3",
    binding: { label: "Database", icon: Database, tone: "text-[oklch(0.5_0.14_160)]" },
    owner: { name: "Data Platform" },
    consumers: ["AI", "WF"],
    calls24h: 2310,
    errRate: 0.7,
  },

  {
    name: "Track event",
    status: "Deprecated",
    tags: ["Write"],
    method: "POST",
    path: "/v1/analytics/track",
    version: "v1.9.0",
    binding: { label: "Webhook", icon: Webhook, tone: "text-[oklch(0.6_0.2_20)]" },
    owner: { name: "Data Platform" },
    consumers: ["UI", "AI", "WF"],
    calls24h: 22104,
    errRate: 0.1,
  },
  {
    name: "Search knowledge base",
    status: "Published",
    tags: ["Read"],
    method: "GET",
    path: "/v1/kb/search",
    version: "v2.1.0",
    binding: { label: "Workflow", icon: Layers, tone: "text-[oklch(0.55_0.2_300)]" },
    owner: { name: "Knowledge" },
    consumers: ["UI", "AI", "WF"],
    calls24h: 12380,
    errRate: 0.6,
  },
  {
    name: "Sync HubSpot contacts",
    status: "Published",
    tags: ["Write"],
    method: "POST",
    path: "/v1/hubspot/sync",
    version: "v1.4.1",
    binding: { label: "REST", icon: Globe, tone: "text-[oklch(0.55_0.18_260)]" },
    owner: { name: "Growth" },
    consumers: ["AI", "WF"],
    calls24h: 1842,
    errRate: 0.3,
  },
  {
    name: "Send Slack alert",
    status: "Published",
    tags: ["Write"],
    method: "POST",
    path: "/v1/slack/alert",
    version: "v1.0.2",
    binding: { label: "Webhook", icon: Webhook, tone: "text-[oklch(0.6_0.2_20)]" },
    owner: { name: "Ops" },
    consumers: ["AI", "WF", "EX"],
    calls24h: 5621,
    errRate: 0,
  },
  {
    name: "Qualify sales lead",
    status: "Published",
    tags: ["Read"],
    method: "POST",
    path: "/v1/agents/sales-qualifier/run",
    version: "v2.0.0",
    binding: { label: "Agent as API", icon: Bot, tone: "text-[oklch(0.55_0.2_300)]" },
    owner: { name: "Sales" },
    consumers: ["UI", "AI"],
    calls24h: 412,
    errRate: 2.1,
  },
  {
    name: "Lookup order status",
    status: "Published",
    tags: ["Read"],
    method: "GET",
    path: "/v1/orders/{id}",
    version: "v3.2.0",
    binding: { label: "REST", icon: Globe, tone: "text-[oklch(0.55_0.18_260)]" },
    owner: { name: "Commerce" },
    consumers: ["UI", "AI", "WF", "EX"],
    calls24h: 30219,
    errRate: 0.2,
  },
  {
    name: "Normalize address",
    status: "Published",
    tags: ["Read"],
    method: "POST",
    path: "/v1/functions/normalize-address",
    version: "v1.3.0",
    binding: { label: "Cloud Function", icon: Code2, tone: "text-[oklch(0.55_0.2_300)]" },
    owner: { name: "Platform", sub: "Utils" },
    consumers: ["UI", "AI", "WF"],
    calls24h: 8420,
    errRate: 0.1,
  },
  {
    name: "Compute shipping cost",
    status: "Published",
    tags: ["Read"],
    method: "POST",
    path: "/v1/functions/shipping-cost",
    version: "v2.0.1",
    binding: { label: "Cloud Function", icon: Code2, tone: "text-[oklch(0.55_0.2_300)]" },
    owner: { name: "Commerce" },
    consumers: ["UI", "WF"],
    calls24h: 2105,
    errRate: 0.5,
  },
  {
    name: "Score lead",
    status: "Draft",
    tags: ["Read"],
    method: "POST",
    path: "/v1/functions/score-lead",
    version: "v0.1.0",
    binding: { label: "Cloud Function", icon: Code2, tone: "text-[oklch(0.55_0.2_300)]" },
    owner: { name: "Growth" },
    consumers: ["AI"],
    calls24h: 0,
    errRate: 0,
  },
];

const STATUS_DOT: Record<StarterRow["status"], string> = {
  Published: "bg-emerald-500",
  Draft: "bg-amber-500",
  Deprecated: "bg-rose-500",
};

const TAG_TONE: Record<StarterRow["tags"][number], string> = {
  Read: "bg-[#E8F0FB] text-[#1E3A8A]",
  Write: "bg-[#FEF3D9] text-[#9A5B12]",
  Destructive: "bg-[#FDE2E2] text-[#9A1F1F]",
};

const METHOD_TONE: Record<StarterRow["method"], string> = {
  GET: "text-emerald-600",
  POST: "text-sky-600",
  PUT: "text-amber-600",
  DELETE: "text-rose-600",
};

type TableTab = "all" | "rest" | "database" | "custom" | "agent";

const TABLE_TABS: { id: TableTab; label: string; match?: string[] }[] = [
  { id: "all", label: "All" },
  { id: "rest", label: "REST APIs", match: ["REST"] },
  { id: "database", label: "Database APIs", match: ["Database"] },
  { id: "custom", label: "Cloud Functions", match: ["Cloud Function"] },
  { id: "agent", label: "Agents as API", match: ["Agent as API"] },
];

function IntegrationStarter({
  onNewIntegration,
  onOpenRow,
}: {
  onNewIntegration: () => void;
  onOpenRow?: (row: StarterRow) => void;
}) {
  const INITIAL = 4;
  const [expanded, setExpanded] = useState(false);
  const [tableTab, setTableTab] = useState<TableTab>("all");

  const tabDef = TABLE_TABS.find((t) => t.id === tableTab)!;
  const filtered =
    tableTab === "all"
      ? STARTER_ROWS
      : STARTER_ROWS.filter((r) => tabDef.match?.includes(r.binding.label));
  const visible = expanded ? filtered : filtered.slice(0, INITIAL);
  const remaining = Math.max(filtered.length - INITIAL, 0);

  return (
    <div className="flex flex-col gap-5">
      <section
        aria-label="All APIs"
        className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">All APIs</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Click any to inspect its contract, binding and usage
            </p>
          </div>
          <button
            type="button"
            onClick={onNewIntegration}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Integration
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex items-center gap-6 border-b border-border/70">
          {TABLE_TABS.map((t) => {
            const count =
              t.id === "all"
                ? STARTER_ROWS.length
                : STARTER_ROWS.filter((r) => t.match?.includes(r.binding.label)).length;
            const active = tableTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTableTab(t.id);
                  setExpanded(false);
                }}
                className={cn(
                  "relative -mb-px flex items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-sm font-medium transition",
                  active
                    ? "border-[#B22257] text-[#B22257]"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                {t.id === "all" && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#F0CEDB] px-1.5 text-[10px] font-semibold text-[#B22257]">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-[16px] border border-border">
          {/* Column headers */}
          <div className="grid grid-cols-[2.6fr_1.2fr_1fr_0.8fr] gap-4 border-b border-border bg-muted/40 px-3 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <div>API</div>
            <div>Binding</div>
            <div>Owner</div>
            <div className="text-right">24H Calls</div>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {visible.map((row, i) => {
              const BIcon = row.binding.icon;
              const isDraft = row.status === "Draft";
              return (
                <button
                  type="button"
                  key={row.name}
                  onClick={() => onOpenRow?.(row)}
                  className={cn(
                    "grid w-full grid-cols-[2.6fr_1.2fr_1fr_0.8fr] items-center gap-4 border-b border-border/70 px-3 py-2.5 text-left transition hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-[#B22257]/30",
                    isDraft && "opacity-60",
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-[13px] font-semibold text-foreground">
                        {row.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-muted-foreground">
                        <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[row.status])} />
                        {row.status}
                      </span>
                      {row.tags.map((t) => (
                        <span
                          key={t}
                          className={cn(
                            "rounded px-1 py-[1px] text-[10px] font-medium",
                            TAG_TONE[t],
                          )}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                      <span
                        className={cn(
                          "rounded px-1 py-[1px] text-[9.5px] font-bold uppercase",
                          row.method === "GET" && "bg-emerald-50 text-emerald-700",
                          row.method === "POST" && "bg-sky-50 text-sky-700",
                          row.method === "PUT" && "bg-amber-50 text-amber-700",
                          row.method === "DELETE" && "bg-rose-50 text-rose-700",
                        )}
                      >
                        {row.method}
                      </span>
                      <span className="truncate text-foreground/80">{row.path}</span>
                      <span className="text-muted-foreground/70">{row.version}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-muted/60">
                      <BIcon className={cn("h-3 w-3", row.binding.tone)} />
                    </span>
                    <span className="text-[12.5px] text-foreground">{row.binding.label}</span>
                  </div>
                  <div className="text-[12.5px] leading-tight">
                    <div className="text-foreground">{row.owner.name}</div>
                    {row.owner.sub && (
                      <div className="text-[10.5px] text-muted-foreground">{row.owner.sub}</div>
                    )}
                  </div>
                  <div className="text-right leading-tight">
                    {isDraft ? (
                      <>
                        <div className="text-[12.5px] font-semibold tabular-nums text-foreground">
                          0
                        </div>
                        <div className="text-[10.5px] text-muted-foreground">Draft</div>
                      </>
                    ) : (
                      <>
                        <div className="text-[12.5px] font-semibold tabular-nums text-foreground">
                          {row.calls24h.toLocaleString()}
                        </div>
                        <div
                          className={cn(
                            "text-[10.5px] tabular-nums",
                            row.errRate >= 1 ? "text-rose-600" : "text-muted-foreground",
                          )}
                        >
                          {row.errRate.toFixed(1)}% err
                        </div>
                      </>
                    )}
                  </div>
                </button>
              );
            })}

            {visible.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card/60 px-4 py-10 text-center text-sm text-muted-foreground">
                No integrations in this category yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {filtered.length > INITIAL && (
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-hover"
            >
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
              />
              {expanded ? "Show less" : `Show ${remaining} more`}
            </button>
            <span className="text-xs text-muted-foreground">
              Showing {visible.length} of {filtered.length}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

const INTEGRATION_TYPE_OPTIONS: {
  id: IntegrationTab;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badge: string;
  title: string;
  description: string;
}[] = [
  {
    id: "api",
    icon: Globe,
    iconBg: "bg-[oklch(0.95_0.04_260)]",
    iconColor: "text-[oklch(0.55_0.18_260)]",
    badge: "HTTP",
    title: "REST API",
    description: "Wrap a third-party REST endpoint with auth, scopes, and rate limits.",
  },
  {
    id: "mcp",
    icon: Plug,
    iconBg: "bg-[oklch(0.94_0.04_165)]",
    iconColor: "text-[oklch(0.5_0.13_165)]",
    badge: "TOOLS",
    title: "MCP Server",
    description: "Compose tools — custom, bound functions, or public MCPs.",
  },
  {
    id: "agent-as-api",
    icon: Bot,
    iconBg: "bg-[oklch(0.95_0.05_300)]",
    iconColor: "text-[oklch(0.55_0.2_300)]",
    badge: "LLM",
    title: "Agent as an API",
    description: "Expose an LLM agent as a callable, versioned endpoint.",
  },
];

function IntegrationTypePicker({
  onBack,
  onSelect,
}: {
  onBack: () => void;
  onSelect: (tab: IntegrationTab) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            New integration
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pick the type of integration you want to create.
          </p>
        </div>
      </div>

      <h4 className="mt-6 text-sm font-semibold tracking-tight text-foreground">
        Integration Type
      </h4>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        {INTEGRATION_TYPE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={cn(
                "group relative flex flex-col gap-3 overflow-hidden rounded-xl border bg-card p-4 text-left transition",
                "border-border hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm",
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_75%)]"
              />
              <div className="relative flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    opt.iconBg,
                    opt.iconColor,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="shrink-0 rounded-full border border-border bg-muted/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {opt.badge}
                </span>
              </div>
              <div className="relative">
                <h5 className="text-sm font-semibold text-foreground">{opt.title}</h5>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IntegrationCardItem({ card }: { card: IntegrationCard }) {
  const Icon = card.icon;
  return (
    <button
      type="button"
      className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-3.5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
    >
      {/* grid pattern overlay — same language as SolutionCard */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_75%)]"
      />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold text-foreground">{card.title}</h3>
          <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">
            {card.description}
          </p>
        </div>
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            card.iconBg,
          )}
        >
          <Icon className={cn("h-3.5 w-3.5", card.iconColor)} />
        </span>
      </div>

      <div className="relative mt-auto">{card.preview}</div>
    </button>
  );
}

type IntegrationRowType = "Cloud Function" | "MCP" | "Agent as API";

type CloudFnRow = {
  name: string;
  type: IntegrationRowType;
  usedIn: { count: number } | null;
  created: string;
};

const CLOUD_FN_ROWS: CloudFnRow[] = [
  { name: "demo_crm vitos", type: "Cloud Function", usedIn: { count: 2 }, created: "Apr 22, 2026" },
  { name: "delta test 2", type: "Cloud Function", usedIn: null, created: "May 1, 2026" },
  { name: "demomcp", type: "Cloud Function", usedIn: null, created: "May 14, 2026" },
  { name: "22APR", type: "Cloud Function", usedIn: null, created: "Apr 22, 2026" },
  { name: "stripe_webhook", type: "Cloud Function", usedIn: { count: 4 }, created: "Apr 18, 2026" },
  { name: "slack_notifier", type: "Cloud Function", usedIn: { count: 1 }, created: "Apr 12, 2026" },
  { name: "hubspot_sync", type: "Cloud Function", usedIn: { count: 3 }, created: "Apr 9, 2026" },
  { name: "zendesk_ticket", type: "Cloud Function", usedIn: null, created: "Apr 5, 2026" },
  { name: "twilio_sms", type: "Cloud Function", usedIn: { count: 2 }, created: "Mar 30, 2026" },
  { name: "calendar_lookup", type: "Cloud Function", usedIn: null, created: "Mar 24, 2026" },
  {
    name: "openai_classify",
    type: "Cloud Function",
    usedIn: { count: 5 },
    created: "Mar 18, 2026",
  },
  { name: "internal_crm", type: "Cloud Function", usedIn: { count: 1 }, created: "Mar 11, 2026" },
];

const MCP_ROWS: CloudFnRow[] = [
  { name: "github_mcp", type: "MCP", usedIn: { count: 3 }, created: "May 18, 2026" },
  { name: "notion_workspace", type: "MCP", usedIn: { count: 2 }, created: "May 12, 2026" },
  { name: "linear_issues", type: "MCP", usedIn: { count: 1 }, created: "May 7, 2026" },
  { name: "figma_designs", type: "MCP", usedIn: null, created: "Apr 29, 2026" },
];

const AGENT_API_ROWS: CloudFnRow[] = [
  {
    name: "sales_qualifier_agent",
    type: "Agent as API",
    usedIn: { count: 2 },
    created: "May 16, 2026",
  },
  {
    name: "support_triage_agent",
    type: "Agent as API",
    usedIn: { count: 3 },
    created: "May 4, 2026",
  },
  { name: "lead_enrichment_agent", type: "Agent as API", usedIn: null, created: "Apr 25, 2026" },
  {
    name: "onboarding_assistant",
    type: "Agent as API",
    usedIn: { count: 1 },
    created: "Apr 11, 2026",
  },
];

const TYPE_BADGE: Record<IntegrationRowType, string> = {
  "Cloud Function": "bg-[#FDE8EF] text-[#8B1E48]",
  MCP: "bg-[#E0EBFB] text-[#1E3A8A]",
  "Agent as API": "bg-[#DCF1E4] text-[#1F6B43]",
};

const ROWS_BY_TAB: Record<IntegrationTab, CloudFnRow[]> = {
  api: CLOUD_FN_ROWS,
  mcp: MCP_ROWS,
  "agent-as-api": AGENT_API_ROWS,
};

function CloudFunctionTable({
  onCreate,
  activeTab,
}: {
  onCreate: () => void;
  activeTab: IntegrationTab;
}) {
  const rows = ROWS_BY_TAB[activeTab];
  const INITIAL_VISIBLE = 7;
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded ? rows : rows.slice(0, INITIAL_VISIBLE);
  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search integrations..."
            className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-hover"
        >
          <FilterIcon className="h-4 w-4" />
          Filter
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New integration
        </button>
      </div>

      <div className={cn("mt-5 rounded-xl", expanded && "max-h-[520px] overflow-y-auto")}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-border px-2 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          <div>Name</div>
          <div>Type</div>
          <div>Used in</div>
          <div>Created</div>
        </div>
        {visibleRows.map((row) => (
          <div
            key={row.name}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 border-b border-border px-2 py-4 transition hover:bg-hover/40"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FDE8EF]">
                <Plug className="h-4 w-4 text-[#8B1E48]" />
              </span>
              <span className="text-sm font-medium text-foreground">{row.name}</span>
            </div>
            <div>
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                  TYPE_BADGE[row.type],
                )}
              >
                {row.type}
              </span>
            </div>
            <div className="text-sm">
              {row.usedIn ? (
                <button className="inline-flex items-center gap-1.5 font-medium text-[#8B1E48] hover:underline">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {row.usedIn.count} projects
                </button>
              ) : (
                <span className="text-muted-foreground">— Unused</span>
              )}
            </div>
            <div className="text-sm text-foreground/80">{row.created}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {rows.length > INITIAL_VISIBLE && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-hover"
          >
            {expanded ? (
              <>
                <ChevronDown className="h-4 w-4 rotate-180" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                View more
              </>
            )}
          </button>
        )}
        <span className="text-sm text-muted-foreground">
          Showing {visibleRows.length} of {rows.length} APIs
        </span>
      </div>
    </div>
  );
}

function IntegrationsHero({ variant = "mcp" }: { variant?: "mcp" | "apis" }) {
  const isApis = variant === "apis";
  const primaryHeroUrl = isApis ? apiHeroBg : mcpHeroBg;
  const heroOverlay = isApis
    ? "linear-gradient(100deg, rgba(45,5,24,0.52) 0%, rgba(83,10,48,0.15) 58%, rgba(40,4,23,0.12) 100%)"
    : "linear-gradient(100deg, rgba(35,4,20,0.5) 0%, rgba(74,8,44,0.14) 58%, rgba(35,3,21,0.12) 100%)";
  const copy = isApis
    ? {
        label: "APIs · Callable endpoints",
        headline: [
          { text: "Every endpoint,", accent: false },
          { text: "production", accent: true },
          { text: "ready.", accent: false },
        ],
        body: "Publish REST APIs, cloud functions, and agents as secure endpoints — versioned, authenticated, and monitored from one collection.",
        cta: "Read the API overview",
        endpoint: "https://api.vitos.io/v1/",
        endpointSuffix: "{endpoint}",
        stat: "31.2k calls in last 24h · 99.9% uptime",
      }
    : {
        label: "MCP · Tools for agents",
        headline: [
          { text: "Everything your", accent: false },
          { text: "agents", accent: true },
          { text: "can call.", accent: false },
        ],
        body: "Connect tools, wrap APIs, and turn agents or data queries into tools other agents can invoke — all from one place.",
        cta: "Read the MCP overview",
        endpoint: "https://api.vitos.io/v1/mcp/",
        endpointSuffix: "{name}",
        stat: "31.2k calls in last 24h · 99.9% uptime",
      };

  return (
    <section
      aria-label={copy.label}
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#3A071E] px-8 py-6 text-white shadow-card"
    >
      {/* The bundled artwork keeps the banner reliable when the remote asset proxy is unavailable. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `${heroOverlay}, url("${primaryHeroUrl}"), url("${integrationsHeroBg}")`,
          backgroundPosition: "center, right center, center",
          backgroundRepeat: "no-repeat",
          backgroundSize: isApis ? "cover, auto 120%, cover" : "cover, auto 125%, cover",
        }}
      />
      <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        {/* Left content */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
              {copy.label}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-semibold leading-[1.15] tracking-tight text-white md:text-3xl drop-shadow-sm">
            {copy.headline.map((part, i) => (
              <span key={i} className={part.accent ? "text-[#FF7CA3]" : "text-white"}>
                {part.text}
                {i < copy.headline.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90 md:text-sm drop-shadow-sm">
            {copy.body}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={isApis ? "#api-overview" : MCP_HOW_TO_USE_URL}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/[0.14]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {isApis ? copy.cta : "How to use"}
            </a>
            {!isApis && <HeroCopyUrl url={MCP_SERVER_URL} />}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Custom Integration Panel ---------- */

type IntegrationMode = "function" | "api";
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ApiTab = "params" | "auth" | "headers";
type AuthMethod = "none" | "basic" | "bearer" | "jwt" | "hmac" | "checksum";
const AUTH_METHOD_LABELS: Record<AuthMethod, string> = {
  none: "No Auth",
  basic: "Basic Authentication",
  bearer: "Bearer Authentication",
  jwt: "JWT",
  hmac: "HMAC",
  checksum: "Checksum",
};
type KV = { id: string; key: string; value: string };

const newKV = (): KV => ({ id: Math.random().toString(36).slice(2), key: "", value: "" });

function CustomIntegrationPanel({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<IntegrationMode>("function");

  const [fnName, setFnName] = useState("");
  const [fnDesc, setFnDesc] = useState("");
  const [fnCode, setFnCode] = useState("function customFunction(variables) {\n  \n}");
  const [fnParams, setFnParams] = useState<KV[]>([newKV()]);

  const [apiName, setApiName] = useState("");
  const [apiDesc, setApiDesc] = useState("");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("");
  const [apiTab, setApiTab] = useState<ApiTab>("params");
  const [params, setParams] = useState<KV[]>([newKV()]);
  const [headers, setHeaders] = useState<KV[]>([newKV()]);
  const [authType, setAuthType] = useState<AuthMethod>("none");
  const [authToken, setAuthToken] = useState("");

  return (
    <div className="mt-5 rounded-2xl border border-border bg-card shadow-sm">
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
          <h3 className="text-base font-semibold text-foreground">Custom Integration</h3>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setMode("function")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              mode === "function"
                ? "bg-[#8B1E48] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Custom Function
          </button>
          <button
            type="button"
            onClick={() => setMode("api")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              mode === "api"
                ? "bg-[#8B1E48] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Add API
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-start gap-2.5 rounded-xl border border-[#F5D3DF] bg-[#FDE8EF]/60 px-4 py-3 text-sm text-[#8B1E48]">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {mode === "function" ? (
            <p>
              Write JavaScript that runs inside your agent. Use the{" "}
              <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[12px]">
                variables
              </code>{" "}
              object to access agent context — whatever you{" "}
              <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[12px]">
                return
              </code>{" "}
              gets passed to the next step in your workflow.
            </p>
          ) : (
            <p>
              Connect to any external HTTP endpoint. Use{" "}
              <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[12px]">
                {"{{variable}}"}
              </code>{" "}
              anywhere in the URL, headers, or body to inject live agent context into your request.
            </p>
          )}
        </div>

        {mode === "function" ? (
          <FunctionForm
            name={fnName}
            setName={setFnName}
            desc={fnDesc}
            setDesc={setFnDesc}
            code={fnCode}
            setCode={setFnCode}
            params={fnParams}
            setParams={setFnParams}
          />
        ) : (
          <ApiForm
            name={apiName}
            setName={setApiName}
            desc={apiDesc}
            setDesc={setApiDesc}
            method={method}
            setMethod={setMethod}
            url={url}
            setUrl={setUrl}
            tab={apiTab}
            setTab={setApiTab}
            params={params}
            setParams={setParams}
            headers={headers}
            setHeaders={setHeaders}
            authType={authType}
            setAuthType={setAuthType}
            authToken={authToken}
            setAuthToken={setAuthToken}
          />
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-hover"
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Check className="h-4 w-4" />
          {mode === "function" ? "Add Function" : "Add API"}
        </button>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-medium text-foreground">{children}</label>;
}

const inputCls =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

function KVTable({ rows, setRows }: { rows: KV[]; setRows: (r: KV[]) => void }) {
  const update = (id: string, patch: Partial<KV>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows(rows.filter((r) => r.id !== id));
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-[1fr_1fr_40px] gap-0 bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        <div>Key</div>
        <div>Value</div>
        <div />
      </div>
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[1fr_1fr_40px] items-center gap-2 border-t border-border px-3 py-2"
        >
          <input
            value={row.key}
            onChange={(e) => update(row.id, { key: e.target.value })}
            placeholder="Enter Key..."
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <input
            value={row.value}
            onChange={(e) => update(row.id, { value: e.target.value })}
            placeholder="Enter Value..."
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <button
            type="button"
            onClick={() => remove(row.id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-hover hover:text-foreground"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="border-t border-border bg-card px-3 py-2">
        <button
          type="button"
          onClick={() => setRows([...rows, newKV()])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}

function FunctionForm(props: {
  name: string;
  setName: (v: string) => void;
  desc: string;
  setDesc: (v: string) => void;
  code: string;
  setCode: (v: string) => void;
  params: KV[];
  setParams: (r: KV[]) => void;
}) {
  return (
    <div className="mt-5 space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>Function Name</FieldLabel>
          <input
            value={props.name}
            onChange={(e) => props.setName(e.target.value)}
            placeholder="Enter the function name"
            className={inputCls}
          />
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <input
            value={props.desc}
            onChange={(e) => props.setDesc(e.target.value)}
            placeholder="Enter the description"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <FieldLabel>Function Code</FieldLabel>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(props.code)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-hover"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-hover"
            >
              <Play className="h-3.5 w-3.5" />
              Test run
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-[#0E0E12]">
          <div className="border-b border-white/5 px-4 py-2 font-mono text-[11px] text-white/50">
            JavaScript
          </div>
          <textarea
            value={props.code}
            onChange={(e) => props.setCode(e.target.value)}
            spellCheck={false}
            className="block min-h-[200px] w-full resize-y bg-transparent px-4 py-3 font-mono text-[12.5px] leading-relaxed text-[#E4E4E7] outline-none"
          />
        </div>
      </div>

      <div>
        <FieldLabel>Parameters (JSON)</FieldLabel>
        <KVTable rows={props.params} setRows={props.setParams} />
      </div>
    </div>
  );
}

function ApiForm(props: {
  name: string;
  setName: (v: string) => void;
  desc: string;
  setDesc: (v: string) => void;
  method: HttpMethod;
  setMethod: (v: HttpMethod) => void;
  url: string;
  setUrl: (v: string) => void;
  tab: ApiTab;
  setTab: (v: ApiTab) => void;
  params: KV[];
  setParams: (r: KV[]) => void;
  headers: KV[];
  setHeaders: (r: KV[]) => void;
  authType: AuthMethod;
  setAuthType: (v: AuthMethod) => void;
  authToken: string;
  setAuthToken: (v: string) => void;
}) {
  const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const tabs: { id: ApiTab; label: string }[] = [
    { id: "params", label: "Params" },
    { id: "auth", label: "Authorization" },
    { id: "headers", label: "Headers" },
  ];

  return (
    <div className="mt-5 space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>API Name</FieldLabel>
          <input
            value={props.name}
            onChange={(e) => props.setName(e.target.value)}
            placeholder="Enter the function name"
            className={inputCls}
          />
        </div>
        <div>
          <FieldLabel>API Description</FieldLabel>
          <input
            value={props.desc}
            onChange={(e) => props.setDesc(e.target.value)}
            placeholder="Enter the function description"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Method &amp; Request URL</FieldLabel>
        <div className="flex items-stretch gap-2">
          <select
            value={props.method}
            onChange={(e) => props.setMethod(e.target.value as HttpMethod)}
            className="appearance-none rounded-xl border border-border bg-white px-4 py-2.5 text-center text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/15"
          >
            {methods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            value={props.url}
            onChange={(e) => props.setUrl(e.target.value)}
            placeholder="Enter Request URL"
            className={cn(inputCls, "flex-1 font-mono")}
          />
        </div>
      </div>

      <div className="border-b border-border">
        <div className="flex items-center gap-6">
          {tabs.map((t) => {
            const active = props.tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => props.setTab(t.id)}
                className={cn(
                  "relative pb-3 text-sm font-medium transition-colors",
                  active ? "text-[#8B1E48]" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#8B1E48]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {props.tab === "params" && (
        <div>
          <FieldLabel>Key &amp; value</FieldLabel>
          <KVTable rows={props.params} setRows={props.setParams} />
        </div>
      )}

      {props.tab === "headers" && (
        <HeadersSection headers={props.headers} setHeaders={props.setHeaders} />
      )}

      {props.tab === "auth" && (
        <div className="space-y-4">
          <div>
            <FieldLabel>Authorization Method</FieldLabel>
            <AuthMethodDropdown value={props.authType} onChange={props.setAuthType} />
          </div>
          {props.authType !== "none" && (
            <div>
              <FieldLabel>
                {props.authType === "bearer" || props.authType === "jwt"
                  ? "Token"
                  : props.authType === "basic"
                    ? "Credentials"
                    : "Secret"}
              </FieldLabel>
              <input
                value={props.authToken}
                onChange={(e) => props.setAuthToken(e.target.value)}
                placeholder={
                  props.authType === "basic"
                    ? "username:password"
                    : props.authType === "bearer"
                      ? "Enter bearer token"
                      : props.authType === "jwt"
                        ? "Enter JWT"
                        : props.authType === "hmac"
                          ? "Enter HMAC secret"
                          : "Enter checksum secret"
                }
                className={cn(inputCls, "font-mono")}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AuthMethodDropdown({
  value,
  onChange,
}: {
  value: AuthMethod;
  onChange: (v: AuthMethod) => void;
}) {
  const [open, setOpen] = useState(false);
  const methods: AuthMethod[] = ["none", "basic", "bearer", "jwt", "hmac", "checksum"];
  return (
    <div className="relative w-full max-w-md">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(inputCls, "flex items-center justify-between text-left")}
      >
        <span className="text-foreground">{AUTH_METHOD_LABELS[value]}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {methods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onChange(m);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/60"
              >
                <span>{AUTH_METHOD_LABELS[m]}</span>
                {value === m && <Check className="h-4 w-4 text-foreground" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function HeadersSection({ headers, setHeaders }: { headers: KV[]; setHeaders: (r: KV[]) => void }) {
  const [mode, setMode] = useState<"json" | "kv">("json");
  const [json, setJson] = useState("");
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-8">
        <RadioPill label="JSON" checked={mode === "json"} onClick={() => setMode("json")} />
        <RadioPill label="Key & Value" checked={mode === "kv"} onClick={() => setMode("kv")} />
      </div>
      {mode === "json" ? (
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder="Enter Valid JSON"
          rows={8}
          className={cn(inputCls, "min-h-[180px] resize-y font-mono")}
        />
      ) : (
        <KVTable rows={headers} setRows={setHeaders} />
      )}
    </div>
  );
}

function RadioPill({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 text-sm font-medium text-foreground"
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
          checked ? "border-[#8B1E48]" : "border-[#8B1E48]/50",
        )}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-[#8B1E48]" />}
      </span>
      {label}
    </button>
  );
}

/* ---------- MCP Integration Panel ---------- */

type McpSideEffect = "read" | "write" | "destructive";

function McpIntegrationPanel({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [sideEffect, setSideEffect] = useState<McpSideEffect>("read");
  const [serverUrl, setServerUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <McpServerDetailsPanel
        initialName={displayName || name || "github-mcp"}
        onBack={() => setSaved(false)}
        onCancel={onBack}
      />
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-border bg-card shadow-sm">
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
            <h3 className="text-base font-semibold text-foreground">New MCP Integration</h3>
            <p className="text-xs text-muted-foreground">
              Connect a Streamable HTTP MCP server and expose its tools as APIs.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5D3DF] bg-[#FDE8EF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8B1E48]">
          MCP
        </span>
      </div>

      <div className="px-6 py-6 space-y-6">
        <McpField label="Name" hint="Shown to humans and agents alike.">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="List Github repos"
            className={inputCls}
          />
        </McpField>

        <McpField label="Slug" hint="Stable identifier. Lowercase, dot-separated.">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="customers.search"
            className={cn(inputCls, "font-mono")}
          />
        </McpField>

        <McpField
          label="Description"
          hint="One sentence. The LLM reads this to decide when to call it."
        >
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Looks up customers by name, email or order id."
            rows={2}
            className={cn(inputCls, "resize-none")}
          />
        </McpField>

        <McpField
          label="Side effect"
          hint="Drives default scopes, rate limits and external exposure."
        >
          <div className="flex flex-wrap items-center gap-2">
            {(["read", "write", "destructive"] as const).map((opt) => {
              const active = sideEffect === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSideEffect(opt)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                    active
                      ? "border-[#8B1E48] bg-[#FDE8EF] text-[#8B1E48]"
                      : "border-border bg-card text-foreground hover:bg-hover",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </McpField>

        <div className="border-t border-border" />

        <McpField
          label="MCP server URL"
          hint="Streamable HTTP endpoint. We'll list tools on connect."
        >
          <input
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="https://mcp.example.com/sse"
            className={cn(inputCls, "font-mono")}
          />
        </McpField>

        <McpField label="Display name">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="github-mcp"
            className={inputCls}
          />
        </McpField>

        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          On connect, we'll fetch the tool list. Each tool becomes its own API in this collection —
          you can rename, scope, and bundle them after.
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/40 px-6 py-4">
        <p className="text-xs text-muted-foreground">
          Created as <span className="font-medium text-foreground">Draft</span>. Promote to
          Published when you're ready.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-hover"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#8B1E48] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#8B1E48]/90"
          >
            <Check className="h-4 w-4" />
            Add to collection
          </button>
        </div>
      </div>
    </div>
  );
}

function McpField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-[220px_1fr] md:gap-6">
      <div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        {hint && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ---------- MCP Server Details Panel ---------- */

type McpToolGroup = "others" | "kapture";
type McpTool = {
  id: string;
  name: string;
  group: McpToolGroup;
  description: string;
  enabled: boolean;
};

type McpToolsTab = "custom" | "predefined";

function McpServerDetailsPanel({
  initialName,
  onBack,
  onCancel,
}: {
  initialName: string;
  onBack: () => void;
  onCancel: () => void;
}) {
  const [serverName, setServerName] = useState(initialName);
  const [toolsTab, setToolsTab] = useState<McpToolsTab>("custom");
  const [copied, setCopied] = useState(false);
  const [createToolOpen, setCreateToolOpen] = useState(false);
  const apiKey = "demo_mcp_api_key_not_real_0001";
  const maskedKey = "demo_mcp_********_0001";

  const [tools, setTools] = useState<McpTool[]>([
    {
      id: "1",
      name: "get_ticket_status",
      group: "others",
      description: "Fetch current status of a support ticket",
      enabled: true,
    },
    {
      id: "2",
      name: "update_order",
      group: "others",
      description: "Update order details by order ID",
      enabled: false,
    },
    {
      id: "3",
      name: "send_notification",
      group: "others",
      description: "Trigger a notification to the end user",
      enabled: false,
    },
    {
      id: "4",
      name: "fetch_customer",
      group: "kapture",
      description: "Retrieve customer record from Kapture CRM",
      enabled: true,
    },
    {
      id: "5",
      name: "close_ticket",
      group: "kapture",
      description: "Close and resolve a ticket in Kapture",
      enabled: false,
    },
  ]);

  const toggle = (id: string) =>
    setTools((t) => t.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));

  const copy = () => {
    navigator.clipboard?.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (createToolOpen) {
    return <AddNewToolPanel onBack={() => setCreateToolOpen(false)} onCancel={onCancel} />;
  }

  return (
    <div className="mt-5 rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 rounded-t-2xl border-b border-border bg-muted/40 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:bg-hover"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h3 className="text-base font-semibold text-foreground">MCP Server Details</h3>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div>
          <FieldLabel>Server Name</FieldLabel>
          <input
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            className={cn(inputCls, "max-w-md")}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#F5D3DF] bg-[#FDE8EF]/40">
          <div className="flex items-center gap-2 px-4 py-2.5">
            <KeyRound className="h-4 w-4 text-[#8B1E48]" />
            <span className="text-sm font-semibold text-[#8B1E48]">Masked API Key</span>
          </div>
          <div className="space-y-2 border-t border-[#F5D3DF] bg-[#FDE8EF]/60 px-4 py-3">
            <p className="text-xs text-[#8B1E48]/80">
              This is masked version of your API Key for reference purpose only.
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-[#F5D3DF] bg-card px-3.5 py-2">
              <code className="flex-1 truncate font-mono text-sm text-foreground">{maskedKey}</code>
              <button
                type="button"
                onClick={copy}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-hover hover:text-foreground"
                aria-label={copied ? "Copied" : "Copy"}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-foreground">Tools</h4>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center rounded-full border border-border bg-muted/40 p-1">
                <button
                  type="button"
                  onClick={() => setToolsTab("custom")}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                    toolsTab === "custom"
                      ? "bg-[#8B1E48] text-white shadow-sm"
                      : "text-foreground/80 hover:text-foreground",
                  )}
                >
                  My Custom
                </button>
                <button
                  type="button"
                  onClick={() => setToolsTab("predefined")}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                    toolsTab === "predefined"
                      ? "bg-[#8B1E48] text-white shadow-sm"
                      : "text-foreground/80 hover:text-foreground",
                  )}
                >
                  Predefined
                </button>
              </div>
              <button
                type="button"
                onClick={() => setCreateToolOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-hover"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Tools
              </button>
            </div>
          </div>

          {toolsTab === "custom" ? (
            <GroupedToolsList groups={CUSTOM_GROUPS} defaultOpen="others" />
          ) : (
            <GroupedToolsList groups={PREDEFINED_GROUPS} defaultOpen="kapture" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-hover"
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-[#8B1E48] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#8B1E48]/90"
        >
          <Check className="h-4 w-4" />
          Save & Update
        </button>
      </div>
    </div>
  );
}

function ToolToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-[#8B1E48]" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/* ---------- Predefined tools list ---------- */

type PredefinedTool = {
  id: string;
  name: string;
  description: string;
  visibility: "public" | "private";
  updated: string;
};

const PREDEFINED_GROUPS: { id: string; name: string; tools: PredefinedTool[] }[] = [
  { id: "others", name: "others", tools: [] },
  {
    id: "kapture",
    name: "kapture",
    tools: [
      {
        id: "k1",
        name: "updateticket",
        description: "Tool to update ticket",
        visibility: "public",
        updated: "4 months ago",
      },
      {
        id: "k2",
        name: "dashboardupdate",
        description: "Tool to update dashboard",
        visibility: "public",
        updated: "4 months ago",
      },
      {
        id: "k3",
        name: "uploadrecordingurl",
        description: "it will update the recording url",
        visibility: "public",
        updated: "4 months ago",
      },
      {
        id: "k4",
        name: "tickettoolll",
        description: "it will create the ticket",
        visibility: "public",
        updated: "4 months ago",
      },
    ],
  },
  {
    id: "servicenow",
    name: "servicenow",
    tools: [
      {
        id: "s1",
        name: "createincident",
        description: "Create a new ServiceNow incident",
        visibility: "public",
        updated: "2 months ago",
      },
      {
        id: "s2",
        name: "lookupuser",
        description: "Look up a user by email",
        visibility: "public",
        updated: "2 months ago",
      },
    ],
  },
  {
    id: "google_sheets",
    name: "google sheets",
    tools: [
      {
        id: "gs1",
        name: "appendrow",
        description: "Append a row to a sheet",
        visibility: "public",
        updated: "1 month ago",
      },
      {
        id: "gs2",
        name: "readrange",
        description: "Read a range of cells",
        visibility: "public",
        updated: "1 month ago",
      },
    ],
  },
  {
    id: "okta",
    name: "okta",
    tools: [
      {
        id: "o1",
        name: "listusers",
        description: "List users in the Okta org",
        visibility: "private",
        updated: "3 weeks ago",
      },
    ],
  },
  {
    id: "keka",
    name: "keka",
    tools: [
      {
        id: "ke1",
        name: "leavebalance",
        description: "Fetch leave balance for an employee",
        visibility: "public",
        updated: "5 months ago",
      },
    ],
  },
  {
    id: "klklk",
    name: "klklk",
    tools: [],
  },
  {
    id: "big_basket",
    name: "big basket",
    tools: [
      {
        id: "bb1",
        name: "ordersearch",
        description: "Search orders by phone number",
        visibility: "public",
        updated: "6 months ago",
      },
    ],
  },
];

const CUSTOM_GROUPS: { id: string; name: string; tools: PredefinedTool[] }[] = [
  {
    id: "others",
    name: "others",
    tools: [
      {
        id: "c1",
        name: "Custom Tool",
        description: "Custom TOOL",
        visibility: "public",
        updated: "4 days ago",
      },
      {
        id: "c2",
        name: "validate_serial_number_4",
        description: "Used to validate a new user device number",
        visibility: "private",
        updated: "1 month ago",
      },
      {
        id: "c3",
        name: "validate_serial_number_2",
        description: "Used to validate a new user device number",
        visibility: "private",
        updated: "1 month ago",
      },
      {
        id: "c4",
        name: "validate_serial_number",
        description: "Used to validate a new user device number",
        visibility: "private",
        updated: "1 month ago",
      },
      {
        id: "c5",
        name: "get_feedback_questions 132ewrfdc",
        description: "feedback questions for airtel customers",
        visibility: "public",
        updated: "2 months ago",
      },
      {
        id: "c6",
        name: "get_feedback_questions 21345",
        description: "feedback questions for airtel customers",
        visibility: "public",
        updated: "2 months ago",
      },
      {
        id: "c7",
        name: "get_feedback_questions 2",
        description: "feedback questions for airtel customers",
        visibility: "public",
        updated: "2 months ago",
      },
      {
        id: "c8",
        name: "get_feedback_questions",
        description: "feedback questions for airtel customers",
        visibility: "public",
        updated: "2 months ago",
      },
    ],
  },
  {
    id: "kapture",
    name: "kapture",
    tools: [
      {
        id: "ck1",
        name: "get_order_ETA",
        description: "It will fetch the order ETA",
        visibility: "private",
        updated: "1 month ago",
      },
    ],
  },
];

function GroupedToolsList({
  groups,
  defaultOpen,
}: {
  groups: { id: string; name: string; tools: PredefinedTool[] }[];
  defaultOpen?: string;
}) {
  const [activeId, setActiveId] = useState<string>(defaultOpen ?? groups[0]?.id ?? "");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  const toggleTool = (id: string) => setEnabled((s) => ({ ...s, [id]: !s[id] }));

  const activeGroup = groups.find((g) => g.id === activeId) ?? groups[0];
  const enabledCount = activeGroup ? activeGroup.tools.filter((t) => enabled[t.id]).length : 0;

  const groupIconFor = (id: string) => {
    switch (id) {
      case "google_sheets":
        return Table;
      case "okta":
        return Lock;
      case "keka":
        return Users;
      case "big_basket":
        return ShoppingBag;
      case "servicenow":
        return Layers;
      default:
        return Puzzle;
    }
  };

  return (
    <div className="mt-4 grid grid-cols-[240px_1fr] gap-6">
      {/* Sidebar */}
      <div className="space-y-1.5 rounded-2xl border border-border bg-muted/40 p-2">
        {groups.map((group) => {
          const Icon = groupIconFor(group.id);
          const isActive = group.id === activeGroup?.id;
          const hasItems = group.tools.length > 0;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveId(group.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition",
                isActive
                  ? "border-[#F5D3DF] bg-[#FDE8EF]/60 shadow-[inset_3px_0_0_0_#8B1E48]"
                  : "border-border bg-card hover:bg-muted/40",
              )}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    isActive ? "bg-[#F5D3DF] text-[#8B1E48]" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate text-sm font-medium text-foreground">{group.name}</span>
                {hasItems && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />}
              </span>
              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border border-border bg-card px-1.5 text-[11px] font-medium text-muted-foreground">
                {group.tools.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tools panel */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold capitalize text-foreground">{activeGroup?.name}</h4>
          {activeGroup && activeGroup.tools.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
              {enabledCount} enabled
            </span>
          )}
        </div>

        <div className="space-y-2">
          {!activeGroup || activeGroup.tools.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-xs text-muted-foreground">
              No tools in this group yet.
            </div>
          ) : (
            activeGroup.tools.map((tool) => {
              const isOn = !!enabled[tool.id];
              return (
                <div
                  key={tool.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 transition hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[13px] font-semibold text-foreground">
                      {tool.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{tool.description}</div>
                  </div>
                  <ToolToggle checked={isOn} onChange={() => toggleTool(tool.id)} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function LockGlyph({ locked }: { locked: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-3.5 w-3.5", locked ? "text-foreground" : "text-muted-foreground")}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      {locked ? <path d="M8 11V8a4 4 0 1 1 8 0v3" /> : <path d="M8 11V8a4 4 0 0 1 7.5-2" />}
    </svg>
  );
}

/* ---------- Add New Tool ---------- */

const TOOL_GROUP_OPTIONS = ["others", "kapture", "servicenow", "google sheets", "okta", "keka"];

function AddNewToolPanel({ onBack, onCancel }: { onBack: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("def function_name(params):\n  # your logic here\n  pass");
  const [copied, setCopied] = useState(false);
  const [openSection, setOpenSection] = useState<"params" | "env" | "advanced" | null>("params");
  const [parameters, setParameters] = useState<
    Array<{ key: string; type: string; description: string }>
  >([{ key: "", type: "", description: "" }]);
  const updateParam = (i: number, field: "key" | "type" | "description", value: string) => {
    setParameters((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  };
  const addParam = () => setParameters((prev) => [...prev, { key: "", type: "", description: "" }]);
  const removeParam = (i: number) => setParameters((prev) => prev.filter((_, idx) => idx !== i));

  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([
    { key: "", value: "" },
  ]);
  const updateEnv = (i: number, field: "key" | "value", value: string) =>
    setEnvVars((p) => p.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));
  const addEnv = () => setEnvVars((p) => [...p, { key: "", value: "" }]);
  const removeEnv = (i: number) => setEnvVars((p) => p.filter((_, idx) => idx !== i));

  const [requirements, setRequirements] = useState<string[]>([""]);
  const updateReq = (i: number, value: string) =>
    setRequirements((p) => p.map((r, idx) => (idx === i ? value : r)));
  const addReq = () => setRequirements((p) => [...p, ""]);
  const removeReq = (i: number) => setRequirements((p) => p.filter((_, idx) => idx !== i));

  const [region, setRegion] = useState("");
  const [advGroup, setAdvGroup] = useState("");
  const [serverSecrets, setServerSecrets] = useState<
    Array<{ key: string; type: string; description: string }>
  >([{ key: "", type: "", description: "" }]);
  const updateSecret = (i: number, f: "key" | "type" | "description", v: string) =>
    setServerSecrets((p) => p.map((s, idx) => (idx === i ? { ...s, [f]: v } : s)));
  const addSecret = () => setServerSecrets((p) => [...p, { key: "", type: "", description: "" }]);
  const removeSecret = (i: number) => setServerSecrets((p) => p.filter((_, idx) => idx !== i));

  const [serverParams, setServerParams] = useState<
    Array<{ key: string; type: string; description: string }>
  >([{ key: "", type: "", description: "" }]);
  const updateServerParam = (i: number, f: "key" | "type" | "description", v: string) =>
    setServerParams((p) => p.map((s, idx) => (idx === i ? { ...s, [f]: v } : s)));
  const addServerParam = () =>
    setServerParams((p) => [...p, { key: "", type: "", description: "" }]);
  const removeServerParam = (i: number) => setServerParams((p) => p.filter((_, idx) => idx !== i));

  const copyCode = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-5 rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 rounded-t-2xl border-b border-border bg-muted/40 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:bg-hover"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h3 className="text-base font-semibold text-foreground">Add New Tool</h3>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <FieldLabel>Function Name</FieldLabel>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter the function name"
              className={inputCls}
            />
          </div>
          <div>
            <FieldLabel>Group</FieldLabel>
            <div className="relative">
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className={cn(inputCls, "appearance-none pr-9", !group && "text-muted-foreground")}
              >
                <option value="">Select options</option>
                {TOOL_GROUP_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div>
          <FieldLabel>Description</FieldLabel>
          <p className="-mt-1 mb-2 text-xs text-muted-foreground">
            The AI Agent uses this to understand the use case of this tool — be specific.
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter the description"
            rows={4}
            className={cn(inputCls, "resize-y")}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Function Code</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-hover"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                Copy
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-hover"
              >
                <Play className="h-3.5 w-3.5" />
                Test
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-[#0f0f17] shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 text-[11px] uppercase tracking-wide text-white/40">
              <span>Python</span>
            </div>
            <div className="flex">
              <div className="select-none border-r border-white/5 px-3 py-3 text-right font-mono text-xs leading-6 text-white/30">
                {code.split("\n").map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                rows={Math.max(3, code.split("\n").length)}
                className="flex-1 resize-y bg-transparent px-4 py-3 font-mono text-sm leading-6 text-[#f5d3df] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="space-y-2.5">
          <CollapsibleRow
            icon={<Brackets className="h-4 w-4 text-muted-foreground" />}
            label="Parameters"
            open={openSection === "params"}
            onToggle={() => setOpenSection(openSection === "params" ? null : "params")}
          >
            <p className="text-xs text-muted-foreground">
              List parameters your function expects to run.
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/30">
              <div className="grid grid-cols-[1fr_180px_1fr_40px] items-center gap-2 border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <div>Key</div>
                <div>Type</div>
                <div>Description</div>
                <div />
              </div>
              <div className="space-y-2 p-3">
                {parameters.map((param, i) => (
                  <div key={i} className="grid grid-cols-[1fr_180px_1fr_40px] items-center gap-2">
                    <input
                      type="text"
                      value={param.key}
                      onChange={(e) => updateParam(i, "key", e.target.value)}
                      placeholder="Enter Key..."
                      className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-foreground/30"
                    />
                    <div className="relative">
                      <select
                        value={param.type}
                        onChange={(e) => updateParam(i, "type", e.target.value)}
                        className="h-9 w-full appearance-none rounded-lg border border-border bg-card px-3 pr-8 text-sm text-foreground outline-none focus:border-foreground/30"
                      >
                        <option value="">Enter Type</option>
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="array">array</option>
                        <option value="object">object</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      value={param.description}
                      onChange={(e) => updateParam(i, "description", e.target.value)}
                      placeholder="Enter Description..."
                      className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-foreground/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeParam(i)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-hover hover:text-foreground"
                      aria-label="Remove parameter"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addParam}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-hover"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            </div>
          </CollapsibleRow>

          <CollapsibleRow
            icon={<Variable className="h-4 w-4 text-muted-foreground" />}
            label="Environmental Variables & Requirements"
            open={openSection === "env"}
            onToggle={() => setOpenSection(openSection === "env" ? null : "env")}
          >
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">Environmental Variables</h4>
              <p className="text-xs text-muted-foreground">
                Define environment variables required at runtime. (e.g., API_KEY)
              </p>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/30">
              <div className="grid grid-cols-[1fr_1fr_40px] items-center gap-2 border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <div>Key</div>
                <div>Value</div>
                <div />
              </div>
              <div className="space-y-2 p-3">
                {envVars.map((env, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_40px] items-center gap-2">
                    <input
                      type="text"
                      value={env.key}
                      onChange={(e) => updateEnv(i, "key", e.target.value)}
                      placeholder="Enter Key..."
                      className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-foreground/30"
                    />
                    <input
                      type="text"
                      value={env.value}
                      onChange={(e) => updateEnv(i, "value", e.target.value)}
                      placeholder="Enter Value..."
                      className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-foreground/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeEnv(i)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-hover hover:text-foreground"
                      aria-label="Remove env var"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEnv}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-hover"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <h4 className="text-sm font-semibold text-foreground">Requirements</h4>
              <p className="text-xs text-muted-foreground">
                List Python libraries your function needs. (e.g., pandas, requests)
              </p>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/30">
              <div className="grid grid-cols-[1fr_40px] items-center gap-2 border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <div>Import</div>
                <div />
              </div>
              <div className="space-y-2 p-3">
                {requirements.map((req, i) => (
                  <div key={i} className="grid grid-cols-[1fr_40px] items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateReq(i, e.target.value)}
                      placeholder="Enter Imports..."
                      className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-foreground/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeReq(i)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-hover hover:text-foreground"
                      aria-label="Remove requirement"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addReq}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-hover"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            </div>
          </CollapsibleRow>

          <CollapsibleRow
            icon={<SlidersHorizontal className="h-4 w-4 text-muted-foreground" />}
            label="Advanced Settings"
            open={openSection === "advanced"}
            onToggle={() => setOpenSection(openSection === "advanced" ? null : "advanced")}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Region</label>
                <div className="relative">
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm text-foreground outline-none focus:border-foreground/30"
                  >
                    <option value="">Select options</option>
                    <option value="us-east">US East</option>
                    <option value="us-west">US West</option>
                    <option value="eu-west">EU West</option>
                    <option value="ap-south">AP South</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Group</label>
                <div className="relative">
                  <select
                    value={advGroup}
                    onChange={(e) => setAdvGroup(e.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm text-foreground outline-none focus:border-foreground/30"
                  >
                    <option value="">Select options</option>
                    {TOOL_GROUP_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            {[
              {
                title: "Server Secrets",
                rows: serverSecrets,
                update: updateSecret,
                add: addSecret,
                remove: removeSecret,
              },
              {
                title: "Server Parameters",
                rows: serverParams,
                update: updateServerParam,
                add: addServerParam,
                remove: removeServerParam,
              },
            ].map((section) => (
              <div key={section.title} className="mt-5">
                <h4 className="mb-2 text-sm font-semibold text-foreground">{section.title}</h4>
                <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                  <div className="grid grid-cols-[1fr_180px_1fr_40px] items-center gap-2 border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    <div>Key</div>
                    <div>Type</div>
                    <div>Description</div>
                    <div />
                  </div>
                  <div className="space-y-2 p-3">
                    {section.rows.map((row, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_180px_1fr_40px] items-center gap-2"
                      >
                        <input
                          type="text"
                          value={row.key}
                          onChange={(e) => section.update(i, "key", e.target.value)}
                          placeholder="Enter Key..."
                          className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-foreground/30"
                        />
                        <div className="relative">
                          <select
                            value={row.type}
                            onChange={(e) => section.update(i, "type", e.target.value)}
                            className="h-9 w-full appearance-none rounded-lg border border-border bg-card px-3 pr-8 text-sm text-foreground outline-none focus:border-foreground/30"
                          >
                            <option value="">Enter Type</option>
                            <option value="string">string</option>
                            <option value="number">number</option>
                            <option value="boolean">boolean</option>
                            <option value="array">array</option>
                            <option value="object">object</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                        <input
                          type="text"
                          value={row.description}
                          onChange={(e) => section.update(i, "description", e.target.value)}
                          placeholder="Enter Description..."
                          className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-foreground/30"
                        />
                        <button
                          type="button"
                          onClick={() => section.remove(i)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-hover hover:text-foreground"
                          aria-label="Remove row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={section.add}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-hover"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </CollapsibleRow>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-hover"
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-hover"
        >
          <FlaskConical className="h-4 w-4" />
          Test
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl bg-[#8B1E48] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#8B1E48]/90"
        >
          <Check className="h-4 w-4" />
          Add Function
        </button>
      </div>
    </div>
  );
}

function CollapsibleRow({
  icon,
  label,
  badge,
  open,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-muted/60"
      >
        <span className="flex items-center gap-2.5">
          {icon}
          <span className="text-sm font-semibold text-foreground">{label}</span>
          {badge && <span className="text-xs font-normal text-muted-foreground">{badge}</span>}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="border-t border-border bg-card px-4 py-3">{children}</div>}
    </div>
  );
}
