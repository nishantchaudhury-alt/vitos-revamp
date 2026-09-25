import { useEffect, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  X,
  Globe,
  Star,
  Info,
  ChevronDown,
  Eye,
  EyeOff,
  Sparkles,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer } from "./PageContainer";
import { ChannelListView } from "./ChannelListView";

type Channel = {
  id: string;
  name: string;
  description: string;
  logo: React.ReactNode;
  connected?: boolean;
  recommended?: boolean;
  fields?: { id: string; label: string; placeholder?: string; type?: "text" | "password" }[];
  form?: {
    headerTitle: string;
    headerSubtitle: string;
    sectionTitle: string;
    sectionSubtitle: string;
    rows?: FormRow[];
    getRows?: (values: Record<string, string>) => FormRow[];
    defaults?: Record<string, string>;
    steps?: { title: string; description: string }[];
    aop?: {
      title: string;
      description: string;
      agents: string[];
    };
    saveLabel?: string;
  };
  oauth?: {
    provider: "Facebook" | "Instagram";
    headerTitle: string;
    headerSubtitle: string;
    permissionsIntro: string;
    permissions: { id: string; label: string; description: string }[];
    steps: { title: string; description: React.ReactNode }[];
    ctaLabel: string;
    ctaClass: string;
  };
};

type FormField = {
  id: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "select" | "textarea" | "checkbox" | "number" | "cards";
  options?: string[];
  hint?: string;
  disabled?: boolean;
  lockedValue?: string;
};
type FormRow = FormField | FormField[];

type Section = {
  id: string;
  title: string;
  subtitle: string;
  channels: Channel[];
};

/* -------- Logos -------- */

const LogoWrap = ({ bg = "#fff", children }: { bg?: string; children: React.ReactNode }) => (
  <div
    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e8e6e1]"
    style={{ background: bg }}
  >
    {children}
  </div>
);

const TwilioLogo = () => (
  <LogoWrap>
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#F22F46">
      <circle cx="12" cy="12" r="10" fill="#F22F46" />
      <circle cx="9" cy="9" r="1.6" fill="#fff" />
      <circle cx="15" cy="9" r="1.6" fill="#fff" />
      <circle cx="9" cy="15" r="1.6" fill="#fff" />
      <circle cx="15" cy="15" r="1.6" fill="#fff" />
    </svg>
  </LogoWrap>
);

const ExotelLogo = () => (
  <LogoWrap>
    <span className="text-[10px] font-semibold tracking-tight text-foreground">exotel</span>
  </LogoWrap>
);

const OzonetelLogo = () => (
  <LogoWrap>
    <span className="text-[9px] font-semibold tracking-tight text-[#0aa14a]">Ozonetel</span>
  </LogoWrap>
);

const TataLogo = () => (
  <LogoWrap bg="#0b3d91">
    <span className="text-[8px] font-bold leading-tight text-white text-center">
      TATA
      <br />
      TELE
    </span>
  </LogoWrap>
);

const SipLogo = () => (
  <LogoWrap bg="#e6f4ff">
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="#0aa1ff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  </LogoWrap>
);

const FacebookLogo = () => (
  <LogoWrap bg="#1877f2">
    <span className="text-lg font-bold leading-none text-white">f</span>
  </LogoWrap>
);

const InstagramLogo = () => (
  <LogoWrap>
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <defs>
        <linearGradient id="ig-g" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#feda75" />
          <stop offset=".3" stopColor="#fa7e1e" />
          <stop offset=".6" stopColor="#d62976" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#ig-g)" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="17" cy="7" r="1.1" fill="#fff" />
    </svg>
  </LogoWrap>
);

const WhatsAppLogo = () => (
  <LogoWrap bg="#25d366">
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#fff">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.6-1.2 1.2-1.7 1.3-.4 0-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.4-3.7-4.5-3.9-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.1.1.3 0 .5-.1.2-.2.3-.3.5l-.3.4c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1.2-.2.6-.7.8-1 .2-.2.3-.2.5-.1.2.1 1.4.7 1.6.8.2.1.4.2.4.3.1.1.1.6-.1 1.2Z" />
    </svg>
  </LogoWrap>
);

const WebsiteLogo = () => (
  <LogoWrap bg="#e0f2fe">
    <Globe className="h-5 w-5 text-[#0aa1ff]" />
  </LogoWrap>
);

const EmailLogo = () => (
  <LogoWrap bg="#e8f0fe">
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="#0055CC"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  </LogoWrap>
);

/* -------- Data -------- */

const CALL_FIELDS = [
  { id: "account", label: "Account SID", placeholder: "AC••••••••" },
  { id: "token", label: "Auth Token", placeholder: "Enter auth token", type: "password" as const },
  { id: "number", label: "Phone number", placeholder: "+1 555 000 0000" },
];

const SOCIAL_FIELDS = [
  { id: "app", label: "App ID", placeholder: "Enter app ID" },
  { id: "secret", label: "App secret", placeholder: "Enter app secret", type: "password" as const },
  { id: "page", label: "Page / account", placeholder: "Enter page or account" },
];

/* Email config is host-driven: the visible fields depend on the selected Host. */
const EMAIL_HOSTS = ["Gmail", "Outlook", "SES", "Custom"];
const HOST_HINTS: Record<string, string> = {
  Gmail: "Google Workspace mailbox",
  Outlook: "Microsoft 365 / Outlook",
  SES: "Amazon SES forwarding",
  Custom: "IMAP / any provider",
};

const GmailHostLogo = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M2 6.5v11A1.5 1.5 0 0 0 3.5 19H5V8.4l7 5.1 7-5.1V19h1.5A1.5 1.5 0 0 0 22 17.5v-11L12 13.75Z"
    />
    <path fill="#EA4335" d="M2 6.5 12 13.75 22 6.5A1.5 1.5 0 0 0 20.5 5h-17A1.5 1.5 0 0 0 2 6.5Z" />
  </svg>
);

const OutlookHostLogo = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" fill="#0078D4" />
    <circle cx="9" cy="12" r="3.2" fill="#fff" />
    <circle cx="9" cy="12" r="1.5" fill="#0078D4" />
  </svg>
);

const SesHostLogo = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#FF9900" d="M12 3 3 7.5v9L12 21l9-4.5v-9Zm0 2.2 6.8 3.4L12 12 5.2 8.6Z" />
  </svg>
);

const CustomHostLogo = () => <Server className="h-4 w-4 text-[#6b7280]" />;

const HOST_LOGOS: Record<string, () => ReactElement> = {
  Gmail: GmailHostLogo,
  Outlook: OutlookHostLogo,
  SES: SesHostLogo,
  Custom: CustomHostLogo,
};
const MAIL_STORES = ["IMAP", "IMAPS"];
const MAILBOX_FOLDERS = ["Inbox", "Sent", "Drafts", "Spam"];
const EMAIL_AUTH_METHODS = ["Password", "OAuth 2.0"];

const AUTH_METHOD_HINT =
  "Password: sign in with the mailbox email and password (or an app password). OAuth 2.0: token-based access for Gmail / Microsoft 365 using a Client ID and Secret.";

function emailFormRows(values: Record<string, string>): FormRow[] {
  const host = values.host || "";
  const authMethod = values.authMethod || "Password";
  const isOAuth = authMethod === "OAuth 2.0";

  const fHost: FormField = {
    id: "host",
    label: "Host",
    type: "cards",
    options: EMAIL_HOSTS,
    placeholder: "Choose the mail provider you're connecting.",
    hint: "Select a host to reveal the credentials and mailbox settings it needs.",
  };
  const fAccountName: FormField = {
    id: "accountName",
    label: "Account Name",
    placeholder: "e.g. Support",
  };
  const fAuthMethod: FormField = {
    id: "authMethod",
    label: "Authentication Method",
    type: "select",
    options: EMAIL_AUTH_METHODS,
    placeholder: "Select method",
    hint: AUTH_METHOD_HINT,
  };
  const fEmailId: FormField = {
    id: "emailId",
    label: "Email ID",
    placeholder: "e.g. support@company.com",
  };
  const fPassword: FormField = {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter password",
    hint: "Use the mailbox password or an app-specific password.",
  };
  const fClientId: FormField = {
    id: "clientId",
    label: "Client ID",
    placeholder: "OAuth client ID",
    hint: "From your Google Cloud or Azure app registration.",
  };
  const fClientSecret: FormField = {
    id: "clientSecret",
    label: "Client Secret",
    type: "password",
    placeholder: "OAuth client secret",
  };
  const fForwardId: FormField = {
    id: "forwardId",
    label: "Forward Mail ID",
    placeholder: "e.g. forward@company.com",
  };
  const fUseAccount: FormField = {
    id: "useAccountName",
    label: "Use Account Name While Replying",
    type: "checkbox",
    hint: "On: replies use the mailbox's Account Name. Off: replies use the user's own Account Name.",
  };
  const fMailStore: FormField = {
    id: "mailStore",
    label: "Mail Store",
    type: "select",
    options: MAIL_STORES,
    placeholder: "Select mail store",
  };
  const fMailbox: FormField = {
    id: "mailboxFolder",
    label: "Mailbox Folder",
    type: "select",
    options: MAILBOX_FOLDERS,
    placeholder: "Select folder",
  };
  const fHostName: FormField = {
    id: "hostName",
    label: "Host Name",
    placeholder: "e.g. imap.company.com",
  };
  const fProtocol: FormField = {
    id: "protocol",
    label: "Protocol (Port)",
    type: "number",
    placeholder: "e.g. 993",
  };

  // Until a host is chosen, only surface the host picker — everything else is host-dependent.
  if (!host) {
    return [fHost];
  }

  // SES authenticates via a forwarding address; mailbox settings are fixed by Kapture and locked.
  if (host === "SES") {
    return [
      fHost,
      fForwardId,
      fAccountName,
      fUseAccount,
      [
        { ...fMailStore, disabled: true, lockedValue: "IMAPS" },
        { ...fMailbox, disabled: true, lockedValue: "Inbox" },
      ],
      [
        { ...fHostName, disabled: true, lockedValue: "imap.kapture.tech" },
        { ...fProtocol, label: "Port", disabled: true, lockedValue: "993" },
      ],
    ];
  }

  // The mailbox Email ID is always captured; Password and OAuth are mutually exclusive for the secret.
  const secret: FormRow = isOAuth ? [fClientId, fClientSecret] : fPassword;
  const rows: FormRow[] = [fHost, fEmailId, fAccountName, fUseAccount, fAuthMethod, secret];

  if (host === "Custom") {
    rows.push(fForwardId, [fMailStore, fMailbox], [fHostName, fProtocol]);
  } else {
    // Gmail / Outlook
    rows.push([fMailStore, fMailbox]);
  }
  return rows;
}

const SECTIONS: Section[] = [
  {
    id: "call",
    title: "Call Channels",
    subtitle: "Cloud telephony providers that let your agents place and receive voice calls.",
    channels: [
      {
        id: "twilio",
        name: "Twilio",
        description: "Programmable voice calls, SMS and phone numbers across 100+ countries.",
        logo: <TwilioLogo />,
        recommended: true,
        fields: CALL_FIELDS,
      },
      {
        id: "exotel",
        name: "Exotel",
        description: "Cloud telephony platform for high-volume Indian and APAC voice traffic.",
        logo: <ExotelLogo />,
        fields: CALL_FIELDS,
      },
      {
        id: "ozonetel",
        name: "Ozonetel",
        description: "Contact-centre grade cloud telephony with call flow builder and CRM hooks.",
        logo: <OzonetelLogo />,
        fields: CALL_FIELDS,
      },
      {
        id: "tata",
        name: "Tata Teleservice",
        description: "Enterprise-grade wired and wireless voice, data and business connectivity.",
        logo: <TataLogo />,
        fields: CALL_FIELDS,
      },
    ],
  },
  {
    id: "sip",
    title: "SIP Integration",
    subtitle: "Bring your own SIP trunk or PBX for direct SIP-based voice connectivity.",
    channels: [
      {
        id: "sip",
        name: "SIP Integration",
        description: "Route inbound and outbound calls over any SIP-compatible trunk or PBX.",
        logo: <SipLogo />,
        fields: [
          { id: "uri", label: "SIP URI", placeholder: "sip:agent@your-domain.com" },
          { id: "user", label: "Username", placeholder: "SIP username" },
          { id: "pass", label: "Password", placeholder: "SIP password", type: "password" as const },
        ],
      },
    ],
  },
  {
    id: "social",
    title: "Social Media Channels",
    subtitle: "Meet customers where they already chat — social inboxes and messaging apps.",
    channels: [
      {
        id: "facebook",
        name: "Facebook",
        description: "Automate Messenger conversations for your Facebook Page.",
        logo: <FacebookLogo />,
        oauth: {
          provider: "Facebook",
          headerTitle: "Connect Facebook Page",
          headerSubtitle: "Authorize permissions and messenger access",
          permissionsIntro:
            "Select the capabilities to authorize when connecting your Facebook Page.",
          permissions: [
            {
              id: "messenger",
              label: "Messenger Conversations",
              description: "Send and receive messages from customers via Facebook Messenger.",
            },
            {
              id: "mentions",
              label: "Page Mentions & Comments",
              description: "Automatically track and respond to public posts and comment threads.",
            },
            {
              id: "leads",
              label: "Lead Ad Forms",
              description: "Capture instant leads generated from Facebook ad campaigns.",
            },
            {
              id: "ig_posts",
              label: "Instagram Post & Comment",
              description:
                "Read linked Instagram posts and respond to their comments from one place.",
            },
            {
              id: "msg_feedback",
              label: "Message Feedback",
              description:
                "Collect ratings and feedback shared by customers inside Messenger threads.",
            },
          ],
          steps: [
            {
              title: "Authenticate with Facebook.",
              description: (
                <>
                  Selecting <strong className="font-semibold text-foreground">Connect</strong> opens
                  Facebook in a new tab to authorize your Page and the permissions above.
                </>
              ),
            },
            {
              title: "Return to the channel list.",
              description: (
                <>
                  After you authenticate, you'll be redirected back to the{" "}
                  <strong className="font-semibold text-foreground">View List</strong> page, where
                  your connected Page appears.
                </>
              ),
            },
            {
              title: "Set up AOP.",
              description: (
                <>
                  From <strong className="font-semibold text-foreground">View List</strong>, open
                  the entry's <strong className="font-semibold text-foreground">Edit</strong> action
                  to assign an AI agent and memory window.
                </>
              ),
            },
          ],
          ctaLabel: "Authenticate with Facebook",
          ctaClass: "bg-[#1877f2] hover:bg-[#166fe0]",
        },
      },
      {
        id: "instagram",
        name: "Instagram",
        description: "Handle DMs and story replies from your Instagram business account.",
        logo: <InstagramLogo />,
        oauth: {
          provider: "Instagram",
          headerTitle: "Connect Instagram Professional",
          headerSubtitle: "Authorize direct messages and comment tracking",
          permissionsIntro:
            "Select the capabilities to authorize when connecting your Instagram Professional account.",
          permissions: [
            {
              id: "dms",
              label: "Direct Messages (DMs)",
              description: "Handle inbound story replies and direct messages automatically.",
            },
            {
              id: "comments",
              label: "Comments & Mentions",
              description: "Engage with users who comment on your posts or tag your handle.",
            },
          ],
          steps: [
            {
              title: "Authenticate with Instagram.",
              description: (
                <>
                  Selecting <strong className="font-semibold text-foreground">Connect</strong> opens
                  Instagram in a new tab to authorize your account and the permissions above.
                </>
              ),
            },
            {
              title: "Return to the channel list.",
              description: (
                <>
                  After you authenticate, you'll be redirected back to the{" "}
                  <strong className="font-semibold text-foreground">View List</strong> page, where
                  your connected account appears.
                </>
              ),
            },
            {
              title: "Set up AOP.",
              description: (
                <>
                  From <strong className="font-semibold text-foreground">View List</strong>, open
                  the entry's <strong className="font-semibold text-foreground">Edit</strong> action
                  to assign an AI agent and memory window.
                </>
              ),
            },
          ],
          ctaLabel: "Authenticate with Instagram",
          ctaClass: "bg-gradient-to-r from-[#833ab4] via-[#c13584] to-[#f77737] hover:opacity-90",
        },
      },
      {
        id: "whatsapp",
        name: "WhatsApp",
        description: "Conversational agents over the WhatsApp Business API.",
        logo: <WhatsAppLogo />,
        recommended: true,
        form: {
          headerTitle: "WhatsApp Configuration",
          headerSubtitle: "Connect your WhatsApp Business number",
          sectionTitle: "Connection Details",
          sectionSubtitle: "Enter the WhatsApp Business API credentials provided by your vendor.",
          rows: [
            [
              {
                id: "vendor",
                label: "Select Vendor",
                placeholder: "Select Vendor",
                type: "select",
                options: ["GUPSHUP", "MSG91", "KARIX", "TWILIO", "INFOBIP"],
              },
              {
                id: "phone",
                label: "Whatsapp Phone Number",
                placeholder: "Enter the phone number",
              },
            ],
            { id: "displayName", label: "Display Name", placeholder: "Enter the display name" },
            [
              { id: "username", label: "Username", placeholder: "Enter the username" },
              {
                id: "password",
                label: "Password",
                placeholder: "Enter the password",
                type: "password",
              },
            ],
            { id: "appId", label: "App ID", placeholder: "Enter the app ID" },
            { id: "accessToken", label: "Access Token", placeholder: "Enter the access token" },
          ],
          aop: {
            title: "AOP Configuration",
            description:
              "Optional. Assign an AI agent to automatically handle conversations on this channel.",
            agents: [
              "WhatsApp Fallback Agent (DPD +5)",
              "Blue Collar Inbound Agent",
              "Support Bot",
              "Sales Assistant",
              "Collections Agent",
            ],
          },
          saveLabel: "Save",
        },
      },
    ],
  },
  {
    id: "web",
    title: "Websites",
    subtitle: "Embed a live chat agent on your website or web app.",
    channels: [
      {
        id: "website",
        name: "Website",
        description: "Drop-in web widget for on-site conversations and lead capture.",
        logo: <WebsiteLogo />,
        fields: [
          { id: "domain", label: "Domain", placeholder: "https://your-site.com" },
          { id: "widgetId", label: "Widget ID", placeholder: "widget_••••" },
        ],
      },
    ],
  },
  {
    id: "email",
    title: "Email Channels",
    subtitle: "Connect email inboxes to manage support tickets and conversations.",
    channels: [
      {
        id: "email",
        name: "Email",
        description: "Connect email inboxes via IMAP to manage support tickets.",
        logo: <EmailLogo />,
        form: {
          headerTitle: "Email Configuration",
          headerSubtitle: "Kapture Email Configuration details are listed below",
          sectionTitle: "Connection Details",
          sectionSubtitle:
            "Enter the inbox account and connection details Kapture uses to sync and reply to emails.",
          defaults: { authMethod: "Password", mailStore: "IMAP", mailboxFolder: "Inbox" },
          getRows: emailFormRows,
          steps: [
            {
              title: "Configure in Vitos.",
              description:
                "Choose a host and fill in the mailbox details above, then save this configuration.",
            },
            {
              title: "Authenticate or set up forwarding.",
              description:
                "In your mailbox, authorize access (OAuth) or set up forwarding to the Kapture address.",
            },
            {
              title: "Return to View List & assign an agent.",
              description:
                "Open the entry from View List and set a Primary Agent to start automating replies.",
            },
          ],
          saveLabel: "Save",
        },
      },
    ],
  },
];

/* -------- Page -------- */

export function ChannelsPage() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [listId, setListId] = useState<string | null>(null);

  const toggleConnected = (id: string) => setConnected((s) => ({ ...s, [id]: !s[id] }));

  const toggleOpen = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  const activeChannel = openId
    ? (SECTIONS.flatMap((s) => s.channels).find((c) => c.id === openId) ?? null)
    : null;

  const listChannel = listId
    ? (SECTIONS.flatMap((s) => s.channels).find((c) => c.id === listId) ?? null)
    : null;

  if (listChannel) {
    return (
      <PageContainer fullWidth>
        <ChannelListView
          channelId={listChannel.id}
          channelName={listChannel.name}
          onBack={() => setListId(null)}
          onCreate={() => {
            setListId(null);
            setOpenId(listChannel.id);
          }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-10">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <header className="border-b border-border px-5 py-4 sm:px-6">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Channels</h1>
          <p className="mt-1 max-w-5xl text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
            Set up and manage cloud telephony, social media, web, and email integrations so AI
            agents can engage with customers seamlessly across channels.
          </p>
        </header>

        <div className="space-y-7 px-5 py-5 sm:px-6 sm:py-6">
          {SECTIONS.filter((section) => section.id !== "email").map((section) => (
            <section key={section.id} aria-labelledby={`channel-section-${section.id}`}>
              <header className="mb-3">
                <h2
                  id={`channel-section-${section.id}`}
                  className="text-[15px] font-semibold text-foreground"
                >
                  {section.title}
                </h2>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
                  {section.subtitle}
                </p>
              </header>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {section.channels.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    connected={!!connected[channel.id]}
                    open={openId === channel.id}
                    onConfigure={() => toggleOpen(channel.id)}
                    onViewList={() => setListId(channel.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <ChannelConfigDrawer
        channel={activeChannel}
        connected={activeChannel ? !!connected[activeChannel.id] : false}
        onClose={() => setOpenId(null)}
        onToggleConnected={() => activeChannel && toggleConnected(activeChannel.id)}
      />
    </PageContainer>
  );
}

function ChannelCard({
  channel,
  connected,
  open,
  onConfigure,
  onViewList,
}: {
  channel: Channel;
  connected: boolean;
  open: boolean;
  onConfigure: () => void;
  onViewList: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex min-h-[166px] flex-col rounded-xl border bg-card p-4 text-left transition duration-200",
        open
          ? "border-[#B22257] ring-1 ring-[#B22257]/15"
          : connected
            ? "border-[#B22257]/40 ring-1 ring-[#B22257]/10"
            : "border-border hover:border-[#B22257]/30 hover:shadow-[0_4px_14px_rgba(15,23,42,0.05)]",
      )}
    >
      <button
        type="button"
        onClick={onConfigure}
        aria-expanded={open}
        aria-label={`Configure ${channel.name}`}
        className="absolute right-4 top-4 inline-flex h-8 items-center justify-center rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-foreground shadow-sm transition hover:border-[#B22257]/35 hover:bg-[#FDF6F8] hover:text-[#B22257] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
      >
        Configure
      </button>

      {channel.logo}
      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="truncate text-[14px] font-semibold text-foreground">{channel.name}</span>
        {connected && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-emerald-700">
            <Check className="h-2.5 w-2.5" /> Connected
          </span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
        {channel.description}
      </p>
      <button
        type="button"
        onClick={onViewList}
        aria-label={`View list for ${channel.name}`}
        className="mt-auto w-fit pt-3 text-[12.5px] font-medium text-[#B22257] transition hover:text-[#8F1944] hover:underline hover:underline-offset-4 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#B22257]/35"
      >
        View list
      </button>
    </div>
  );
}

/* -------- Config panel -------- */

function ChannelConfigPanel({
  channel,
  connected,
  onClose,
  onToggleConnected,
}: {
  channel: Channel;
  connected: boolean;
  onClose: () => void;
  onToggleConnected: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(channel.form?.defaults ?? {});
  const [savedKeys, setSavedKeys] = useState<{ name: string }[]>([]);
  const [keyName, setKeyName] = useState("");
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [showPw, setShowPw] = useState<Record<string, boolean>>({});
  const [aopOn, setAopOn] = useState(true);
  const [agent, setAgent] = useState<string>("");
  const [memory, setMemory] = useState<string>("0");

  // Seed defaults (and reset) whenever a different channel opens.
  useEffect(() => {
    setValues(channel.form?.defaults ?? {});
    setShowPw({});
  }, [channel.id, channel.form?.defaults]);

  const fields = channel.fields ?? [];
  const canSave = keyName.trim() && fields.every((f) => (values[f.id] ?? "").trim());
  const oauth = channel.oauth;
  const form = channel.form;
  const formRows = form ? (form.getRows ? form.getRows(values) : (form.rows ?? [])) : [];
  const anyPerm = oauth ? oauth.permissions.some((p) => perms[p.id]) : false;

  const handleSave = () => {
    if (!canSave) return;
    setSavedKeys((k) => [...k, { name: keyName.trim() }]);
    setKeyName("");
    setValues({});
    if (!connected) onToggleConnected();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#faf9f7]">
      <div className="flex shrink-0 items-start gap-3 border-b border-[#e8e6e1] px-5 py-4">
        {channel.logo}
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-foreground">
            {oauth ? oauth.headerTitle : form ? form.headerTitle : `${channel.name} Configuration`}
          </div>
          <div className="text-[12.5px] text-muted-foreground">
            {oauth
              ? oauth.headerSubtitle
              : form
                ? form.headerSubtitle
                : `Configure credentials for ${channel.name}`}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-muted-foreground hover:bg-white hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {form ? (
        <>
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <section>
              <div className="text-[14px] font-semibold text-foreground">{form.sectionTitle}</div>
              <p className="mt-1 text-[12.5px] text-muted-foreground">{form.sectionSubtitle}</p>
              <div className="mt-4 space-y-3.5">
                {formRows.map((row, ri) => {
                  const list = Array.isArray(row) ? row : [row];
                  return (
                    <div
                      key={ri}
                      className={cn(
                        "grid gap-3.5",
                        list.length === 2 ? "grid-cols-2" : "grid-cols-1",
                      )}
                    >
                      {list.map((f) => (
                        <FormFieldControl
                          key={f.id}
                          field={f}
                          value={f.lockedValue ?? values[f.id] ?? ""}
                          showPassword={!!showPw[f.id]}
                          onTogglePassword={() => setShowPw((s) => ({ ...s, [f.id]: !s[f.id] }))}
                          onChange={(v) => setValues((s) => ({ ...s, [f.id]: v }))}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>

            {form.steps && (
              <section>
                <div className="rounded-2xl border border-[#F0D3DF] bg-[#FDF3F7] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F0D3DF] bg-white text-[#B22257]">
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                      <div className="text-[14px] font-semibold text-foreground">
                        What happens next
                      </div>
                    </div>
                    <span className="rounded-md border border-[#F0D3DF] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#B22257]">
                      Setup Steps
                    </span>
                  </div>
                  <ol className="relative">
                    {form.steps.map((s, i) => {
                      const last = i === form.steps!.length - 1;
                      return (
                        <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                          {!last && (
                            <span
                              aria-hidden
                              className="absolute left-[13px] top-7 bottom-0 w-px bg-[#E7BDCD]"
                            />
                          )}
                          <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#B22257]/50 bg-[#FDF3F7] text-[11px] font-semibold text-[#B22257]">
                            {i + 1}
                          </div>
                          <div className="pt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                            <span className="font-semibold text-foreground">{s.title}</span>{" "}
                            {s.description}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </section>
            )}

            {form.aop && (
              <section
                className={cn(
                  "rounded-2xl border p-4 sm:p-5",
                  aopOn ? "border-[#F0D3DF] bg-[#FDF3F7]" : "border-[#e8e6e1] bg-white",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      aopOn ? "bg-white text-[#B22257]" : "bg-[#f4f3f1] text-muted-foreground",
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-[14px] font-semibold text-foreground">
                        {form.aop.title}
                      </div>
                      <span className="rounded-md border border-[#F0D3DF] bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#B22257]">
                        AI Orchestration
                      </span>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                      {form.aop.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={aopOn}
                    onClick={() => setAopOn((v) => !v)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition",
                      aopOn ? "bg-[#B22257]" : "bg-[#d9d6d1]",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                        aopOn ? "translate-x-[22px]" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </div>

                {aopOn && (
                  <div className="mt-4 space-y-3 border-t border-[#F0D3DF] pt-4">
                    <label className="block">
                      <div className="mb-1 flex items-center gap-1 text-[12.5px] font-medium text-foreground">
                        Primary Agent
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="relative">
                        <select
                          value={agent}
                          onChange={(e) => setAgent(e.target.value)}
                          className={cn(inputCls, "appearance-none pr-9 border-[#B22257]")}
                        >
                          <option value="">Select an agent</option>
                          {form.aop.agents.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </label>
                    <label className="block">
                      <div className="mb-1 flex items-center gap-1 text-[12.5px] font-medium text-foreground">
                        Memory Window (mins)
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={memory}
                        onChange={(e) => setMemory(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#e8e6e1] bg-white px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#B22257]/40 bg-white px-5 py-1.5 text-[13px] font-medium text-[#B22257] hover:bg-[#FDF3F7]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!connected) onToggleConnected();
                onClose();
              }}
              className="rounded-lg bg-[#B22257] px-5 py-1.5 text-[13px] font-semibold text-white ring-1 ring-inset ring-[#B22257] hover:bg-[#9c1e4d]"
            >
              {form.saveLabel ?? "Save"}
            </button>
          </div>
        </>
      ) : oauth ? (
        <>
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <section>
              <div className="text-[14px] font-semibold text-foreground">
                1. Requested permissions
              </div>
              <p className="mt-1 text-[12.5px] text-muted-foreground">{oauth.permissionsIntro}</p>
              <div className="mt-3 space-y-2">
                {oauth.permissions.map((p) => {
                  const checked = !!perms[p.id];
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-2.5 rounded-lg border bg-white p-3 transition",
                        checked
                          ? "border-[#B22257] ring-1 ring-[#B22257]/20"
                          : "border-[#e8e6e1] hover:border-[#B22257]/40",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setPerms((s) => ({ ...s, [p.id]: e.target.checked }))}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#B22257]"
                      />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-foreground">{p.label}</div>
                        <div className="text-[12px] leading-relaxed text-muted-foreground">
                          {p.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="text-[14px] font-semibold text-foreground">
                2. Authentication & AI setup
              </div>
              <div className="mt-3 rounded-2xl border border-[#F0D3DF] bg-[#FDF3F7] p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F0D3DF] bg-white text-[#B22257]">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <div className="text-[14px] font-semibold text-foreground">
                      What happens next
                    </div>
                  </div>
                  <span className="rounded-md border border-[#F0D3DF] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#B22257]">
                    AI Orchestration
                  </span>
                </div>
                <ol className="relative">
                  {oauth.steps.map((s, i) => {
                    const last = i === oauth.steps.length - 1;
                    return (
                      <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                        {!last && (
                          <span
                            aria-hidden
                            className="absolute left-[13px] top-7 bottom-0 w-px bg-[#E7BDCD]"
                          />
                        )}
                        <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#B22257]/50 bg-[#FDF3F7] text-[11px] font-semibold text-[#B22257]">
                          {i + 1}
                        </div>
                        <div className="pt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                          <span className="font-semibold text-foreground">{s.title}</span>{" "}
                          {s.description}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#e8e6e1] bg-white px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#e8e6e1] bg-white px-4 py-1.5 text-[13px] font-medium text-foreground hover:border-[#B22257]/40 hover:text-[#B22257]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!anyPerm}
              onClick={() => {
                if (!connected) onToggleConnected();
                onClose();
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-[13px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50",
                oauth.ctaClass,
              )}
            >
              <span className="inline-flex h-4 w-4 items-center justify-center">
                {oauth.provider === "Facebook" ? (
                  <span className="text-[13px] font-bold leading-none">f</span>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                )}
              </span>
              {oauth.ctaLabel}
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="rounded-xl border border-[#e8e6e1] bg-white p-4">
            <div className="mb-3 text-[13px] font-semibold text-foreground">Add New Connection</div>
            <div className="space-y-3">
              <Field label="Connection name" required>
                <input
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Support line"
                  className={inputCls}
                />
              </Field>
              {fields.map((f) => (
                <Field key={f.id} label={f.label} required>
                  <input
                    value={values[f.id] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                    placeholder={f.placeholder}
                    type={f.type ?? "text"}
                    className={inputCls}
                  />
                </Field>
              ))}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave}
                  className="rounded-lg bg-[#B22257] px-4 py-1.5 text-[13px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 mb-2 text-[13px] font-semibold text-foreground">
            Saved Connections
          </div>
          <div className="rounded-xl border border-[#e8e6e1] bg-white px-4 py-8">
            {savedKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f3f1] text-muted-foreground">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="text-[13px] font-semibold text-foreground">No connections yet</div>
                <div className="text-[12.5px] text-muted-foreground">
                  Add credentials above to activate this channel.
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-[#e8e6e1]">
                {savedKeys.map((k, idx) => (
                  <li key={idx} className="flex items-center justify-between py-2 text-[13px]">
                    <span className="font-medium text-foreground">{k.name}</span>
                    <span className="text-[11px] uppercase tracking-wider text-emerald-700">
                      Active
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#e8e6e1] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground/70 focus:border-[#B22257]";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[12.5px] font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-[#B22257]">*</span>}
      </div>
      {children}
    </label>
  );
}

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

function FormFieldControl({
  field,
  value,
  onChange,
  showPassword,
  onTogglePassword,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
}) {
  const disabled = !!field.disabled;
  const disabledCls = disabled && "cursor-not-allowed bg-[#f4f3f1] text-muted-foreground/60";

  if (field.type === "checkbox") {
    return (
      <div className="flex items-center gap-2 py-1">
        <input
          type="checkbox"
          id={field.id}
          checked={value === "true"}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked ? "true" : "")}
          className="h-4 w-4 cursor-pointer accent-[#B22257] disabled:cursor-not-allowed"
        />
        <label
          htmlFor={field.id}
          className={cn(
            "cursor-pointer text-[13px] text-foreground",
            disabled && "cursor-not-allowed text-muted-foreground/60",
          )}
        >
          {field.label}
        </label>
        {field.hint && <FieldHint hint={field.hint} />}
      </div>
    );
  }
  if (field.type === "cards") {
    return (
      <div>
        <div className="mb-1 flex items-center gap-1 text-[13px] font-semibold text-foreground">
          {field.label}
          {field.hint && <FieldHint hint={field.hint} />}
        </div>
        {field.placeholder && (
          <p className="mb-2.5 text-[12px] text-muted-foreground">{field.placeholder}</p>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          {field.options?.map((o) => {
            const active = value === o;
            const Logo = HOST_LOGOS[o];
            return (
              <button
                key={o}
                type="button"
                onClick={() => onChange(active ? "" : o)}
                className={cn(
                  "group relative flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition",
                  active
                    ? "border-[#B22257] bg-[#FDF3F7] ring-2 ring-[#B22257]/15"
                    : "border-[#e8e6e1] bg-white hover:border-[#d5d1c9] hover:bg-[#faf9f7]",
                )}
              >
                {Logo && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f4f3f1]">
                    <Logo />
                  </span>
                )}
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span
                    className={cn(
                      "text-[13px] font-semibold",
                      active ? "text-[#B22257]" : "text-foreground",
                    )}
                  >
                    {o}
                  </span>
                  <span className="text-[11.5px] text-muted-foreground">{HOST_HINTS[o] ?? ""}</span>
                </span>
                {active && (
                  <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#B22257] text-[10px] font-bold text-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <label className="block">
      <div className="mb-1 flex items-center gap-1 text-[13px] font-semibold text-foreground">
        {field.label}
        {field.hint && <FieldHint hint={field.hint} />}
      </div>
      {field.type === "select" ? (
        <div className="relative">
          <select
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              inputCls,
              "appearance-none pr-9",
              !value && "text-muted-foreground",
              disabledCls,
            )}
          >
            <option value="">{field.placeholder ?? "Select"}</option>
            {field.options?.map((o) => (
              <option key={o} value={o} className="text-foreground">
                {o}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      ) : field.type === "password" ? (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={cn(inputCls, "pr-9", disabledCls)}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      ) : field.type === "textarea" ? (
        <textarea
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={cn(inputCls, "resize-none leading-relaxed", disabledCls)}
        />
      ) : field.type === "number" ? (
        <input
          type="number"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn(inputCls, disabledCls)}
        />
      ) : (
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn(inputCls, disabledCls)}
        />
      )}
    </label>
  );
}

function ChannelConfigDrawer({
  channel,
  connected,
  onClose,
  onToggleConnected,
}: {
  channel: Channel | null;
  connected: boolean;
  onClose: () => void;
  onToggleConnected: () => void;
}) {
  const open = !!channel;
  const [mounted, setMounted] = useState<Channel | null>(channel);

  useEffect(() => {
    if (channel) setMounted(channel);
  }, [channel]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  const c = mounted;

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
        aria-label={c ? `${c.name} configuration` : "Channel configuration"}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {c && (
          <ChannelConfigPanel
            channel={c}
            connected={connected}
            onClose={onClose}
            onToggleConnected={onToggleConnected}
          />
        )}
      </aside>
    </>,
    document.body,
  );
}
