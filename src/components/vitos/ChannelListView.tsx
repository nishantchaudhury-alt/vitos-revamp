import { Fragment, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Database,
  ExternalLink,
  Globe,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
  Workflow,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelDetailsPanel } from "./ChannelDetailsPanel";
import { getChannelType, STATUS_META, TYPE_META, type Agent } from "./AgentsListPage";
import { FLOW_VERSION } from "./ConversationFlowBuilder";

type ColumnDef = {
  id: string;
  label: string;
  sortable?: boolean;
  renderCell?: (val: string) => React.ReactNode;
};

type ListConfig = {
  columns: ColumnDef[];
  rows: Record<string, string>[];
  bannerHint: string;
  createLabel?: string;
};

const LIST_CONFIG: Record<string, ListConfig> = {
  facebook: {
    bannerHint:
      "After a page is connected, open its Edit action to assign an AI agent and memory window. Entries without an agent are marked below.",
    columns: [
      { id: "facebookPage", label: "Facebook Page", sortable: true },
      { id: "instagramPage", label: "Instagram Page", sortable: true },
      { id: "instagramPageId", label: "Instagram Page ID", sortable: true },
      { id: "primaryAgent", label: "Primary Agent", sortable: true },
      { id: "createdDate", label: "Created Date", sortable: true },
    ],
    rows: [
      {
        id: "1",
        facebookPage: "JNE",
        instagramPage: "JNE",
        instagramPageId: "17841461705567620",
        primaryAgent: "Support Bot",
        createdDate: "2026-05-04 11:20:41",
        status: "enabled",
      },
      {
        id: "2",
        facebookPage: "test",
        instagramPage: "Kapture CRM",
        instagramPageId: "17841451617989148",
        primaryAgent: "Sales Assistant",
        createdDate: "2026-05-06 13:44:18",
        status: "enabled",
      },
      {
        id: "3",
        facebookPage: "tets",
        instagramPage: "JNE",
        instagramPageId: "17841461705567620",
        primaryAgent: "—",
        createdDate: "2026-05-08 09:31:52",
        status: "disabled",
      },
      {
        id: "4",
        facebookPage: "JNE",
        instagramPage: "JNE",
        instagramPageId: "17841461705567620",
        primaryAgent: "Blue Collar Inbound Agent",
        createdDate: "2026-05-10 16:12:07",
        status: "enabled",
      },
      {
        id: "5",
        facebookPage: "Page",
        instagramPage: "ecom123",
        instagramPageId: "4356786975643256",
        primaryAgent: "Ecom Concierge",
        createdDate: "2026-05-14 10:48:33",
        status: "enabled",
      },
      {
        id: "6",
        facebookPage: "ecom",
        instagramPage: "ecom123",
        instagramPageId: "4356786975643256",
        primaryAgent: "—",
        createdDate: "2026-05-16 12:05:19",
        status: "disabled",
      },
      {
        id: "7",
        facebookPage: "KapEnergy",
        instagramPage: "KapEnergy",
        instagramPageId: "17841461434558180",
        primaryAgent: "Energy Support",
        createdDate: "2026-05-20 14:27:44",
        status: "enabled",
      },
    ],
  },
  instagram: {
    bannerHint:
      "After an account is connected, open its Edit action to assign an AI agent and memory window. Entries without an agent are marked below.",
    columns: [
      { id: "instagramPage", label: "Instagram Page", sortable: true },
      { id: "instagramPageId", label: "Instagram Page ID", sortable: true },
      { id: "linkedFacebook", label: "Linked Facebook", sortable: true },
      { id: "primaryAgent", label: "Primary Agent", sortable: true },
      { id: "createdDate", label: "Created Date", sortable: true },
    ],
    rows: [
      {
        id: "1",
        instagramPage: "JNE",
        instagramPageId: "17841461705567620",
        linkedFacebook: "JNE",
        primaryAgent: "Support Bot",
        createdDate: "2026-05-04 11:20:41",
        status: "enabled",
      },
      {
        id: "2",
        instagramPage: "Kapture CRM",
        instagramPageId: "17841451617989148",
        linkedFacebook: "test",
        primaryAgent: "Sales Assistant",
        createdDate: "2026-05-06 13:44:18",
        status: "enabled",
      },
      {
        id: "3",
        instagramPage: "ecom123",
        instagramPageId: "4356786975643256",
        linkedFacebook: "Page",
        primaryAgent: "—",
        createdDate: "2026-05-14 10:48:33",
        status: "disabled",
      },
      {
        id: "4",
        instagramPage: "KapEnergy",
        instagramPageId: "17841461434558180",
        linkedFacebook: "KapEnergy",
        primaryAgent: "Energy Support",
        createdDate: "2026-05-20 14:27:44",
        status: "enabled",
      },
    ],
  },
  whatsapp: {
    bannerHint:
      "After a number is connected, open its Edit action to assign an AI agent and memory window. Entries without an agent are marked below.",
    columns: [
      { id: "vendor", label: "Vendor", sortable: true },
      { id: "phone", label: "Phone Number", sortable: true },
      { id: "displayName", label: "Display Name", sortable: true },
      { id: "primaryAgent", label: "Primary Agent", sortable: true },
      { id: "createdDate", label: "Created Date", sortable: true },
    ],
    rows: [
      {
        id: "1",
        vendor: "GUPSHUP",
        phone: "9873731",
        displayName: "—",
        primaryAgent: "Blue Collar Inbound Agent",
        createdDate: "2026-04-29 16:42:03",
        status: "disabled",
      },
      {
        id: "2",
        vendor: "MSG91",
        phone: "916363801414",
        displayName: "Kapture Support",
        primaryAgent: "Support Bot",
        createdDate: "2026-05-07 13:30:55",
        status: "enabled",
      },
      {
        id: "3",
        vendor: "MSG91",
        phone: "123123123",
        displayName: "Kapture Sales",
        primaryAgent: "Sales Assistant",
        createdDate: "2026-05-07 16:03:07",
        status: "enabled",
      },
      {
        id: "4",
        vendor: "MSG91",
        phone: "9123213",
        displayName: "—",
        primaryAgent: "Collections Agent",
        createdDate: "2026-05-07 16:03:39",
        status: "disabled",
      },
      {
        id: "5",
        vendor: "MSG91",
        phone: "12312321",
        displayName: "Test Account",
        primaryAgent: "Test Agent",
        createdDate: "2026-05-07 16:11:08",
        status: "enabled",
      },
      {
        id: "6",
        vendor: "MSG91",
        phone: "919110637500",
        displayName: "Kapture Lending",
        primaryAgent: "Lending Agent",
        createdDate: "2026-06-02 11:39:27",
        status: "enabled",
      },
    ],
  },
  twilio: {
    bannerHint:
      "After a number is connected, open its Edit action to assign an AI agent and memory window. Entries without an agent are marked below.",
    columns: [
      { id: "accountSid", label: "Account SID", sortable: true },
      { id: "phone", label: "Phone Number", sortable: true },
      { id: "primaryAgent", label: "Primary Agent", sortable: true },
      { id: "createdDate", label: "Created Date", sortable: true },
    ],
    rows: [
      {
        id: "1",
        accountSid: "AC1234••••7890",
        phone: "+1 415 555 0100",
        primaryAgent: "Support Bot",
        createdDate: "2026-05-04 11:20:41",
        status: "enabled",
      },
      {
        id: "2",
        accountSid: "AC9876••••4321",
        phone: "+1 415 555 0142",
        primaryAgent: "—",
        createdDate: "2026-05-08 09:31:52",
        status: "disabled",
      },
    ],
  },
  chat: {
    bannerHint:
      "After a chat channel is created, open a row to configure its agent, domain and widget settings.",
    columns: [
      { id: "chatName", label: "Chat Name", sortable: true },
      { id: "channelId", label: "Channel ID", sortable: true },
      { id: "userType", label: "User Type", sortable: true },
      { id: "deploymentStatus", label: "Deployment Status", sortable: true },
    ],
    rows: [
      {
        id: "1",
        chatName: "Customer Support Chat",
        channelId: "chat_support_india",
        domain: "support.kapturecrm.com",
        widgetId: "chat_A93FZ",
        userType: "Registered User",
        deploymentStatus: "Active",
        createdDate: "2026-05-04 11:20:41",
        status: "enabled",
      },
      {
        id: "2",
        chatName: "Sales Concierge",
        channelId: "chat_sales_web",
        domain: "www.kapturecrm.com",
        widgetId: "chat_B72PQ",
        userType: "Registered User",
        deploymentStatus: "Active",
        createdDate: "2026-05-16 12:05:19",
        status: "enabled",
      },
      {
        id: "3",
        chatName: "Guest Helpdesk",
        channelId: "chat_guest_help",
        domain: "help.kapturecrm.com",
        widgetId: "chat_C84LN",
        userType: "Guest User",
        deploymentStatus: "Not deployed",
        createdDate: "2026-05-18 09:24:12",
        status: "enabled",
      },
    ],
  },
  website: {
    bannerHint:
      "After a website is connected, open its Edit action to assign an AI agent and memory window. Entries without an agent are marked below.",
    columns: [
      { id: "websiteName", label: "Website Name", sortable: true },
      { id: "domain", label: "Website URL", sortable: true },
      { id: "userType", label: "User Type", sortable: true },
    ],
    rows: [
      {
        id: "1",
        websiteName: "kaptureqa",
        domain: "autoqa.com",
        userType: "Registered User",
        widgetId: "widget_A93FZ",
        primaryAgent: "Website Concierge",
        createdDate: "2026-05-04 11:20:41",
        status: "enabled",
      },
      {
        id: "2",
        websiteName: "Website qa",
        domain: "www.abc.com",
        userType: "Registered User",
        widgetId: "widget_B72PQ",
        primaryAgent: "Ecom Concierge",
        createdDate: "2026-05-16 12:05:19",
        status: "enabled",
      },
      {
        id: "3",
        websiteName: "newqa",
        domain: "autoqa.com",
        userType: "Guest User",
        widgetId: "widget_C84LN",
        primaryAgent: "Website Concierge",
        createdDate: "2026-05-18 09:24:12",
        status: "enabled",
      },
      {
        id: "4",
        websiteName: "test",
        domain: "weee.com",
        userType: "Registered User",
        widgetId: "widget_D19MK",
        primaryAgent: "Support Bot",
        createdDate: "2026-05-21 12:44:32",
        status: "enabled",
      },
      {
        id: "5",
        websiteName: "Arun Manickam R",
        domain: "https://rscviutwwgfcpbsdvnib.supabase.co/rest/v1/AVAIL_HOTEL",
        userType: "Guest User",
        widgetId: "widget_E53RP",
        primaryAgent: "—",
        createdDate: "2026-05-23 08:16:05",
        status: "enabled",
      },
      {
        id: "6",
        websiteName: "New website",
        domain: "web.com",
        userType: "Guest User",
        widgetId: "widget_F67QX",
        primaryAgent: "Website Concierge",
        createdDate: "2026-05-25 14:31:49",
        status: "enabled",
      },
      {
        id: "7",
        websiteName: "new website",
        domain: "https://democrm.kapturecrm.com/",
        userType: "Registered User",
        widgetId: "widget_G28VT",
        primaryAgent: "Support Bot",
        createdDate: "2026-05-27 10:09:18",
        status: "enabled",
      },
      {
        id: "8",
        websiteName: "new website",
        domain: "https://democrm.kapturecrm.com/",
        userType: "Guest User",
        widgetId: "widget_H74JW",
        primaryAgent: "—",
        createdDate: "2026-05-29 15:52:03",
        status: "enabled",
      },
      {
        id: "9",
        websiteName: "testtoday",
        domain: "https://democrm.kapturecrm.com/",
        userType: "Guest User",
        widgetId: "widget_J31BD",
        primaryAgent: "Sales Assistant",
        createdDate: "2026-06-02 11:47:26",
        status: "enabled",
      },
      {
        id: "10",
        websiteName: "testtmrw",
        domain: "https://democrm.kapturecrm.com/",
        userType: "Guest User",
        widgetId: "widget_K95CA",
        primaryAgent: "Website Concierge",
        createdDate: "2026-06-03 09:18:44",
        status: "enabled",
      },
    ],
  },
  email: {
    bannerHint:
      "After an email inbox is connected, open its Edit action to configure routing and authentication settings.",
    createLabel: "Create New",
    columns: [
      { id: "email", label: "Email", sortable: true },
      { id: "personName", label: "Account Name", sortable: true },
      { id: "host", label: "Host", sortable: true },
      { id: "primaryAgent", label: "Primary Agent", sortable: true },
      { id: "createdDate", label: "Created Date", sortable: true },
    ],
    rows: [
      {
        id: "1",
        email: "support@europa.kapdesk.com",
        personName: "Support",
        forwardId: "",
        status: "enabled",
        host: "Gmail",
        authMethod: "Password",
        primaryAgent: "Support Bot",
        createdDate: "2026-05-04 11:20:41",
        mailStore: "IMAP",
        mailboxFolder: "Inbox",
      },
      {
        id: "2",
        email: "support@mail.kapture.tech",
        personName: "Support SES",
        forwardId: "support@mail.kapture.tech",
        status: "enabled",
        host: "SES",
        authMethod: "Forwarding",
        primaryAgent: "—",
        createdDate: "2026-05-06 13:44:18",
        mailStore: "IMAPS",
        mailboxFolder: "Inbox",
        hostName: "imap.kapture.tech",
        protocol: "993",
      },
      {
        id: "3",
        email: "syncTestInd@test.mail.kapture.tech",
        personName: "testsync2",
        forwardId: "syncTestInd@test.mail.kapture.tech",
        status: "enabled",
        host: "SES",
        authMethod: "Forwarding",
        primaryAgent: "—",
        createdDate: "2026-05-08 09:31:52",
        mailStore: "IMAPS",
        mailboxFolder: "Inbox",
        hostName: "imap.kapture.tech",
        protocol: "993",
      },
      {
        id: "4",
        email: "crmkapturetes@airtelbank.com",
        personName: "test",
        forwardId: "",
        status: "enabled",
        host: "Gmail",
        authMethod: "OAuth 2.0",
        primaryAgent: "Sales Assistant",
        createdDate: "2026-05-10 16:12:07",
        mailStore: "IMAP",
        mailboxFolder: "Inbox",
        clientId: "104287913245-abc123def456.apps.googleusercontent.com",
      },
      {
        id: "5",
        email: "crmtestother@airtelbank.com",
        personName: "crmtestother",
        forwardId: "",
        status: "enabled",
        host: "Outlook",
        authMethod: "Password",
        primaryAgent: "Support Bot",
        createdDate: "2026-05-14 10:48:33",
        mailStore: "IMAP",
        mailboxFolder: "Inbox",
      },
      {
        id: "6",
        email: "crmtestwecare@airtelbank.com",
        personName: "wecare",
        forwardId: "crmtestwecare-fwd@airtelbank.com",
        status: "enabled",
        host: "Custom",
        authMethod: "Password",
        primaryAgent: "Collections Agent",
        createdDate: "2026-05-16 12:05:19",
        mailStore: "IMAP",
        mailboxFolder: "Inbox",
        hostName: "imap.airtelbank.com",
        protocol: "993",
      },
      {
        id: "7",
        email: "kapturetesting9@kapturetesting9.kapdesk.com",
        personName: "RTEST",
        forwardId: "",
        status: "enabled",
        host: "Gmail",
        authMethod: "Password",
        primaryAgent: "—",
        createdDate: "2026-05-20 14:27:44",
        mailStore: "IMAP",
        mailboxFolder: "Inbox",
      },
    ],
  },
};

const FALLBACK: ListConfig = {
  bannerHint:
    "After a connection is created, open its Edit action to assign an AI agent and memory window. Entries without an agent are marked below.",
  columns: [
    { id: "name", label: "Name", sortable: true },
    { id: "identifier", label: "Identifier", sortable: true },
    { id: "primaryAgent", label: "Primary Agent", sortable: true },
    { id: "createdDate", label: "Created Date", sortable: true },
  ],
  rows: [],
};

export function ChannelListView({
  channelId,
  channelName,
  onBack,
  onCreate,
  onCreateIntegration,
  onViewWorkflow,
  initialWebsite,
  workflowAgents = [],
  extraRows = [],
  highlightRowId = null,
}: {
  channelId: string;
  channelName: string;
  onBack: () => void;
  onCreate: () => void;
  onCreateIntegration?: () => void;
  onViewWorkflow?: (workflow: { id: string; name: string }) => void;
  initialWebsite?: { name: string; domain: string; workflow?: DeploymentSource } | null;
  workflowAgents?: Agent[];
  extraRows?: Record<string, string>[];
  highlightRowId?: string | null;
}) {
  const config = LIST_CONFIG[channelId] ?? FALLBACK;
  const [deploymentSource, setDeploymentSource] = useState<DeploymentSource | null>(
    channelId === "website" ? (initialWebsite?.workflow ?? null) : null,
  );
  const [fromBuilder, setFromBuilder] = useState(
    channelId === "website" && Boolean(initialWebsite?.workflow),
  );
  const configuredInitialWebsite =
    channelId === "website" && initialWebsite
      ? (config.rows.find(
          (row) => row.websiteName === initialWebsite.name && row.domain === initialWebsite.domain,
        ) ?? config.rows.find((row) => row.websiteName === initialWebsite.name))
      : undefined;
  const createdInitialWebsite =
    channelId === "website" && initialWebsite && !configuredInitialWebsite
      ? {
          id: `deployed-${initialWebsite.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          websiteName: initialWebsite.name,
          domain: initialWebsite.domain,
          userType: "Guest User",
          widgetId: "Pending",
          primaryAgent: "—",
          versionHistory: "none",
          createdDate: new Date().toISOString().slice(0, 19).replace("T", " "),
          status: "enabled",
        }
      : undefined;
  const initialRows = [
    ...(createdInitialWebsite ? [createdInitialWebsite] : []),
    ...extraRows,
    ...config.rows,
  ];
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const [rows, setRows] = useState<Record<string, string>[]>(initialRows);
  const [deleteTarget, setDeleteTarget] = useState<Record<string, string> | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Record<string, string> | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<Record<string, string> | null>(
    configuredInitialWebsite ?? createdInitialWebsite ?? null,
  );

  const rowLabel = (r: Record<string, string>) =>
    r.displayName && r.displayName !== "—"
      ? r.displayName
      : (r[config.columns[0].id] ?? "this configuration");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = list.filter((r) =>
        config.columns.some((c) => (r[c.id] ?? "").toLowerCase().includes(q)),
      );
    }
    if (sort) {
      list = [...list].sort((a, b) => {
        const av = a[sort.id] ?? "";
        const bv = b[sort.id] ?? "";
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return list;
  }, [config, rows, query, sort]);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setRows((rs) => rs.filter((x) => x.id !== deleteTarget.id));
    if (selectedWebsite?.id === deleteTarget.id) setSelectedWebsite(null);
    setDeleteTarget(null);
  };

  const gridTemplate = `${config.columns
    .map((_, index) => (index === 0 ? "minmax(220px,1.1fr)" : "minmax(180px,1fr)"))
    .join(" ")}`;

  const toggleSort = (id: string) => {
    setSort((cur) => {
      if (cur?.id !== id) return { id, dir: "asc" };
      if (cur.dir === "asc") return { id, dir: "desc" };
      return null;
    });
  };

  if (channelId === "website" && selectedWebsite) {
    return (
      <>
        <WebsiteConfigurationView
          row={selectedWebsite}
          deploymentSource={deploymentSource}
          fromBuilder={fromBuilder}
          workflowAgents={workflowAgents}
          onSourceChange={setDeploymentSource}
          onBack={() => {
            setDeploymentSource(null);
            setFromBuilder(false);
            setSelectedWebsite(null);
          }}
          onDelete={() => setDeleteTarget(selectedWebsite)}
          onCreateIntegration={onCreateIntegration}
          onViewWorkflow={onViewWorkflow}
          onSave={(values) => {
            setRows((current) =>
              current.map((row) => (row.id === selectedWebsite.id ? { ...row, ...values } : row)),
            );
            setDeploymentSource(null);
            setFromBuilder(false);
            setSelectedWebsite(null);
          }}
        />

        {deleteTarget && (
          <ModalShell onClose={() => setDeleteTarget(null)}>
            <DeleteConfirmation
              label={rowLabel(deleteTarget)}
              onCancel={() => setDeleteTarget(null)}
              onConfirm={confirmDelete}
            />
          </ModalShell>
        )}
      </>
    );
  }

  return (
    <div className="w-full">
      <nav aria-label="Channel list breadcrumb" className="mb-4 flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={onBack}
          className="font-medium text-muted-foreground transition hover:text-[#B22257] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
        >
          Channels
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
        <h1 className="font-medium text-[#B22257]">{channelName}</h1>
      </nav>

      <section
        aria-label={`${channelName} connections`}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      >
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center">
          <label className="flex h-9 w-full items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 shadow-sm transition focus-within:border-[#B22257]/40 focus-within:bg-card focus-within:ring-2 focus-within:ring-[#B22257]/10 sm:w-64">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">Search {channelName} connections</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#B22257] bg-card px-3.5 text-[13px] font-medium text-[#B22257] transition hover:bg-[#FDF3F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35 sm:ml-auto"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {config.createLabel ?? "Create New"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]" role="table" aria-label={`${channelName} connection list`}>
            <div
              role="row"
              className="grid items-center gap-4 border-b border-border bg-muted/25 px-4 py-3"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {config.columns.map((column) => {
                const active = sort?.id === column.id;
                return (
                  <div key={column.id} role="columnheader">
                    <button
                      type="button"
                      onClick={() => column.sortable && toggleSort(column.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.11em] text-muted-foreground transition",
                        column.sortable ? "hover:text-[#B22257]" : "cursor-default",
                      )}
                    >
                      {column.label}
                      {column.sortable && (
                        <span className="flex flex-col leading-none" aria-hidden="true">
                          <ChevronUp
                            className={cn(
                              "h-2.5 w-2.5",
                              active && sort?.dir === "asc"
                                ? "text-[#B22257]"
                                : "text-muted-foreground/45",
                            )}
                          />
                          <ChevronDown
                            className={cn(
                              "-mt-0.5 h-2.5 w-2.5",
                              active && sort?.dir === "desc"
                                ? "text-[#B22257]"
                                : "text-muted-foreground/45",
                            )}
                          />
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div role="rowgroup" className="divide-y divide-border">
              {filtered.map((row, rowIndex) => {
                const firstValue = row[config.columns[0].id] ?? channelName;
                const openRow = () => {
                  if (channelId === "website") {
                    setSelectedWebsite(row);
                  } else {
                    setDetailsTarget(row);
                  }
                };
                return (
                  <div
                    key={row.id}
                    role="row"
                    tabIndex={0}
                    onClick={openRow}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openRow();
                      }
                    }}
                    className={cn(
                      "group grid cursor-pointer items-center gap-4 px-4 py-2 transition hover:bg-muted/20 focus:outline-none focus-visible:bg-[#FDF3F7]/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B22257]/25",
                      row.id === highlightRowId && "bg-[#FDF3F7]/70 hover:bg-[#FDF3F7]",
                    )}
                    style={{ gridTemplateColumns: gridTemplate }}
                  >
                    {config.columns.map((column, columnIndex) => (
                      <div
                        key={column.id}
                        role="cell"
                        className={cn(
                          "min-w-0 text-[13px] text-foreground",
                          columnIndex === 0 && "font-medium",
                        )}
                      >
                        {columnIndex === 0 ? (
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold uppercase",
                                rowIndex % 3 === 0
                                  ? "border-[#F7CFDD] bg-[#FDF3F7] text-[#B22257]"
                                  : "border-border bg-muted/60 text-muted-foreground",
                              )}
                              aria-hidden="true"
                            >
                              {row.logoUrl ? (
                                <img
                                  src={row.logoUrl}
                                  alt=""
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                firstValue.trim().charAt(0) || "•"
                              )}
                            </span>
                            <span className="truncate">
                              {column.renderCell
                                ? column.renderCell(row[column.id] ?? "")
                                : row[column.id]}
                            </span>
                          </div>
                        ) : (
                          <span className="block truncate" title={row[column.id] ?? ""}>
                            {column.renderCell
                              ? column.renderCell(row[column.id] ?? "")
                              : row[column.id]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="px-4 py-14 text-center text-sm text-muted-foreground">
                  No matching {channelName.toLowerCase()} connections found.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Delete confirm */}
      {deleteTarget && (
        <ModalShell onClose={() => setDeleteTarget(null)}>
          <DeleteConfirmation
            label={rowLabel(deleteTarget)}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        </ModalShell>
      )}

      <ChannelDetailsPanel
        open={!!detailsTarget}
        channelId={channelId}
        channelName={channelName}
        row={detailsTarget}
        initialMode="view"
        onClose={() => setDetailsTarget(null)}
        onSave={(vals) => {
          if (!detailsTarget) return;
          setRows((rs) => rs.map((x) => (x.id === detailsTarget.id ? { ...x, ...vals } : x)));
        }}
      />
    </div>
  );
}

const VISUAL_BOTS = [
  {
    id: "testing",
    name: "testing",
    description: "testing",
    updated: "14-08-2026",
    created: "10-09-2025",
  },
  {
    id: "green",
    name: "Green",
    description: "Green UI",
    updated: "05-08-2026",
    created: "10-09-2025",
  },
  {
    id: "unnamed",
    name: "Unnamed",
    description: "Default website chat",
    updated: "13-07-2026",
    created: "10-09-2025",
  },
];

const WEBSITE_DEPLOYMENTS = [
  {
    id: "1",
    name: "SK finance chatbot Final",
    flowId: "95f678fb-1fdc-48b3-a5bb-59011354875a",
    version: "0.1",
    deployment: "100%",
    capabilities: ["Fetch", "Search"],
  },
  {
    id: "2",
    name: "Customer Support Assistant",
    flowId: "42b933a1-09d5-4fb4-a7b9-44d61e9670ca",
    version: "1.2",
    deployment: "75%",
    capabilities: ["Fetch", "Search", "Save"],
  },
  {
    id: "3",
    name: "Lead Qualification Flow",
    flowId: "781c8e0d-b4bc-45fa-9031-1d8f4bb00e76",
    version: "2.0",
    deployment: "50%",
    capabilities: ["Search", "Save"],
  },
  {
    id: "4",
    name: "Booking Concierge Beta",
    flowId: "d10ff327-a27e-4924-8c3d-c8709859db68",
    version: "0.8",
    deployment: "25%",
    capabilities: ["Fetch"],
  },
  {
    id: "5",
    name: "After-hours Routing Test",
    flowId: "f58c37f4-40cd-4de3-b18e-32f9955bf072",
    version: "0.3",
    deployment: "10%",
    capabilities: [],
  },
];

const INTEGRATION_APIS = [
  {
    id: "search-customers",
    name: "Search customers",
    method: "GET",
    path: "/v1/customers/search",
    version: "v2.4.1",
    access: "Read",
    binding: "REST",
    owner: "Platform",
    calls: "18,429",
  },
  {
    id: "triage-ticket",
    name: "Triage support ticket",
    method: "POST",
    path: "/v1/tickets/{id}/triage",
    version: "v3.0.0",
    access: "Write",
    binding: "Agent as API",
    owner: "Support",
    calls: "6,210",
  },
  {
    id: "issue-refund",
    name: "Issue refund",
    method: "POST",
    path: "/v1/orders/{id}/refund",
    version: "v1.8.2",
    access: "Destructive",
    binding: "Workflow",
    owner: "Finance",
    calls: "312",
  },
  {
    id: "stripe-charge",
    name: "Create Stripe charge",
    method: "POST",
    path: "/v1/payments/charges",
    version: "v1.2.0",
    access: "Write",
    binding: "REST",
    owner: "Payments",
    calls: "4,821",
  },
  {
    id: "query-customers",
    name: "Query customer table",
    method: "GET",
    path: "/v1/db/customers/query",
    version: "v1.6.0",
    access: "Read",
    binding: "Database",
    owner: "Data Platform",
    calls: "9,140",
  },
  {
    id: "upsert-account",
    name: "Upsert account record",
    method: "POST",
    path: "/v1/db/accounts/upsert",
    version: "v1.2.3",
    access: "Write",
    binding: "Database",
    owner: "Data Platform",
    calls: "2,310",
  },
  {
    id: "render-invoice",
    name: "Render invoice PDF",
    method: "POST",
    path: "/v1/functions/render-invoice",
    version: "v1.1.0",
    access: "Write",
    binding: "Cloud Function",
    owner: "Finance",
    calls: "1,876",
  },
];

type WebsiteDeployment = (typeof WEBSITE_DEPLOYMENTS)[number];

export type DeploymentSource = { id: string; name: string; version: string };

function nextVersion(versions: string[]) {
  const parsed = versions.map((version) => version.split(".").map((part) => Number(part) || 0));
  const highest = parsed.reduce(
    (best, current) => {
      for (let i = 0; i < Math.max(best.length, current.length); i += 1) {
        const a = best[i] ?? 0;
        const b = current[i] ?? 0;
        if (a !== b) return b > a ? current : best;
      }
      return best;
    },
    parsed[0] ?? [1, 0],
  );
  const bumped = [...highest];
  bumped[bumped.length - 1] += 1;
  return bumped.join(".");
}

function deploymentsFor(source: DeploymentSource | null, withHistory = true): WebsiteDeployment[] {
  if (!source) return [];
  const current: WebsiteDeployment = {
    id: `${source.id}:current`,
    name: source.name,
    flowId: source.id,
    version: source.version,
    deployment: "100%",
    capabilities: [],
  };
  if (!withHistory) return [current];
  const otherVersions = WEBSITE_DEPLOYMENTS.map((deployment) => ({
    ...deployment,
    id: `${source.id}:${deployment.id}`,
    name: source.name,
    flowId: source.id,
  }));
  return [current, ...otherVersions];
}

function WebsiteDeploymentConfiguration({
  deployment,
  assignedApi,
  onSelectIntegration,
}: {
  deployment: WebsiteDeployment;
  assignedApi?: (typeof INTEGRATION_APIS)[number];
  onSelectIntegration: () => void;
}) {
  const connected = Boolean(assignedApi);
  const badge = connected
    ? { label: "Connected", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" }
    : { label: "Required to deploy", className: "bg-amber-50 text-amber-700 ring-amber-100" };

  const description = connected
    ? "This workflow reads customer context through the integration below."
    : "Select a published integration to give this workflow access to customer context.";

  return (
    <div className="relative overflow-hidden bg-card">
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r to-transparent",
          connected ? "from-emerald-100/70" : "from-amber-100/70",
        )}
      />
      <div className="relative flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              connected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
            )}
          >
            {connected ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Database className="h-4 w-4" aria-hidden="true" />
            )}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[13px] font-semibold text-foreground">Connect customer data</h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                  badge.className,
                )}
              >
                {badge.label}
              </span>
            </div>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              For <span className="font-medium text-foreground">{deployment.name}</span>
            </p>
            <p className="mt-1.5 max-w-xl text-[11.5px] leading-relaxed text-muted-foreground">
              {description}
            </p>

            {assignedApi ? (
              <div className="mt-2.5 inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-muted/25 px-2.5 py-1.5">
                <span className="rounded bg-foreground/90 px-1.5 py-0.5 text-[9px] font-semibold text-background">
                  {assignedApi.method}
                </span>
                <span className="truncate text-[11.5px] font-medium text-foreground">
                  {assignedApi.name}
                </span>
                <span className="hidden truncate font-mono text-[10.5px] text-muted-foreground sm:inline">
                  {assignedApi.path}
                </span>
              </div>
            ) : (
              deployment.capabilities.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Uses
                  </span>
                  {deployment.capabilities.map((capability) => (
                    <span
                      key={capability}
                      className="rounded-md border border-border bg-muted/25 px-1.5 py-0.5 text-[10px] font-medium text-foreground"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onSelectIntegration}
          aria-label={`${connected ? "Change" : "Choose"} customer data integration for ${deployment.name}`}
          className={cn(
            "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg px-3.5 text-[11.5px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35 sm:self-center",
            connected
              ? "border border-border bg-card text-foreground hover:bg-muted/40"
              : "bg-[#B22257] text-white shadow-sm hover:bg-[#971D49]",
          )}
        >
          {connected ? "Change integration" : "Choose integration"}
          {!connected && <ArrowRight className="h-3 w-3" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

function WorkflowEmptyIllustration() {
  return (
    <svg
      viewBox="0 0 320 128"
      fill="none"
      aria-hidden="true"
      className="h-auto w-[300px] max-w-full"
    >
      <style>{`
        .wf-flow { stroke-dasharray: 3 4; animation: wf-flow 1.6s linear infinite; }
        @keyframes wf-flow { to { stroke-dashoffset: -14; } }
        @media (prefers-reduced-motion: reduce) { .wf-flow { animation: none; } }
      `}</style>
      <defs>
        <pattern id="wf-dots" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" className="fill-muted-foreground/25" />
        </pattern>
        <radialGradient id="wf-fade" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="wf-mask">
          <rect width="320" height="128" fill="url(#wf-fade)" />
        </mask>
      </defs>
      <rect width="320" height="128" fill="url(#wf-dots)" mask="url(#wf-mask)" />

      <path d="M87 64H121" className="wf-flow stroke-muted-foreground/45" strokeWidth="1.25" />
      <path d="M199 64H233" className="wf-flow stroke-muted-foreground/45" strokeWidth="1.25" />

      <rect x="12.5" y="44.5" width="72" height="40" rx="8" className="fill-card stroke-border" />
      <rect x="20" y="52" width="12" height="12" rx="3" fill="#E8F5EE" />
      <path d="M27 54.5l-3 4h3l-1 3 3-4h-3l1-3z" fill="#2F8F5B" />
      <rect x="37" y="53.5" width="38" height="4" rx="2" className="fill-muted" />
      <rect x="37" y="60.5" width="24" height="3" rx="1.5" className="fill-muted/70" />
      <rect x="20" y="70" width="32" height="8" rx="4" fill="#E6F1FB" />
      <circle cx="84.5" cy="64.5" r="2.75" fill="#B22257" />

      <rect
        x="124.5"
        y="30.5"
        width="72"
        height="68"
        rx="10"
        fill="#FDF3F7"
        stroke="#B22257"
        strokeOpacity="0.45"
        strokeDasharray="4 3"
      />
      <circle
        cx="160.5"
        cy="64.5"
        r="12"
        className="fill-card"
        stroke="#B22257"
        strokeOpacity="0.35"
      />
      <path d="M160.5 59v11M155 64.5h11" stroke="#B22257" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="124.5" cy="64.5" r="2.75" fill="#3B82F6" />
      <circle cx="196.5" cy="64.5" r="2.75" fill="#B22257" />

      <rect x="236.5" y="40.5" width="72" height="48" rx="8" className="fill-card stroke-border" />
      <path d="M236.5 50.5h72" className="stroke-border" />
      <circle cx="243.5" cy="45.5" r="1.5" className="fill-muted-foreground/30" />
      <circle cx="248.5" cy="45.5" r="1.5" className="fill-muted-foreground/30" />
      <circle cx="253.5" cy="45.5" r="1.5" className="fill-muted-foreground/30" />
      <circle cx="257.5" cy="69.5" r="8" fill="#FDF3F7" stroke="#B22257" strokeOpacity="0.55" />
      <ellipse cx="257.5" cy="69.5" rx="3.25" ry="8" stroke="#B22257" strokeOpacity="0.55" />
      <path d="M249.5 69.5h16" stroke="#B22257" strokeOpacity="0.55" />
      <rect x="270" y="63.5" width="30" height="4" rx="2" className="fill-muted" />
      <rect x="270" y="70.5" width="20" height="3" rx="1.5" className="fill-muted/70" />
      <circle cx="236.5" cy="64.5" r="2.75" fill="#3B82F6" />
    </svg>
  );
}

function WebsiteConfigurationView({
  row,
  deploymentSource,
  fromBuilder,
  workflowAgents,
  onSourceChange,
  onBack,
  onDelete,
  onSave,
  onCreateIntegration,
  onViewWorkflow,
}: {
  row: Record<string, string>;
  deploymentSource: DeploymentSource | null;
  fromBuilder: boolean;
  workflowAgents: Agent[];
  onSourceChange: (source: DeploymentSource | null) => void;
  onBack: () => void;
  onDelete: () => void;
  onSave: (values: Record<string, string>) => void;
  onCreateIntegration?: () => void;
  onViewWorkflow?: (workflow: { id: string; name: string }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState<{
    websiteName: string;
    domain: string;
    logoName: string;
    logoUrl: string;
  } | null>(null);
  const [websiteName, setWebsiteName] = useState(row.websiteName ?? "Website");
  const [domain, setDomain] = useState(row.domain ?? "");
  const userType = row.userType ?? "Guest User";
  const [logoName, setLogoName] = useState(row.logoName ?? "");
  const [logoUrl, setLogoUrl] = useState(row.logoUrl ?? "");
  const [visualBot, setVisualBot] = useState(row.visualBot ?? "testing");
  const withHistory = row.versionHistory !== "none";
  const [addedVersions, setAddedVersions] = useState<WebsiteDeployment[]>([]);
  const deployments = useMemo(() => {
    const [current, ...history] = deploymentsFor(deploymentSource, withHistory);
    if (!current) return [];
    const added = addedVersions
      .filter((version) => version.flowId === deploymentSource?.id)
      .reverse();
    const percent = (deployment: WebsiteDeployment) => Number.parseInt(deployment.deployment) || 0;
    return [current, ...added, ...history].sort((a, b) => percent(b) - percent(a));
  }, [addedVersions, deploymentSource, withHistory]);
  const [selectedDeployment, setSelectedDeployment] = useState(row.selectedDeployment ?? "");
  const toggleDeployment = (id: string) =>
    setSelectedDeployment((current) => (current === id ? "" : id));
  const [deployedDeployment, setDeployedDeployment] = useState(row.deployedDeployment ?? "");
  const [deployedFlow, setDeployedFlow] = useState({
    name: row.deployedFlowName ?? "",
    version: row.deployedFlowVersion ?? "",
  });
  const deployVersion = (deployment: WebsiteDeployment) => {
    setDeployedDeployment(deployment.id);
    setDeployedFlow({ name: deployment.name, version: deployment.version });
  };
  const [workflowPickerOpen, setWorkflowPickerOpen] = useState(false);
  const [workflowQuery, setWorkflowQuery] = useState("");
  const [workflowDraft, setWorkflowDraft] = useState("");
  const [replaceTarget, setReplaceTarget] = useState<WebsiteDeployment | null>(null);
  const [apiConfigOpen, setApiConfigOpen] = useState(false);
  const [apiQuery, setApiQuery] = useState("");
  const [apiFilter, setApiFilter] = useState<"all" | "rest" | "database" | "cloud" | "agent">(
    "all",
  );
  const [apiDraft, setApiDraft] = useState("");
  const [allocationTarget, setAllocationTarget] = useState<WebsiteDeployment | null>(null);
  const [allocationDraft, setAllocationDraft] = useState(100);
  const [deploymentAllocations, setDeploymentAllocations] = useState<Record<string, string>>(() => {
    try {
      if (row.deploymentAllocations) return JSON.parse(row.deploymentAllocations);
    } catch {
      // Fall back to the prototype defaults when stored allocation data is invalid.
    }
    return Object.fromEntries(
      WEBSITE_DEPLOYMENTS.map((deployment) => [deployment.id, deployment.deployment]),
    );
  });
  const [apiAssignments, setApiAssignments] = useState<Record<string, string>>(() => {
    try {
      return row.apiAssignments ? JSON.parse(row.apiAssignments) : {};
    } catch {
      return {};
    }
  });
  const domainHref = /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;
  const flowLive =
    Boolean(deploymentSource) && deployedDeployment.startsWith(`${deploymentSource?.id}:`);
  const liveElsewhere = Boolean(deployedDeployment) && !flowLive;
  const openWorkflowPicker = () => {
    setWorkflowDraft(deploymentSource?.id ?? "");
    setWorkflowQuery("");
    setWorkflowPickerOpen(true);
  };
  const filteredWorkflows = workflowAgents.filter((agent) =>
    agent.name.toLowerCase().includes(workflowQuery.trim().toLowerCase()),
  );
  const backToBuilder = () => {
    if (deploymentSource)
      onViewWorkflow?.({ id: deploymentSource.id, name: deploymentSource.name });
  };
  const startEditing = () => {
    setEditSnapshot({ websiteName, domain, logoName, logoUrl });
    setEditing(true);
  };
  const cancelEditing = () => {
    if (editSnapshot) {
      setWebsiteName(editSnapshot.websiteName);
      setDomain(editSnapshot.domain);
      setLogoName(editSnapshot.logoName);
      setLogoUrl(editSnapshot.logoUrl);
    }
    setEditing(false);
  };
  const selectedDeploymentDetails = deployments.find(
    (deployment) => deployment.id === selectedDeployment,
  );
  const selectedApiId = selectedDeployment ? apiAssignments[selectedDeployment] : "";
  const selectedApiDetails = INTEGRATION_APIS.find((api) => api.id === selectedApiId);
  const filteredApis = INTEGRATION_APIS.filter((api) => {
    const matchesQuery = `${api.name} ${api.path} ${api.binding} ${api.owner}`
      .toLowerCase()
      .includes(apiQuery.trim().toLowerCase());
    const matchesFilter =
      apiFilter === "all" ||
      (apiFilter === "rest" && api.binding === "REST") ||
      (apiFilter === "database" && api.binding === "Database") ||
      (apiFilter === "cloud" && api.binding === "Cloud Function") ||
      (apiFilter === "agent" && api.binding === "Agent as API");
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="w-full">
      <nav
        aria-label="Website configuration breadcrumb"
        className="mb-4 flex items-center gap-2 text-sm"
      >
        {fromBuilder && deploymentSource ? (
          <>
            <span className="font-medium text-muted-foreground">AI Agents</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
            <button
              type="button"
              onClick={backToBuilder}
              className="max-w-[240px] truncate font-medium text-muted-foreground transition hover:text-[#B22257] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
            >
              {deploymentSource.name}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onBack}
            className="font-medium text-muted-foreground transition hover:text-[#B22257] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
          >
            Channels
          </button>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
        <span className="font-medium text-[#B22257]">Website</span>
      </nav>

      <section className="flex min-h-[calc(100vh-8.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {fromBuilder && deploymentSource && (
              <button
                type="button"
                onClick={backToBuilder}
                aria-label="Back to builder"
                title="Back to builder"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:text-[#B22257] hover:border-[#B22257]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
            <h1 className="text-[16px] font-semibold text-foreground">Website Configuration</h1>
          </div>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete website configuration"
            title="Delete"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#B22257] bg-card text-[#B22257] transition hover:bg-[#FDF3F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-6 p-4 sm:p-5">
          <section aria-labelledby="website-overview-heading">
            <header className="mb-2.5">
              <div>
                <h2
                  id="website-overview-heading"
                  className="text-[14px] font-semibold text-foreground"
                >
                  Overview
                </h2>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  Review and update this website integration.
                </p>
              </div>
            </header>

            {editing ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-[14px] font-semibold text-foreground">Edit details</h3>

                <div className="mt-4 flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-[#FDF3F7] text-[#B22257]">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Website logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Globe className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-foreground">Logo</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                      {logoName || "PNG, JPG or SVG. Square images work best."}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12px] font-medium text-foreground transition hover:border-[#B22257]/40 hover:text-[#B22257] focus-within:ring-2 focus-within:ring-[#B22257]/35">
                        <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
                        {logoUrl ? "Replace" : "Upload logo"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml"
                          className="sr-only"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            setLogoName(file.name);
                            setLogoUrl(URL.createObjectURL(file));
                            event.target.value = "";
                          }}
                        />
                      </label>
                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoName("");
                            setLogoUrl("");
                          }}
                          className="h-8 rounded-lg px-2.5 text-[12px] font-medium text-muted-foreground transition hover:bg-muted/50 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-[12px] font-medium text-foreground">
                      Name <span className="text-[#B22257]">*</span>
                    </span>
                    <input
                      value={websiteName}
                      onChange={(event) => setWebsiteName(event.target.value)}
                      placeholder="e.g. Support site"
                      aria-invalid={!websiteName.trim()}
                      className={cn(
                        "h-9 w-full rounded-lg border bg-card px-3 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-[#B22257]/40 focus:ring-2 focus:ring-[#B22257]/10",
                        websiteName.trim() ? "border-border" : "border-red-300",
                      )}
                    />
                    {!websiteName.trim() && (
                      <span className="block text-[11.5px] text-red-600">Name is required.</span>
                    )}
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[12px] font-medium text-foreground">Website link</span>
                    <input
                      value={domain}
                      onChange={(event) => setDomain(event.target.value)}
                      placeholder="https://your-site.com"
                      className="h-9 w-full rounded-lg border bg-card px-3 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-[#B22257]/40 focus:ring-2 focus:ring-[#B22257]/10 border-border"
                    />
                  </label>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="h-9 rounded-lg border border-border bg-card px-4 text-[13px] font-medium text-foreground transition hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!websiteName.trim()}
                    onClick={() => setEditing(false)}
                    className="h-9 rounded-lg bg-[#B22257] px-4 text-[13px] font-medium text-white transition hover:bg-[#971D49] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40 disabled:cursor-not-allowed disabled:bg-muted-foreground/35"
                  >
                    Update
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-2">
                <div className="flex items-center gap-3 p-4">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-[#FDF3F7] text-[#B22257]"
                    aria-hidden="true"
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Globe className="h-[18px] w-[18px]" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] text-muted-foreground">Website</p>
                    <h3 className="truncate text-[14px] font-semibold text-foreground">
                      {websiteName}
                    </h3>
                    {domain ? (
                      <a
                        href={domainHref}
                        target="_blank"
                        rel="noreferrer"
                        className="group mt-0.5 inline-flex max-w-full items-center gap-1 text-[12px] text-muted-foreground transition hover:text-[#B22257]"
                      >
                        <span className="truncate">{domain}</span>
                        <ExternalLink
                          className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </a>
                    ) : (
                      <p className="mt-0.5 text-[12px] text-muted-foreground">No website link</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={startEditing}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12px] font-medium text-foreground transition hover:border-[#B22257]/40 hover:text-[#B22257] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit details
                  </button>
                </div>

                <div className="flex items-center gap-3 border-t border-border p-4 sm:border-l sm:border-t-0">
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground",
                      deploymentSource ? "border-border" : "border-dashed border-border",
                    )}
                    aria-hidden="true"
                  >
                    <Workflow className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] text-muted-foreground">Flow name</p>
                    {deploymentSource ? (
                      <>
                        <h3 className="truncate text-[14px] font-semibold text-foreground">
                          {deploymentSource.name}
                        </h3>
                        <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                          <span className="font-mono text-[11.5px]">
                            v{deploymentSource.version}
                          </span>
                          {flowLive && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                                  aria-hidden="true"
                                />
                                Live
                              </span>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <h3 className="text-[14px] font-medium text-muted-foreground">
                        No workflow selected
                      </h3>
                    )}
                  </div>
                  {deploymentSource && !fromBuilder && (
                    <button
                      type="button"
                      onClick={openWorkflowPicker}
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12px] font-medium text-foreground transition hover:border-[#B22257]/40 hover:text-[#B22257] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby="website-deployment-heading">
            <header className="mb-2.5">
              <h2
                id="website-deployment-heading"
                className="text-[14px] font-semibold text-foreground"
              >
                Website Deployment Details
              </h2>
              {deploymentSource && !selectedDeployment && (
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  Select a version to configure and deploy.
                </p>
              )}
              {liveElsewhere && (
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Live now:
                  <span className="font-medium text-foreground">
                    {deployedFlow.name || "another workflow"}
                  </span>
                  {deployedFlow.version && (
                    <span className="font-mono text-[11.5px]">v{deployedFlow.version}</span>
                  )}
                </p>
              )}
            </header>
            {deploymentSource ? (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] table-fixed text-left text-[12.5px]">
                    <thead className="border-b border-border bg-muted/30 text-[12px] text-muted-foreground">
                      <tr>
                        <th className="w-14 px-3 py-2.5 font-medium">#</th>
                        <th className="px-3 py-2.5 font-medium">Flow name</th>
                        <th className="w-24 px-3 py-2.5 font-medium">Version</th>
                        <th className="w-28 px-3 py-2.5 font-medium">Allocation</th>
                        <th className="w-52 px-3 py-2.5 font-medium">Integration</th>
                        <th className="w-32 px-3 py-2.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deployments.map((deployment, index) => {
                        const selected = selectedDeployment === deployment.id;
                        const assignedApi = INTEGRATION_APIS.find(
                          (api) => api.id === apiAssignments[deployment.id],
                        );
                        return (
                          <Fragment key={deployment.id}>
                            <tr
                              onClick={() => toggleDeployment(deployment.id)}
                              className={cn(
                                "group cursor-pointer border-t border-border transition first:border-t-0",
                                selected
                                  ? "bg-[#FDF3F7]/60 shadow-[inset_2px_0_0_#B22257]"
                                  : "hover:bg-muted/25",
                              )}
                            >
                              <td className="px-3 py-2.5 text-muted-foreground">
                                <div className="flex items-center gap-2.5">
                                  <button
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    aria-label={`Select ${deployment.name}`}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      toggleDeployment(deployment.id);
                                    }}
                                    className={cn(
                                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35 focus-visible:ring-offset-1",
                                      selected
                                        ? "border-[#B22257]"
                                        : "border-border bg-card group-hover:border-[#B22257]/55",
                                    )}
                                  >
                                    {selected && (
                                      <span
                                        className="h-2 w-2 rounded-full bg-[#B22257]"
                                        aria-hidden="true"
                                      />
                                    )}
                                  </button>
                                  <span>{index + 1}.</span>
                                </div>
                              </td>
                              <td
                                title={deployment.name}
                                className="truncate px-3 py-2.5 font-medium text-foreground"
                              >
                                <span className="truncate">{deployment.name}</span>
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="font-mono text-[11.5px] text-muted-foreground">
                                  v{deployment.version}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-foreground">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    const currentAllocation = Number.parseInt(
                                      (
                                        deploymentAllocations[deployment.id] ??
                                        deployment.deployment
                                      ).replace("%", ""),
                                    );
                                    setAllocationDraft(
                                      Number.isNaN(currentAllocation) ? 100 : currentAllocation,
                                    );
                                    setAllocationTarget(deployment);
                                  }}
                                  aria-label={`Edit allocation for ${deployment.name}`}
                                  title="Edit allocation"
                                  className="group/pill inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-[12px] font-medium text-foreground ring-1 ring-inset ring-border transition hover:bg-muted hover:ring-[#B22257]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
                                >
                                  <span className="tabular-nums">
                                    {deploymentAllocations[deployment.id] ?? deployment.deployment}
                                  </span>
                                  <Pencil
                                    className="h-3 w-0 shrink-0 opacity-0 transition-all duration-150 group-hover/pill:w-3 group-hover/pill:opacity-100 group-focus-visible/pill:w-3 group-focus-visible/pill:opacity-100 [@media(hover:none)]:w-3 [@media(hover:none)]:opacity-100 text-muted-foreground"
                                    aria-hidden="true"
                                  />
                                </button>
                              </td>
                              <td className="px-3 py-2.5">
                                {assignedApi ? (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setSelectedDeployment(deployment.id);
                                      setApiDraft(apiAssignments[deployment.id] ?? "");
                                      setApiQuery("");
                                      setApiFilter("all");
                                      setApiConfigOpen(true);
                                    }}
                                    aria-label={`Change integration for ${deployment.name}, currently ${assignedApi.name}`}
                                    title="Change integration"
                                    className="group/pill inline-flex max-w-full items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-800 ring-1 ring-inset ring-emerald-100 transition hover:bg-emerald-100/70 hover:ring-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
                                  >
                                    <span
                                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                                      aria-hidden="true"
                                    />
                                    <span className="truncate">{assignedApi.name}</span>
                                    <Pencil
                                      className="h-3 w-0 shrink-0 opacity-0 transition-all duration-150 group-hover/pill:w-3 group-hover/pill:opacity-100 group-focus-visible/pill:w-3 group-focus-visible/pill:opacity-100 [@media(hover:none)]:w-3 [@media(hover:none)]:opacity-100 text-emerald-700"
                                      aria-hidden="true"
                                    />
                                  </button>
                                ) : (
                                  <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
                                    <span
                                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"
                                      aria-hidden="true"
                                    />
                                    Not configured
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5">
                                {deployedDeployment === deployment.id ? (
                                  <span
                                    role="status"
                                    className="flex items-center gap-2 text-[12px] font-medium text-emerald-700"
                                  >
                                    <span
                                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                                      aria-hidden="true"
                                    />
                                    Deployed
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={!(selected && visualBot && assignedApi)}
                                    title={
                                      !assignedApi
                                        ? "Connect an integration to deploy"
                                        : !selected
                                          ? "Select this version to deploy"
                                          : undefined
                                    }
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (deployedDeployment) {
                                        setReplaceTarget(deployment);
                                      } else {
                                        deployVersion(deployment);
                                      }
                                    }}
                                    className="inline-flex h-7 min-w-[76px] items-center justify-center rounded-md bg-[#B22257] px-2.5 text-[11.5px] font-medium text-white shadow-sm transition hover:bg-[#971D49] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:border disabled:border-border disabled:bg-muted/40 disabled:text-muted-foreground/70 disabled:shadow-none"
                                  >
                                    Deploy
                                  </button>
                                )}
                              </td>
                            </tr>
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {selectedDeploymentDetails &&
                  selectedDeploymentDetails.id !== deployedDeployment && (
                    <div className="border-t border-border">
                      <WebsiteDeploymentConfiguration
                        deployment={selectedDeploymentDetails}
                        assignedApi={selectedApiDetails}
                        onSelectIntegration={() => {
                          setApiDraft(selectedApiId);
                          setApiQuery("");
                          setApiFilter("all");
                          setApiConfigOpen(true);
                        }}
                      />
                    </div>
                  )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 pb-8 pt-6 text-center">
                <WorkflowEmptyIllustration />
                <div>
                  <p className="text-[13px] font-semibold text-foreground">No workflow selected</p>
                  <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
                    Choose a work agent to see its versions and deploy it to this website.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openWorkflowPicker}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-[#B22257] px-4 text-[13px] font-medium text-white transition hover:bg-[#971D49] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40 focus-visible:ring-offset-1"
                >
                  Select workflow
                </button>
              </div>
            )}
          </section>

          <section aria-labelledby="chat-ui-heading">
            <header className="mb-2.5">
              <h2 id="chat-ui-heading" className="text-[14px] font-semibold text-foreground">
                Configure Chat UI
              </h2>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Customize your chat UI here, or use the default design.
              </p>
            </header>

            <div>
              <p className="mb-2 text-[12px] font-medium text-muted-foreground">
                Select Visual Bot
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={() => setVisualBot("new")}
                  className={cn(
                    "flex min-h-[132px] flex-col items-center justify-center rounded-xl border border-dashed text-[#B22257] transition hover:bg-[#FDF3F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35",
                    visualBot === "new" ? "border-[#B22257] bg-[#FDF3F7]" : "border-[#B22257]/55",
                  )}
                >
                  <Plus className="h-5 w-5" aria-hidden="true" />
                  <span className="mt-2 text-[13px] font-medium">Create New</span>
                </button>

                <div className="contents" role="radiogroup" aria-label="Visual bot design">
                  {VISUAL_BOTS.map((bot) => {
                    const selected = visualBot === bot.id;
                    return (
                      <button
                        key={bot.id}
                        type="button"
                        onClick={() => setVisualBot(bot.id)}
                        role="radio"
                        aria-checked={selected}
                        aria-label={`Select ${bot.name}`}
                        className={cn(
                          "relative flex min-h-[132px] flex-col rounded-xl border bg-card p-3 text-left transition hover:border-[#B22257]/35 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35",
                          selected ? "border-[#B22257] ring-1 ring-[#B22257]/15" : "border-border",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border",
                            selected
                              ? "border-[#B22257] bg-[#B22257] text-white"
                              : "border-border bg-card",
                          )}
                        >
                          {selected && <Check className="h-3 w-3" aria-hidden="true" />}
                        </span>
                        <span className="pr-7 text-[15px] font-semibold text-foreground">
                          {bot.name}
                        </span>
                        <span className="mt-1 text-[12px] text-muted-foreground">
                          {bot.description}
                        </span>
                        <span className="mt-auto pt-4 text-[10px] text-muted-foreground">
                          Last Updated: {bot.updated}
                        </span>
                        <span className="mt-1 text-[10px] text-muted-foreground">
                          Created On: {bot.created}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-3.5">
          {deployedDeployment && (
            <p className="mr-auto text-[12px] font-medium text-emerald-700" role="status">
              Deployment updated successfully.
            </p>
          )}
          <button
            type="button"
            onClick={() =>
              onSave({
                websiteName,
                domain,
                userType,
                logoName,
                logoUrl,
                visualBot,
                selectedDeployment,
                deployedDeployment,
                deployedFlowName: deployedFlow.name,
                deployedFlowVersion: deployedFlow.version,
                apiAssignments: JSON.stringify(apiAssignments),
                deploymentAllocations: JSON.stringify(deploymentAllocations),
              })
            }
            className="h-9 rounded-lg border border-[#B22257] bg-card px-4 text-[13px] font-medium text-[#B22257] transition hover:bg-[#FDF3F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
          >
            Save &amp; Update
          </button>
        </footer>
      </section>

      {allocationTarget && (
        <ModalShell onClose={() => setAllocationTarget(null)}>
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDF3F7] text-[#B22257]">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 className="mt-3 text-[17px] font-semibold text-foreground">
              Edit traffic allocation
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              Choose how much website traffic goes to {allocationTarget.name}. Saving creates a new
              version, and v{allocationTarget.version} stays as it is.
            </p>

            <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="deployment-allocation"
                  className="text-[12px] font-medium text-foreground"
                >
                  Traffic allocation
                </label>
                <div className="flex h-9 items-center overflow-hidden rounded-lg border border-border bg-card">
                  <input
                    id="deployment-allocation-number"
                    type="number"
                    min={0}
                    max={100}
                    value={allocationDraft}
                    onChange={(event) =>
                      setAllocationDraft(
                        Math.min(100, Math.max(0, Number(event.target.value) || 0)),
                      )
                    }
                    className="h-full w-16 bg-transparent px-2 text-right text-[13px] font-semibold text-foreground outline-none"
                    aria-label="Traffic allocation percentage"
                  />
                  <span className="pr-2 text-[12px] font-medium text-muted-foreground">%</span>
                </div>
              </div>
              <input
                id="deployment-allocation"
                type="range"
                min={0}
                max={100}
                value={allocationDraft}
                onChange={(event) => setAllocationDraft(Number(event.target.value))}
                className="mt-4 w-full accent-[#B22257]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAllocationTarget(null)}
                className="h-9 rounded-lg border border-border bg-card px-4 text-[13px] font-medium text-foreground transition hover:bg-muted/40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  `${allocationDraft}%` ===
                  (deploymentAllocations[allocationTarget.id] ?? allocationTarget.deployment)
                }
                onClick={() => {
                  const version: WebsiteDeployment = {
                    ...allocationTarget,
                    id: `${allocationTarget.flowId}:v${Date.now()}`,
                    version: nextVersion(deployments.map((item) => item.version)),
                    deployment: `${allocationDraft}%`,
                  };
                  setAddedVersions((current) => [...current, version]);
                  const inheritedApi = apiAssignments[allocationTarget.id];
                  if (inheritedApi) {
                    setApiAssignments((current) => ({ ...current, [version.id]: inheritedApi }));
                  }
                  setSelectedDeployment(version.id);
                  setAllocationTarget(null);
                }}
                className="h-9 rounded-lg bg-[#B22257] px-4 text-[13px] font-medium text-white transition hover:bg-[#971D49] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40 disabled:cursor-not-allowed disabled:bg-muted-foreground/35"
              >
                Save as new version
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {workflowPickerOpen && (
        <ModalShell onClose={() => setWorkflowPickerOpen(false)} size="wide">
          <h2 className="text-[17px] font-semibold text-foreground">Select workflow</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Choose a work agent to deploy to {websiteName}.
          </p>

          <label className="mt-4 flex h-9 w-full items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 focus-within:border-[#B22257]/40 focus-within:bg-card focus-within:ring-2 focus-within:ring-[#B22257]/10">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">Search work agents</span>
            <input
              value={workflowQuery}
              onChange={(event) => setWorkflowQuery(event.target.value)}
              placeholder="Search work agents..."
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </label>

          <div className="mt-3 overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[28px_minmax(220px,1.4fr)_minmax(150px,1fr)_110px_130px_120px] items-center gap-4 border-b border-border bg-muted/30 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>
                <span className="sr-only">Select</span>
              </span>
              <span>Name</span>
              <span>Type</span>
              <span>Channel Type</span>
              <span>Last modified</span>
              <span>Status</span>
            </div>
            <div
              role="radiogroup"
              aria-label="Work agents"
              className="max-h-[320px] overflow-y-auto"
            >
              {filteredWorkflows.length === 0 && (
                <p className="px-4 py-12 text-center text-[13px] text-muted-foreground">
                  {workflowAgents.length === 0
                    ? "No work agents yet."
                    : `No results for "${workflowQuery}"`}
                </p>
              )}
              {filteredWorkflows.map((agent) => {
                const draft = workflowDraft === agent.id;
                const live = deployedDeployment.startsWith(`${agent.id}:`);
                const typeMeta = TYPE_META[agent.type];
                const status = STATUS_META[agent.status];
                const TypeIcon = typeMeta.Icon;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    role="radio"
                    aria-checked={draft}
                    onClick={() => setWorkflowDraft(agent.id)}
                    className={cn(
                      "grid w-full grid-cols-[28px_minmax(220px,1.4fr)_minmax(150px,1fr)_110px_130px_120px] items-center gap-4 border-b border-border/70 px-4 py-2 text-left transition last:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B22257]/35",
                      draft ? "bg-[#FDF3F7]/70" : "hover:bg-muted/25",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border",
                        draft ? "border-[#B22257]" : "border-border bg-card",
                      )}
                      aria-hidden="true"
                    >
                      {draft && <span className="h-2 w-2 rounded-full bg-[#B22257]" />}
                    </span>
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                        style={{ backgroundColor: typeMeta.bg, color: typeMeta.text }}
                      >
                        <TypeIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate text-[13px] font-medium text-foreground">
                        {agent.name}
                      </span>
                      {live && (
                        <span className="inline-flex shrink-0 items-center gap-1.5 text-[11.5px] font-medium text-emerald-700">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                            aria-hidden="true"
                          />
                          Live here
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span
                        className="inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-medium"
                        style={{ backgroundColor: typeMeta.bg, color: typeMeta.text }}
                      >
                        <TypeIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{typeMeta.label}</span>
                      </span>
                    </span>
                    <span className="truncate text-[13px] text-foreground">
                      {getChannelType(agent)}
                    </span>
                    <span className="truncate text-[13px] text-foreground">
                      {agent.lastModified}
                    </span>
                    <span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium"
                        style={{ backgroundColor: status.bg, color: status.text }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: status.dot }}
                        />
                        {status.label}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setWorkflowPickerOpen(false)}
              className="h-9 rounded-lg border border-border bg-card px-4 text-[13px] font-medium text-foreground transition hover:bg-muted/40"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!workflowDraft || workflowDraft === deploymentSource?.id}
              onClick={() => {
                const agent = workflowAgents.find((item) => item.id === workflowDraft);
                if (!agent) return;
                onSourceChange({ id: agent.id, name: agent.name, version: FLOW_VERSION });
                setSelectedDeployment("");
                setWorkflowPickerOpen(false);
              }}
              className="h-9 rounded-lg bg-[#B22257] px-4 text-[13px] font-medium text-white transition hover:bg-[#971D49] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40 disabled:cursor-not-allowed disabled:bg-muted-foreground/35"
            >
              Select workflow
            </button>
          </div>
        </ModalShell>
      )}

      {replaceTarget && (
        <ModalShell onClose={() => setReplaceTarget(null)}>
          {(() => {
            const sameFlow = deployedFlow.name === replaceTarget.name;
            const liveName = deployedFlow.name || "Another workflow";
            return (
              <>
                <h2 className="pr-8 text-[17px] font-semibold text-foreground">
                  {sameFlow ? "Replace the live version?" : "Replace the live workflow?"}
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  Only one version can be live on {websiteName} at a time.
                </p>

                <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
                  <div className="flex items-center gap-3 px-3.5 py-3">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground">Live now</p>
                      <p className="truncate text-[13px] font-medium text-foreground">{liveName}</p>
                    </div>
                    {deployedFlow.version && (
                      <span className="shrink-0 font-mono text-[12px] text-muted-foreground">
                        v{deployedFlow.version}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 bg-[#FDF3F7]/60 px-3.5 py-3">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-[#B22257]"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground">Goes live</p>
                      <p className="truncate text-[13px] font-medium text-foreground">
                        {replaceTarget.name}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[12px] font-medium text-[#B22257]">
                      v{replaceTarget.version}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  Visitors switch over as soon as you deploy.
                  {deployedFlow.version &&
                    ` To go back, deploy ${sameFlow ? "" : `${liveName} `}v${deployedFlow.version} again.`}
                </p>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReplaceTarget(null)}
                    className="h-9 rounded-lg border border-border bg-card px-4 text-[13px] font-medium text-foreground transition hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
                  >
                    {deployedFlow.version ? `Keep v${deployedFlow.version}` : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deployVersion(replaceTarget);
                      setReplaceTarget(null);
                    }}
                    className="h-9 rounded-lg bg-[#B22257] px-4 text-[13px] font-medium text-white transition hover:bg-[#971D49] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40"
                  >
                    Deploy v{replaceTarget.version}
                  </button>
                </div>
              </>
            );
          })()}
        </ModalShell>
      )}

      {apiConfigOpen && selectedDeploymentDetails && (
        <ModalShell onClose={() => setApiConfigOpen(false)} size="wide">
          <div>
            <div className="pr-8">
              <h2 className="text-[18px] font-semibold text-foreground">
                Select customer data integration
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Choose an existing integration for {selectedDeploymentDetails.name}.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-3 border-b border-border">
              <div
                className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto"
                role="tablist"
                aria-label="API type"
              >
                {[
                  { id: "all" as const, label: "All" },
                  { id: "rest" as const, label: "REST APIs" },
                  { id: "database" as const, label: "Database APIs" },
                  { id: "cloud" as const, label: "Cloud Functions" },
                  { id: "agent" as const, label: "Agents as API" },
                ].map((filter) => {
                  const active = apiFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setApiFilter(filter.id)}
                      className={cn(
                        "relative flex h-10 shrink-0 items-center gap-1.5 px-1 text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35",
                        active ? "text-[#B22257]" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {filter.label}
                      {filter.id === "all" && (
                        <span className="rounded-full bg-[#F7DFE8] px-1.5 py-0.5 text-[10px] font-semibold text-[#B22257]">
                          {INTEGRATION_APIS.length}
                        </span>
                      )}
                      {active && (
                        <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#B22257]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {onCreateIntegration && (
                <button
                  type="button"
                  onClick={() => {
                    setApiConfigOpen(false);
                    onCreateIntegration();
                  }}
                  className="mb-1 inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#B22257] bg-card px-3 text-[11px] font-medium text-[#B22257] transition hover:bg-[#FDF3F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  Create new integration
                </button>
              )}
            </div>

            <label className="mt-3 flex h-9 w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 focus-within:border-[#B22257]/40 focus-within:bg-card focus-within:ring-2 focus-within:ring-[#B22257]/10">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Search APIs</span>
              <input
                value={apiQuery}
                onChange={(event) => setApiQuery(event.target.value)}
                placeholder="Search APIs..."
                className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </label>

            <div className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-border">
              <table className="w-full min-w-[760px] text-left">
                <thead className="sticky top-0 z-10 border-b border-border bg-muted/40 text-[10px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                  <tr>
                    <th className="w-12 px-3 py-2.5">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-3 py-2.5">API</th>
                    <th className="w-40 px-3 py-2.5">Binding</th>
                    <th className="w-40 px-3 py-2.5">Owner</th>
                    <th className="w-28 px-3 py-2.5 text-right">24h calls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredApis.map((api) => {
                    const selected = apiDraft === api.id;
                    return (
                      <tr
                        key={api.id}
                        onClick={() => setApiDraft(api.id)}
                        className={cn(
                          "cursor-pointer transition",
                          selected ? "bg-[#FDF3F7]/75" : "hover:bg-muted/20",
                        )}
                      >
                        <td className="px-3 py-3 align-middle">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={`Select ${api.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setApiDraft(api.id);
                            }}
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-[4px] border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35 focus-visible:ring-offset-1",
                              selected
                                ? "border-[#B22257] bg-[#B22257] text-white"
                                : "border-border bg-card hover:border-[#B22257]/55",
                            )}
                          >
                            {selected && <Check className="h-2.5 w-2.5" aria-hidden="true" />}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[13px] font-semibold text-foreground">
                              {api.name}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Published
                            </span>
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[9px] font-medium",
                                api.access === "Read" && "bg-blue-50 text-blue-700",
                                api.access === "Write" && "bg-amber-50 text-amber-700",
                                api.access === "Destructive" && "bg-red-50 text-red-700",
                              )}
                            >
                              {api.access}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                            <span
                              className={cn(
                                "rounded px-1 py-0.5 font-sans font-semibold",
                                api.method === "GET"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-sky-50 text-sky-700",
                              )}
                            >
                              {api.method}
                            </span>
                            <span>{api.path}</span>
                            <span>{api.version}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-[12px] text-foreground">{api.binding}</td>
                        <td className="px-3 py-3 text-[12px] text-foreground">{api.owner}</td>
                        <td className="px-3 py-3 text-right text-[12px] font-semibold text-foreground">
                          {api.calls}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredApis.length === 0 && (
                <div className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                  No APIs match your search.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setApiConfigOpen(false)}
              className="h-9 rounded-lg border border-border bg-card px-4 text-[13px] font-medium text-foreground transition hover:bg-muted/40"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!apiDraft}
              onClick={() => {
                setApiAssignments((current) => ({
                  ...current,
                  [selectedDeployment]: apiDraft,
                }));
                setApiConfigOpen(false);
              }}
              className="h-9 rounded-lg bg-[#B22257] px-4 text-[13px] font-medium text-white transition hover:bg-[#971D49] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40 disabled:cursor-not-allowed disabled:bg-muted-foreground/35"
            >
              Use integration
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function DeleteConfirmation({
  label,
  onCancel,
  onConfirm,
}: {
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <div className="flex flex-col items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FDF3F7]">
          <Trash2 className="h-5 w-5 text-[#B22257]" />
        </div>
        <h2 className="text-[17px] font-semibold text-foreground">Delete configuration?</h2>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">{label}</span>? This action cannot be
          undone.
        </p>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition hover:bg-muted/40"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-[#B22257] px-4 py-2 text-[13px] font-medium text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40"
        >
          Delete
        </button>
      </div>
    </>
  );
}

function ModalShell({
  children,
  onClose,
  size = "default",
}: {
  children: React.ReactNode;
  onClose: () => void;
  size?: "default" | "medium" | "wide";
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative max-h-[calc(100vh-2rem)] w-full overflow-auto rounded-2xl border border-[#e8e6e1] bg-white p-6 shadow-xl",
          size === "wide" ? "max-w-[960px]" : size === "medium" ? "max-w-[560px]" : "max-w-[440px]",
        )}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
