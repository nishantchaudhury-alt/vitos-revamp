import { Bot, Database, Plug, MessagesSquare, Search, Bell, Sparkles } from "lucide-react";

interface Props {
  workspaceName: string;
  interactive?: boolean;
  onCreateAgent?: () => void;
}

export function WorkspaceShell({ workspaceName, interactive = false, onCreateAgent }: Props) {
  const displayName = workspaceName.trim() || "Your Workspace";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-sidebar-foreground">
              {displayName}
            </div>
            <div className="text-xs text-muted-foreground">Workspace</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {[
            { icon: Bot, label: "AI Agents" },
            { icon: Database, label: "Knowledge Base" },
            { icon: Plug, label: "All APIs" },
            { icon: MessagesSquare, label: "Channels" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/80"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Trial · 14 days left
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">{displayName}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">Home</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex w-64 items-center gap-2 rounded-md border border-input bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
              Search
            </div>
            <Bell className="h-4 w-4 text-muted-foreground" />
            <div className="h-7 w-7 rounded-full bg-gradient-primary" />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center p-10">
          {interactive ? (
            <EmptyState workspaceName={displayName} onCreateAgent={onCreateAgent} />
          ) : (
            <PlaceholderPanel />
          )}
        </main>
      </div>
    </div>
  );
}

function PlaceholderPanel() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-28 rounded-xl border border-border bg-muted/40"
          style={{ opacity: 0.6 - i * 0.05 }}
        />
      ))}
    </div>
  );
}

function EmptyState({
  workspaceName,
  onCreateAgent,
}: {
  workspaceName: string;
  onCreateAgent?: () => void;
}) {
  return (
    <div className="flex max-w-md flex-col items-center text-center animate-fade-up">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
        <Bot className="h-9 w-9 text-primary-foreground" />
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-2 ring-primary/30">
          <Sparkles className="h-3 w-3 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Your workspace is ready.
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {workspaceName} is set up. Start by creating your first AI Agent.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          onClick={onCreateAgent}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition hover:opacity-90 active:scale-[0.98]"
        >
          + Create Agent
        </button>
        <button className="text-xs font-medium text-primary hover:underline">
          Take a quick tour →
        </button>
      </div>
    </div>
  );
}
