import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Shared page wrapper for main content areas.
 * Defaults to a wider but still readable max-width with less side padding.
 * Use `fullWidth` for data-heavy pages (tables, grids) that should use all
 * available horizontal space.
 */
export function PageContainer({ children, className, fullWidth = false }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 py-6 animate-fade-up",
        fullWidth ? "max-w-none" : "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
