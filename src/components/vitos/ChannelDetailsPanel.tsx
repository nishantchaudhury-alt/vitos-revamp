import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Facebook,
  Globe,
  Info,
  Instagram,
  Link2,
  Lock,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DetailField = {
  id: string;
  label: string;
  type?: "text" | "password" | "select" | "multiselect" | "textarea" | "number" | "checkbox";
  options?: string[];
  readonly?: boolean;
  copyable?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  suffix?: string;
  defaultValue?: string;
  hint?: string;
};

type DetailSection = {
  id: string;
  title: string;
  fields: DetailField[];
};

type DetailConfig = {
  sections: DetailSection[];
  webhook?: { label: string; description: string; url: string };
};

const AGENTS = [
  "Support Bot",
  "Sales Assistant",
  "Blue Collar Inbound Agent",
  "Collections Agent",
  "Lending Agent",
  "Energy Support",
  "Ecom Concierge",
  "Website Concierge",
  "Test Agent",
];

function FieldHint({ hint }: { hint: string }) {
  return (
    <span
      title={hint}
      className="inline-flex cursor-help text-muted-foreground/70 hover:text-[#B22257]"
    >
      <Info className="h-3.5 w-3.5" />
      <span className="sr-only">{hint}</span>
    </span>
  );
}

function fieldsForChannel(
  channelId: string,
  row: Record<string, string>,
  live?: Record<string, string>,
): DetailConfig {
  const agentField = (): DetailField => ({
    id: "primaryAgent",
    label: "Primary Agent",
    type: "select",
    options: AGENTS,
    defaultValue: row.primaryAgent && row.primaryAgent !== "—" ? row.primaryAgent : "",
  });
  if (channelId === "whatsapp") {
    return {
      sections: [
        {
          id: "account",
          title: "Account & Credentials",
          fields: [
            {
              id: "displayName",
              label: "WhatsApp Display Name",
              placeholder: "Enter the display name",
              defaultValue: row.displayName,
            },
            {
              id: "phone",
              label: "Phone Number",
              placeholder: "Enter the phone number",
              defaultValue: row.phone,
            },
            {
              id: "username",
              label: "Username",
              placeholder: "Enter the username",
              defaultValue: "kapture",
            },
            { id: "vendor", label: "Vendor", readonly: true, defaultValue: row.vendor },
            { id: "appId", label: "App ID", placeholder: "Enter the app ID", defaultValue: "123" },
            {
              id: "accessToken",
              label: "Access Token",
              type: "password",
              placeholder: "Enter the access token",
              defaultValue: "demo_whatsapp_access_token_not_real_0001",
            },
          ],
        },
        {
          id: "routing",
          title: "Routing & Logic",
          fields: [
            { ...agentField(), fullWidth: true },
            {
              id: "flowId",
              label: "Flow ID",
              readonly: true,
              copyable: true,
              fullWidth: true,
              defaultValue: "b8e4f0c3-5d92-4e66-a0b3-8e7d2f9c4a15",
            },
            {
              id: "conversationValidity",
              label: "Conversation Validity",
              type: "number",
              placeholder: "e.g. 120",
              suffix: "mins",
              defaultValue: "120",
            },
          ],
        },
      ],
      webhook: {
        label: "WhatsApp Webhook URL",
        description:
          "Add this webhook URL in your vendor platform to securely connect it with Kapture CRM and start receiving message events in real-time.",
        url: `https://chinav-workspace-vitos.int.kapturecrm.com/api/v1/whatsapp/webhook/${row.id ?? "0000"}`,
      },
    };
  }
  if (channelId === "facebook") {
    return {
      sections: [
        {
          id: "account",
          title: "Account & Credentials",
          fields: [
            {
              id: "facebookPage",
              label: "Facebook Page Name",
              placeholder: "Enter the page name",
              defaultValue: row.facebookPage,
            },
            {
              id: "pageId",
              label: "Page ID",
              readonly: true,
              copyable: true,
              defaultValue: "114448647912384",
            },
            {
              id: "subscriptionType",
              label: "Subscription Type",
              type: "multiselect",
              options: ["post", "message", "mention"],
              fullWidth: true,
              defaultValue: "post,message,mention",
            },
            {
              id: "accessToken",
              label: "Access Token",
              type: "password",
              fullWidth: true,
              placeholder: "Enter the access token",
              defaultValue: "demo_facebook_access_token_not_real_0001",
            },
            { id: "createDate", label: "Create Date", readonly: true, defaultValue: "28 Jan 2026" },
            { id: "expiryDate", label: "Expiry Date", readonly: true, defaultValue: "20 Sep 2026" },
          ],
        },
        {
          id: "routing",
          title: "Routing & Logic",
          fields: [
            { ...agentField() },
            {
              id: "memoryWindow",
              label: "Memory Window (mins)",
              type: "number",
              placeholder: "e.g. 60",
              defaultValue: "60",
            },
            {
              id: "flowId",
              label: "Flow ID",
              readonly: true,
              copyable: true,
              fullWidth: true,
              defaultValue: "b8e4f0c3-5d92-4e66-a0b3-8e7d2f9c4a15",
            },
          ],
        },
      ],
    };
  }
  if (channelId === "instagram") {
    return {
      sections: [
        {
          id: "account",
          title: "Account & Credentials",
          fields: [
            {
              id: "instagramPageId",
              label: "Instagram ID",
              readonly: true,
              copyable: true,
              defaultValue: row.instagramPageId,
            },
            {
              id: "instagramPage",
              label: "Instagram Name",
              placeholder: "Enter the name",
              defaultValue: row.instagramPage,
            },
            {
              id: "accessToken",
              label: "Access Token",
              type: "password",
              fullWidth: true,
              placeholder: "Enter the access token",
              defaultValue: "demo_instagram_access_token_not_real_0001",
            },
            {
              id: "facebookPageName",
              label: "Facebook Page Name",
              placeholder: "Enter the page name",
              defaultValue: row.linkedFacebook ?? "JNE",
            },
            {
              id: "facebookPageId",
              label: "Facebook Page ID",
              readonly: true,
              copyable: true,
              defaultValue: "211282838724640",
            },
            {
              id: "subscriptionType",
              label: "Subscription Type",
              type: "select",
              options: ["post", "message", "mention"],
              defaultValue: "post",
            },
            { id: "createDate", label: "Create Date", readonly: true, defaultValue: "24 Jan 2026" },
            { id: "expiryDate", label: "Expiry Date", readonly: true, defaultValue: "14 Jul 2026" },
          ],
        },
        {
          id: "routing",
          title: "Routing & Logic",
          fields: [
            { ...agentField() },
            {
              id: "memoryWindow",
              label: "Memory Window (mins)",
              type: "number",
              placeholder: "e.g. 60",
              defaultValue: "60",
            },
            {
              id: "flowId",
              label: "Flow ID",
              readonly: true,
              copyable: true,
              fullWidth: true,
              defaultValue: "b8e4f0c3-5d92-4e66-a0b3-8e7d2f9c4a15",
            },
          ],
        },
      ],
    };
  }
  if (channelId === "twilio") {
    return {
      sections: [
        {
          id: "account",
          title: "Account & Credentials",
          fields: [
            {
              id: "accountSid",
              label: "Account SID",
              readonly: true,
              copyable: true,
              defaultValue: row.accountSid,
            },
            {
              id: "phone",
              label: "Phone Number",
              placeholder: "Enter the phone number",
              defaultValue: row.phone,
            },
            {
              id: "authToken",
              label: "Auth Token",
              type: "password",
              fullWidth: true,
              placeholder: "Enter the auth token",
              defaultValue: "demo_twilio_auth_token_not_real_0001",
            },
          ],
        },
        {
          id: "routing",
          title: "Routing & Logic",
          fields: [
            { ...agentField() },
            {
              id: "voice",
              label: "Voice",
              type: "select",
              options: ["Polly.Joanna", "Polly.Matthew", "Polly.Aditi"],
              defaultValue: "Polly.Joanna",
            },
          ],
        },
      ],
    };
  }
  if (channelId === "website") {
    return {
      sections: [
        {
          id: "account",
          title: "Account & Credentials",
          fields: [
            {
              id: "domain",
              label: "Domain",
              placeholder: "https://your-site.com",
              defaultValue: row.domain,
            },
            {
              id: "widgetId",
              label: "Widget ID",
              readonly: true,
              copyable: true,
              defaultValue: row.widgetId,
            },
          ],
        },
        {
          id: "routing",
          title: "Routing & Logic",
          fields: [
            { ...agentField(), fullWidth: true },
            {
              id: "memoryWindow",
              label: "Memory Window",
              type: "number",
              placeholder: "e.g. 20",
              suffix: "messages",
              fullWidth: true,
              defaultValue: "20",
            },
          ],
        },
      ],
      webhook: {
        label: "Embed Snippet URL",
        description: "Copy this URL and add it to your website to load the chat widget.",
        url: `https://cdn.kapturecrm.com/widget/${row.widgetId ?? "widget"}.js`,
      },
    };
  }
  if (channelId === "email") {
    const host = live?.host ?? row.host ?? "";
    const authMethod = live?.authMethod ?? row.authMethod ?? "Password";
    const isOAuth = authMethod === "OAuth 2.0";
    const isSES = host === "SES";
    const isCustom = host === "Custom";
    const authHint =
      "Password: sign in with the mailbox email and password (or an app password). OAuth 2.0: token-based access for Gmail / Microsoft 365 using a Client ID and Secret.";

    const accountFields: DetailField[] = [
      {
        id: "host",
        label: "Host",
        type: "select",
        options: ["Gmail", "Outlook", "SES", "Custom"],
        defaultValue: host,
      },
    ];

    // Mailbox identifier sits above the account name.
    if (isSES) {
      accountFields.push(
        {
          id: "email",
          label: "Kapture SES Email",
          readonly: true,
          copyable: true,
          defaultValue: row.email,
        },
        {
          id: "forwardId",
          label: "Forward Mail ID",
          fullWidth: true,
          placeholder: "e.g. forward@company.com",
          defaultValue: row.forwardId || "",
        },
      );
    } else {
      accountFields.push({
        id: "email",
        label: "Email ID",
        readonly: !isCustom,
        copyable: true,
        defaultValue: row.email,
      });
    }

    accountFields.push(
      {
        id: "personName",
        label: "Account Name",
        placeholder: "Enter account name",
        defaultValue: row.personName,
      },
      {
        id: "useAccountName",
        label: "Use Account Name While Replying",
        type: "checkbox",
        fullWidth: true,
        hint: "On: replies use the mailbox's Account Name. Off: replies use the user's own Account Name.",
        defaultValue: row.useAccountName || "",
      },
    );

    if (!isSES) {
      accountFields.push({
        id: "authMethod",
        label: "Authentication Method",
        type: "select",
        options: ["Password", "OAuth 2.0"],
        fullWidth: true,
        hint: authHint,
        defaultValue: authMethod,
      });
      if (isOAuth) {
        accountFields.push(
          {
            id: "clientId",
            label: "Client ID",
            copyable: true,
            hint: "From your Google Cloud or Azure app registration.",
            defaultValue: row.clientId || "",
          },
          {
            id: "clientSecret",
            label: "Client Secret",
            type: "password",
            placeholder: "Enter OAuth client secret",
            defaultValue: row.clientSecret || "",
          },
        );
      } else {
        accountFields.push({
          id: "password",
          label: "Password",
          type: "password",
          placeholder: "Enter password",
          hint: "Use the mailbox password or an app-specific password.",
          defaultValue: "••••••••",
        });
      }
      if (isCustom) {
        accountFields.push({
          id: "forwardId",
          label: "Forward Mail ID",
          fullWidth: true,
          placeholder: "e.g. forward@company.com",
          defaultValue: row.forwardId || "",
        });
      }
    }

    if (isSES) {
      // Fixed by Kapture — shown for reference, not editable.
      accountFields.push(
        {
          id: "mailStore",
          label: "Mail Store",
          readonly: true,
          defaultValue: row.mailStore || "IMAPS",
        },
        {
          id: "mailboxFolder",
          label: "Mailbox Folder",
          readonly: true,
          defaultValue: row.mailboxFolder || "Inbox",
        },
        {
          id: "hostName",
          label: "Host Name",
          readonly: true,
          defaultValue: row.hostName || "imap.kapture.tech",
        },
        { id: "protocol", label: "Port", readonly: true, defaultValue: row.protocol || "993" },
      );
    } else {
      accountFields.push(
        {
          id: "mailStore",
          label: "Mail Store",
          type: "select",
          options: ["IMAP", "IMAPS"],
          defaultValue: row.mailStore || "IMAP",
        },
        {
          id: "mailboxFolder",
          label: "Mailbox Folder",
          type: "select",
          options: ["Inbox", "Sent", "Drafts", "Spam"],
          defaultValue: row.mailboxFolder || "Inbox",
        },
      );
      if (isCustom) {
        accountFields.push(
          {
            id: "hostName",
            label: "Host Name",
            placeholder: "e.g. imap.company.com",
            defaultValue: row.hostName || "",
          },
          {
            id: "protocol",
            label: "Protocol (Port)",
            type: "number",
            placeholder: "e.g. 993",
            defaultValue: row.protocol || "",
          },
        );
      }
    }

    return {
      sections: [
        { id: "account", title: "Account & Connection", fields: accountFields },
        {
          id: "routing",
          title: "Routing & Logic",
          fields: [
            { ...agentField(), fullWidth: true },
            {
              id: "memoryWindow",
              label: "Memory Window (mins)",
              type: "number",
              placeholder: "e.g. 60",
              defaultValue: "60",
            },
            {
              id: "flowId",
              label: "Flow ID",
              readonly: true,
              copyable: true,
              fullWidth: true,
              defaultValue: "b8e4f0c3-5d92-4e66-a0b3-8e7d2f9c4a15",
            },
          ],
        },
      ],
    };
  }
  const cols = Object.keys(row).filter((k) => k !== "id" && k !== "status" && k !== "createdDate");
  return {
    sections: [
      {
        id: "details",
        title: "Details",
        fields: cols.map((c) => ({
          id: c,
          label: c.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
          defaultValue: row[c],
        })),
      },
    ],
  };
}

function formatCreatedOn(v?: string) {
  if (!v) return "";
  // "2026-04-29 16:42:03" -> "Apr 29, 2026 • 16:42:03"
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2}:\d{2})/);
  if (!m) return v;
  const [, y, mo, d, t] = m;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(mo, 10) - 1]} ${parseInt(d, 10)}, ${y} • ${t}`;
}

function ChannelBadge({ channelId }: { channelId: string }) {
  const map: Record<string, { bg: string; icon: React.ReactNode }> = {
    whatsapp: {
      bg: "#25D366",
      icon: <MessageCircle className="h-5 w-5 text-white" strokeWidth={2.4} />,
    },
    facebook: {
      bg: "#1877F2",
      icon: <Facebook className="h-5 w-5 text-white" strokeWidth={2.2} />,
    },
    instagram: {
      bg: "linear-gradient(135deg,#833ab4,#c13584,#f77737)",
      icon: <Instagram className="h-5 w-5 text-white" strokeWidth={2.2} />,
    },
    twilio: { bg: "#F22F46", icon: <Phone className="h-5 w-5 text-white" strokeWidth={2.2} /> },
    website: { bg: "#B22257", icon: <Globe className="h-5 w-5 text-white" strokeWidth={2.2} /> },
    email: { bg: "#0055CC", icon: <Mail className="h-5 w-5 text-white" strokeWidth={2.2} /> },
  };
  const conf = map[channelId] ?? { bg: "#B22257", icon: <Globe className="h-5 w-5 text-white" /> };
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{ background: conf.bg }}
    >
      {conf.icon}
    </div>
  );
}

export function ChannelDetailsPanel({
  open,
  channelId,
  channelName,
  row,
  initialMode = "view",
  onClose,
  onSave,
}: {
  open: boolean;
  channelId: string;
  channelName: string;
  row: Record<string, string> | null;
  initialMode?: "view" | "edit";
  onClose: () => void;
  onSave?: (values: Record<string, string>) => void;
}) {
  const [mounted, setMounted] = useState<Record<string, string> | null>(row);
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [values, setValues] = useState<Record<string, string>>({});
  const [revealToken, setRevealToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  const config = useMemo<DetailConfig>(
    () =>
      mounted
        ? fieldsForChannel(channelId, mounted, { host: values.host, authMethod: values.authMethod })
        : { sections: [] },
    [channelId, mounted, values.host, values.authMethod],
  );

  useEffect(() => {
    if (row) {
      setMounted(row);
      setMode(initialMode);
      setRevealToken(false);
      const next: Record<string, string> = {};
      fieldsForChannel(channelId, row).sections.forEach((s) => {
        s.fields.forEach((f) => {
          next[f.id] = f.defaultValue ?? "";
        });
      });
      setValues(next);
    }
  }, [row, channelId, initialMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const title = useMemo(() => {
    if (!mounted) return channelName;
    return (
      values.displayName ||
      mounted.displayName ||
      mounted[Object.keys(mounted).find((k) => k !== "id" && k !== "status") ?? ""] ||
      channelName
    );
  }, [mounted, values, channelName]);

  const setVal = (id: string, v: string) => setValues((s) => ({ ...s, [id]: v }));

  const copyWebhook = async () => {
    if (!config.webhook) return;
    try {
      await navigator.clipboard.writeText(config.webhook.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${channelName} details`}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {mounted && (
          <>
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-[#e8e6e1] px-6 py-4">
              <ChannelBadge channelId={channelId} />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[16px] font-semibold text-foreground">
                  {title} <span className="font-normal text-muted-foreground">— Details</span>
                </h2>
                {mounted.createdDate && (
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    Created on {formatCreatedOn(mounted.createdDate)}
                  </p>
                )}
              </div>
              {mode === "view" ? (
                <button
                  type="button"
                  onClick={() => setMode("edit")}
                  aria-label="Edit"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#F7CFDD] bg-white text-[#B22257] transition hover:bg-[#FDF3F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              ) : null}
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-4">
                {config.sections.map((section) => (
                  <section
                    key={section.id}
                    className="rounded-xl border border-[#e8e6e1] bg-white p-4"
                  >
                    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
                      {section.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                      {section.fields.map((f) => (
                        <div key={f.id} className={cn("min-w-0", f.fullWidth && "col-span-2")}>
                          <FieldRow
                            key={f.id}
                            field={f}
                            mode={mode}
                            value={values[f.id] ?? ""}
                            onChange={(v) => setVal(f.id, v)}
                            revealToken={revealToken}
                            onToggleReveal={() => setRevealToken((v) => !v)}
                            openSelect={openSelect === f.id}
                            onToggleSelect={() =>
                              setOpenSelect((cur) => (cur === f.id ? null : f.id))
                            }
                            onSelectOption={(v) => {
                              setVal(f.id, v);
                              setOpenSelect(null);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}

                {config.webhook && (
                  <section className="rounded-xl border border-[#e8e6e1] bg-white p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-[#B22257]" />
                      <h3 className="text-[13px] font-semibold text-foreground">
                        {config.webhook.label}
                      </h3>
                    </div>
                    <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">
                      {config.webhook.description}
                    </p>
                    <div className="flex items-stretch overflow-hidden rounded-lg border border-[#e8e6e1] bg-[#faf9f7]">
                      <div className="webhook-scroll min-w-0 flex-1 overflow-x-auto whitespace-nowrap px-3 py-2 font-mono text-[12.5px] text-foreground">
                        {config.webhook.url}
                      </div>
                      <button
                        type="button"
                        onClick={copyWebhook}
                        className="inline-flex shrink-0 items-center gap-1.5 border-l border-[#e8e6e1] bg-white px-3 text-[13px] font-medium text-[#B22257] transition hover:bg-[#FDF3F7]"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Footer (edit only) */}
            {mode === "edit" && (
              <div className="flex items-center justify-end gap-2 border-t border-[#e8e6e1] bg-white px-6 py-3">
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="rounded-lg border border-[#e8e6e1] bg-white px-4 py-2 text-[13px] font-medium text-foreground transition hover:bg-muted/40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSave?.(values);
                    setMode("view");
                  }}
                  className="rounded-lg bg-[#B22257] px-4 py-2 text-[13px] font-medium text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40"
                >
                  Save Changes
                </button>
              </div>
            )}
          </>
        )}
      </aside>
    </>,
    document.body,
  );
}

function FieldRow({
  field,
  mode,
  value,
  onChange,
  revealToken,
  onToggleReveal,
  openSelect,
  onToggleSelect,
  onSelectOption,
}: {
  field: DetailField;
  mode: "view" | "edit";
  value: string;
  onChange: (v: string) => void;
  revealToken: boolean;
  onToggleReveal: () => void;
  openSelect: boolean;
  onToggleSelect: () => void;
  onSelectOption: (v: string) => void;
}) {
  const isToken = field.type === "password";
  const isReadOnly = !!field.readonly;
  const showAsStatic = mode === "view" || isReadOnly;
  const displayValue = value && value.length > 0 ? value : "—";
  const masked = isToken ? "•".repeat(12) : displayValue;
  const isMulti = field.type === "multiselect";
  const multiValues = isMulti
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const toggleMulti = (opt: string) => {
    const set = new Set(multiValues);
    if (set.has(opt)) set.delete(opt);
    else set.add(opt);
    onChange(Array.from(set).join(","));
  };

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value ?? "");
    } catch {
      /* noop */
    }
  };

  if (field.type === "checkbox") {
    const on = value === "true";
    return (
      <div className="min-w-0">
        <label
          className={cn(
            "flex items-center gap-2.5 rounded-lg border border-[#e8e6e1] bg-white px-3 py-2.5 text-[13.5px] text-foreground",
            showAsStatic ? "cursor-default" : "cursor-pointer hover:border-[#B22257]/50",
          )}
        >
          <input
            type="checkbox"
            checked={on}
            disabled={showAsStatic}
            onChange={(e) => onChange(e.target.checked ? "true" : "")}
            className="h-4 w-4 accent-[#B22257]"
          />
          <span>{field.label}</span>
          {field.hint && <FieldHint hint={field.hint} />}
        </label>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <label className="mb-1.5 flex items-center gap-1 text-[12px] font-medium text-muted-foreground/80">
        {field.label}
        {field.hint && <FieldHint hint={field.hint} />}
      </label>

      {isMulti && showAsStatic ? (
        <div
          className={cn(
            "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[13.5px]",
            "border-[#e8e6e1] bg-white",
          )}
        >
          {multiValues.length === 0 ? (
            <span className="px-1 text-muted-foreground">—</span>
          ) : (
            multiValues.map((v) => (
              <span
                key={v}
                className="inline-flex items-center rounded-full bg-[#f5f4f1] px-2.5 py-0.5 text-[12.5px] text-foreground"
              >
                {v}
              </span>
            ))
          )}
        </div>
      ) : isMulti ? (
        <div className="relative">
          <button
            type="button"
            onClick={onToggleSelect}
            className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-[#dcd6cc] bg-white px-2.5 py-1.5 text-left text-[13.5px] text-foreground shadow-[0_1px_0_rgba(17,17,17,0.02)] transition hover:border-[#B22257]/50 focus:outline-none focus-visible:border-[#B22257] focus-visible:ring-2 focus-visible:ring-[#B22257]/25"
          >
            {multiValues.length === 0 ? (
              <span className="px-1 text-muted-foreground">Select...</span>
            ) : (
              multiValues.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 rounded-full bg-[#FDF3F7] px-2.5 py-0.5 text-[12.5px] text-[#B22257]"
                >
                  {v}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMulti(v);
                    }}
                  />
                </span>
              ))
            )}
            <ChevronDown
              className={cn(
                "ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform",
                openSelect && "rotate-180",
              )}
            />
          </button>
          {openSelect && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-56 overflow-auto rounded-lg border border-[#e8e6e1] bg-white p-1 shadow-[0_8px_24px_-8px_rgba(17,17,17,0.15)]">
              {(field.options ?? []).map((opt) => {
                const active = multiValues.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleMulti(opt)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[13px] transition hover:bg-[#FDF3F7]",
                      active && "bg-[#FDF3F7] font-medium text-[#B22257]",
                    )}
                  >
                    <span className="truncate">{opt}</span>
                    {active && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : showAsStatic ? (
        <div
          className={cn(
            "relative flex h-10 w-full items-center gap-2 rounded-lg border px-3 text-[13.5px]",
            isReadOnly && mode === "edit"
              ? "border-[#e8e6e1] bg-[#f5f4f1] text-foreground/80"
              : "border-[#e8e6e1] bg-white text-foreground",
          )}
        >
          <div
            className={cn(
              "min-w-0 flex-1 truncate leading-snug",
              isToken && "font-mono tracking-wider",
            )}
          >
            {isToken ? (revealToken ? displayValue : masked) : displayValue}
            {field.suffix && !isToken && value && (
              <span className="ml-1 font-normal text-muted-foreground">{field.suffix}</span>
            )}
          </div>
          {isReadOnly && mode === "edit" && !field.copyable && (
            <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
          )}
          {isToken && (
            <button
              type="button"
              onClick={onToggleReveal}
              aria-label={revealToken ? "Hide" : "Reveal"}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-[#faf9f7] hover:text-foreground"
            >
              {revealToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
          {field.copyable && value && (
            <button
              type="button"
              onClick={copyValue}
              aria-label="Copy"
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-[#faf9f7] hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : field.type === "select" ? (
        <div className="relative">
          <button
            type="button"
            onClick={onToggleSelect}
            className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-[#dcd6cc] bg-white px-3 text-left text-[13.5px] text-foreground shadow-[0_1px_0_rgba(17,17,17,0.02)] transition hover:border-[#B22257]/50 focus:outline-none focus-visible:border-[#B22257] focus-visible:ring-2 focus-visible:ring-[#B22257]/25"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value || "Select..."}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform",
                openSelect && "rotate-180",
              )}
            />
          </button>
          {openSelect && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-56 overflow-auto rounded-lg border border-[#e8e6e1] bg-white p-1 shadow-[0_8px_24px_-8px_rgba(17,17,17,0.15)]">
              {(field.options ?? []).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onSelectOption(opt)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[13px] transition hover:bg-[#FDF3F7]",
                    value === opt && "bg-[#FDF3F7] font-medium text-[#B22257]",
                  )}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className="block w-full rounded-lg border border-[#dcd6cc] bg-white px-3 py-2.5 text-[13.5px] text-foreground shadow-[0_1px_0_rgba(17,17,17,0.02)] transition placeholder:text-muted-foreground/60 hover:border-[#B22257]/50 focus:outline-none focus:border-[#B22257] focus-visible:ring-2 focus-visible:ring-[#B22257]/25 resize-none leading-relaxed"
        />
      ) : (
        <div className="relative">
          <input
            type={
              isToken && !revealToken ? "password" : field.type === "number" ? "number" : "text"
            }
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={cn(
              "block h-10 w-full rounded-lg border border-[#dcd6cc] bg-white px-3 text-[13.5px] text-foreground shadow-[0_1px_0_rgba(17,17,17,0.02)] transition placeholder:text-muted-foreground/60 hover:border-[#B22257]/50 focus:outline-none focus:border-[#B22257] focus-visible:ring-2 focus-visible:ring-[#B22257]/25",
              isToken && "pr-10 font-mono tracking-wider",
              field.suffix && "pr-14",
            )}
          />
          {field.suffix && !isToken && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12.5px] text-muted-foreground">
              {field.suffix}
            </span>
          )}
          {isToken && (
            <button
              type="button"
              onClick={onToggleReveal}
              aria-label={revealToken ? "Hide" : "Reveal"}
              className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-[#faf9f7] hover:text-foreground"
            >
              {revealToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
