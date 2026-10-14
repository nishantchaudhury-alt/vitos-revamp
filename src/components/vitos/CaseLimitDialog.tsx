import { useState } from "react";
import { ArrowLeft, Check, ListChecks, Replace, Scissors } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { btn, eyebrow, focusRing } from "./playgroundStyles";

type CaseLike = { id: string; title: string; tags: string[] };

type Mode = "choose" | "pick";

/**
 * Shown when adding use cases would go over the limit. Offers three ways out:
 * replace everything, keep existing and pick some new ones, or drop existing ones to make room.
 */
export function CaseLimitDialog<T extends CaseLike>({
  existing,
  incoming,
  max,
  onCancel,
  onResolve,
}: {
  existing: T[];
  incoming: T[];
  max: number;
  onCancel: () => void;
  onResolve: (next: T[]) => void;
}) {
  const free = Math.max(0, max - existing.length);
  const over = existing.length + incoming.length - max;
  const [mode, setMode] = useState<Mode>("choose");
  const [intent, setIntent] = useState<"pick-new" | "make-room">("pick-new");
  const [keep, setKeep] = useState<Set<string>>(() => new Set(existing.map((item) => item.id)));
  const [take, setTake] = useState<Set<string>>(() => new Set());

  const total = keep.size + take.size;
  const canConfirm = take.size > 0 && total <= max;

  const openPicker = (next: "pick-new" | "make-room") => {
    setIntent(next);
    setKeep(new Set(existing.map((item) => item.id)));
    setTake(
      new Set(
        (next === "pick-new" ? incoming.slice(0, free) : incoming.slice(0, max)).map(
          (item) => item.id,
        ),
      ),
    );
    setMode("pick");
  };

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else if (total < max) next.add(id);
    setter(next);
  };

  const options = [
    {
      key: "replace",
      Icon: Replace,
      title: "Replace all",
      body:
        incoming.length > max
          ? `Remove your ${existing.length} use cases and add the first ${max} new ones.`
          : `Remove your ${existing.length} use ${existing.length === 1 ? "case" : "cases"} and add the ${incoming.length} new ones.`,
      disabled: existing.length === 0,
      onClick: () => onResolve(incoming.slice(0, max)),
    },
    {
      key: "pick-new",
      Icon: ListChecks,
      title: "Choose which new ones to add",
      body:
        free > 0
          ? `Keep your existing use cases and pick ${free} of the new ones.`
          : "No free slots left. Remove existing use cases first.",
      disabled: free === 0,
      onClick: () => openPicker("pick-new"),
    },
    {
      key: "make-room",
      Icon: Scissors,
      title: "Remove existing to make room",
      body:
        incoming.length <= max
          ? `Add all ${incoming.length} new ones and choose which existing use cases to remove.`
          : `There are more than ${max} new use cases, so some of them can't fit.`,
      disabled: incoming.length > max || existing.length === 0,
      onClick: () => openPicker("make-room"),
    },
  ];

  const row = (item: T, checked: boolean, onToggle: () => void, isNew: boolean) => {
    const blocked = !checked && total >= max;
    return (
      <li key={item.id}>
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          disabled={blocked}
          onClick={onToggle}
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45",
            focusRing,
            checked ? "bg-[#C72B65]/[0.04]" : "hover:bg-muted/60",
          )}
        >
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
              checked ? "border-[#C72B65] bg-[#C72B65] text-white" : "border-border bg-card",
            )}
            aria-hidden="true"
          >
            {checked && <Check className="h-3 w-3" strokeWidth={3} />}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{item.title}</span>
          {isNew && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-px text-[11px] font-medium text-emerald-700">
              New
            </span>
          )}
        </button>
      </li>
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-[560px] gap-0 overflow-hidden p-0 sm:rounded-xl">
        {mode === "choose" ? (
          <>
            <div className="px-6 pb-4 pt-6">
              <DialogTitle className="text-[16px] font-semibold">
                You can test up to {max} use cases
              </DialogTitle>
              <DialogDescription className="mt-1 text-[13px] leading-relaxed">
                You have {existing.length} and are adding {incoming.length}, which is {over} more
                than the limit. Choose how to make them fit.
              </DialogDescription>
              <div className="mt-3 flex items-center gap-2">
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-foreground/30"
                    style={{ width: `${Math.min(100, (existing.length / max) * 100)}%` }}
                  />
                  <span
                    className="absolute inset-y-0 rounded-full bg-red-400"
                    style={{
                      left: `${Math.min(100, (existing.length / max) * 100)}%`,
                      width: `${Math.min(100, (incoming.length / max) * 100)}%`,
                    }}
                  />
                </span>
                <span className="shrink-0 text-[12px] tabular-nums text-red-600">
                  {existing.length + incoming.length}/{max}
                </span>
              </div>
            </div>
            <div className="space-y-2 border-t border-border px-6 py-4">
              {options.map(({ key, Icon, title, body, disabled, onClick }) => (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={onClick}
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-3 rounded-lg border border-border p-3.5 text-left transition-colors hover:border-[#C72B65]/50 hover:bg-[#C72B65]/[0.03] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-transparent",
                    focusRing,
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-foreground">{title}</span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                      {body}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="flex justify-end border-t border-border px-6 py-3">
              <button type="button" onClick={onCancel} className={btn.ghost}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-2 px-6 pb-4 pt-6">
              <button
                type="button"
                onClick={() => setMode("choose")}
                aria-label="Back to options"
                className={cn(btn.ghost, "-ml-2 -mt-1 h-8 w-8 px-0")}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <DialogTitle className="text-[16px] font-semibold">
                  {intent === "pick-new" ? "Choose new use cases" : "Make room for the new ones"}
                </DialogTitle>
                <DialogDescription className="mt-1 text-[13px]">
                  Select up to {max}. Unchecked use cases won&apos;t be in the test.
                </DialogDescription>
              </div>
              <span
                className={cn(
                  "ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-medium tabular-nums",
                  total > max
                    ? "bg-red-50 text-red-600"
                    : total === max
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {total}/{max} selected
              </span>
            </div>
            <div className="max-h-[360px] space-y-4 overflow-y-auto border-t border-border px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div>
                <p className={cn(eyebrow, "mb-1.5 px-3")}>New · {incoming.length}</p>
                <ul className="space-y-0.5">
                  {incoming.map((item) =>
                    row(item, take.has(item.id), () => toggle(take, setTake, item.id), true),
                  )}
                </ul>
              </div>
              <div>
                <p className={cn(eyebrow, "mb-1.5 px-3")}>Your use cases · {existing.length}</p>
                <ul className="space-y-0.5">
                  {existing.map((item) =>
                    row(item, keep.has(item.id), () => toggle(keep, setKeep, item.id), false),
                  )}
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-3">
              <span className="text-[12px] text-muted-foreground">
                {take.size === 0
                  ? "Select at least one new use case."
                  : `Adding ${take.size} new, keeping ${keep.size} existing.`}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={onCancel} className={btn.ghost}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canConfirm}
                  onClick={() =>
                    onResolve([
                      ...existing.filter((item) => keep.has(item.id)),
                      ...incoming.filter((item) => take.has(item.id)),
                    ])
                  }
                  className={btn.primary}
                >
                  Update use cases
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
