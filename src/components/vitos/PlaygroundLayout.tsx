import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn } from "./playgroundStyles";

/** The one content column every playground screen sits in: same width, padding and rhythm. */
export function ViewShell({
  children,
  fill = false,
  className,
}: {
  children: React.ReactNode;
  /** Pin to the available height so inner panes scroll instead of the page. */
  fill?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-6 py-5",
        fill ? "min-h-0 flex-1" : "flex-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Title row shared by every screen: optional back, title with count, meta, and actions. */
export function ViewHeader({
  title,
  count,
  meta,
  onBack,
  actions,
}: {
  title: string;
  count?: number;
  meta?: React.ReactNode;
  onBack?: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-9 shrink-0 flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className={cn(btn.ghost, "-ml-2 w-9 px-0")}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold leading-6 text-foreground">
            {title}
            {count !== undefined && (
              <span className="ml-1.5 font-normal tabular-nums text-muted-foreground">{count}</span>
            )}
          </h2>
          {meta && (
            <div className="truncate text-[13px] leading-5 text-muted-foreground">{meta}</div>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
