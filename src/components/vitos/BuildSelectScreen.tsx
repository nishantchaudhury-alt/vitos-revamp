import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  PanelLeft,
  Plus,
  LogOut,
  Sparkles,
  Lightbulb,
  AudioLines,
  MessageSquare,
  CheckCircle2,
  Search,
  Diamond,
  Play,
  Link2,
  Network,
  TrendingUp,
  ListChecks,
  Workflow,
  BarChart3,
  ChevronsUpDown,
  ChevronDown,
  Brain,
  LayoutGrid,
  MoreHorizontal,
  Database,
  Ticket,
  ShoppingCart,
  User,
  FileText,
  Bell,
  TableProperties,
  BookOpen,
  Plug,
  Radio,
  Server,
  Activity,
  FlaskConical,
  SlidersHorizontal,
  Settings2,
  Zap,
  Trash2,
  X,
} from "lucide-react";
import vitosLogo from "@/assets/vitos-logo.png";
import bgRight from "@/assets/vitos-bg-right.png";
import integrationsHeroBg from "@/assets/integrations-hero-bg.webp";
import { HomeOverview } from "./HomeOverview";
import { AgentsListPage, ALL_AGENTS, type Agent, type AgentTypeKey } from "./AgentsListPage";
import { AgentTypeSelect, type AgentType } from "./AgentTypeSelect";
import { IndustrySelect } from "./IndustrySelect";
import { NameAgentScreen } from "./NameAgentScreen";
import { AopPage } from "./AopPage";
import { NewAopPanel } from "./NewAopPanel";
import { PageContainer } from "./PageContainer";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { AllWorkspacesPage } from "./AllWorkspacesPage";
import { IntegrationsPage } from "./IntegrationsPage";
import { ProvidersPage } from "./ProvidersPage";
import { ChannelsPage } from "./ChannelsPage";
import { KnowledgePage } from "./KnowledgePage";

type CardKey = "conversational" | "workflow" | "api" | "copilot" | "aop";

const AGENT_NAV_TO_SCOPE: Record<string, "all" | AgentTypeKey> = {
  all: "all",
  conversation: "conversation",
  workflow: "workflow",
  api: "api",
  aop: "multi",
};

interface Props {
  workspaceName: string;
  onLogout: () => void;
}

interface CardDef {
  key: CardKey;
  tag: "Agent" | "Orchestrator";
  title: string;
  description: React.ReactNode;
  diagram: React.ReactNode;
  examples: string[];
  pills: { icon: React.ComponentType<{ className?: string }>; label: string }[];
}

const CARDS: CardDef[] = [
  {
    key: "conversational",
    tag: "Agent",
    title: "Conversational agent",
    description: (
      <>
        Talks to customers in real time —{" "}
        <strong className="font-semibold text-foreground">
          voice, chat, WhatsApp, email, or SMS
        </strong>
        . One agent, any channel.
      </>
    ),
    diagram: <ConversationalDiagram color="#f43f5e" />,
    examples: [
      "A WhatsApp support bot that answers FAQs, sends order updates, and hands off to a human agent when needed",
      "A voice IVR that understands natural language, resolves billing queries, and books callbacks automatically",
      "A live chat assistant on your website that qualifies leads and routes them to the right sales rep",
    ],
    pills: [
      { icon: AudioLines, label: "Understand" },
      { icon: MessageSquare, label: "Respond" },
      { icon: CheckCircle2, label: "Resolve" },
    ],
  },
  {
    key: "workflow",
    tag: "Agent",
    title: "Workflow agent",
    description: (
      <>
        Runs in the background — triggered by{" "}
        <strong className="font-semibold text-foreground">events</strong>,{" "}
        <strong className="font-semibold text-foreground">schedules</strong>, or{" "}
        <strong className="font-semibold text-foreground">data changes</strong>. Fully automated,{" "}
        <strong className="font-semibold text-foreground">no manual hand-holding</strong>
      </>
    ),
    diagram: <WorkflowDiagram color="#0ea5e9" />,
    examples: [
      "A nightly job that syncs orders from Shopify to your warehouse system and flags exceptions",
      "An onboarding flow triggered when a new user signs up — provisions accounts, sends welcome emails, and schedules check-ins",
      "A reconciliation agent that watches your payments table and auto-resolves mismatches against bank statements",
    ],
    pills: [
      { icon: Search, label: "Detect" },
      { icon: Diamond, label: "Decide" },
      { icon: Play, label: "Act" },
    ],
  },
  {
    key: "api",
    tag: "Agent",
    title: "Agent as API",
    description: (
      <>
        Turn any agent into a building block — plug it into your{" "}
        <strong className="font-semibold text-foreground">systems</strong>,{" "}
        <strong className="font-semibold text-foreground">other tools</strong>, or{" "}
        <strong className="font-semibold text-foreground">chain</strong> it with other agents
      </>
    ),
    diagram: <ApiDiagram color="#10b981" />,
    examples: [
      "Expose a refund-decision agent as an endpoint your billing system calls in real time",
      "Embed a knowledge-search agent inside your existing helpdesk — no UI changes needed",
      "Let one agent call another mid-conversation to enrich a customer profile from your CRM",
    ],
    pills: [
      { icon: Link2, label: "Integrate" },
      { icon: Network, label: "Orchestrate" },
      { icon: TrendingUp, label: "Scale" },
    ],
  },
  {
    key: "aop",
    tag: "Orchestrator",
    title: "Multi-agent workflow (AOP)",
    description: (
      <>
        Coordinate multiple agents into one seamless journey —{" "}
        <strong className="font-semibold text-foreground">
          it decides which agent runs, when, and what happens next
        </strong>
      </>
    ),
    diagram: <AopDiagram color="#8b5cf6" />,
    examples: [
      "A customer support journey that routes between a chat agent, a refund workflow agent, and a CRM lookup agent automatically",
      "An end-to-end sales motion: qualify lead → book demo → send proposal — handled by three specialized agents in sequence",
      "An incident response orchestrator that pages on-call, gathers logs via an API agent, and drafts a postmortem when resolved",
    ],
    pills: [
      { icon: ListChecks, label: "Plan" },
      { icon: Workflow, label: "Coordinate" },
      { icon: BarChart3, label: "Optimize" },
    ],
  },
];

export function BuildSelectScreen({ workspaceName, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );
  const [hovered, setHovered] = useState(false);
  const [activeBuildKey, setActiveBuildKey] = useState<CardKey | null>(null);
  const [view, setView] = useState<
    | "home"
    | "agents"
    | "agent-type"
    | "industry"
    | "workflow-name"
    | "copilot-name"
    | "aop"
    | "schema"
    | "workspaces"
    | "integrations"
    | "providers"
    | "channels"
    | "knowledge"
  >("home");
  const [schemaAutoOpen, setSchemaAutoOpen] = useState(false);
  const [agentTypeOrigin, setAgentTypeOrigin] = useState<"home" | "agents">("home");
  const [agentsReopenKey, setAgentsReopenKey] = useState(0);
  const [reopenCreatePanel, setReopenCreatePanel] = useState(false);
  const [conversationType, setConversationType] = useState<AgentType | null>(null);
  const [createdAgents, setCreatedAgents] = useState<Agent[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const saved = window.localStorage.getItem("vitos-created-agents");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as Agent[]) : [];
    } catch {
      return [];
    }
  });
  const [creationNotice, setCreationNotice] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  const [agentsOpen, setAgentsOpen] = useState(false);
  const [activeAgentKey, setActiveAgentKey] = useState<string | null>(null);
  useEffect(() => {
    try {
      window.localStorage.setItem("vitos-created-agents", JSON.stringify(createdAgents));
    } catch {
      // Keep the local prototype usable if browser storage is unavailable.
    }
  }, [createdAgents]);
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [view]);

  const isExpanded = !collapsed || hovered;

  const completeAgentCreation = ({
    name,
    type,
    subType,
  }: {
    name: string;
    type: AgentTypeKey;
    subType?: AgentType;
  }) => {
    const createdAt = new Date();
    const agent: Agent = {
      id: `local-${createdAt.getTime()}`,
      name,
      type,
      subType,
      lastModified: "just now",
      lastModifiedAt: createdAt.toISOString().slice(0, 16).replace("T", " "),
      status: "in_build",
    };

    setCreatedAgents((current) => [agent, ...current]);
    setCreationNotice(`${name} was created and is ready to configure.`);
    setActiveAgentKey(type);
    setActiveBuildKey(null);
    setReopenCreatePanel(false);
    setView("agents");
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#FAFAFA]">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => collapsed && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`flex shrink-0 flex-col justify-between border-r border-sidebar-border bg-white/80 backdrop-blur transition-[width] duration-200 ease-in-out ${
          isExpanded ? "w-52" : "w-12"
        }`}
      >
        <div className="flex-1 min-h-0 overflow-hidden">
          <div
            className={`flex items-center py-2 ${!isExpanded ? "justify-center px-2" : "justify-between px-3"}`}
          >
            {isExpanded && (
              <div className="flex items-center gap-2">
                <img src={vitosLogo} alt="Vitos" className="h-7 w-7 rounded-full" />
                <span className="text-base font-semibold tracking-tight text-foreground">
                  Vitos
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() =>
                setCollapsed((c) => {
                  setHovered(false);
                  return !c;
                })
              }
              className="rounded-md p-1.5 text-muted-foreground hover:bg-hover"
              aria-label="Toggle sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>

          <nav className={`pt-1 pb-2 space-y-0.5 ${!isExpanded ? "px-1.5" : "px-2"}`}>
            {/* WORKSPACE section */}
            {!isExpanded && <div className="mt-1 mx-1.5 border-t border-sidebar-border/60" />}

            {/* Workspace selector chip / home */}
            <div>
              {isExpanded ? (
                <WorkspaceSwitcher
                  workspaceName={workspaceName}
                  onHome={() => {
                    setView("home");
                    setActiveAgentKey(null);
                    setActiveBuildKey(null);
                    setAgentsOpen(false);
                  }}
                  isHome={view === "home"}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setView("home");
                    setActiveAgentKey(null);
                    setActiveBuildKey(null);
                    setAgentsOpen(false);
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                    view === "home" ? "bg-[#B22257] text-[#F0CEDB]" : "hover:bg-hover"
                  }`}
                  aria-label="Home"
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      view === "home" ? "bg-white text-[#B22257]" : "bg-[#F7E0EA] text-[#B22257]"
                    }`}
                  >
                    KX
                  </div>
                </button>
              )}
            </div>

            {/* BUILD section */}
            {isExpanded ? (
              <div className="flex items-center gap-2 px-2 pb-1 pt-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                  Build
                </span>
                <span className="h-px flex-1 bg-sidebar-border/60" />
              </div>
            ) : (
              <div className="mt-2 mx-1.5 border-t border-sidebar-border/60" />
            )}

            {/* AOP */}
            <button
              type="button"
              aria-label="AOP"
              onClick={() => {
                setView("aop");
                setActiveAgentKey(null);
                setAgentsOpen(false);
              }}
              className={`flex w-full items-center rounded-full py-1 text-[13px] transition ${
                view === "aop"
                  ? "bg-[#B22257] text-[#F0CEDB] font-medium"
                  : "text-sidebar-foreground/80 hover:bg-hover"
              } ${!isExpanded ? "justify-center" : "gap-2 px-2"}`}
            >
              <Workflow className="h-3.5 w-3.5" />
              {isExpanded && <span>AOP</span>}
            </button>

            {/* Agents */}
            <div>
              <button
                type="button"
                aria-label="Agents"
                onClick={() => {
                  setAgentsOpen(false);
                  setActiveAgentKey("all");
                  setReopenCreatePanel(false);
                  setView("agents");
                }}
                className={`flex w-full items-center text-[13px] rounded-full transition ${
                  view === "agents"
                    ? "bg-[#B22257] text-[#F0CEDB] font-medium"
                    : "text-sidebar-foreground/80 hover:bg-hover"
                } ${!isExpanded ? "justify-center py-1" : "gap-2 px-2 py-1"}`}
              >
                <Brain className="h-3.5 w-3.5" />
                {isExpanded && <span>Agents</span>}
              </button>
            </div>

            {/* Integrations */}
            <button
              type="button"
              aria-label="Integrations"
              onClick={() => {
                setView("integrations");
                setActiveAgentKey(null);
                setAgentsOpen(false);
              }}
              className={`flex w-full items-center rounded-full py-1 text-[13px] transition ${
                view === "integrations"
                  ? "bg-[#B22257] text-[#F0CEDB] font-medium"
                  : "text-sidebar-foreground/80 hover:bg-hover"
              } ${!isExpanded ? "justify-center" : "gap-2 px-2"}`}
            >
              <Plug className="h-3.5 w-3.5" />
              {isExpanded && <span>Integrations</span>}
            </button>

            {/* RESOURCES section */}
            {isExpanded ? (
              <div className="flex items-center gap-2 px-2 pb-1 pt-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                  Resources
                </span>
                <span className="h-px flex-1 bg-sidebar-border/60" />
              </div>
            ) : (
              <div className="mt-2 mx-1.5 border-t border-sidebar-border/60" />
            )}

            {/* Schema */}
            <button
              type="button"
              aria-label="Schema"
              onClick={() => {
                setView("schema");
                setActiveAgentKey(null);
                setAgentsOpen(false);
              }}
              className={`flex w-full items-center rounded-full py-1 text-[13px] transition ${
                view === "schema"
                  ? "bg-[#B22257] text-[#F0CEDB] font-medium"
                  : "text-sidebar-foreground/80 hover:bg-hover"
              } ${!isExpanded ? "justify-center" : "gap-2 px-2"}`}
            >
              <Database className="h-3.5 w-3.5" />
              {isExpanded && <span>Schema</span>}
            </button>

            {/* Knowledge */}
            <button
              type="button"
              aria-label="Knowledge"
              onClick={() => {
                setView("knowledge");
                setActiveAgentKey(null);
                setAgentsOpen(false);
              }}
              className={`flex w-full items-center rounded-full py-1 text-[13px] transition ${
                view === "knowledge"
                  ? "bg-[#B22257] text-[#F0CEDB] font-medium"
                  : "text-sidebar-foreground/80 hover:bg-hover"
              } ${!isExpanded ? "justify-center" : "gap-2 px-2"}`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {isExpanded && <span>Knowledge</span>}
            </button>

            {/* Channels */}
            <button
              type="button"
              aria-label="Channels"
              onClick={() => {
                setView("channels");
                setActiveAgentKey(null);
                setAgentsOpen(false);
              }}
              className={`flex w-full items-center rounded-full py-1 text-[13px] transition ${
                view === "channels"
                  ? "bg-[#B22257] text-[#F0CEDB] font-medium"
                  : "text-sidebar-foreground/80 hover:bg-hover"
              } ${!isExpanded ? "justify-center" : "gap-2 px-2"}`}
            >
              <Radio className="h-3.5 w-3.5" />
              {isExpanded && <span>Channels</span>}
            </button>

            {/* Providers */}
            <button
              type="button"
              aria-label="Providers"
              onClick={() => {
                setView("providers");
                setActiveAgentKey(null);
                setAgentsOpen(false);
              }}
              className={`flex w-full items-center rounded-full py-1 text-[13px] transition ${
                view === "providers"
                  ? "bg-[#B22257] text-[#F0CEDB] font-medium"
                  : "text-sidebar-foreground/80 hover:bg-hover"
              } ${!isExpanded ? "justify-center" : "gap-2 px-2"}`}
            >
              <Server className="h-3.5 w-3.5" />
              {isExpanded && <span>Providers</span>}
            </button>

            {/* OPERATE section */}
            {isExpanded ? (
              <div className="flex items-center gap-2 px-2 pb-1 pt-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                  Operate
                </span>
                <span className="h-px flex-1 bg-sidebar-border/60" />
              </div>
            ) : (
              <div className="mt-2 mx-1.5 border-t border-sidebar-border/60" />
            )}

            <button
              type="button"
              disabled
              aria-label="Simulation — coming soon"
              title="Simulation — coming soon"
              className={`flex w-full cursor-not-allowed items-center rounded-full py-1 text-[13px] text-sidebar-foreground/50 ${!isExpanded ? "justify-center" : "gap-2 px-2"}`}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              {isExpanded && (
                <span className="flex flex-1 items-center justify-between">
                  Simulation <span className="text-[9px] uppercase tracking-wider">Soon</span>
                </span>
              )}
            </button>
            <button
              type="button"
              disabled
              aria-label="Observability — coming soon"
              title="Observability — coming soon"
              className={`flex w-full cursor-not-allowed items-center rounded-full py-1 text-[13px] text-sidebar-foreground/50 ${!isExpanded ? "justify-center" : "gap-2 px-2"}`}
            >
              <Activity className="h-3.5 w-3.5" />
              {isExpanded && (
                <span className="flex flex-1 items-center justify-between">
                  Observability <span className="text-[9px] uppercase tracking-wider">Soon</span>
                </span>
              )}
            </button>
            <button
              type="button"
              disabled
              aria-label="Analytics — coming soon"
              title="Analytics — coming soon"
              className={`flex w-full cursor-not-allowed items-center rounded-full py-1 text-[13px] text-sidebar-foreground/50 ${!isExpanded ? "justify-center" : "gap-2 px-2"}`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              {isExpanded && (
                <span className="flex flex-1 items-center justify-between">
                  Analytics <span className="text-[9px] uppercase tracking-wider">Soon</span>
                </span>
              )}
            </button>
            <button
              type="button"
              disabled
              aria-label="Controls — coming soon"
              title="Controls — coming soon"
              className={`flex w-full cursor-not-allowed items-center rounded-full py-1 text-[13px] text-sidebar-foreground/50 ${!isExpanded ? "justify-center" : "gap-2 px-2"}`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {isExpanded && (
                <span className="flex flex-1 items-center justify-between">
                  Controls <span className="text-[9px] uppercase tracking-wider">Soon</span>
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Profile footer */}
        <div
          className={`shrink-0 border-t border-sidebar-border px-2 py-2 ${!isExpanded ? "flex justify-center" : ""}`}
        >
          {isExpanded ? (
            <div className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E91E63] to-[#B22257] text-[10px] font-semibold text-white shadow-sm">
                S
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                Swati <span className="text-muted-foreground font-normal">· Support Manager</span>
              </span>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Logout"
                title="Logout"
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-hover hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Logout"
              title="Logout"
              className="flex items-center justify-center rounded-md p-1 transition hover:bg-hover"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E91E63] to-[#B22257] text-[10px] font-semibold text-white shadow-sm">
                S
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main
        ref={mainRef}
        className={`relative flex-1 bg-[#FAFAFA] ${
          view === "agent-type" ||
          view === "industry" ||
          view === "workflow-name" ||
          view === "copilot-name"
            ? "grid place-items-center overflow-y-auto px-10 pb-10 pt-24 xl:pt-32"
            : "flex flex-col overflow-y-auto"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-no-repeat bg-bottom bg-contain"
          style={{ backgroundImage: `url(${bgRight})` }}
        />
        <div
          className={`relative z-10 w-full ${
            view === "agent-type" ||
            view === "industry" ||
            view === "workflow-name" ||
            view === "copilot-name"
              ? ""
              : "flex flex-1 flex-col"
          }`}
        >
          {view === "home" ? (
            <HomeOverview
              workspaceName={workspaceName}
              onStartBuilding={(key) => {
                setActiveBuildKey(key);
                if (key === "conversational") {
                  setAgentTypeOrigin("home");
                  setView("agent-type");
                } else if (key === "aop") {
                  setView("aop");
                } else if (key === "workflow") {
                  setView("workflow-name");
                } else if (key === "copilot") {
                  setView("copilot-name");
                } else {
                  setView("industry");
                }
              }}
            />
          ) : view === "agents" && activeAgentKey ? (
            <AgentsListPage
              key={`${activeAgentKey}-${agentsReopenKey}`}
              scope={AGENT_NAV_TO_SCOPE[activeAgentKey] ?? "all"}
              initialAgents={[...createdAgents, ...ALL_AGENTS]}
              createdNotice={creationNotice}
              onDismissNotice={() => setCreationNotice(null)}
              initialCreateOpen={reopenCreatePanel}
              onCreateAgent={(key) => {
                if (key === "conversation") {
                  setActiveBuildKey("conversational");
                  setAgentTypeOrigin("agents");
                  setReopenCreatePanel(false);
                  setView("agent-type");
                } else if (key === "workflow") {
                  setActiveBuildKey("workflow");
                  setReopenCreatePanel(false);
                  setView("workflow-name");
                } else if (key === "copilot") {
                  setReopenCreatePanel(false);
                  setView("copilot-name");
                }
              }}
            />
          ) : view === "agent-type" ? (
            <AgentTypeSelect
              onProceed={(type) => {
                setConversationType(type);
                setView("industry");
              }}
              onBack={() => {
                if (agentTypeOrigin === "agents") {
                  setReopenCreatePanel(true);
                  setAgentsReopenKey((k) => k + 1);
                  setView("agents");
                } else {
                  setView("home");
                }
              }}
            />
          ) : view === "industry" ? (
            <IndustrySelect
              onProceed={({ name }) =>
                completeAgentCreation({
                  name,
                  type: activeBuildKey === "api" ? "api" : "conversation",
                  subType:
                    activeBuildKey === "conversational" ? (conversationType ?? "text") : undefined,
                })
              }
              onBack={() => {
                if (activeBuildKey === "conversational") {
                  setView("agent-type");
                } else {
                  setView("home");
                }
              }}
            />
          ) : view === "workflow-name" ? (
            <NameAgentScreen
              onProceed={({ name }) => completeAgentCreation({ name, type: "workflow" })}
              onBack={() => setView("home")}
            />
          ) : view === "copilot-name" ? (
            <NameAgentScreen
              variant="copilot"
              onProceed={({ name }) => completeAgentCreation({ name, type: "api" })}
              onBack={() => setView("home")}
            />
          ) : view === "aop" ? (
            <AopPage
              workspaceName={workspaceName}
              onGoToSchema={() => {
                setSchemaAutoOpen(true);
                setView("schema");
                setActiveAgentKey(null);
                setAgentsOpen(false);
              }}
              onCanvasModeChange={(active) => setCollapsed(active)}
            />
          ) : view === "schema" ? (
            <SchemaPage
              autoOpenNew={schemaAutoOpen}
              onConsumeAutoOpen={() => setSchemaAutoOpen(false)}
            />
          ) : view === "workspaces" ? (
            <AllWorkspacesPage currentWorkspace={workspaceName || "Kapture CX"} />
          ) : view === "integrations" ? (
            <IntegrationsPage />
          ) : view === "providers" ? (
            <ProvidersPage />
          ) : view === "channels" ? (
            <ChannelsPage />
          ) : view === "knowledge" ? (
            <KnowledgePage />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function SchemaHero() {
  return (
    <section
      aria-label="Schema — Entities and operational data"
      className="relative mb-6 overflow-hidden rounded-2xl border border-white/5 px-8 py-5 text-white shadow-card bg-cover bg-center"
      style={{ backgroundImage: `url(${integrationsHeroBg})` }}
    >
      <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        {/* Left content */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">
              Schema · Data model for agents
            </span>
          </div>

          <h1 className="mt-3 text-xl font-semibold leading-[1.15] tracking-tight md:text-2xl">
            <span className="text-[#EEC9D7]">The shape of every</span>{" "}
            <span className="text-[#F25691]">record</span>{" "}
            <span className="text-[#EEC9D7]">your agents touch.</span>
          </h1>

          <p className="mt-2 max-w-xl text-xs leading-relaxed text-[#F8CFDF]">
            Define the entities your agents and AOPs read and write — tickets, orders, leads, or
            anything custom. Manage operational lookup tables the same way, all from one place.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/85 transition hover:bg-white/[0.08]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Read the Schema overview
            </button>
          </div>
        </div>

        {/* Right entity preview card */}
        <div className="w-full max-w-sm shrink-0 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
            <span className="flex items-center gap-2">
              <Database className="h-3 w-3" />
              Entity · tickets
            </span>
            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[9px] tracking-[0.12em] text-white/60">
              12 columns
            </span>
          </div>
          <div className="mt-2.5 space-y-1 font-mono text-[11.5px]">
            {[
              { k: "id", t: "uuid", pk: true },
              { k: "status", t: "enum", pk: false },
              { k: "created_at", t: "timestamp", pk: false },
            ].map((row) => (
              <div
                key={row.k}
                className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1"
              >
                <span className="text-white/85">{row.k}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[oklch(0.78_0.16_5)]">{row.t}</span>
                  {row.pk && (
                    <span className="rounded-sm border border-white/15 px-1 text-[9px] tracking-wider text-white/60">
                      PK
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 text-xs text-white/55">48.6k rows · synced 2m ago</div>
        </div>
      </div>
    </section>
  );
}

function SchemaPage({
  autoOpenNew = false,
  onConsumeAutoOpen,
}: {
  autoOpenNew?: boolean;
  onConsumeAutoOpen?: () => void;
}) {
  const [newOpen, setNewOpen] = useState(false);
  const [scope, setScope] = useState<"entity" | "operation">("entity");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"rows" | "cards">("rows");
  const [statesFor, setStatesFor] = useState<SchemaEntity | null>(null);
  const [editFor, setEditFor] = useState<SchemaEntity | null>(null);
  useEffect(() => {
    if (autoOpenNew) {
      setNewOpen(true);
      onConsumeAutoOpen?.();
    }
  }, [autoOpenNew, onConsumeAutoOpen]);

  const filtered = SCHEMA_ROWS.filter(
    (r) => r.scope === scope && r.name.toLowerCase().includes(query.toLowerCase()),
  );
  const entityCount = SCHEMA_ROWS.filter((r) => r.scope === "entity").length;
  const operationCount = SCHEMA_ROWS.filter((r) => r.scope === "operation").length;

  return (
    <PageContainer fullWidth>
      {/* Hero */}
      <SchemaHero />

      {/* Scope toggle pill */}
      <div className="mb-5 inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
        {[
          {
            key: "entity" as const,
            label: "Schema Entity",
            count: entityCount,
            badge: undefined as string | undefined,
          },
          {
            key: "operation" as const,
            label: "Operation Data Table",
            count: operationCount,
            badge: "Reference",
          },
        ].map((opt) => {
          const active = scope === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setScope(opt.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
              <span
                className={cn(
                  "inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {opt.count}
              </span>
            </button>
          );
        })}
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
              placeholder={scope === "entity" ? "Filter entities..." : "Filter data tables..."}
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] text-foreground transition hover:bg-hover"
          >
            All Types
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] text-foreground transition hover:bg-hover"
          >
            Sort: Recently Modified
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            {scope === "entity" ? "Create Entity" : "Create Data Table"}
          </button>
          <div className="flex items-center rounded-md border border-border bg-background p-0.5">
            <button
              type="button"
              aria-label="Rows view"
              onClick={() => setViewMode("rows")}
              className={cn(
                "rounded px-2 py-1.5 transition",
                viewMode === "rows"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <TableProperties className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Cards view"
              onClick={() => setViewMode("cards")}
              className={cn(
                "rounded px-2 py-1.5 transition",
                viewMode === "cards"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {viewMode === "rows" ? (
          <>
            <div className="grid grid-cols-[minmax(220px,1.4fr)_90px_80px_80px_70px_90px_120px_140px] items-center gap-6 border-b border-border bg-muted/30 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div>{scope === "entity" ? "Entity" : "Data Table"}</div>
              <div>Type</div>
              <div>Records</div>
              <div>Columns</div>
              <div>States</div>
              <div>Status</div>
              <div>Last Modified</div>
              <div>Actions</div>
            </div>

            <div className="divide-y divide-border">
              {filtered.map((r) => {
                const Icon = SCHEMA_ICON_MAP[r.icon];
                return (
                  <div
                    key={r.id}
                    className="group grid grid-cols-[minmax(220px,1.4fr)_90px_80px_80px_70px_90px_120px_140px] items-center gap-6 px-5 py-3 transition hover:bg-hover"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                          SCHEMA_ICON_TONES[r.type.tone],
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-foreground">
                          {r.name}
                        </div>
                        {r.description && (
                          <div className="mt-0.5 truncate text-[11.5px] leading-snug text-muted-foreground">
                            {r.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
                          SCHEMA_TYPE_TONES[r.type.tone],
                        )}
                      >
                        {r.type.label}
                      </span>
                    </div>
                    <div className="text-[12.5px] font-medium tabular-nums text-foreground">
                      {r.records.toLocaleString()}
                    </div>
                    <div className="text-[12.5px] font-medium tabular-nums text-foreground">
                      {r.columns}
                    </div>
                    <div className="text-[12.5px] font-medium tabular-nums text-foreground">
                      {r.states}
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        <span className="h-1 w-1 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>
                    <div className="text-[12px] text-muted-foreground">{r.modified}</div>
                    <div className="flex items-center justify-start gap-1.5">
                      <InstantTooltip label="Edit Properties">
                        <button
                          type="button"
                          aria-label="Edit properties"
                          onClick={() => setEditFor(r)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-hover hover:text-foreground"
                        >
                          <Settings2 className="h-3.5 w-3.5" />
                        </button>
                      </InstantTooltip>
                      <InstantTooltip label="States">
                        <button
                          type="button"
                          aria-label="Manage states"
                          onClick={() => setStatesFor(r)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-hover hover:text-foreground"
                        >
                          <Zap className="h-3.5 w-3.5" />
                        </button>
                      </InstantTooltip>
                      <InstantTooltip label="Delete">
                        <button
                          type="button"
                          aria-label="Delete"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </InstantTooltip>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No {scope === "entity" ? "entities" : "data tables"} match "{query}".
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => {
              const Icon = SCHEMA_ICON_MAP[r.icon];
              return (
                <div
                  key={r.id}
                  className="flex flex-col rounded-xl border border-border bg-background p-4 transition hover:border-foreground/20 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                        SCHEMA_ICON_TONES[r.type.tone],
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-foreground">
                        {r.name}
                      </div>
                      {r.description && (
                        <div className="mt-0.5 truncate text-[11.5px] leading-snug text-muted-foreground">
                          {r.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
                        SCHEMA_TYPE_TONES[r.type.tone],
                      )}
                    >
                      {r.type.label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-border bg-muted/20 p-2 text-center">
                    <div>
                      <div className="text-[11px] font-semibold text-foreground">
                        {r.records.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Records</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-foreground">{r.columns}</div>
                      <div className="text-[10px] text-muted-foreground">Columns</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-foreground">{r.states}</div>
                      <div className="text-[10px] text-muted-foreground">States</div>
                    </div>
                  </div>
                  <div className="mt-3 text-[12px] text-muted-foreground">
                    Last modified {r.modified}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditFor(r)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground transition hover:bg-hover"
                    >
                      <Settings2 className="h-3 w-3" />
                      Edit Properties
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatesFor(r)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground transition hover:bg-hover"
                    >
                      <Zap className="h-3 w-3" />
                      State
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                No {scope === "entity" ? "entities" : "data tables"} match "{query}".
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2.5 text-[11.5px] text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            <span className="font-semibold text-foreground">
              {scope === "entity" ? entityCount : operationCount}
            </span>{" "}
            entries
          </div>
        </div>
      </div>

      <NewAopPanel open={newOpen} onClose={() => setNewOpen(false)} />
      <StatesPanel entity={statesFor} onClose={() => setStatesFor(null)} />
      <EditEntityPanel
        entity={editFor}
        onClose={() => setEditFor(null)}
        onOpenStates={(e) => {
          setEditFor(null);
          setStatesFor(e);
        }}
      />
    </PageContainer>
  );
}

interface SchemaEntity {
  id: string;
  name: string;
  description?: string;
  type: {
    label: "Lead" | "Ticket" | "Order" | "Custom";
    tone: "amber" | "sky" | "violet" | "slate";
  };
  icon: "file" | "ticket" | "order" | "custom";
  records: number;
  columns: number;
  states: number;
  status: "active" | "draft";
  modified: string;
  scope: "entity" | "operation";
}

const SCHEMA_ROWS: SchemaEntity[] = [
  {
    id: "1",
    name: "Loan Application Leads",
    type: { label: "Lead", tone: "amber" },
    icon: "file",
    records: 200,
    columns: 44,
    states: 10,
    status: "active",
    modified: "7 hours ago",
    scope: "entity",
  },
  {
    id: "2",
    name: "collections",
    type: { label: "Ticket", tone: "sky" },
    icon: "ticket",
    records: 66,
    columns: 41,
    states: 10,
    status: "active",
    modified: "1 month ago",
    scope: "entity",
  },
  {
    id: "3",
    name: "loanaccount",
    description: "asd",
    type: { label: "Lead", tone: "amber" },
    icon: "file",
    records: 5,
    columns: 18,
    states: 2,
    status: "active",
    modified: "16 days ago",
    scope: "entity",
  },
  {
    id: "4",
    name: "test",
    description: "asd",
    type: { label: "Custom", tone: "slate" },
    icon: "custom",
    records: 0,
    columns: 9,
    states: 0,
    status: "active",
    modified: "5 hours ago",
    scope: "entity",
  },
  {
    id: "5",
    name: "audit_logs",
    type: { label: "Custom", tone: "slate" },
    icon: "custom",
    records: 1240,
    columns: 12,
    states: 0,
    status: "active",
    modified: "3 days ago",
    scope: "operation",
  },
  {
    id: "6",
    name: "api_keys",
    type: { label: "Custom", tone: "slate" },
    icon: "custom",
    records: 8,
    columns: 6,
    states: 0,
    status: "active",
    modified: "12 days ago",
    scope: "operation",
  },
];

const SCHEMA_TYPE_TONES: Record<string, string> = {
  amber: "bg-amber-50 text-amber-700 border-amber-200/70",
  sky: "bg-sky-50 text-sky-700 border-sky-200/70",
  violet: "bg-violet-50 text-violet-700 border-violet-200/70",
  slate: "bg-slate-50 text-slate-700 border-slate-200/70",
};

const SCHEMA_ICON_TONES: Record<string, string> = {
  amber: "bg-amber-100 text-amber-700",
  sky: "bg-sky-100 text-sky-700",
  violet: "bg-violet-100 text-violet-700",
  slate: "bg-slate-100 text-slate-600",
};

const SCHEMA_ICON_MAP = {
  file: FileText,
  ticket: Ticket,
  order: ShoppingCart,
  custom: Database,
} as const;

/* ---------- Schema Entity Illustration ---------- */

function SchemaEntityIllustration() {
  const STROKE = "#B22257";
  const SOFT = "rgba(178, 34, 87, 0.45)";
  const FAINT = "rgba(178, 34, 87, 0.18)";
  const BG = "#FFF5F8";
  const FIELD = "rgba(178, 34, 87, 0.14)";
  const ACCENT = "rgba(178, 34, 87, 0.55)";

  // A small entity record card
  const Record = ({
    x,
    y,
    w = 96,
    h = 70,
    rows = 3,
    delay = 0,
    accent = false,
  }: {
    x: number;
    y: number;
    w?: number;
    h?: number;
    rows?: number;
    delay?: number;
    accent?: boolean;
  }) => (
    <g
      className="entity-float"
      style={{ animationDelay: `${delay}s`, transformOrigin: `${x + w / 2}px ${y + h / 2}px` }}
    >
      {/* shadow */}
      <rect x={x + 3} y={y + 4} width={w} height={h} rx={6} fill="rgba(178,34,87,0.10)" />
      {/* card */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={accent ? BG : "white"}
        stroke={STROKE}
        strokeWidth={1.2}
      />
      {/* header bar */}
      <rect
        x={x}
        y={y}
        width={w}
        height={14}
        rx={6}
        fill={accent ? STROKE : "white"}
        stroke={STROKE}
        strokeWidth={1.2}
      />
      {/* primary key dot */}
      <circle cx={x + 7} cy={y + 7} r={2} fill={accent ? "white" : STROKE} />
      {/* title line */}
      <rect
        x={x + 13}
        y={y + 5}
        width={w * 0.45}
        height={4}
        rx={1.5}
        fill={accent ? "white" : ACCENT}
      />
      {/* field rows */}
      {Array.from({ length: rows }).map((_, i) => {
        const ry = y + 22 + i * 13;
        return (
          <g key={i}>
            <circle cx={x + 8} cy={ry + 3} r={1.6} fill={STROKE} opacity={0.6} />
            <rect x={x + 14} y={ry} width={w * 0.35} height={3.5} rx={1} fill={FIELD} />
            <rect x={x + 14 + w * 0.4} y={ry} width={w * 0.4} height={3.5} rx={1} fill={FIELD} />
          </g>
        );
      })}
    </g>
  );

  return (
    <div className="relative w-full">
      <style>{`
        @keyframes entityFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes entityDash { to { stroke-dashoffset: -24; } }
        @keyframes entityScan {
          0% { transform: translateY(0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(40px); opacity: 0; }
        }
        @keyframes entityPulse {
          0%, 100% { r: 3; opacity: 0.6; }
          50% { r: 4.2; opacity: 1; }
        }
        .entity-float { animation: entityFloat 4.5s ease-in-out infinite; }
        .entity-link { stroke-dasharray: 3 4; animation: entityDash 1.6s linear infinite; }
        .entity-scan { animation: entityScan 2.6s ease-in-out infinite; }
        .entity-pulse { animation: entityPulse 1.8s ease-in-out infinite; }
      `}</style>

      <svg viewBox="0 0 320 200" className="mx-auto h-28 w-full max-w-[240px]" fill="none">
        {/* dashed connection lines between records */}
        <g
          stroke={SOFT}
          strokeWidth={1.1}
          strokeLinecap="round"
          className="entity-link"
          fill="none"
        >
          <path d="M118 80 L 168 60" />
          <path d="M118 110 L 168 130" />
          <path d="M214 75 L 214 115" />
        </g>

        {/* link endpoint dots */}
        <circle cx={118} cy={80} r={2.2} fill={STROKE} />
        <circle cx={168} cy={60} r={2.2} fill={STROKE} />
        <circle cx={118} cy={110} r={2.2} fill={STROKE} />
        <circle cx={168} cy={130} r={2.2} fill={STROKE} />

        {/* Left primary record (accent) */}
        <Record x={22} y={62} w={96} h={76} rows={3} delay={0} accent />

        {/* Right top record */}
        <Record x={168} y={28} w={96} h={56} rows={2} delay={0.3} />

        {/* Right bottom record */}
        <Record x={168} y={108} w={96} h={62} rows={2} delay={0.6} />

        {/* scanning highlight on primary card */}
        <g clipPath="url(#entity-clip)">
          <rect
            x={22}
            y={62}
            width={96}
            height={3}
            fill={STROKE}
            opacity={0.35}
            className="entity-scan"
          />
        </g>
        <defs>
          <clipPath id="entity-clip">
            <rect x={22} y={62} width={96} height={76} rx={6} />
          </clipPath>
        </defs>

        {/* pulsing relation node */}
        <circle cx={143} cy={95} r={3} fill={STROKE} className="entity-pulse" />
      </svg>
    </div>
  );
}

/* ---------- Operation DataTable Isometric Illustration ---------- */

function DataTableIsoIllustration() {
  const STROKE = "#2563EB"; // blue-600
  const SOFT = "rgba(37, 99, 235, 0.45)";
  const FAINT = "rgba(37, 99, 235, 0.16)";
  const CELL = "rgba(37, 99, 235, 0.14)";
  const HEADER = "#2563EB";

  // Table card geometry
  const tx = 60;
  const ty = 40;
  const tw = 200;
  const th = 130;
  const headerH = 22;
  const cols = 4;
  const rowH = 18;
  const rows = 5;
  const colW = tw / cols;

  return (
    <div className="relative w-full">
      <style>{`
        @keyframes tblFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes tblScan {
          0%   { transform: translateY(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(${rowH * (rows - 1)}px); opacity: 0; }
        }
        @keyframes tblRowGlow {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes tblBeam {
          0% { transform: translateX(-30px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(60px); opacity: 0; }
        }
        @keyframes tblCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .tbl-float  { animation: tblFloat 5s ease-in-out infinite; transform-origin: center; }
        .tbl-scan   { animation: tblScan 3.6s cubic-bezier(.4,0,.2,1) infinite; }
        .tbl-row-1  { animation: tblRowGlow 3.6s ease-in-out infinite; }
        .tbl-row-2  { animation: tblRowGlow 3.6s ease-in-out 0.6s infinite; }
        .tbl-row-3  { animation: tblRowGlow 3.6s ease-in-out 1.2s infinite; }
        .tbl-beam   { animation: tblBeam 2.4s ease-in-out infinite; }
        .tbl-cursor { animation: tblCursor 1s steps(2) infinite; }
      `}</style>

      <svg viewBox="0 0 320 200" className="mx-auto h-28 w-full max-w-[240px]" fill="none">
        {/* faint background grid */}
        <g stroke={FAINT} strokeWidth={1}>
          <path d="M0 30 H320" />
          <path d="M0 180 H320" />
        </g>

        {/* Floating search chip */}
        <g className="tbl-float">
          <rect
            x={20}
            y={14}
            width={88}
            height={18}
            rx={9}
            fill="white"
            stroke={STROKE}
            strokeWidth={1.1}
          />
          <circle cx={31} cy={23} r={3.2} stroke={STROKE} strokeWidth={1.2} fill="none" />
          <line
            x1={33.6}
            y1={25.6}
            x2={36.6}
            y2={28.6}
            stroke={STROKE}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <rect x={42} y={20.5} width={42} height={3} rx={1.5} fill={CELL} />
          <line
            x1={88}
            y1={19}
            x2={88}
            y2={28}
            stroke={STROKE}
            strokeWidth={1.2}
            className="tbl-cursor"
          />
        </g>

        {/* Table card */}
        <g className="tbl-float" style={{ animationDelay: "0.2s" }}>
          {/* shadow */}
          <rect x={tx + 3} y={ty + 5} width={tw} height={th} rx={8} fill="rgba(37,99,235,0.10)" />
          {/* card body */}
          <rect
            x={tx}
            y={ty}
            width={tw}
            height={th}
            rx={8}
            fill="white"
            stroke={STROKE}
            strokeWidth={1.2}
          />

          {/* header */}
          <path
            d={`M${tx} ${ty + headerH} V${ty + 8} Q${tx} ${ty} ${tx + 8} ${ty} H${tx + tw - 8} Q${tx + tw} ${ty} ${tx + tw} ${ty + 8} V${ty + headerH} Z`}
            fill={HEADER}
          />
          {/* header column labels */}
          {Array.from({ length: cols }).map((_, i) => (
            <rect
              key={`h${i}`}
              x={tx + i * colW + 8}
              y={ty + 9}
              width={colW - 16}
              height={4}
              rx={1.5}
              fill="white"
              opacity={0.85}
            />
          ))}

          {/* column dividers */}
          {Array.from({ length: cols - 1 }).map((_, i) => (
            <line
              key={`c${i}`}
              x1={tx + (i + 1) * colW}
              y1={ty + headerH}
              x2={tx + (i + 1) * colW}
              y2={ty + th}
              stroke={FAINT}
              strokeWidth={1}
            />
          ))}

          {/* rows */}
          {Array.from({ length: rows }).map((_, r) => {
            const ry = ty + headerH + r * rowH + 6;
            const highlightClass = r === 1 ? "tbl-row-1" : r === 3 ? "tbl-row-2" : "";
            return (
              <g key={`r${r}`}>
                {/* row hover highlight */}
                {(r === 1 || r === 3) && (
                  <rect
                    x={tx + 1}
                    y={ty + headerH + r * rowH}
                    width={tw - 2}
                    height={rowH}
                    fill={STROKE}
                    opacity={0.12}
                    className={highlightClass}
                  />
                )}
                {/* cell content bars */}
                {Array.from({ length: cols }).map((_, c) => {
                  // first col: id dot + bar; others: bar
                  if (c === 0) {
                    return (
                      <g key={`r${r}c${c}`}>
                        <circle cx={tx + 8} cy={ry + 2} r={1.6} fill={STROKE} opacity={0.7} />
                        <rect
                          x={tx + 14}
                          y={ry}
                          width={colW - 22}
                          height={3.5}
                          rx={1.2}
                          fill={CELL}
                        />
                      </g>
                    );
                  }
                  const w = c === cols - 1 ? colW * 0.5 : colW - 16;
                  return (
                    <rect
                      key={`r${r}c${c}`}
                      x={tx + c * colW + 8}
                      y={ry}
                      width={w}
                      height={3.5}
                      rx={1.2}
                      fill={CELL}
                    />
                  );
                })}
                {/* row separator */}
                {r < rows - 1 && (
                  <line
                    x1={tx + 4}
                    y1={ty + headerH + (r + 1) * rowH}
                    x2={tx + tw - 4}
                    y2={ty + headerH + (r + 1) * rowH}
                    stroke={FAINT}
                    strokeWidth={1}
                  />
                )}
              </g>
            );
          })}

          {/* scanning beam across rows */}
          <g clipPath="url(#dt-clip)">
            <rect
              x={tx}
              y={ty + headerH + 2}
              width={tw}
              height={2}
              fill={STROKE}
              opacity={0.55}
              className="tbl-scan"
            />
          </g>
          <defs>
            <clipPath id="dt-clip">
              <rect x={tx} y={ty + headerH} width={tw} height={th - headerH} rx={6} />
            </clipPath>
          </defs>
        </g>

        {/* Floating result pill */}
        <g>
          <rect
            x={222}
            y={172}
            width={70}
            height={16}
            rx={8}
            fill="white"
            stroke={STROKE}
            strokeWidth={1.1}
          />
          <circle cx={232} cy={180} r={2.4} fill={STROKE} className="tbl-row-3" />
          <rect x={238} y={178} width={46} height={3.5} rx={1.5} fill={CELL} />
        </g>

        {/* tiny query beam from search to table */}
        <g stroke={SOFT} strokeWidth={1} strokeDasharray="2 3" fill="none">
          <path d="M64 32 L 90 50" className="tbl-beam" />
        </g>
      </svg>
    </div>
  );
}

/* ---------- Diagrams ---------- */

/* Use CSS vars directly — tokens are oklch, so hsl(var(--primary)) won't parse. */

const Card = "var(--card)";
const Muted = "var(--muted-foreground)";

interface DiagramProps {
  color?: string;
}
function getColors(c: string = "var(--primary)") {
  return {
    P: c,
    PSoft: `color-mix(in oklab, ${c} 35%, transparent)`,
    PFaint: `color-mix(in oklab, ${c} 18%, transparent)`,
  };
}

const THEMES: Record<
  CardKey,
  {
    color: string;
    tag: string;
    pill: string;
    diagBgIdle: string;
    diagBgSelected: string;
    ring: string;
    border: string;
  }
> = {
  conversational: {
    color: "#f43f5e",
    tag: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    pill: "border-rose-500/20 bg-rose-500/10 text-rose-700",
    diagBgIdle: "bg-rose-500/[0.05]",
    diagBgSelected: "bg-rose-500/15",
    ring: "ring-rose-500/30",
    border: "border-rose-500",
  },
  workflow: {
    color: "#0ea5e9",
    tag: "bg-sky-500/10 text-sky-700 border-sky-500/20",
    pill: "border-sky-500/20 bg-sky-500/10 text-sky-700",
    diagBgIdle: "bg-sky-500/[0.05]",
    diagBgSelected: "bg-sky-500/15",
    ring: "ring-sky-500/30",
    border: "border-sky-500",
  },
  api: {
    color: "#10b981",
    tag: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    pill: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
    diagBgIdle: "bg-emerald-500/[0.05]",
    diagBgSelected: "bg-emerald-500/15",
    ring: "ring-emerald-500/30",
    border: "border-emerald-500",
  },
  aop: {
    color: "#8b5cf6",
    tag: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    pill: "border-violet-500/20 bg-violet-500/10 text-violet-700",
    diagBgIdle: "bg-violet-500/[0.05]",
    diagBgSelected: "bg-violet-500/15",
    ring: "ring-violet-500/30",
    border: "border-violet-500",
  },
  copilot: {
    color: "#f59e0b",
    tag: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    pill: "border-amber-500/20 bg-amber-500/10 text-amber-700",
    diagBgIdle: "bg-amber-500/[0.05]",
    diagBgSelected: "bg-amber-500/15",
    ring: "ring-amber-500/30",
    border: "border-amber-500",
  },
};

function ConversationalDiagram({ color }: DiagramProps) {
  const { P, PFaint } = getColors(color);
  const nodes = [
    { x: 110, y: 28, label: "mic" },
    { x: 172, y: 60, label: "WA" },
    { x: 152, y: 112, label: "sms" },
    { x: 68, y: 112, label: "chat" },
    { x: 48, y: 60, label: "@" },
  ];
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full p-4">
      <g stroke={PFaint} fill="none" strokeDasharray="2 3">
        <circle cx="110" cy="75" r="34" />
        <circle cx="110" cy="75" r="54" />
      </g>
      <circle cx="110" cy="75" r="9" fill={P} fillOpacity="0.15" stroke={P} />
      <circle cx="110" cy="75" r="3" fill={P} />
      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r="3.5" fill={P} />
          <text x={n.x} y={n.y - 7} textAnchor="middle" fontSize="7" fill={P} fontWeight="500">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- Edit Entity Panel ---------- */

type EntityColType =
  "text" | "number" | "date" | "select" | "boolean" | "email" | "phone" | "url" | "json";

interface EntityColumn {
  id: string;
  name: string;
  type: EntityColType;
  required?: boolean;
}

const COL_TYPE_TONE: Record<EntityColType, string> = {
  text: "bg-slate-100 text-slate-700",
  number: "bg-blue-100 text-blue-700",
  date: "bg-violet-100 text-violet-700",
  select: "bg-amber-100 text-amber-700",
  boolean: "bg-emerald-100 text-emerald-700",
  email: "bg-sky-100 text-sky-700",
  phone: "bg-teal-100 text-teal-700",
  url: "bg-indigo-100 text-indigo-700",
  json: "bg-rose-100 text-rose-700",
};

const LOAN_LEAD_COLUMNS: { name: string; type: EntityColType; required?: boolean }[] = [
  { name: "lead_id", type: "text", required: true },
  { name: "application_id", type: "text", required: true },
  { name: "first_name", type: "text", required: true },
  { name: "last_name", type: "text", required: true },
  { name: "email", type: "email", required: true },
  { name: "phone", type: "phone", required: true },
  { name: "alternate_phone", type: "phone" },
  { name: "date_of_birth", type: "date" },
  { name: "gender", type: "select" },
  { name: "marital_status", type: "select" },
  { name: "pan_number", type: "text" },
  { name: "aadhaar_number", type: "text" },
  { name: "address_line1", type: "text" },
  { name: "address_line2", type: "text" },
  { name: "city", type: "text" },
  { name: "state", type: "text" },
  { name: "pincode", type: "text" },
  { name: "employment_type", type: "select" },
  { name: "employer_name", type: "text" },
  { name: "designation", type: "text" },
  { name: "monthly_income", type: "number" },
  { name: "annual_income", type: "number" },
  { name: "existing_emi", type: "number" },
  { name: "credit_score", type: "number" },
  { name: "loan_amount_requested", type: "number", required: true },
  { name: "loan_tenure_months", type: "number" },
  { name: "loan_purpose", type: "select" },
  { name: "interest_rate", type: "number" },
  { name: "processing_fee", type: "number" },
  { name: "documents_uploaded", type: "boolean" },
  { name: "kyc_status", type: "select" },
  { name: "kyc_verified_at", type: "date" },
  { name: "underwriter_id", type: "text" },
  { name: "approval_status", type: "select" },
  { name: "sanctioned_amount", type: "number" },
  { name: "disbursed_amount", type: "number" },
  { name: "disbursed_at", type: "date" },
  { name: "rejection_reason", type: "text" },
  { name: "source_channel", type: "select" },
  { name: "assigned_agent", type: "text" },
  { name: "last_contacted_at", type: "date" },
  { name: "notes", type: "text" },
  { name: "created_at", type: "date" },
  { name: "updated_at", type: "date" },
];

const COLLECTIONS_COLUMNS: { name: string; type: EntityColType; required?: boolean }[] = [
  { name: "ticket_id", type: "text", required: true },
  { name: "loan_account_id", type: "text", required: true },
  { name: "customer_name", type: "text", required: true },
  { name: "customer_phone", type: "phone" },
  { name: "customer_email", type: "email" },
  { name: "outstanding_amount", type: "number" },
  { name: "overdue_amount", type: "number" },
  { name: "dpd", type: "number" },
  { name: "bucket", type: "select" },
  { name: "priority", type: "select" },
  { name: "assigned_to", type: "text" },
  { name: "status", type: "select" },
  { name: "last_payment_date", type: "date" },
  { name: "last_payment_amount", type: "number" },
  { name: "ptp_date", type: "date" },
  { name: "ptp_amount", type: "number" },
  { name: "ptp_status", type: "select" },
  { name: "contact_attempts", type: "number" },
  { name: "last_contact_channel", type: "select" },
  { name: "last_contact_at", type: "date" },
  { name: "next_action_at", type: "date" },
  { name: "escalation_level", type: "number" },
  { name: "resolution_notes", type: "text" },
  { name: "closed_at", type: "date" },
  { name: "created_at", type: "date" },
  { name: "updated_at", type: "date" },
];

const LOAN_ACCOUNT_COLUMNS: { name: string; type: EntityColType; required?: boolean }[] = [
  { name: "account_id", type: "text", required: true },
  { name: "customer_id", type: "text", required: true },
  { name: "product_type", type: "select" },
  { name: "principal", type: "number" },
  { name: "interest_rate", type: "number" },
  { name: "tenure_months", type: "number" },
  { name: "emi_amount", type: "number" },
  { name: "outstanding_balance", type: "number" },
  { name: "next_due_date", type: "date" },
  { name: "status", type: "select" },
  { name: "opened_at", type: "date" },
  { name: "closed_at", type: "date" },
];

const TEST_COLUMNS: { name: string; type: EntityColType; required?: boolean }[] = [
  { name: "id", type: "text", required: true },
  { name: "name", type: "text" },
  { name: "value", type: "number" },
  { name: "flag", type: "boolean" },
  { name: "created_at", type: "date" },
];

const DEFAULT_ENTITY_COLUMNS: Record<
  string,
  { name: string; type: EntityColType; required?: boolean }[]
> = {
  "1": LOAN_LEAD_COLUMNS,
  "2": COLLECTIONS_COLUMNS,
  "3": LOAN_ACCOUNT_COLUMNS,
  "4": TEST_COLUMNS,
};

function EditEntityPanel({
  entity,
  onClose,
  onOpenStates,
}: {
  entity: SchemaEntity | null;
  onClose: () => void;
  onOpenStates: (e: SchemaEntity) => void;
}) {
  const open = !!entity;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [columns, setColumns] = useState<EntityColumn[]>([]);
  const [colQuery, setColQuery] = useState("");

  useEffect(() => {
    if (!entity) return;
    setName(entity.name);
    setDescription(entity.description ?? "");
    const seed = DEFAULT_ENTITY_COLUMNS[entity.id] ?? [];
    setColumns(seed.map((c, i) => ({ id: `${entity.id}-c-${i}`, ...c })));
    setColQuery("");
  }, [entity]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const Icon = entity ? SCHEMA_ICON_MAP[entity.icon] : FileText;
  const iconTone = entity ? SCHEMA_ICON_TONES[entity.type.tone] : "bg-muted text-muted-foreground";
  const stateSeed = entity ? (DEFAULT_ENTITY_STATES[entity.id] ?? []) : [];

  const filteredCols = columns.filter((c) =>
    c.name.toLowerCase().includes(colQuery.trim().toLowerCase()),
  );

  const updateCol = (id: string, patch: Partial<EntityColumn>) =>
    setColumns((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeCol = (id: string) => setColumns((cs) => cs.filter((c) => c.id !== id));
  const addCol = () =>
    setColumns((cs) => [...cs, { id: `new-${Date.now()}`, name: "", type: "text" }]);

  return createPortal(
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-label="Edit entity"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                iconTone,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                Edit Properties
              </div>
              <h2 className="mt-0.5 truncate text-[17px] font-semibold leading-snug tracking-tight text-foreground">
                {entity?.name ?? ""}
              </h2>
              <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                {entity?.type.label} · {entity?.records.toLocaleString() ?? 0} records ·{" "}
                {columns.length} columns · {stateSeed.length} states
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {/* Details */}
          <section>
            <h3 className="text-[13px] font-semibold text-foreground">Details</h3>
            <div className="mt-2 space-y-2.5">
              <div>
                <label className="text-[11.5px] font-medium text-muted-foreground">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-muted-foreground">
                  Description <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="What does this entity represent?"
                  className="mt-1 w-full resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
                    SCHEMA_TYPE_TONES[entity?.type.tone ?? "slate"],
                  )}
                >
                  {entity?.type.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  Active
                </span>
                <span className="text-[11.5px] text-muted-foreground">
                  Last modified {entity?.modified}
                </span>
              </div>
            </div>
          </section>

          {/* States summary */}
          <section className="mt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-foreground">
                States{" "}
                <span className="ml-1 font-normal text-muted-foreground">({stateSeed.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => entity && onOpenStates(entity)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11.5px] font-medium text-foreground transition hover:bg-hover"
              >
                <Zap className="h-3 w-3" />
                Manage states
              </button>
            </div>
            {stateSeed.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {stateSeed.map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-2 rounded-md border border-dashed border-border bg-muted/20 px-3 py-3 text-center text-[12px] text-muted-foreground">
                No states configured yet.
              </div>
            )}
          </section>

          {/* Columns */}
          <section className="mt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-foreground">
                Columns{" "}
                <span className="ml-1 font-normal text-muted-foreground">({columns.length})</span>
              </h3>
              <button
                type="button"
                onClick={addCol}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[11.5px] font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="h-3 w-3" />
                Add column
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={colQuery}
                onChange={(e) => setColQuery(e.target.value)}
                placeholder="Filter columns..."
                className="flex-1 bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-[minmax(0,1fr)_96px_28px] gap-2 border-b border-border bg-muted/40 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div>Name</div>
                <div>Type</div>
                <div />
              </div>
              <div className="max-h-[42vh] divide-y divide-border overflow-y-auto">
                {filteredCols.map((c) => (
                  <div
                    key={c.id}
                    className="group/col grid grid-cols-[minmax(0,1fr)_96px_28px] items-center gap-2 px-2.5 py-1.5 transition hover:bg-hover"
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      <input
                        value={c.name}
                        onChange={(e) => updateCol(c.id, { name: e.target.value })}
                        placeholder="column_name"
                        className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-[12px] text-foreground transition hover:border-border focus:border-primary focus:bg-background focus:outline-none"
                      />
                      {c.required && (
                        <span className="shrink-0 rounded bg-rose-50 px-1 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-rose-600">
                          req
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <select
                        value={c.type}
                        onChange={(e) => updateCol(c.id, { type: e.target.value as EntityColType })}
                        className={cn(
                          "w-full appearance-none rounded-md border border-transparent px-1.5 py-0.5 pr-5 text-[11px] font-medium focus:border-primary focus:outline-none",
                          COL_TYPE_TONE[c.type],
                        )}
                      >
                        {(Object.keys(COL_TYPE_TONE) as EntityColType[]).map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 opacity-70" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCol(c.id)}
                      aria-label={`Remove ${c.name}`}
                      className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 transition hover:bg-hover hover:text-rose-600 group-hover/col:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {filteredCols.length === 0 && (
                  <div className="px-3 py-6 text-center text-[12px] text-muted-foreground">
                    No columns match "{colQuery}".
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-card px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-[13px] font-medium text-foreground transition hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Save changes
          </button>
        </div>
      </aside>
    </>,
    document.body,
  );
}

/* ---------- Instant Tooltip ---------- */

function InstantTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-1 left-1/2 z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-md transition-opacity duration-75 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

/* ---------- States Panel ---------- */

const STATE_PALETTE = [
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#3b82f6",
  "#8b5cf6",
  "#14b8a6",
  "#ef4444",
  "#a855f7",
  "#22c55e",
  "#0ea5e9",
];

const DEFAULT_ENTITY_STATES: Record<string, { name: string; color: string }[]> = {
  "1": [
    { name: "Application Submitted", color: "#10b981" },
    { name: "Document Collection", color: "#f59e0b" },
    { name: "Documents Failed", color: "#f43f5e" },
    { name: "Lead Captured", color: "#f59e0b" },
    { name: "Loan Approved", color: "#10b981" },
    { name: "Loan Disbursed", color: "#14b8a6" },
    { name: "Loan Rejected", color: "#f43f5e" },
    { name: "Sanction Sent", color: "#8b5cf6" },
    { name: "Underwriting", color: "#3b82f6" },
    { name: "KYC Verified", color: "#22c55e" },
  ],
  "2": [
    { name: "Open", color: "#3b82f6" },
    { name: "In Progress", color: "#f59e0b" },
    { name: "Escalated", color: "#f43f5e" },
    { name: "PTP Given", color: "#8b5cf6" },
    { name: "PTP Broken", color: "#ef4444" },
    { name: "Payment Received", color: "#10b981" },
    { name: "Partial Payment", color: "#14b8a6" },
    { name: "Awaiting Response", color: "#0ea5e9" },
    { name: "Closed", color: "#22c55e" },
    { name: "Written Off", color: "#a855f7" },
  ],
  "3": [
    { name: "Active", color: "#10b981" },
    { name: "Closed", color: "#94a3b8" },
  ],
};

interface StateValue {
  id: string;
  name: string;
  color: string;
}

function StatesPanel({ entity, onClose }: { entity: SchemaEntity | null; onClose: () => void }) {
  const open = !!entity;
  const [values, setValues] = useState<StateValue[]>([]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#000000");
  const [view, setView] = useState<"list" | "cards">("list");

  useEffect(() => {
    if (!entity) return;
    const seed = DEFAULT_ENTITY_STATES[entity.id] ?? [];
    setValues(seed.map((s, i) => ({ id: `${entity.id}-${i}`, name: s.name, color: s.color })));
    setNewName("");
    setNewColor("#000000");
  }, [entity]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const remove = (id: string) => setValues((vs) => vs.filter((v) => v.id !== id));
  const add = () => {
    const name = newName.trim();
    if (!name) return;
    const color =
      newColor && newColor !== "#000000"
        ? newColor
        : STATE_PALETTE[values.length % STATE_PALETTE.length];
    setValues((vs) => [...vs, { id: `${Date.now()}`, name, color }]);
    setNewName("");
    setNewColor("#000000");
  };

  const Icon = entity ? SCHEMA_ICON_MAP[entity.icon] : FileText;
  const iconTone = entity ? SCHEMA_ICON_TONES[entity.type.tone] : "bg-muted text-muted-foreground";

  return createPortal(
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-label="State Configuration"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[460px] flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                iconTone,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold leading-snug tracking-tight text-foreground">
                State Configuration
              </h2>
              <div className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                {entity?.type.label ?? ""}
                {entity ? " · " : ""}
                {entity?.name ?? ""}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
              Configured Values
              <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {values.length}
              </span>
            </div>
            <div className="ml-auto flex items-center rounded-md border border-border bg-background p-0.5">
              <InstantTooltip label="List view">
                <button
                  type="button"
                  aria-label="List view"
                  onClick={() => setView("list")}
                  className={cn(
                    "rounded px-1.5 py-1 transition",
                    view === "list"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <TableProperties className="h-3.5 w-3.5" />
                </button>
              </InstantTooltip>
              <InstantTooltip label="Card view">
                <button
                  type="button"
                  aria-label="Card view"
                  onClick={() => setView("cards")}
                  className={cn(
                    "rounded px-1.5 py-1 transition",
                    view === "cards"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </InstantTooltip>
            </div>
          </div>

          {view === "list" ? (
            <div className="mt-3 space-y-2">
              {values.map((v, i) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition hover:bg-hover"
                >
                  <span className="flex-1 truncate text-[13px] font-medium text-foreground">
                    {v.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: v.color }} />
                    state {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(v.id)}
                    aria-label={`Remove ${v.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-hover hover:text-rose-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {values.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-[12.5px] text-muted-foreground">
                  No states configured yet.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {values.map((v, i) => (
                <div
                  key={v.id}
                  className="group/card relative overflow-hidden rounded-lg border border-border bg-background pl-2.5 pr-2 py-2 transition hover:border-foreground/20 hover:shadow-sm"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-1.5 left-0 w-1 rounded-r"
                    style={{ background: v.color }}
                  />
                  <div className="flex items-start justify-between gap-1 pl-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        state {i + 1}
                      </div>
                      <div className="mt-0.5 truncate text-[12.5px] font-semibold leading-tight text-foreground">
                        {v.name}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(v.id)}
                      aria-label={`Remove ${v.name}`}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition hover:bg-hover hover:text-rose-600 group-hover/card:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              {values.length === 0 && (
                <div className="col-span-2 rounded-xl border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-[12.5px] text-muted-foreground">
                  No states configured yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add New */}
        <div className="border-t border-border bg-card px-5 py-4">
          <div className="text-[13px] font-semibold text-foreground">Add New Value</div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="e.g. in_review, escalated, archived"
              className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <label className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1">
              <span
                className="h-4 w-4 rounded-sm border border-border"
                style={{ background: newColor }}
              />
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-4 w-6 cursor-pointer border-0 bg-transparent p-0"
                aria-label="Pick color"
              />
            </label>
            <button
              type="button"
              onClick={add}
              disabled={!newName.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">
            Press Enter or click Add to create a new value
          </p>
        </div>
      </aside>
    </>,
    document.body,
  );
}

function WorkflowDiagram({ color }: DiagramProps) {
  const { P, PSoft } = getColors(color);
  const nodes = [
    { x: 35, label: "trigger", done: false },
    { x: 95, label: "fetch", done: false },
    { x: 145, label: "process", done: false },
    { x: 195, label: "done", done: true },
  ];
  return (
    <svg viewBox="0 0 230 150" className="h-full w-full p-4">
      <text x="50" y="40" textAnchor="middle" fontSize="7" fill={P} fontWeight="500">
        schedule
      </text>
      <text x="135" y="40" textAnchor="middle" fontSize="7" fill={P} fontWeight="500">
        DB chang · API event
      </text>
      <line x1="35" y1="80" x2="195" y2="80" stroke={PSoft} strokeDasharray="3 3" />
      {nodes.map((n) => (
        <g key={n.label}>
          {n.done ? (
            <>
              <circle cx={n.x} cy="80" r="8" fill={P} fillOpacity="0.18" stroke={P} />
              <circle cx={n.x} cy="80" r="3" fill={P} />
            </>
          ) : (
            <>
              <circle cx={n.x} cy="80" r="6" fill={Card} stroke={PSoft} />
              <circle cx={n.x} cy="80" r="2.2" fill={P} />
            </>
          )}
          <text x={n.x} y="105" textAnchor="middle" fontSize="7" fill={Muted}>
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ApiDiagram({ color }: DiagramProps) {
  const { P, PFaint } = getColors(color);
  return (
    <svg viewBox="0 0 240 150" className="h-full w-full p-4">
      <g stroke={PFaint} strokeDasharray="2 3" fill="none">
        <line x1="55" y1="42" x2="120" y2="72" />
        <line x1="55" y1="100" x2="120" y2="72" />
        <line x1="185" y1="42" x2="120" y2="72" />
        <line x1="185" y1="100" x2="120" y2="72" />
      </g>
      <text x="120" y="22" textAnchor="middle" fontSize="6.5" fill={P} fontWeight="500">
        AOP
      </text>
      <text x="120" y="30" textAnchor="middle" fontSize="6" fill={Muted}>
        orchestrator
      </text>
      <polygon
        points="120,52 142,65 142,88 120,101 98,88 98,65"
        fill={P}
        fillOpacity="0.12"
        stroke={P}
      />
      <circle cx="120" cy="76" r="3" fill={P} />
      {[
        { x: 25, y: 32, t: "CRM", s: "system" },
        { x: 25, y: 90, t: "Agent", s: "peer call" },
        { x: 178, y: 32, t: "ERP", s: "system" },
        { x: 178, y: 90, t: "App", s: "webhook" },
      ].map((b, i) => (
        <g key={i}>
          <text x={b.x + 18} y={b.y + 8} textAnchor="middle" fontSize="7" fill={P} fontWeight="500">
            {b.t}
          </text>
          <text x={b.x + 18} y={b.y + 16} textAnchor="middle" fontSize="6" fill={Muted}>
            {b.s}
          </text>
        </g>
      ))}
      <text x="120" y="120" textAnchor="middle" fontSize="6.5" fill={P} fontWeight="500">
        /v1/agent/invoke
      </text>
    </svg>
  );
}

function AopDiagram({ color }: DiagramProps) {
  const { P, PFaint } = getColors(color);
  const nodes = [
    { x: 72, y: 55, label: "conversation" },
    { x: 148, y: 55, label: "workflow" },
    { x: 110, y: 118, label: "api agent" },
  ];
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full p-4">
      <text x="110" y="18" textAnchor="middle" fontSize="7" fill={Muted}>
        orchestrates · routes · coordinates
      </text>
      <g stroke={PFaint} fill="none" strokeDasharray="2 3">
        <circle cx="110" cy="80" r="42" />
      </g>
      <circle cx="110" cy="80" r="9" fill={P} fillOpacity="0.15" stroke={P} />
      <circle cx="110" cy="80" r="3" fill={P} />
      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r="3.5" fill={P} />
          <text x={n.x} y={n.y + 14} textAnchor="middle" fontSize="6.5" fill={Muted}>
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
