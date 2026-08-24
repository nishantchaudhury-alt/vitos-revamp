import { useEffect, useRef, useState } from "react";
import { Loader2, Home, PanelLeft, Plus, LogOut, Search, Bell } from "lucide-react";

import vitosLogo from "@/assets/vitos-logo.png";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onCreate: () => void;
  creating: boolean;
  onLogout: () => void;
}

export function NameWorkspaceScreen({ value, onChange, onCreate, creating, onLogout }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    inputRef.current?.focus();
    setMounted(true);
  }, []);

  const valid = value.trim().length >= 2;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-sidebar-border bg-white/80 backdrop-blur md:flex">
        <div>
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <img src={vitosLogo} alt="Vitos" className="h-8 w-8 rounded-full" />
              <span className="text-lg font-semibold tracking-tight text-foreground">Vitos</span>
            </div>
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-hover"
              aria-label="Toggle sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>

          <nav className="px-3 py-2">
            <div className="flex items-center gap-2 rounded-lg bg-hover px-2.5 py-2 text-sm text-sidebar-foreground/80">
              <Home className="h-4 w-4 shrink-0" />
              {value.trim() ? (
                <span className="truncate text-sm font-medium text-sidebar-foreground animate-fade-in">
                  {value.trim()}
                </span>
              ) : (
                <div className="h-2 w-full rounded-full bg-muted" />
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main className="relative flex flex-1 flex-col bg-background">
        {/* Top header */}
        <div className="sticky top-0 z-20 flex h-14 items-center justify-end gap-3 border-b border-sidebar-border bg-white/80 px-6 backdrop-blur">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search APIs, agents, workflows..."
              className="h-9 w-80 rounded-lg border border-sidebar-border bg-[#FAFAFA] pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-sidebar-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </span>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="rounded-md p-2 text-muted-foreground transition hover:bg-hover hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#E91E63] to-[#B22257] text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
            title="Swati · Support Manager"
          >
            S
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className={`w-full max-w-xl ${mounted ? "animate-fade-up" : "opacity-0"}`}>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Name your workspace
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This is your command centre — where your agents, workflows, and knowledge live.
            </p>

            <div className="mt-6">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && valid && !creating) onCreate();
                }}
                placeholder="Workspace name"
                maxLength={48}
                className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onCreate}
                disabled={!valid || creating}
                className={`inline-flex items-center gap-2 rounded-xl bg-[#B22257] px-6 py-2.5 text-sm font-semibold text-[#F0CEDB] transition active:scale-[0.99] ${
                  valid && !creating ? "hover:bg-[#B22257]/90" : "cursor-not-allowed opacity-50"
                }`}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
