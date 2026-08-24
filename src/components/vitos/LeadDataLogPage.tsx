import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Phone,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { PageContainer } from "./PageContainer";
import { LeadDetailsPage } from "./LeadDetailsPage";

type PipelineStatus =
  "Underwriting" | "Form Abandoned" | "Sanction Sent" | "Document Pending" | "Form Submitted";

type LoanType = "Personal Loan" | "Home Loan" | "Vehicle Loan";

interface Lead {
  id: string;
  name: string;
  phone: string;
  amount: string;
  loanType: LoanType;
  tenure: string;
  status: PipelineStatus;
  score: number | null;
  aad: boolean;
  pan: boolean;
  date: string;
  time: string;
}

const LEADS: Lead[] = [
  {
    id: "1",
    name: "Rajeev Prasad",
    phone: "+91 99160 14141",
    amount: "₹2,40,000",
    loanType: "Personal Loan",
    tenure: "36 mos",
    status: "Underwriting",
    score: 750,
    aad: true,
    pan: true,
    date: "Jun 16, 2026",
    time: "09:46 AM",
  },
  {
    id: "2",
    name: "Ayushi Jaiswal",
    phone: "+91 91191 61666",
    amount: "₹2,00,000",
    loanType: "Home Loan",
    tenure: "12 mos",
    status: "Underwriting",
    score: 750,
    aad: true,
    pan: true,
    date: "Jun 04, 2026",
    time: "11:41 AM",
  },
  {
    id: "3",
    name: "Aditya Batra",
    phone: "+91 88602 64939",
    amount: "₹1,00,000",
    loanType: "Personal Loan",
    tenure: "36 mos",
    status: "Form Abandoned",
    score: null,
    aad: true,
    pan: true,
    date: "Jun 08, 2026",
    time: "09:37 AM",
  },
  {
    id: "4",
    name: "Ramani",
    phone: "+91 75758 37619",
    amount: "₹1,23,12,321",
    loanType: "Vehicle Loan",
    tenure: "24 mos",
    status: "Underwriting",
    score: 750,
    aad: true,
    pan: true,
    date: "Jun 04, 2026",
    time: "08:40 AM",
  },
  {
    id: "5",
    name: "Shreeya",
    phone: "+91 88602 86827",
    amount: "₹50,00,000",
    loanType: "Home Loan",
    tenure: "24 mos",
    status: "Sanction Sent",
    score: 750,
    aad: true,
    pan: true,
    date: "Jun 16, 2026",
    time: "08:57 AM",
  },
  {
    id: "6",
    name: "Salah K",
    phone: "+91 80507 14177",
    amount: "₹5,00,000",
    loanType: "Personal Loan",
    tenure: "36 mos",
    status: "Sanction Sent",
    score: 750,
    aad: true,
    pan: true,
    date: "Jun 17, 2026",
    time: "08:16 AM",
  },
  {
    id: "7",
    name: "Neehaarika Uttla",
    phone: "+91 97482 69252",
    amount: "₹5,00,000",
    loanType: "Home Loan",
    tenure: "12 mos",
    status: "Document Pending",
    score: null,
    aad: true,
    pan: true,
    date: "Jun 08, 2026",
    time: "12:47 PM",
  },
  {
    id: "8",
    name: "Venkata Raju",
    phone: "+91 79752 60914",
    amount: "₹4,55,44,444",
    loanType: "Personal Loan",
    tenure: "12 mos",
    status: "Form Submitted",
    score: null,
    aad: true,
    pan: true,
    date: "Jun 05, 2026",
    time: "11:59 AM",
  },
];

const STATUS_TONES: Record<PipelineStatus, string> = {
  Underwriting: "bg-blue-50 text-blue-700 border-blue-200/70",
  "Form Abandoned": "bg-slate-100 text-slate-600 border-slate-200",
  "Sanction Sent": "bg-emerald-50 text-emerald-700 border-emerald-200/70",
  "Document Pending": "bg-amber-50 text-amber-700 border-amber-200/70",
  "Form Submitted": "bg-violet-50 text-violet-700 border-violet-200/70",
};

const HEADER_GRID =
  "grid grid-cols-[minmax(220px,1.4fr)_minmax(180px,1fr)_minmax(140px,auto)_minmax(160px,1fr)_100px] items-center gap-4 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";
const ROW_GRID =
  "grid grid-cols-[minmax(220px,1.4fr)_minmax(180px,1fr)_minmax(140px,auto)_minmax(160px,1fr)_100px] items-center gap-4 px-4 py-3 transition hover:bg-hover";

interface Props {
  procedureName: string;
  workspaceName: string;
  onBack: () => void;
}

export function LeadDataLogPage({ procedureName, workspaceName, onBack }: Props) {
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loanTypes, setLoanTypes] = useState<Record<LoanType, boolean>>({
    "Personal Loan": false,
    "Home Loan": false,
    "Vehicle Loan": false,
  });
  const [statusGroup, setStatusGroup] = useState<string>("Any Status");

  const filtered = useMemo(() => {
    return LEADS.filter((l) => {
      const q = query.trim().toLowerCase();
      if (q && !l.name.toLowerCase().includes(q) && !l.phone.includes(q)) return false;
      const anyLoanSelected = Object.values(loanTypes).some(Boolean);
      if (anyLoanSelected && !loanTypes[l.loanType]) return false;
      if (statusGroup !== "Any Status" && l.status !== statusGroup) return false;
      return true;
    });
  }, [query, loanTypes, statusGroup]);

  if (selectedLead) {
    return (
      <LeadDetailsPage
        leadName={selectedLead.name}
        leadId={`1fc6e0${selectedLead.id.padStart(2, "0")}`}
        procedureName={procedureName}
        workspaceName={workspaceName}
        status={selectedLead.status}
        loanAmount={selectedLead.amount}
        loanType={selectedLead.loanType}
        tenure={selectedLead.tenure}
        score={selectedLead.score}
        phone={selectedLead.phone}
        onBack={() => setSelectedLead(null)}
      />
    );
  }

  return (
    <PageContainer fullWidth>
      {/* Breadcrumb + back */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to procedures
      </button>

      {/* Table card */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Header inside card */}
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground leading-tight">
                  Lead Data Log
                </h1>
                <p className="text-xs text-muted-foreground">
                  Real-time application pipeline metrics
                </p>
              </div>
              <span className="ml-2 inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {LEADS.length} records
              </span>
            </div>
          </div>
        </div>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3">
          <div className="flex w-64 items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads by name, phone..."
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] text-foreground transition hover:bg-hover"
            >
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              Filters
            </button>
            {filtersOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-border bg-card p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-foreground">Filter Leads</div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoanTypes({
                        "Personal Loan": false,
                        "Home Loan": false,
                        "Vehicle Loan": false,
                      });
                      setStatusGroup("Any Status");
                    }}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    Clear all
                  </button>
                </div>

                <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Loan Type
                </div>
                <div className="mt-2 space-y-2">
                  {(Object.keys(loanTypes) as LoanType[]).map((lt) => (
                    <label
                      key={lt}
                      className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={loanTypes[lt]}
                        onChange={(e) =>
                          setLoanTypes((prev) => ({ ...prev, [lt]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-border"
                      />
                      {lt}
                    </label>
                  ))}
                </div>

                <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status Group
                </div>
                <select
                  value={statusGroup}
                  onChange={(e) => setStatusGroup(e.target.value)}
                  className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option>Any Status</option>
                  <option>Underwriting</option>
                  <option>Sanction Sent</option>
                  <option>Form Abandoned</option>
                  <option>Document Pending</option>
                  <option>Form Submitted</option>
                </select>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column headers */}
        <div className={HEADER_GRID}>
          <div>Lead Identity</div>
          <div>Loan Request</div>
          <div>Pipeline Status</div>
          <div>Last Active</div>
          <div className="text-center">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {filtered.map((l) => (
            <div key={l.id} className={ROW_GRID}>
              {/* Identity */}
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-foreground">{l.name}</div>
                <div className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] leading-snug text-muted-foreground">
                  <Phone className="h-2.5 w-2.5" />
                  {l.phone}
                </div>
              </div>

              {/* Loan Request */}
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-foreground">{l.amount}</div>
                <div className="mt-0.5 truncate text-[11.5px] leading-snug text-muted-foreground">
                  {l.loanType} · {l.tenure}
                </div>
              </div>

              {/* Status */}
              <div>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_TONES[l.status]}`}
                >
                  {l.status}
                </span>
              </div>

              {/* Last Active */}
              <div>
                <div className="text-[12px] text-foreground">{l.date}</div>
                <div className="text-[11px] text-muted-foreground">{l.time}</div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedLead(l)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium text-foreground transition hover:bg-hover"
                >
                  <Eye className="h-3 w-3" />
                  View
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No leads match your filters.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2.5 text-[11.5px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[11.5px] text-foreground focus:outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span>Page 1 of 20</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-hover"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-hover"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
