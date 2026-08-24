import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Plus,
  Power,
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
      { id: "domain", label: "Domain", sortable: true },
      { id: "widgetId", label: "Widget ID", sortable: true },
      { id: "primaryAgent", label: "Primary Agent", sortable: true },
      { id: "createdDate", label: "Created Date", sortable: true },
    ],
    rows: [
      {
        id: "1",
        domain: "kapturecrm.com",
        widgetId: "widget_A93FZ",
        primaryAgent: "Website Concierge",
        createdDate: "2026-05-04 11:20:41",
        status: "enabled",
      },
      {
        id: "2",
        domain: "shop.kapturecrm.com",
        widgetId: "widget_B72PQ",
        primaryAgent: "Ecom Concierge",
        createdDate: "2026-05-16 12:05:19",
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
  const [statuses, setStatuses] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(config.rows.map((r) => [r.id, r.status !== "disabled"])),
  );
  const [deleteTarget, setDeleteTarget] = useState<Record<string, string> | null>(null);
  const [disableTarget, setDisableTarget] = useState<Record<string, string> | null>(null);
  const [enableTarget, setEnableTarget] = useState<Record<string, string> | null>(null);
  const [deleteBlocked, setDeleteBlocked] = useState<Record<string, string> | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Record<string, string> | null>(null);
  const [detailsMode, setDetailsMode] = useState<"view" | "edit">("view");

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

  const requestToggle = (r: Record<string, string>) => {
    const enabled = statuses[r.id];
    if (enabled) {
      setDisableTarget(r);
    } else {
      setEnableTarget(r);
    }
  };

  const requestDelete = (r: Record<string, string>) => {
    if (statuses[r.id]) {
      setDeleteBlocked(r);
    } else {
      setDeleteTarget(r);
    }
  };

  const confirmDisable = () => {
    if (!disableTarget) return;
    setStatuses((s) => ({ ...s, [disableTarget.id]: false }));
    setDisableTarget(null);
  };

  const confirmEnable = () => {
    if (!enableTarget) return;
    setStatuses((s) => ({ ...s, [enableTarget.id]: true }));
    setEnableTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setRows((rs) => rs.filter((x) => x.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const gridTemplate = `minmax(0,1.2fr) ${config.columns
    .slice(1)
    .map(() => "minmax(0,1fr)")
    .join(" ")} 120px 100px`;

  const toggleSort = (id: string) => {
    setSort((cur) => {
      if (cur?.id !== id) return { id, dir: "asc" };
      if (cur.dir === "asc") return { id, dir: "desc" };
      return null;
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e6e1] bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to channels
      </button>

      <div className="mt-4 mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{channelName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All {channelName} connections in this workspace. Manage status, edit AOP or add a new
          entry.
        </p>
      </div>

      <div className="rounded-2xl border border-[#e8e6e1] bg-white shadow-sm">
        {/* Info banner */}
        <div className="m-4 flex items-start gap-2 rounded-xl border border-[#F7CFDD] bg-[#FDF3F7] px-3.5 py-2.5 text-[13px] text-foreground">
          <Plus className="mt-0.5 h-4 w-4 shrink-0 text-[#B22257]" />
          <p className="leading-relaxed">
            <span className="font-semibold text-[#B22257]">Set up AOP by editing an entry.</span>{" "}
            {config.bannerHint}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 pb-3">
          <div className="flex w-72 items-center gap-2 rounded-full border border-[#e8e6e1] bg-white px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#B22257] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#B22257] transition hover:bg-[#FDF3F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40"
          >
            <Plus className="h-3.5 w-3.5" />
            {config.createLabel ?? "Create New"}
          </button>
        </div>

        {/* Table header */}
        <div
          className="grid items-center gap-4 border-y border-[#e8e6e1] bg-[#faf9f7] px-4 py-2.5 text-[12px] font-semibold text-foreground"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {config.columns.map((c) => {
            const active = sort?.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => c.sortable && toggleSort(c.id)}
                className={cn(
                  "inline-flex items-center gap-1 text-left",
                  c.sortable ? "hover:text-[#B22257]" : "cursor-default",
                )}
              >
                {c.label}
                {c.sortable && (
                  <span className="flex flex-col leading-none">
                    <ChevronUp
                      className={cn(
                        "h-2.5 w-2.5",
                        active && sort?.dir === "asc"
                          ? "text-[#B22257]"
                          : "text-muted-foreground/50",
                      )}
                    />
                    <ChevronDown
                      className={cn(
                        "-mt-0.5 h-2.5 w-2.5",
                        active && sort?.dir === "desc"
                          ? "text-[#B22257]"
                          : "text-muted-foreground/50",
                      )}
                    />
                  </span>
                )}
              </button>
            );
          })}
          <div>Status</div>
          <div>Action</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#efece7]">
          {filtered.map((r) => {
            const enabled = statuses[r.id];
            return (
              <div
                key={r.id}
                className="grid items-center gap-4 px-4 py-3 transition hover:bg-[#faf9f7]"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {config.columns.map((c, i) => (
                  <div
                    key={c.id}
                    className={cn(
                      "text-[13px]",
                      c.renderCell ? "leading-snug" : "truncate",
                      enabled ? "text-foreground" : "text-muted-foreground/60",
                      i === 0 && "font-medium",
                    )}
                  >
                    {c.renderCell ? c.renderCell(r[c.id] ?? "") : r[c.id]}
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[12px] font-medium",
                      enabled ? "text-[#B22257]" : "text-muted-foreground",
                    )}
                  >
                    {enabled ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => requestToggle(r)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition",
                      enabled ? "bg-[#B22257]" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
                        enabled ? "translate-x-4" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDetailsTarget(r);
                      setDetailsMode("view");
                    }}
                    aria-label="Edit entry"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#F7CFDD] bg-white text-[#B22257] transition hover:bg-[#FDF3F7]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => requestDelete(r)}
                    aria-label="Delete entry"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#F7CFDD] bg-white text-[#B22257] transition hover:bg-[#FDF3F7]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No entries yet. Click <span className="font-medium text-[#B22257]">Create New</span>{" "}
              to connect your first {channelName}.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#e8e6e1] bg-[#faf9f7] px-4 py-2.5 text-[12px] text-muted-foreground">
          <span>
            Showing 1–{filtered.length} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#e8e6e1] bg-white text-muted-foreground transition hover:bg-[#FDF3F7] hover:text-[#B22257]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-foreground">Page 1 of 1</span>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#e8e6e1] bg-white text-muted-foreground transition hover:bg-[#FDF3F7] hover:text-[#B22257]"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <ModalShell onClose={() => setDeleteTarget(null)}>
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FDF3F7]">
              <Trash2 className="h-5 w-5 text-[#B22257]" />
            </div>
            <h2 className="text-[17px] font-semibold text-foreground">Delete configuration?</h2>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{rowLabel(deleteTarget)}</span>? This
              action cannot be undone.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-[#e8e6e1] bg-white px-4 py-2 text-[13px] font-medium text-foreground transition hover:bg-muted/40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg bg-[#B22257] px-4 py-2 text-[13px] font-medium text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40"
            >
              Delete
            </button>
          </div>
        </ModalShell>
      )}

      {/* Delete blocked (must disable first) */}
      {deleteBlocked && (
        <ModalShell onClose={() => setDeleteBlocked(null)}>
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-[17px] font-semibold text-foreground">Disable before deleting</h2>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              This configuration is currently{" "}
              <span className="font-semibold text-foreground">enabled</span>. Please disable it
              first using the Status toggle, then delete it.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setDeleteBlocked(null)}
              className="rounded-lg border border-[#e8e6e1] bg-white px-4 py-2 text-[13px] font-medium text-foreground transition hover:bg-muted/40"
            >
              Got it
            </button>
          </div>
        </ModalShell>
      )}

      {/* Disable confirm */}
      {disableTarget && (
        <ModalShell onClose={() => setDisableTarget(null)}>
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-[17px] font-semibold text-foreground">Disable configuration?</h2>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Are you sure you want to disable{" "}
              <span className="font-semibold text-foreground">{rowLabel(disableTarget)}</span>? It
              will stop receiving messages until re-enabled.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDisableTarget(null)}
              className="rounded-lg border border-[#e8e6e1] bg-white px-4 py-2 text-[13px] font-medium text-foreground transition hover:bg-muted/40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDisable}
              className="rounded-lg bg-[#B22257] px-4 py-2 text-[13px] font-medium text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40"
            >
              Disable
            </button>
          </div>
        </ModalShell>
      )}

      {/* Enable confirm */}
      {enableTarget && (
        <ModalShell onClose={() => setEnableTarget(null)}>
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF4FF]">
              <Power className="h-5 w-5 text-[#2563EB]" />
            </div>
            <h2 className="text-[17px] font-semibold text-foreground">Enable configuration?</h2>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Are you sure you want to enable{" "}
              <span className="font-semibold text-foreground">{rowLabel(enableTarget)}</span>? It
              will start receiving messages.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEnableTarget(null)}
              className="rounded-lg border border-[#e8e6e1] bg-white px-4 py-2 text-[13px] font-medium text-foreground transition hover:bg-muted/40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmEnable}
              className="rounded-lg border border-[#F7CFDD] bg-white px-4 py-2 text-[13px] font-medium text-[#B22257] transition hover:bg-[#FDF3F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40"
            >
              Enable
            </button>
          </div>
        </ModalShell>
      )}

      <ChannelDetailsPanel
        open={!!detailsTarget}
        channelId={channelId}
        channelName={channelName}
        row={detailsTarget}
        initialMode={detailsMode}
        onClose={() => setDetailsTarget(null)}
        onSave={(vals) => {
          if (!detailsTarget) return;
          setRows((rs) => rs.map((x) => (x.id === detailsTarget.id ? { ...x, ...vals } : x)));
        }}
      />
    </div>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
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
        className="relative w-full max-w-[440px] rounded-2xl border border-[#e8e6e1] bg-white p-6 shadow-xl"
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
