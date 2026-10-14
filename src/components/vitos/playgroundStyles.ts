// Shared styling for every prompt playground screen, so sizes and surfaces stay on one scale:
//   type 11 caps · 12 meta · 13 body/controls · 14 sub-titles · 16 titles · 24 figures
//   radius 8 controls · 12 panels · full only for status badges, dots and avatars
//   height 36 for buttons and inputs · brand colour only for primary actions, selection and focus

export const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B65]/30 focus-visible:ring-offset-1";

const buttonBase = `inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium transition-colors disabled:cursor-not-allowed ${focusRing}`;

export const btn = {
  primary: `${buttonBase} bg-[#C72B65] px-4 text-white hover:bg-[#A92355] disabled:bg-[#C72B65]/40`,
  secondary: `${buttonBase} border border-border bg-card px-3.5 text-foreground hover:bg-muted disabled:opacity-50`,
  ghost: `${buttonBase} px-3 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50`,
  icon: `${buttonBase} w-9 border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40`,
  danger: `${buttonBase} border border-red-200 bg-card px-3.5 text-red-600 hover:bg-red-50`,
};

export const panel =
  "rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

export const eyebrow =
  "text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground";
