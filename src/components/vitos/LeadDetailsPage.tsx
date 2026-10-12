import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Check,
  Link2,
  Inbox,
  Activity,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
} from "lucide-react";
import {
  ChevronDown,
  Check as CheckIcon,
  Pencil,
  Sparkles,
  Bell,
  ShieldCheck,
  Wallet,
  Mail,
  Bot,
  ChevronRight,
  Headphones,
  Phone,
  PhoneCall,
  PhoneOff,
  X,
} from "lucide-react";
import { PageContainer } from "./PageContainer";

interface Props {
  leadName: string;
  leadId: string;
  procedureName: string;
  workspaceName: string;
  status: string;
  loanAmount: string;
  loanType: string;
  tenure: string;
  score: number | null;
  phone: string;
  onBack: () => void;
}

export function LeadDetailsPage({
  leadName,
  leadId,
  procedureName,
  workspaceName,
  status,
  loanAmount,
  loanType,
  tenure,
  score,
  phone,
  onBack,
}: Props) {
  const [detailedView] = useState(false);

  const firstName = leadName.toLowerCase().split(" ")[0];
  const listRows: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Id", value: <span className="font-mono">{leadId}</span> },
    { label: "State", value: status },
    {
      label: "State Modified At",
      value: <span className="font-mono">2026-06-08T09:48:43.005875</span>,
    },
    { label: "Created At", value: <span className="font-mono">2026-06-08T09:42:58.39194</span> },
    { label: "Modified At", value: <span className="font-mono">2026-06-08T09:42:58.39194</span> },
    { label: "Action Taken By", value: <span className="text-muted-foreground">null</span> },
    { label: "Full Name", value: leadName },
    { label: "Mobile", value: phone },
    { label: "Email", value: `${firstName}@gmail.com` },
    { label: "Loan Type", value: loanType },
    { label: "Loan Amount", value: loanAmount },
    { label: "Tenure", value: tenure },
    { label: "Monthly Income", value: "₹50,000" },
    { label: "Preferred Language", value: "hindi" },
    { label: "City", value: "Delhi" },
    { label: "Aadhaar Verified", value: "true" },
    { label: "Aadhaar Name", value: <span className="text-muted-foreground">null</span> },
    { label: "Pan Verified", value: "true" },
    { label: "Pan Name", value: <span className="text-muted-foreground">null</span> },
    { label: "Credit Score", value: score ?? "—" },
    { label: "Credit Pull Date", value: <span className="font-mono">2026-06-08T09:44:11.72</span> },
    { label: "Offered Interest Rate", value: "0" },
    { label: "Assigned Rm", value: <span className="text-muted-foreground">null</span> },
    { label: "Rejection Reason", value: <span className="text-muted-foreground">null</span> },
    { label: "Pan Number", value: <span className="font-mono">******856A</span> },
    { label: "Aadhaar Number", value: <span className="font-mono">********2134</span> },
    {
      label: "Doc Form Link",
      value: (
        <a href="#" className="break-all text-rose-600 hover:text-rose-700">
          https://selfserveapp.kapturecrm.com/support-portals/VitosLoanForm/view/adhaar-pan.php?lead_id=
          {leadId}
        </a>
      ),
    },
    { label: "Action Taken", value: <span className="text-muted-foreground">null</span> },
    { label: "Interest Rate", value: <span className="text-muted-foreground">null</span> },
    { label: "Loan Application Number", value: <span className="font-mono">4827016739</span> },
    { label: "Bank Statements Verified", value: "Yes" },
    { label: "Foir Percentage", value: "8" },
    { label: "Cibil Report Checked", value: "Yes" },
    {
      label: "Underwriter Decision",
      value: <span className="font-medium text-emerald-700">Loan Approved</span>,
    },
    { label: "Underwriter Id", value: <span className="text-muted-foreground">null</span> },
    {
      label: "Sanction Sent At",
      value: <span className="font-mono">2026-06-08T09:50:10.288</span>,
    },
    { label: "Visitation Date", value: <span className="font-mono">2026-05-04</span> },
    { label: "Signature Received", value: "Yes" },
    { label: "Loan Disbursed", value: "Yes" },
    {
      label: "Disbursement Failure Reason",
      value: <span className="text-muted-foreground">null</span>,
    },
    { label: "Loan Account Id", value: <span className="text-muted-foreground">null</span> },
  ];

  return (
    <PageContainer fullWidth className="flex h-[calc(100vh-3.5rem)] flex-col">
      <button
        type="button"
        onClick={onBack}
        className="self-start inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to lead log
      </button>

      {/* Unified container */}
      <div className="mt-4 flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[13px] font-semibold tracking-tight text-foreground leading-tight">
                  Lead Details Workspace
                </h1>
                <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  ID: {leadId}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Structured internal evaluation profile &amp; active pipelines
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            {status}
          </span>
        </div>

        {/* Body — 40 / 60 split */}
        <div className="min-h-0 flex-1 grid lg:grid-cols-[40%_60%] overflow-hidden">
          {/* Left column */}
          <div className="h-full overflow-y-auto border-b border-border p-4 lg:border-b-0 lg:border-r">
            {/* Activity Summary — compact strip above lead details header */}
            <div className="mb-3 grid grid-cols-3 gap-2">
              <CompactSummaryStat value={7} label="Total Actions" icon={Activity} tint="sky" />
              <CompactSummaryStat value={7} label="Agents Involved" icon={Sparkles} tint="violet" />
              <CompactSummaryStat
                value={0}
                label="Completed"
                icon={CheckCircle2}
                tint="emerald"
                muted
              />
            </div>

            {/* View toggle */}
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Lead Details
              </div>
            </div>

            {!detailedView ? (
              <div className="overflow-hidden rounded-lg border border-border bg-background">
                {listRows.map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex items-start justify-between gap-4 px-3 py-2 text-[11.5px] ${
                      i === listRows.length - 1 ? "" : "border-b border-border"
                    }`}
                  >
                    <span className="shrink-0 text-muted-foreground">{row.label}</span>
                    <span className="min-w-0 text-right font-medium text-foreground">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Summary tiles */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-border bg-background p-2.5">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Loan Requested
                    </div>
                    <div className="mt-0.5 text-[15px] font-semibold text-foreground leading-tight">
                      {loanAmount}
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-muted-foreground">
                      {loanType} · {tenure}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-2.5">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Risk Profile
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-1.5 leading-tight">
                      <span className="text-[15px] font-semibold text-emerald-700">
                        {score ?? "—"}
                      </span>
                      {score !== null && (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-1 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider text-emerald-700">
                          CIBIL
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-muted-foreground">
                      Status: {score && score >= 700 ? "Excellent" : "Review"}
                    </div>
                  </div>
                </div>

                <Section title="Applicant Profile">
                  <div className="rounded-lg border border-border bg-background">
                    <InfoRow label="Full Name" value={leadName} />
                    <InfoRow label="Mobile Number" value={phone} />
                    <InfoRow
                      label="Email Address"
                      value={`${leadName.toLowerCase().split(" ")[0]}@gmail.com`}
                    />
                    <InfoRow
                      label="City / Preferred Lang"
                      value={
                        <span>
                          Delhi <span className="text-muted-foreground">·</span> Hindi
                        </span>
                      }
                    />
                    <InfoRow label="Monthly Income" value="₹50,000" isLast />
                  </div>
                </Section>

                <Section title="KYC & Verification Stack">
                  <div className="grid grid-cols-2 gap-2">
                    <KycCard label="Aadhaar Profile" value="********2134" />
                    <KycCard label="PAN Card Profile" value="******856A" />
                  </div>
                  <div className="mt-2 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between px-2.5 py-1.5 text-[11.5px]">
                      <span className="text-foreground">Bank Statements Verified</span>
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-emerald-700">
                        Yes
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border px-2.5 py-1.5 text-[11.5px]">
                      <span className="text-foreground">Document Form Link</span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[10.5px] font-medium text-rose-600 hover:text-rose-700"
                      >
                        <Link2 className="h-3 w-3" />
                        Copy Link
                      </button>
                    </div>
                  </div>
                </Section>

                <Section title="Underwriting & Strategy">
                  <div className="rounded-lg border border-border bg-background p-2.5">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Latest Action Note
                    </div>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-foreground">
                      Call completed. User verified identity. Agreed on 0.0% interest rate.
                    </p>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-2.5 gap-y-2 rounded-lg border border-border bg-background p-2.5">
                    <MetaField
                      label="Underwriter Decision"
                      value={<span className="text-emerald-700 font-semibold">Loan Approved</span>}
                    />
                    <MetaField label="FOIR Percentage" value="8%" />
                    <MetaField label="Offered Interest Rate" value="0.0%" />
                    <MetaField label="Application Number" value="4827016739" />
                  </div>
                </Section>

                <Section title="System Timeline Metrics">
                  <div className="rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between px-2.5 py-1.5 text-[11.5px]">
                      <span className="text-muted-foreground">Created At</span>
                      <span className="font-mono text-foreground">2026-06-08 09:42:58</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border px-2.5 py-1.5 text-[11.5px]">
                      <span className="text-muted-foreground">State Modified At</span>
                      <span className="font-mono text-foreground">2026-06-08 09:48:43</span>
                    </div>
                  </div>
                </Section>

                <div className="grid grid-cols-3 gap-2">
                  <StatTile value={0} label="Total Actions" />
                  <StatTile value={0} label="Agents Involved" />
                  <StatTile value={0} label="Completed" />
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="h-full overflow-hidden flex flex-col">
            <ActionQueuePanel
              leadName={leadName}
              phone={phone}
              loanAmount={loanAmount}
              tenure={tenure}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-2.5 py-1.5 text-[11.5px] ${
        isLast ? "" : "border-b border-border"
      }`}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function KycCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative rounded-lg border border-border bg-background p-2.5">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[11.5px] text-foreground">{value}</div>
      <span className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Check className="h-2.5 w-2.5" />
      </span>
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-[11.5px] text-foreground">{value}</div>
    </div>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-2 py-2 text-center">
      <div className="text-base font-semibold text-foreground">{value}</div>
      <div className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

type AgentRow = {
  name: string;
  time: string;
  tone: "emerald" | "amber" | "rose" | "violet" | "sky" | "orange" | "teal";
  rule?: string;
  detail?: string;
  status?: "completed" | "pending";
  steps?: Array<{ title: string; description: string; time: string; badge: string }>;
};

const AGENTS: AgentRow[] = [
  {
    name: "Loan Account Creation Agent",
    time: "Jul 10, 5:58 AM",
    tone: "emerald",
    rule: "Rule 1",
    detail: "Loan Disbursed",
    status: "completed",
    steps: [
      {
        title: "Fetch Application Metadata",
        description:
          "Payload validation match against schema rule configuration mapping index block.",
        time: "05:58:32.102",
        badge: "SUCCESS",
      },
      {
        title: "Generate Account Ledger Id",
        description: "Core banking ledger sequence handshake request acknowledgment generated.",
        time: "05:58:32.415",
        badge: "PROCESSED",
      },
      {
        title: "Dispatch Webhook Notification Trigger",
        description:
          "Callback sequence distributed out to customer notifications service agent node.",
        time: "05:58:32.890",
        badge: "DISPATCHED",
      },
    ],
  },
  {
    name: "HITL Letter Signature Agent",
    time: "Jul 10, 5:58 AM",
    tone: "rose",
    rule: "Rule 1",
    detail: "Signature Received",
    status: "completed",
    steps: [
      {
        title: "Render Sanction Letter Template",
        description:
          "Personalized sanction letter draft assembled from applicant metadata payload.",
        time: "05:57:11.204",
        badge: "SUCCESS",
      },
      {
        title: "Route To Human Reviewer Queue",
        description:
          "Escalation dispatched to underwriting reviewer inbox with SLA tracker attached.",
        time: "05:57:12.640",
        badge: "PROCESSED",
      },
      {
        title: "Capture Reviewer Signature",
        description:
          "Digital signature captured and cryptographically bound to letter revision hash.",
        time: "05:57:45.021",
        badge: "SIGNED",
      },
    ],
  },
  {
    name: "Sanction Letter Agent",
    time: "Jul 10, 5:58 AM",
    tone: "emerald",
    rule: "Rule 1",
    detail: "Sanction Sent",
    status: "completed",
    steps: [
      {
        title: "Compile Sanction Terms",
        description:
          "Interest rate, tenure and covenant clauses merged into sanction document envelope.",
        time: "05:56:02.118",
        badge: "SUCCESS",
      },
      {
        title: "Attach Fee Schedule PDF",
        description: "Processing fee and stamp duty appendix bundled with primary sanction letter.",
        time: "05:56:03.402",
        badge: "ATTACHED",
      },
      {
        title: "Send Sanction To Applicant",
        description:
          "Sanction letter delivered to applicant inbox with acknowledgment receipt request.",
        time: "05:56:04.867",
        badge: "DELIVERED",
      },
    ],
  },
  {
    name: "Customer Notification Agent",
    time: "Jul 10, 5:54 AM",
    tone: "amber",
    rule: "Rule 1",
    detail: "Notification Delivered",
    status: "completed",
    steps: [
      {
        title: "Resolve Notification Channel",
        description:
          "Applicant preferred channel matrix evaluated against opt-in consent registry.",
        time: "05:53:41.010",
        badge: "SUCCESS",
      },
      {
        title: "Compose Multi-Channel Payload",
        description:
          "SMS, WhatsApp and email bodies templated with localized preferred language copy.",
        time: "05:53:41.884",
        badge: "PROCESSED",
      },
      {
        title: "Dispatch Notification Batch",
        description: "Batch dispatched to gateway with retry policy and delivery receipt webhook.",
        time: "05:53:42.612",
        badge: "DISPATCHED",
      },
    ],
  },
  {
    name: "KYC Confirmation Agent",
    time: "Jul 10, 5:54 AM",
    tone: "violet",
    rule: "Rule 1",
    detail: "KYC Confirmed",
    status: "completed",
    steps: [
      {
        title: "Validate Aadhaar OTP Response",
        description: "UIDAI XML payload verified against applicant demographic reference block.",
        time: "05:52:18.331",
        badge: "SUCCESS",
      },
      {
        title: "Cross Match PAN Registry",
        description: "Income tax registry lookup matched against captured PAN name and DOB tuple.",
        time: "05:52:19.045",
        badge: "MATCHED",
      },
      {
        title: "Persist KYC Verification Record",
        description:
          "Verification artifact committed with immutable audit trail signature reference.",
        time: "05:52:19.782",
        badge: "STORED",
      },
    ],
  },
  {
    name: "Document Collection Agent",
    time: "Jul 10, 5:53 AM",
    tone: "orange",
    rule: "Rule 1",
    detail: "Documents Collected",
    status: "completed",
    steps: [
      {
        title: "Generate Upload Portal Link",
        description: "Signed short-lived portal URL minted with applicant scope and expiry window.",
        time: "05:51:02.412",
        badge: "SUCCESS",
      },
      {
        title: "Ingest Uploaded Documents",
        description: "Bank statements, ID proofs and income slips ingested and virus scan cleared.",
        time: "05:51:37.221",
        badge: "PROCESSED",
      },
      {
        title: "Extract Structured Fields",
        description: "OCR pipeline parsed statement metadata and normalized into ledger schema.",
        time: "05:51:39.008",
        badge: "PARSED",
      },
    ],
  },
  {
    name: "Lead Verification Agent",
    time: "Jul 10, 5:53 AM",
    tone: "teal",
    rule: "Rule 1",
    detail: "Lead Verified",
    status: "completed",
    steps: [
      {
        title: "Fetch Lead Source Payload",
        description:
          "Inbound lead record hydrated from CRM ingestion channel with attribution tags.",
        time: "05:50:04.101",
        badge: "SUCCESS",
      },
      {
        title: "Run Duplicate Suppression",
        description: "Fuzzy match executed across mobile, email and PAN identity graph for dedup.",
        time: "05:50:05.223",
        badge: "CLEAN",
      },
      {
        title: "Score Lead Intent Signal",
        description:
          "Behavioral signal weighted by campaign source and computed intent score persisted.",
        time: "05:50:06.517",
        badge: "SCORED",
      },
    ],
  },
];

const TONE_MAP: Record<
  AgentRow["tone"],
  { text: string; bg: string; dot: string; border: string; softBg: string }
> = {
  emerald: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
    border: "bg-emerald-500",
    softBg: "bg-emerald-50/40",
  },
  amber: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
    border: "bg-amber-500",
    softBg: "bg-amber-50/40",
  },
  rose: {
    text: "text-rose-600",
    bg: "bg-rose-50",
    dot: "bg-rose-500",
    border: "bg-rose-500",
    softBg: "bg-rose-50/40",
  },
  violet: {
    text: "text-violet-700",
    bg: "bg-violet-50",
    dot: "bg-violet-500",
    border: "bg-violet-500",
    softBg: "bg-violet-50/40",
  },
  sky: {
    text: "text-sky-700",
    bg: "bg-sky-50",
    dot: "bg-sky-500",
    border: "bg-sky-500",
    softBg: "bg-sky-50/40",
  },
  orange: {
    text: "text-orange-700",
    bg: "bg-orange-50",
    dot: "bg-orange-500",
    border: "bg-orange-500",
    softBg: "bg-orange-50/40",
  },
  teal: {
    text: "text-teal-700",
    bg: "bg-teal-50",
    dot: "bg-teal-500",
    border: "bg-teal-500",
    softBg: "bg-teal-50/40",
  },
};

function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-1 rounded-sm bg-muted-foreground/30" />
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </div>
      </div>
      {right}
    </div>
  );
}

function SummaryStat({
  value,
  label,
  tone = "default",
}: {
  value: number;
  label: string;
  tone?: "default" | "muted";
}) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2.5">
      <div
        className={`text-[22px] font-semibold leading-none tracking-tight ${
          tone === "muted" ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function CompactSummaryStat({
  value,
  label,
  icon: Icon,
  tint,
  muted = false,
}: {
  value: number;
  label: string;
  icon: typeof Activity;
  tint: "sky" | "violet" | "emerald";
  muted?: boolean;
}) {
  const TINTS: Record<"sky" | "violet" | "emerald", { bg: string; text: string }> = {
    sky: { bg: "bg-sky-50", text: "text-sky-600" },
    violet: { bg: "bg-violet-50", text: "text-violet-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  };
  const t = TINTS[tint];
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-sm">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${t.bg} ${t.text}`}
      >
        <Icon className="h-3 w-3" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 leading-tight">
        <div className="text-[8.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </div>
        <div
          className={`text-[12px] font-semibold tabular-nums leading-tight ${
            muted ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ============ Action Queue (live agent) ============

type StepFinalStatus = "success" | "processed" | "dispatched";
type StepStatus = "pending" | "running" | StepFinalStatus;

interface StepDef {
  title: string;
  description: string;
  finalStatus: StepFinalStatus;
  timestamp: string;
}

interface AgentDef {
  name: string;
  icon: typeof Sparkles;
  description: string;
  steps: StepDef[];
}

const QUEUE_AGENTS: AgentDef[] = [
  {
    name: "Loan Account Creation Agent",
    icon: Wallet,
    description: "Provisions a ledger account and syncs with core banking.",
    steps: [
      {
        title: "Fetch Application Metadata",
        description:
          "Payload validation match against schema rule configuration mapping index block.",
        finalStatus: "success",
        timestamp: "05:58:32.102",
      },
      {
        title: "Generate Account Ledger Id",
        description: "Core banking ledger sequence handshake request acknowledgment generated.",
        finalStatus: "processed",
        timestamp: "05:58:32.415",
      },
      {
        title: "Dispatch Webhook Notification Trigger",
        description:
          "Callback sequence distributed out to customer notifications service agent node.",
        finalStatus: "dispatched",
        timestamp: "05:58:32.890",
      },
    ],
  },
  {
    name: "KYC Verification Agent",
    icon: ShieldCheck,
    description: "Runs identity and compliance checks against verified sources.",
    steps: [
      {
        title: "Pull Identity Documents",
        description: "Retrieve encrypted KYC documents from secure storage bucket for review.",
        finalStatus: "success",
        timestamp: "05:59:04.221",
      },
      {
        title: "Run Sanction & PEP Screening",
        description: "Cross-reference applicant profile against global watchlist databases.",
        finalStatus: "processed",
        timestamp: "05:59:04.688",
      },
      {
        title: "Post Verification Decision",
        description: "Publish signed KYC decision event to downstream underwriting service.",
        finalStatus: "dispatched",
        timestamp: "05:59:05.014",
      },
    ],
  },
  {
    name: "Disbursement Notification Agent",
    icon: Bell,
    description: "Alerts the customer once funds are released to their account.",
    steps: [
      {
        title: "Compose Disbursement Message",
        description: "Render personalized SMS and email templates with disbursement details.",
        finalStatus: "success",
        timestamp: "05:59:41.033",
      },
      {
        title: "Sign Delivery Payload",
        description: "Attach HMAC signature to outbound notification payload for provider.",
        finalStatus: "processed",
        timestamp: "05:59:41.402",
      },
      {
        title: "Dispatch to Customer Channel",
        description: "Send finalized notification through preferred customer channel gateway.",
        finalStatus: "dispatched",
        timestamp: "05:59:41.870",
      },
    ],
  },
  {
    name: "Welcome Email Agent",
    icon: Mail,
    description: "Sends the onboarding welcome and next-steps guide.",
    steps: [
      {
        title: "Resolve Customer Profile",
        description: "Load latest customer preferences and language selection from profile store.",
        finalStatus: "success",
        timestamp: "06:00:12.144",
      },
      {
        title: "Render Welcome Template",
        description: "Compile onboarding email with loan summary and dashboard entry link.",
        finalStatus: "processed",
        timestamp: "06:00:12.521",
      },
      {
        title: "Handoff to Delivery Provider",
        description: "Enqueue signed email payload with retry policy on delivery provider.",
        finalStatus: "dispatched",
        timestamp: "06:00:12.902",
      },
    ],
  },
];

const STATUS_TONE: Record<
  StepFinalStatus | "running",
  { pill: string; dot: string; label: string }
> = {
  success: {
    pill: "border-emerald-100 bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
    label: "SUCCESS",
  },
  processed: {
    pill: "border-blue-100 bg-blue-50 text-blue-600",
    dot: "bg-blue-500",
    label: "PROCESSED",
  },
  dispatched: {
    pill: "border-purple-100 bg-purple-50 text-purple-600",
    dot: "bg-purple-500",
    label: "DISPATCHED",
  },
  running: {
    pill: "border-amber-100 bg-amber-50 text-amber-600",
    dot: "bg-amber-500",
    label: "RUNNING",
  },
};

function ActionQueuePanel({ leadName, phone, loanAmount, tenure }: CallLead) {
  const firstName = leadName.split(" ")[0];
  const [agentIdx, setAgentIdx] = useState(0);
  const [agentRuns, setAgentRuns] = useState(0);
  const activeAgent = QUEUE_AGENTS[agentIdx];
  const [statuses, setStatuses] = useState<StepStatus[]>(() =>
    activeAgent.steps.map(() => "pending"),
  );
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idx = 0;
    let phase: "run" | "settle" = "run";
    const steps = QUEUE_AGENTS[agentIdx].steps;
    setStatuses(steps.map(() => "pending"));

    const timers: number[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const t = window.setTimeout(fn, ms);
      timers.push(t);
    };

    const tick = () => {
      if (cancelled) return;
      if (idx >= steps.length) {
        // Hold on completed state, then advance to next agent
        schedule(() => {
          if (cancelled) return;
          setAgentIdx((i) => (i + 1) % QUEUE_AGENTS.length);
          setAgentRuns((n) => n + 1);
        }, 2200);
        return;
      }
      const current = idx;
      if (phase === "run") {
        setStatuses((prev) => {
          const next = [...prev];
          next[current] = "running";
          return next;
        });
        phase = "settle";
        schedule(tick, 1400);
      } else {
        setStatuses((prev) => {
          const next = [...prev];
          next[current] = steps[current].finalStatus;
          return next;
        });
        idx += 1;
        phase = "run";
        schedule(tick, 900);
      }
    };

    schedule(tick, 600);
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [agentIdx]);

  const [callStatus, setCallStatus] = useState<"idle" | "live" | "ended">("idle");
  const [callMessages, setCallMessages] = useState<CallMessage[]>([]);
  const [pendingSpeaker, setPendingSpeaker] = useState<"agent" | "customer" | null>(null);
  const [callElapsed, setCallElapsed] = useState(0);
  const callStartRef = useRef(0);
  const [ongoingTab, setOngoingTab] = useState<"trace" | "call">("trace");
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>(() => buildPastCalls(firstName));
  const [historyTab, setHistoryTab] = useState<"agents" | "calls">("agents");
  const [unseenCall, setUnseenCall] = useState(false);
  const [openCall, setOpenCall] = useState<CallRecord | null>(null);
  const [callRun, setCallRun] = useState(0);
  const [dismissedCallRun, setDismissedCallRun] = useState(0);
  const callStatusRef = useRef(callStatus);
  const agentRunsRef = useRef(0);
  const callEndedAtRunRef = useRef<number | null>(null);
  const firstCallStartedRef = useRef(false);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    agentRunsRef.current = agentRuns;
    if (agentRuns === 0 || callStatusRef.current === "live") return;
    const endedAt = callEndedAtRunRef.current;
    const due = endedAt === null ? !firstCallStartedRef.current : agentRuns - endedAt >= 2;
    if (due) {
      firstCallStartedRef.current = true;
      callEndedAtRunRef.current = null;
      setCallRun((run) => run + 1);
    }
  }, [agentRuns]);

  useEffect(() => {
    if (callRun === 0) return;
    let cancelled = false;
    const timers: number[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, ms),
      );
    };
    const script = buildLiveScript(leadName, loanAmount, tenure);
    const collected: CallMessage[] = [];
    const seconds = () => Math.floor((Date.now() - callStartRef.current) / 1000);
    const push = (message: CallMessage) => {
      collected.push(message);
      setCallMessages([...collected]);
    };
    const next = (i: number) => {
      if (i >= script.length) {
        setPendingSpeaker(null);
        schedule(() => {
          const duration = seconds();
          push({
            id: "ended",
            speaker: "event",
            tone: "neutral",
            text: `Call ended · ${formatDuration(duration)}`,
            time: formatClock(duration),
          });
          setCallStatus("ended");
          callEndedAtRunRef.current = agentRunsRef.current;
          setRecentCalls((current) => [
            {
              id: `live-${callStartRef.current}`,
              title: "KYC verification call",
              startedAt: `Today, ${new Date(callStartRef.current).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}`,
              duration: formatDuration(duration),
              outcome: "completed",
              summary: `${firstName} confirmed their date of birth and loan details. Priya explained the 24-hour underwriting timeline and sent a secure link to upload the last three months of bank statements.`,
              messages: [...collected],
            },
            ...current,
          ]);
          setUnseenCall(true);
        }, 1400);
        return;
      }
      const line = script[i];
      setPendingSpeaker(line.speaker === "event" ? null : line.speaker);
      const delay = line.speaker === "event" ? 700 : Math.min(3600, 1100 + line.text.length * 24);
      schedule(() => {
        push({ ...line, id: String(i), time: formatClock(seconds()) });
        next(i + 1);
      }, delay);
    };
    schedule(() => {
      callStartRef.current = Date.now();
      setCallMessages([]);
      setCallElapsed(0);
      setCallStatus("live");
      next(0);
    }, 600);
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [callRun, firstName, leadName, loanAmount, tenure]);

  useEffect(() => {
    if (callStatus !== "live") return;
    const id = window.setInterval(
      () => setCallElapsed(Math.floor((Date.now() - callStartRef.current) / 1000)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [callStatus]);

  const callLive = callStatus === "live";
  const showCallTab = callLive || (callStatus === "ended" && ongoingTab === "call");
  const viewingCall = showCallTab && ongoingTab === "call";

  const allDone = statuses.every((s) => s !== "pending" && s !== "running");
  const anyStarted = statuses.some((s) => s !== "pending");
  const headerStatus: "running" | "completed" | "queued" = !anyStarted
    ? "queued"
    : allDone
      ? "completed"
      : "running";

  const nextAgents = Array.from(
    { length: 3 },
    (_, i) => QUEUE_AGENTS[(agentIdx + 1 + i) % QUEUE_AGENTS.length],
  );
  const AgentIcon = activeAgent.icon;

  if (openCall) {
    return (
      <CallTranscriptView
        call={openCall}
        leadName={leadName}
        phone={phone}
        onBack={() => setOpenCall(null)}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
      {/* ============ 1. Next Agents ============ */}
      <section>
        <PanelSectionHeader
          icon={Inbox}
          title="Next Agents"
          hint="Queued — not yet executing"
          right={
            <span className="flex h-4 min-w-4 items-center justify-center rounded bg-muted px-1 text-[10px] font-bold text-muted-foreground">
              {nextAgents.length}
            </span>
          }
        />
        {nextAgents.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-[11.5px] text-muted-foreground">
            <Circle className="h-3 w-3 shrink-0" />
            No upcoming agents
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {nextAgents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.name}
                  className="group flex flex-col rounded-lg border border-border bg-card p-3 transition-colors hover:border-foreground/20"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted/50 text-foreground/70 transition-colors group-hover:bg-muted">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="font-mono text-[9.5px] font-semibold text-muted-foreground/70">
                      #{i + 1}
                    </span>
                  </div>
                  <h4 className="text-[12px] font-semibold leading-tight text-foreground">
                    {agent.name}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-muted-foreground">
                    {agent.description}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5 border-t border-border/60 pt-2">
                    <Clock className="h-2.5 w-2.5 text-amber-600" />
                    <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                      Queued
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ 2. Ongoing Agent ============ */}
      <section>
        <PanelSectionHeader
          icon={Activity}
          title="Ongoing Agent"
          hint="Executing now"
          right={
            <div className="flex items-center gap-1.5">
              {callLive && <LiveCallPill onClick={() => setOngoingTab("call")} />}
              <HeaderStatusBadge status={headerStatus} />
            </div>
          }
        />
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/40 px-2 py-1.5">
            <OngoingTabs
              tab={viewingCall ? "call" : "trace"}
              onChange={setOngoingTab}
              showCall={showCallTab}
              live={callLive}
              elapsed={callElapsed}
            />
          </div>
          {viewingCall ? (
            <LiveCallView
              leadName={leadName}
              phone={phone}
              live={callLive}
              elapsed={callElapsed}
              messages={callMessages}
              pendingSpeaker={pendingSpeaker}
              onViewRecent={() => {
                setOngoingTab("trace");
                setHistoryTab("calls");
                setUnseenCall(false);
              }}
            />
          ) : (
            <>
              <div>
                {/* Header */}
                <button
                  type="button"
                  onClick={() => setCollapsed((v) => !v)}
                  className="flex w-full items-center justify-between gap-3 border-b border-border/70 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground/70">
                      <AgentIcon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-[13px] font-semibold leading-none text-foreground">
                        {activeAgent.name}
                      </span>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="font-medium">
                          {statuses.filter((s) => s !== "pending" && s !== "running").length} /{" "}
                          {statuses.length} completed
                        </span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="font-mono text-muted-foreground/80">Jul 10, 05:58 AM</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                        collapsed ? "-rotate-90" : ""
                      }`}
                    />
                  </div>
                </button>

                {!collapsed && (
                  <>
                    <div className="border-b border-border/70 bg-muted/30 px-4 py-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                        <Clock className="h-3 w-3" />
                        Execution Trace
                      </div>
                    </div>
                    <div className="relative px-4 pt-3 pb-4">
                      {!anyStarted ? (
                        <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                          <span className="relative block h-2 w-2">
                            <span className="absolute inset-0 animate-ping rounded-full bg-muted-foreground/40" />
                            <span className="relative block h-2 w-2 rounded-full bg-muted-foreground/60" />
                          </span>
                          <span>Initializing agent…</span>
                        </div>
                      ) : (
                        <ol className="relative flex flex-col gap-4">
                          {/* Timeline rail */}
                          <li
                            className="pointer-events-none absolute bottom-6 left-[9px] top-3 w-0.5 bg-border/70"
                            aria-hidden="true"
                          />
                          {activeAgent.steps.map((step, i) => {
                            const status = statuses[i];
                            const isPending = status === "pending";
                            const isRunning = status === "running";
                            const toneKey: "running" | StepFinalStatus = isRunning
                              ? "running"
                              : isPending
                                ? "running"
                                : (status as StepFinalStatus);
                            const tone = STATUS_TONE[toneKey] ?? STATUS_TONE.running;
                            const stepIndex = i + 1;

                            return (
                              <li
                                key={step.title}
                                className={`relative flex gap-3 animate-fade-in ${isPending ? "opacity-50" : ""}`}
                                style={{ animationDelay: `${i * 80}ms` }}
                              >
                                {/* Timeline node */}
                                <div className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                                  {isRunning ? (
                                    <span className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-amber-500 ring-1 ring-amber-500/20">
                                      <span className="absolute inline-flex h-5 w-5 animate-ping rounded-full bg-amber-400/60" />
                                      <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
                                    </span>
                                  ) : status === "success" ? (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-emerald-500 text-white ring-1 ring-emerald-500/20">
                                      <CheckIcon className="h-3 w-3" strokeWidth={3} />
                                    </span>
                                  ) : status === "processed" ? (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-blue-500 ring-1 ring-blue-500/20">
                                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                    </span>
                                  ) : status === "dispatched" ? (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-purple-500 ring-1 ring-purple-500/20">
                                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                    </span>
                                  ) : (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-muted">
                                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                                    </span>
                                  )}
                                </div>

                                {/* Step content */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-[12px] font-semibold leading-tight text-foreground">
                                      <span className="mr-1 font-mono text-[10px] font-medium text-muted-foreground/70">
                                        {String(stepIndex).padStart(2, "0")}
                                      </span>
                                      {step.title}
                                    </h4>
                                    {!isPending && (
                                      <span
                                        className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${tone.pill}`}
                                      >
                                        {tone.label}
                                      </span>
                                    )}
                                  </div>
                                  {!isPending && (
                                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                      {step.description}
                                    </p>
                                  )}
                                  {!isPending && (
                                    <div className="mt-1 font-mono text-[9.5px] uppercase text-muted-foreground/70">
                                      {isRunning ? (
                                        <span className="inline-flex items-center gap-1">
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                          running…
                                        </span>
                                      ) : (
                                        step.timestamp
                                      )}
                                    </div>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                          {!allDone && anyStarted && (
                            <li className="relative flex gap-3">
                              <div className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                                <span className="inline-flex gap-0.5">
                                  <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground/60" />
                                  <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                                  <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                                </span>
                              </div>
                              <span className="text-[11px] leading-5 text-muted-foreground">
                                Waiting for next step
                              </span>
                            </li>
                          )}
                        </ol>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ============ 3. Past Agents & Recent Calls ============ */}
      <HistorySection
        showCalls={recentCalls.some((call) => call.id.startsWith("live-"))}
        tab={historyTab}
        onTabChange={(tab) => {
          setHistoryTab(tab);
          if (tab === "calls") setUnseenCall(false);
        }}
        calls={recentCalls}
        unseenCall={unseenCall}
        onOpenCall={setOpenCall}
      />

      {callLive && !viewingCall && dismissedCallRun !== callRun && (
        <div className="pointer-events-none sticky bottom-0 z-20 -mt-2 flex justify-center">
          <LiveCallToast
            firstName={firstName}
            onOpen={() => setOngoingTab("call")}
            onDismiss={() => setDismissedCallRun(callRun)}
          />
        </div>
      )}
    </div>
  );
}

function PanelSectionHeader({
  icon: Icon,
  title,
  hint,
  right,
}: {
  icon: typeof Activity;
  title: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
        {hint && (
          <span className="hidden truncate text-[10px] font-normal normal-case text-muted-foreground/70 sm:inline">
            · {hint}
          </span>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

function PastAgentsList({ inContainer = false }: { inContainer?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ul
      className={`divide-y divide-border/70 ${
        inContainer ? "" : "rounded-lg border border-border bg-card/50"
      }`}
    >
      {AGENTS.map((a) => {
        const tone = TONE_MAP[a.tone];
        const isOpen = open === a.name;
        const hasDetail = Boolean(a.steps && a.steps.length > 0);
        const isHitl = a.name.startsWith("HITL");
        return (
          <li key={a.name}>
            <button
              type="button"
              disabled={!hasDetail}
              onClick={() => hasDetail && setOpen(isOpen ? null : a.name)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                hasDetail ? "hover:bg-muted/40" : "cursor-default"
              } ${isOpen ? "bg-muted/30" : ""}`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${tone.bg} ${tone.text}`}
                aria-hidden
              >
                {isHitl ? (
                  <Pencil className="h-2.5 w-2.5" />
                ) : (
                  <CheckIcon className="h-2.5 w-2.5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[12px] font-semibold leading-tight text-foreground">
                    {a.name}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    Completed
                  </span>
                </span>
                {a.detail && (
                  <span className="mt-0.5 block truncate text-[10.5px] leading-snug text-muted-foreground">
                    {a.detail}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground/80">
                {a.time}
              </span>
              {hasDetail && (
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {isOpen && a.steps && (
              <div className="border-t border-border/60 bg-muted/20 px-3 py-3">
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Rule</span>
                  <span className="font-semibold text-foreground">{a.rule}</span>
                </div>
                <div className="mb-2.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Executed Steps Trace
                </div>
                <ol className="relative ml-1 space-y-3 border-l border-dashed border-border pl-4">
                  {a.steps.map((s) => (
                    <li key={s.title} className="relative">
                      <span
                        className={`absolute -left-[21px] top-1 h-2 w-2 rounded-full ${tone.dot} ring-4 ring-background`}
                        aria-hidden
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11.5px] font-semibold leading-tight text-foreground">
                            {s.title}
                          </div>
                          <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">
                            {s.description}
                          </p>
                          <div className="mt-1 font-mono text-[10px] text-muted-foreground/80">
                            {s.time}
                          </div>
                        </div>
                        <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                          {s.badge}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function HeaderStatusBadge({ status }: { status: "running" | "completed" | "queued" }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-emerald-700">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Completed
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-amber-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        Running
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
      <Circle className="h-2.5 w-2.5" />
      Queued
    </span>
  );
}

// ============ Voice calls ============

type CallLead = { leadName: string; phone: string; loanAmount: string; tenure: string };

type CallMessage = {
  id: string;
  speaker: "agent" | "customer" | "event";
  text: string;
  time: string;
  tone?: "success" | "neutral";
};

type CallRecord = {
  id: string;
  title: string;
  startedAt: string;
  duration: string;
  outcome: "completed" | "voicemail";
  summary: string;
  messages: CallMessage[];
};

const VOICE_AGENT_NAME = "Priya";
const VOICE_TRIGGER = "KYC Verification Agent";

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return m > 0 ? `${m}m ${String(sec).padStart(2, "0")}s` : `${sec}s`;
}

function buildLiveScript(
  leadName: string,
  loanAmount: string,
  tenure: string,
): Omit<CallMessage, "id" | "time">[] {
  const first = leadName.split(" ")[0];
  const email = `${first.toLowerCase()}@gmail.com`;
  return [
    {
      speaker: "agent",
      text: `Hi, am I speaking with ${first}? This is Priya, a virtual assistant from Kapture Finance, calling about your loan application.`,
    },
    { speaker: "customer", text: `Yes, this is ${first}. Go ahead.` },
    {
      speaker: "agent",
      text: "Thanks! Before we continue, I need to verify a couple of details. Could you confirm your date of birth?",
    },
    { speaker: "customer", text: "Sure, it's 14th March 1991." },
    { speaker: "event", tone: "success", text: "Date of birth matched KYC records" },
    {
      speaker: "agent",
      text: `That matches our records. I can see you've applied for ${loanAmount} over ${tenure}. Is that correct?`,
    },
    { speaker: "customer", text: "Yes, that's right. How long will the approval take?" },
    {
      speaker: "agent",
      text: "Your KYC is complete, so underwriting usually wraps up within 24 hours. You'll get an SMS as soon as it's approved.",
    },
    { speaker: "customer", text: "Okay. Do I need to send anything else?" },
    {
      speaker: "agent",
      text: "Just your last three months of bank statements. I'm sending a secure upload link to your registered email now.",
    },
    { speaker: "event", tone: "success", text: `Upload link sent to ${email}` },
    { speaker: "customer", text: "Got it, I can see the email. Thanks!" },
    {
      speaker: "agent",
      text: `You're welcome, ${first}. Is there anything else I can help you with today?`,
    },
    { speaker: "customer", text: "No, that's all." },
    { speaker: "agent", text: "Thanks for your time. Have a great day!" },
  ];
}

function buildPastCalls(first: string): CallRecord[] {
  return [
    {
      id: "past-welcome",
      title: "Application welcome call",
      startedAt: "Jul 9, 4:12 PM",
      duration: "1m 38s",
      outcome: "completed",
      summary: `Priya welcomed ${first}, confirmed the preferred language as Hindi, and shared the document checklist for KYC.`,
      messages: [
        {
          id: "w1",
          speaker: "agent",
          time: "00:02",
          text: `Hello ${first}, this is Priya from Kapture Finance. Thanks for applying for a loan with us!`,
        },
        { id: "w2", speaker: "customer", time: "00:08", text: "Hi, thanks for calling." },
        {
          id: "w3",
          speaker: "agent",
          time: "00:12",
          text: "Which language would you prefer for future calls and messages?",
        },
        { id: "w4", speaker: "customer", time: "00:18", text: "Hindi is better for me." },
        {
          id: "w5",
          speaker: "event",
          tone: "success",
          time: "00:19",
          text: "Preferred language set to Hindi",
        },
        {
          id: "w6",
          speaker: "agent",
          time: "00:24",
          text: "Noted. To complete KYC, please keep your PAN and Aadhaar handy. I'll send the checklist by SMS.",
        },
        { id: "w7", speaker: "customer", time: "00:41", text: "Okay, will do." },
        { id: "w8", speaker: "event", tone: "neutral", time: "01:38", text: "Call ended · 1m 38s" },
      ],
    },
    {
      id: "past-reminder",
      title: "Document reminder call",
      startedAt: "Jul 8, 11:05 AM",
      duration: "32s",
      outcome: "voicemail",
      summary: `${first} didn't answer. Priya left a voicemail reminding them to upload their PAN and Aadhaar.`,
      messages: [
        {
          id: "r1",
          speaker: "event",
          tone: "neutral",
          time: "00:00",
          text: "No answer · voicemail",
        },
        {
          id: "r2",
          speaker: "agent",
          time: "00:04",
          text: `Hi ${first}, this is Priya from Kapture Finance. Just a reminder to upload your PAN and Aadhaar so we can continue your application. Thank you!`,
        },
        { id: "r3", speaker: "event", tone: "neutral", time: "00:32", text: "Call ended · 32s" },
      ],
    },
  ];
}

function LiveDot({ className = "h-2 w-2" }: { className?: string }) {
  return (
    <span className={`relative flex ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400/70" />
      <span className="relative inline-flex h-full w-full rounded-full bg-rose-500" />
    </span>
  );
}

function LiveCallPill({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-rose-700 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
    >
      <LiveDot />
      Live call
    </button>
  );
}

function VoiceBars({ active }: { active: boolean }) {
  return (
    <span className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
      <style>{`
        @keyframes vitos-voice-bar { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
        .vitos-voice-bar { transform-origin: bottom; animation: vitos-voice-bar 0.9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .vitos-voice-bar { animation: none; } }
      `}</style>
      {[0, 0.15, 0.3, 0.45].map((delay) => (
        <span
          key={delay}
          className={`h-full w-[2px] rounded-full ${
            active ? "vitos-voice-bar bg-rose-500" : "scale-y-[0.3] bg-muted-foreground/40"
          }`}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

function LiveCallToast({
  firstName,
  onOpen,
  onDismiss,
}: {
  firstName: string;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-border bg-card/95 py-1.5 pl-3 pr-1.5 shadow-lg shadow-black/5 backdrop-blur animate-fade-up"
    >
      <LiveDot />
      <p className="whitespace-nowrap text-[11.5px] text-muted-foreground">
        <span className="font-semibold text-foreground">{VOICE_AGENT_NAME}</span> is on a live call
        with {firstName}
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-rose-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
      >
        <Headphones className="h-3 w-3" />
        Listen in
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

const SEGMENTED_GROUP = "inline-flex items-center rounded-lg bg-muted/60 p-0.5";

function TabReveal({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div
      inert={!show}
      aria-hidden={!show}
      className={`-my-px grid transition-[grid-template-columns,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        show ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] -translate-x-1 opacity-0"
      }`}
    >
      <div className="min-w-0 overflow-hidden">
        <div className="py-px pl-0.5 pr-px">{children}</div>
      </div>
    </div>
  );
}

function segmentedTab(active: boolean) {
  return `inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-[11px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${
    active
      ? "bg-card text-foreground shadow-sm ring-1 ring-border"
      : "text-muted-foreground hover:text-foreground"
  }`;
}

function OngoingTabs({
  tab,
  onChange,
  showCall,
  live,
  elapsed,
}: {
  tab: "trace" | "call";
  onChange: (tab: "trace" | "call") => void;
  showCall: boolean;
  live: boolean;
  elapsed: number;
}) {
  const ended = showCall && !live;
  return (
    <div role="tablist" className={SEGMENTED_GROUP}>
      <button
        type="button"
        role="tab"
        aria-selected={tab === "trace"}
        onClick={() => onChange("trace")}
        className={segmentedTab(tab === "trace")}
      >
        <Activity className="h-3 w-3" />
        Agent trace
      </button>
      <TabReveal show={showCall}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "call"}
          onClick={() => onChange("call")}
          className={segmentedTab(tab === "call")}
        >
          {ended ? <PhoneOff className="h-3 w-3" /> : <LiveDot className="h-1.5 w-1.5" />}
          {ended ? "Call ended" : "Live call"}
          <span className="font-mono text-[10px] font-medium text-muted-foreground">
            {formatClock(elapsed)}
          </span>
        </button>
      </TabReveal>
    </div>
  );
}

function CallThread({
  messages,
  customerName,
  pendingSpeaker,
}: {
  messages: CallMessage[];
  customerName: string;
  pendingSpeaker?: "agent" | "customer" | null;
}) {
  const initial = customerName.charAt(0).toUpperCase();
  return (
    <ol className="flex flex-col gap-3">
      {messages.map((message) => {
        if (message.speaker === "event") {
          const success = message.tone !== "neutral";
          return (
            <li key={message.id} className="flex justify-center animate-fade-up">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${
                  success
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-border bg-muted/50 text-muted-foreground"
                }`}
              >
                {success ? <CheckCircle2 className="h-3 w-3" /> : <PhoneOff className="h-3 w-3" />}
                {message.text}
              </span>
            </li>
          );
        }
        const isAgent = message.speaker === "agent";
        return (
          <li
            key={message.id}
            className={`flex items-end gap-2 animate-fade-up ${isAgent ? "" : "flex-row-reverse"}`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                isAgent ? "bg-violet-50 text-violet-600" : "bg-rose-100 text-rose-700"
              }`}
              aria-hidden="true"
            >
              {isAgent ? <Bot className="h-3.5 w-3.5" /> : initial}
            </span>
            <div className={`flex max-w-[78%] flex-col ${isAgent ? "items-start" : "items-end"}`}>
              <span className="mb-0.5 px-1 text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {isAgent ? VOICE_AGENT_NAME : customerName}
                </span>{" "}
                · <span className="font-mono">{message.time}</span>
              </span>
              <p
                className={`rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
                  isAgent
                    ? "rounded-bl-md bg-muted/60 text-foreground"
                    : "rounded-br-md border border-rose-100 bg-rose-50 text-foreground"
                }`}
              >
                {message.text}
              </p>
            </div>
          </li>
        );
      })}
      {pendingSpeaker && (
        <li
          className={`flex items-center gap-2 ${pendingSpeaker === "agent" ? "" : "flex-row-reverse"}`}
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1.5">
            <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground/60" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
          </span>
          <span className="text-[10.5px] text-muted-foreground">
            {pendingSpeaker === "agent" ? VOICE_AGENT_NAME : customerName} is speaking…
          </span>
        </li>
      )}
    </ol>
  );
}

function LiveCallView({
  leadName,
  phone,
  live,
  elapsed,
  messages,
  pendingSpeaker,
  onViewRecent,
}: {
  leadName: string;
  phone: string;
  live: boolean;
  elapsed: number;
  messages: CallMessage[];
  pendingSpeaker: "agent" | "customer" | null;
  onViewRecent: () => void;
}) {
  const threadRef = useRef<HTMLDivElement>(null);
  const firstName = leadName.split(" ")[0];

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, pendingSpeaker]);

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            live ? "bg-rose-50 text-rose-600" : "bg-muted/60 text-muted-foreground"
          }`}
        >
          {live ? <PhoneCall className="h-4 w-4" /> : <PhoneOff className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-none text-foreground">
            {VOICE_AGENT_NAME} · AI voice agent
          </p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            {live ? "On a call with" : "Called"} {leadName} ·{" "}
            <span className="font-mono">{phone}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <VoiceBars active={live && pendingSpeaker !== null} />
          <span className="font-mono text-[11.5px] font-medium text-foreground">
            {formatClock(elapsed)}
          </span>
          {live ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-rose-700">
              <LiveDot className="h-1.5 w-1.5" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
              Ended
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-muted/30 px-4 py-2">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
          <Headphones className="h-3 w-3" />
          Live transcript
        </span>
        <span className="truncate text-[10.5px] text-muted-foreground">
          Triggered by {VOICE_TRIGGER}
        </span>
      </div>
      <div
        ref={threadRef}
        className="max-h-[380px] overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {messages.length === 0 ? (
          <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
            <LiveDot />
            Connecting call…
          </div>
        ) : (
          <CallThread
            messages={messages}
            customerName={firstName}
            pendingSpeaker={pendingSpeaker}
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-2.5">
        {live ? (
          <span className="text-[10.5px] text-muted-foreground">
            You&apos;re listening in. {firstName} can&apos;t hear you.
          </span>
        ) : (
          <>
            <span className="text-[10.5px] text-muted-foreground">
              This call has ended and was saved to Recent calls.
            </span>
            <button
              type="button"
              onClick={onViewRecent}
              className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-rose-600 transition hover:text-rose-700"
            >
              View recent calls
              <ChevronRight className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function OutcomePill({ outcome }: { outcome: CallRecord["outcome"] }) {
  return outcome === "completed" ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-emerald-700">
      <CheckCircle2 className="h-2.5 w-2.5" />
      Completed
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 rounded border border-amber-100 bg-amber-50 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-amber-700">
      <Phone className="h-2.5 w-2.5" />
      Voicemail
    </span>
  );
}

function HistorySection({
  showCalls,
  tab,
  onTabChange,
  calls,
  unseenCall,
  onOpenCall,
}: {
  showCalls: boolean;
  tab: "agents" | "calls";
  onTabChange: (tab: "agents" | "calls") => void;
  calls: CallRecord[];
  unseenCall: boolean;
  onOpenCall: (call: CallRecord) => void;
}) {
  const activeTab = showCalls ? tab : "agents";
  const count = (value: number, active: boolean) => (
    <span
      className={`flex h-4 min-w-4 items-center justify-center rounded px-1 text-[10px] font-bold ${
        active ? "bg-muted text-foreground" : "bg-muted/70 text-muted-foreground"
      }`}
    >
      {value}
    </span>
  );

  return (
    <section>
      <PanelSectionHeader icon={Clock} title="History" hint="Finished agents and calls" />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/40 px-2 py-1.5">
          <div role="tablist" className={SEGMENTED_GROUP}>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "agents"}
              onClick={() => onTabChange("agents")}
              className={segmentedTab(activeTab === "agents")}
            >
              <Clock className="h-3 w-3" />
              Past agents
              {count(AGENTS.length, activeTab === "agents")}
            </button>
            <TabReveal show={showCalls}>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "calls"}
                onClick={() => onTabChange("calls")}
                className={segmentedTab(activeTab === "calls")}
              >
                <Phone className="h-3 w-3" />
                Recent calls
                {count(calls.length, activeTab === "calls")}
                {unseenCall && activeTab !== "calls" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-label="New call" />
                )}
              </button>
            </TabReveal>
          </div>
        </div>

        {activeTab === "agents" ? (
          <PastAgentsList inContainer />
        ) : (
          <ul className="divide-y divide-border/70 animate-fade-up">
            {calls.map((call) => (
              <li key={call.id}>
                <button
                  type="button"
                  onClick={() => onOpenCall(call)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-muted/40"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                      call.outcome === "completed"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                    aria-hidden="true"
                  >
                    <Phone className="h-2.5 w-2.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[12px] font-semibold leading-tight text-foreground">
                        {call.title}
                      </span>
                      <OutcomePill outcome={call.outcome} />
                    </span>
                    <span className="mt-0.5 block truncate text-[10.5px] leading-snug text-muted-foreground">
                      {VOICE_AGENT_NAME} (AI) · {call.duration} ·{" "}
                      {call.messages.filter((m) => m.speaker !== "event").length} messages
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground/80">
                    {call.startedAt}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function CallTranscriptView({
  call,
  leadName,
  phone,
  onBack,
}: {
  call: CallRecord;
  leadName: string;
  phone: string;
  onBack: () => void;
}) {
  const meta = [
    { label: "Voice agent", value: `${VOICE_AGENT_NAME} (AI)` },
    { label: "Customer", value: leadName, sub: phone },
    { label: "Triggered by", value: VOICE_TRIGGER },
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto animate-fade-up">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to action queue"
          title="Back"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
            {call.title}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {call.startedAt} · {call.duration}
          </p>
        </div>
        <OutcomePill outcome={call.outcome} />
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {meta.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-background px-3 py-2"
            >
              <p className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-0.5 truncate text-[12px] font-medium text-foreground">
                {item.value}
              </p>
              {item.sub && (
                <p className="truncate font-mono text-[10.5px] text-muted-foreground">{item.sub}</p>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Call summary
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-foreground">{call.summary}</p>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Conversation
          </p>
          <CallThread messages={call.messages} customerName={leadName.split(" ")[0]} />
        </div>
      </div>
    </div>
  );
}
