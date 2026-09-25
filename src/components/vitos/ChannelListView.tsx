import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelDetailsPanel } from "./ChannelDetailsPanel";

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
}: {
  channelId: string;
  channelName: string;
  onBack: () => void;
  onCreate: () => void;
}) {
  const config = LIST_CONFIG[channelId] ?? FALLBACK;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const [rows, setRows] = useState<Record<string, string>[]>(config.rows);
  const [deleteTarget, setDeleteTarget] = useState<Record<string, string> | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Record<string, string> | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<Record<string, string> | null>(null);

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
          onBack={() => setSelectedWebsite(null)}
          onDelete={() => setDeleteTarget(selectedWebsite)}
          onSave={(values) => {
            setRows((current) =>
              current.map((row) => (row.id === selectedWebsite.id ? { ...row, ...values } : row)),
            );
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
                    className="group grid cursor-pointer items-center gap-4 px-4 py-2 transition hover:bg-muted/20 focus:outline-none focus-visible:bg-[#FDF3F7]/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B22257]/25"
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
                              {firstValue.trim().charAt(0) || "•"}
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
  },
  {
    id: "2",
    name: "Customer Support Assistant",
    flowId: "42b933a1-09d5-4fb4-a7b9-44d61e9670ca",
    version: "1.2",
    deployment: "75%",
  },
  {
    id: "3",
    name: "Lead Qualification Flow",
    flowId: "781c8e0d-b4bc-45fa-9031-1d8f4bb00e76",
    version: "2.0",
    deployment: "50%",
  },
  {
    id: "4",
    name: "Booking Concierge Beta",
    flowId: "d10ff327-a27e-4924-8c3d-c8709859db68",
    version: "0.8",
    deployment: "25%",
  },
  {
    id: "5",
    name: "After-hours Routing Test",
    flowId: "f58c37f4-40cd-4de3-b18e-32f9955bf072",
    version: "0.3",
    deployment: "10%",
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

function WebsiteConfigurationView({
  row,
  onBack,
  onDelete,
  onSave,
}: {
  row: Record<string, string>;
  onBack: () => void;
  onDelete: () => void;
  onSave: (values: Record<string, string>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [websiteName, setWebsiteName] = useState(row.websiteName ?? "Website");
  const [domain, setDomain] = useState(row.domain ?? "");
  const [userType, setUserType] = useState(row.userType ?? "Guest User");
  const [visualBot, setVisualBot] = useState(row.visualBot ?? "testing");
  const [selectedDeployment, setSelectedDeployment] = useState(row.selectedDeployment ?? "");
  const [deployedDeployment, setDeployedDeployment] = useState(row.deployedDeployment ?? "");
  const [apiConfigOpen, setApiConfigOpen] = useState(false);
  const [apiQuery, setApiQuery] = useState("");
  const [apiFilter, setApiFilter] = useState<"all" | "rest" | "database" | "cloud" | "agent">(
    "all",
  );
  const [apiDraft, setApiDraft] = useState("");
  const [apiAssignments, setApiAssignments] = useState<Record<string, string>>(() => {
    try {
      return row.apiAssignments ? JSON.parse(row.apiAssignments) : {};
    } catch {
      return {};
    }
  });
  const domainHref = /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;
  const selectedDeploymentDetails = WEBSITE_DEPLOYMENTS.find(
    (deployment) => deployment.id === selectedDeployment,
  );
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
        <button
          type="button"
          onClick={onBack}
          className="font-medium text-muted-foreground transition hover:text-[#B22257] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
        >
          Channels
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
        <span className="font-medium text-[#B22257]">Website</span>
      </nav>

      <section className="flex min-h-[calc(100vh-8.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3.5 sm:px-5">
          <h1 className="text-[16px] font-semibold text-foreground">Website Configuration</h1>
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

        <div className="space-y-3 p-3 sm:p-4">
          <section
            aria-labelledby="website-overview-heading"
            className="rounded-xl bg-muted/45 p-2.5"
          >
            <header className="border-b border-border px-1.5 pb-2">
              <h2
                id="website-overview-heading"
                className="text-[14px] font-semibold text-foreground"
              >
                Overview
              </h2>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Review and update this website integration.
              </p>
            </header>

            <div className="mt-2 flex flex-col gap-4 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#F7CFDD] bg-[#FDF3F7] text-sm font-semibold uppercase text-[#B22257]"
                aria-hidden="true"
              >
                {websiteName.trim().charAt(0) || "W"}
              </span>

              {editing ? (
                <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[1fr_1.4fr_180px]">
                  <label className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Website name
                    </span>
                    <input
                      value={websiteName}
                      onChange={(event) => setWebsiteName(event.target.value)}
                      className="h-9 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground outline-none transition focus:border-[#B22257]/40 focus:ring-2 focus:ring-[#B22257]/10"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Website URL
                    </span>
                    <input
                      value={domain}
                      onChange={(event) => setDomain(event.target.value)}
                      className="h-9 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground outline-none transition focus:border-[#B22257]/40 focus:ring-2 focus:ring-[#B22257]/10"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      User type
                    </span>
                    <select
                      value={userType}
                      onChange={(event) => setUserType(event.target.value)}
                      className="h-9 w-full rounded-lg border border-border bg-card px-3 text-[13px] text-foreground outline-none transition focus:border-[#B22257]/40 focus:ring-2 focus:ring-[#B22257]/10"
                    >
                      <option>Registered User</option>
                      <option>Guest User</option>
                    </select>
                  </label>
                </div>
              ) : (
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-[14px] font-medium text-foreground">
                      {websiteName}
                    </h3>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      {userType}
                    </span>
                  </div>
                  <a
                    href={domainHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 block w-fit max-w-full truncate text-[12.5px] font-medium text-[#2563EB] hover:underline"
                  >
                    {domain}
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={() => setEditing((current) => !current)}
                aria-label={editing ? "Finish editing website" : "Edit website"}
                title={editing ? "Done" : "Edit"}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg border border-[#B22257] bg-card text-[#B22257] transition hover:bg-[#FDF3F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35 sm:self-center"
              >
                {editing ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </section>

          <section
            aria-labelledby="website-deployment-heading"
            className="rounded-xl bg-muted/45 p-2.5"
          >
            <header className="flex items-center justify-between gap-3 px-1.5 pb-2">
              <h2
                id="website-deployment-heading"
                className="text-[14px] font-semibold text-foreground"
              >
                Website Deployment Details
              </h2>
              {selectedDeployment && (
                <button
                  type="button"
                  onClick={() => {
                    setApiDraft(apiAssignments[selectedDeployment] ?? "");
                    setApiQuery("");
                    setApiFilter("all");
                    setApiConfigOpen(true);
                  }}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-[#B22257] bg-card px-3 text-[12px] font-medium text-[#B22257] transition hover:bg-[#FDF3F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
                >
                  Configure API
                </button>
              )}
            </header>
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full min-w-[720px] text-left text-[12.5px]">
                <thead className="border-b border-border bg-muted/35 text-muted-foreground">
                  <tr>
                    <th className="w-16 px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Flow Name</th>
                    <th className="px-3 py-2 font-medium">Flow ID</th>
                    <th className="w-32 px-3 py-2 font-medium">Version</th>
                    <th className="w-52 px-3 py-2 font-medium">Deployment Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {WEBSITE_DEPLOYMENTS.map((deployment) => {
                    const selected = selectedDeployment === deployment.id;
                    return (
                      <tr
                        key={deployment.id}
                        className={cn(
                          "border-t border-border transition first:border-t-0",
                          selected ? "bg-[#FDF3F7]/70" : "hover:bg-muted/20",
                        )}
                      >
                        <td className="px-3 py-2 text-muted-foreground">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={selected}
                              aria-label={`${selected ? "Deselect" : "Select"} ${deployment.name}`}
                              onClick={() => {
                                setSelectedDeployment((current) =>
                                  current === deployment.id ? "" : deployment.id,
                                );
                                setDeployedDeployment("");
                              }}
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35 focus-visible:ring-offset-1",
                                selected
                                  ? "border-[#B22257] bg-[#B22257] text-white"
                                  : "border-border bg-card hover:border-[#B22257]/55",
                              )}
                            >
                              {selected && <Check className="h-2.5 w-2.5" aria-hidden="true" />}
                            </button>
                            <span>{deployment.id}.</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-medium text-foreground">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{deployment.name}</span>
                            {apiAssignments[deployment.id] && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                                  aria-hidden="true"
                                />
                                API configured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono text-[12px] text-foreground">
                          {deployment.flowId}
                        </td>
                        <td className="px-3 py-2 text-foreground">{deployment.version}</td>
                        <td className="px-3 py-2 text-foreground">{deployment.deployment}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="chat-ui-heading" className="rounded-xl bg-muted/45 p-2.5">
            <header className="border-b border-border px-1.5 pb-2">
              <h2 id="chat-ui-heading" className="text-[14px] font-semibold text-foreground">
                Configure Chat UI
              </h2>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Customize your chat UI here, or use the default design.
              </p>
            </header>

            <div className="mt-2 rounded-xl border border-border bg-card p-3">
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
                visualBot,
                selectedDeployment,
                deployedDeployment,
                apiAssignments: JSON.stringify(apiAssignments),
              })
            }
            className="h-9 rounded-lg border border-[#B22257] bg-card px-4 text-[13px] font-medium text-[#B22257] transition hover:bg-[#FDF3F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
          >
            Save &amp; Update
          </button>
          <button
            type="button"
            disabled={!selectedDeployment || !apiAssignments[selectedDeployment]}
            onClick={() => setDeployedDeployment(selectedDeployment)}
            className="h-9 rounded-lg bg-[#B22257] px-4 text-[13px] font-medium text-white shadow-sm transition hover:bg-[#971D49] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted-foreground/35 disabled:shadow-none"
          >
            Deploy
          </button>
        </footer>
      </section>

      {apiConfigOpen && selectedDeploymentDetails && (
        <ModalShell onClose={() => setApiConfigOpen(false)} size="wide">
          <div>
            <h2 className="text-[18px] font-semibold text-foreground">Select an API</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              Choose an existing integration for {selectedDeploymentDetails.name}.
            </p>

            <div
              className="mt-4 flex items-center gap-6 overflow-x-auto border-b border-border"
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
              Use selected API
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
  size?: "default" | "wide";
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
          size === "wide" ? "max-w-[960px]" : "max-w-[440px]",
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
