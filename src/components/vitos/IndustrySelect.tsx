import { useEffect, useMemo, useState } from "react";
import buildLogo from "@/assets/build-logo.png";
import {
  ArrowLeft,
  Sparkles,
  Zap,
  ShoppingBag,
  Landmark,
  HeartPulse,
  Plane,
  GraduationCap,
  Building2,
} from "lucide-react";

export type Industry =
  | "scratch"
  | "energy"
  | "ecommerce"
  | "bfsi"
  | "healthcare"
  | "travel"
  | "education"
  | "realestate";

interface Props {
  onProceed?: (data: { industry: Industry; name: string; description: string }) => void;
  onBack?: () => void;
}

const PINK = "#c0386b";

const INDUSTRIES: {
  key: Industry;
  label: string;
  hint: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}[] = [
  {
    key: "scratch",
    label: "Start from scratch",
    hint: "A blank canvas",
    Icon: Sparkles,
    iconColor: "#16a34a",
    iconBg: "rgba(22,163,74,0.10)",
  },
  {
    key: "energy",
    label: "Energy & Utilities",
    hint: "Bills, outages, meters",
    Icon: Zap,
    iconColor: "#eab308",
    iconBg: "rgba(234,179,8,0.12)",
  },
  {
    key: "ecommerce",
    label: "E-commerce",
    hint: "Orders, returns, tracking",
    Icon: ShoppingBag,
    iconColor: "#ec4899",
    iconBg: "rgba(236,72,153,0.10)",
  },
  {
    key: "bfsi",
    label: "Banking & Finance",
    hint: "Accounts, loans, KYC",
    Icon: Landmark,
    iconColor: "#0ea5e9",
    iconBg: "rgba(14,165,233,0.10)",
  },
  {
    key: "healthcare",
    label: "Healthcare",
    hint: "Appointments, reports",
    Icon: HeartPulse,
    iconColor: "#ef4444",
    iconBg: "rgba(239,68,68,0.10)",
  },
  {
    key: "travel",
    label: "Travel & Hospitality",
    hint: "Bookings, itineraries",
    Icon: Plane,
    iconColor: "#6366f1",
    iconBg: "rgba(99,102,241,0.10)",
  },
  {
    key: "education",
    label: "Education",
    hint: "Admissions, courses",
    Icon: GraduationCap,
    iconColor: "#8b5cf6",
    iconBg: "rgba(139,92,246,0.10)",
  },
  {
    key: "realestate",
    label: "Real Estate",
    hint: "Listings, site visits",
    Icon: Building2,
    iconColor: "#0d9488",
    iconBg: "rgba(13,148,136,0.10)",
  },
];

export function IndustrySelect({ onProceed, onBack }: Props) {
  const [selected, setSelected] = useState<Industry | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const selectedIndustry = useMemo(
    () => INDUSTRIES.find((i) => i.key === selected) ?? null,
    [selected],
  );

  const trimmedName = name.trim();
  const canProceed = !!selected && trimmedName.length > 0;

  return (
    <div className={`mx-auto w-full max-w-4xl px-2 ${mounted ? "animate-fade-up" : "opacity-0"}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1 -ml-2 text-sm text-muted-foreground transition hover:bg-hover hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}
      <img src={buildLogo} alt="Build" className="mb-4 h-10 w-10" />
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        What world does your agent live in?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick an industry and we'll pre-load the lingo, intents, and a few sample flows. Not sure?
        Start from scratch.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {INDUSTRIES.map(({ key, label, hint: subhint, Icon, iconColor, iconBg }) => {
          const isSelected = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`group flex items-center gap-3 rounded-xl bg-white px-4 py-3.5 text-left transition-all duration-200 ${
                isSelected ? "shadow-md -translate-y-0.5" : "hover:shadow-sm hover:-translate-y-px"
              }`}
              style={{
                border: isSelected ? `1.5px solid ${PINK}` : "0.5px solid hsl(0 0% 90%)",
              }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: iconBg, color: iconColor }}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold leading-tight text-foreground">
                  {label}
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                  {subhint}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-10 space-y-4 animate-fade-up">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Almost there — let's give it an identity
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A name and a one-liner help your team (and your agent) know what it stands for.
            </p>
          </div>
          <div>
            <label htmlFor="agent-name" className="block text-sm font-semibold text-foreground">
              Give your agent a name
            </label>
            <input
              id="agent-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 60))}
              maxLength={60}
              placeholder="e.g. Riley, the returns whisperer"
              className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="agent-desc" className="block text-sm font-semibold text-foreground">
              What will it do? <span className="font-normal text-muted-foreground">— optional</span>
            </label>
            <textarea
              id="agent-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 280))}
              maxLength={280}
              rows={3}
              placeholder="A line or two about the job — we'll use it to set the tone."
              className="mt-2 w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        {selectedIndustry ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
            style={{ background: "rgba(192,56,107,0.08)", color: PINK }}
          >
            <span
              className="flex h-4 w-4 items-center justify-center rounded-md"
              style={{ background: selectedIndustry.iconBg, color: selectedIndustry.iconColor }}
            >
              <selectedIndustry.Icon className="h-3 w-3" />
            </span>
            {selectedIndustry.label}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() =>
            canProceed &&
            onProceed?.({ industry: selected!, name: trimmedName, description: description.trim() })
          }
          disabled={!canProceed}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition active:scale-[0.99] ${
            canProceed
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "bg-[#B22257]/30 text-[#F0CEDB]/70 cursor-not-allowed"
          }`}
        >
          Let's build
        </button>
      </div>
    </div>
  );
}
