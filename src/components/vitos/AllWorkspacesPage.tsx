import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { PageContainer } from "./PageContainer";

type Status = "live" | "testing" | "draft";

interface Workspace {
  initials: string;
  name: string;
  status: Status;
  env: string;
  agents: number;
  aops: number;
  schemas: number;
  avatarBg: string;
  avatarFg: string;
}

const WORKSPACES: Workspace[] = [
  {
    initials: "KX",
    name: "Kapture CX",
    status: "live",
    env: "Production",
    agents: 7,
    aops: 4,
    schemas: 2,
    avatarBg: "bg-[#F7E0EA]",
    avatarFg: "text-[#B22257]",
  },
  {
    initials: "SB",
    name: "Sandbox",
    status: "testing",
    env: "Sandbox",
    agents: 3,
    aops: 1,
    schemas: 1,
    avatarBg: "bg-[#E2EAFB]",
    avatarFg: "text-[#3858C9]",
  },
  {
    initials: "BI",
    name: "Billing Ops",
    status: "live",
    env: "Production",
    agents: 3,
    aops: 2,
    schemas: 1,
    avatarBg: "bg-[#DCF1E3]",
    avatarFg: "text-[#1F8047]",
  },
  {
    initials: "VB",
    name: "Voice Bot - Beta",
    status: "testing",
    env: "Sandbox",
    agents: 2,
    aops: 0,
    schemas: 1,
    avatarBg: "bg-[#E4DEFB]",
    avatarFg: "text-[#5A45C4]",
  },
  {
    initials: "R2",
    name: "Retail 2.0",
    status: "draft",
    env: "In progress",
    agents: 1,
    aops: 0,
    schemas: 0,
    avatarBg: "bg-[#ECECEC]",
    avatarFg: "text-[#6B6B6B]",
  },
];

const STATUS_DOT: Record<Status, string> = {
  live: "bg-emerald-500",
  testing: "bg-amber-500",
  draft: "bg-muted-foreground/40",
};

const STATUS_PILL: Record<Status, string> = {
  live: "bg-emerald-100 text-emerald-700",
  testing: "bg-amber-100 text-amber-700",
  draft: "bg-muted text-muted-foreground",
};

interface Props {
  currentWorkspace: string;
}

export function AllWorkspacesPage({ currentWorkspace }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return WORKSPACES.filter((w) => {
      if (query && !w.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query]);

  return (
    <PageContainer>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">All workspaces</h1>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-hover"
          >
            <Plus className="h-4 w-4" />
            New workspace
          </button>
        </div>

        {/* Search + filters */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#E5E5E5] bg-hover px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search by name..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <WorkspaceCard key={w.name} w={w} active={w.name === currentWorkspace} />
          ))}

          {/* New workspace tile */}
          <button
            type="button"
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D4D4D4] bg-hover py-6 text-muted-foreground transition hover:border-[#B8B8B8] hover:bg-hover hover:text-foreground"
          >
            <Plus className="h-5 w-5" />
            <span className="mt-2 text-sm font-medium">New workspace</span>
          </button>
        </div>
      </div>
    </PageContainer>
  );
}

function WorkspaceCard({ w, active }: { w: Workspace; active: boolean }) {
  return (
    <button
      type="button"
      className={`group flex flex-col rounded-xl border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? "border-[#B22257]" : "border-border hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-md ${w.avatarBg} text-xs font-bold ${w.avatarFg}`}
          >
            {w.initials}
          </div>
          <span className="text-base font-semibold text-foreground">{w.name}</span>
        </div>
      </div>

      <div className="mt-4 flex items-end gap-7">
        <Stat value={w.agents} label="agents" />
        <Stat value={w.aops} label="AOPs" />
        <Stat value={w.schemas} label="schemas" />
      </div>
    </button>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="leading-tight">
      <div className="text-xl font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
