import { useEffect, useMemo, useState } from "react";
import buildLogo from "@/assets/build-logo.png";
import { ArrowLeft, Square } from "lucide-react";

export type AgentType = "voice" | "text";

interface Props {
  onSelect?: (type: AgentType) => void;
  onProceed?: (type: AgentType) => void;
  onBack?: () => void;
}

const PINK = "#c0386b";

// Soft corner-tinted card washes (mostly white with one tinted corner blob)
const TINTS = {
  lavender:
    "radial-gradient(80% 70% at 100% 0%, rgba(206,196,240,0.50) 0%, rgba(206,196,240,0) 60%), radial-gradient(70% 60% at 0% 100%, rgba(225,215,245,0.32) 0%, rgba(225,215,245,0) 65%), linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)",
  blue: "radial-gradient(80% 70% at 100% 0%, rgba(180,210,255,0.55) 0%, rgba(180,210,255,0) 60%), radial-gradient(70% 60% at 0% 100%, rgba(210,225,255,0.35) 0%, rgba(210,225,255,0) 65%), linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%)",
} as const;

type Tint = keyof typeof TINTS;

export function AgentTypeSelect({ onSelect, onProceed, onBack }: Props) {
  const [selected, setSelected] = useState<AgentType | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hint = useMemo(() => {
    if (selected === "voice") return "Next up: connect your voice provider";
    if (selected === "text") return "Next up: pick your trigger";
    return "Not sure? You can change this later.";
  }, [selected]);

  const pick = (t: AgentType) => {
    setSelected(t);
    onSelect?.(t);
  };

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
        Hey Swati, what are you building today?
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <AgentCard
          isSelected={selected === "voice"}
          onClick={() => pick("voice")}
          tint="lavender"
          title="Voice Agent"
          description="Handles phone calls, speaks to customers in real time. Great for support lines and outbound follow-ups."
          tags={["Inbound calls", "Outbound calls", "IVR replacement"]}
          visual={<VoiceWaveform />}
        />
        <AgentCard
          isSelected={selected === "text"}
          onClick={() => pick("text")}
          tint="blue"
          title="Non-Voice Agent"
          description="Works across WhatsApp, email, and background tasks — no voice required."
          tags={["Chat / WhatsApp", "Email", "Workflow"]}
          visual={<ContactStack />}
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{hint}</p>
        <button
          type="button"
          onClick={() => selected && onProceed?.(selected)}
          disabled={!selected}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition active:scale-[0.99] ${
            selected
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "bg-[#B22257]/30 text-[#F0CEDB]/70 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

interface CardProps {
  isSelected: boolean;
  onClick: () => void;
  badge?: string;
  title: string;
  description: string;
  tags: string[];
  visual: React.ReactNode;
  tint: Tint;
}

function AgentCard({
  isSelected,
  onClick,
  badge,
  title,
  description,
  tags,
  visual,
  tint,
}: CardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col overflow-hidden rounded-2xl text-left transition-all duration-200 ${
        isSelected ? "shadow-md -translate-y-0.5" : "hover:shadow-md"
      }`}
      style={{
        border: isSelected ? `1.5px solid ${PINK}` : "0.5px solid hsl(0 0% 90%)",
        background: TINTS[tint],
      }}
    >
      {/* Illustration area — transparent so the card's tint flows through */}
      <div className="relative h-48 w-full overflow-hidden">{visual}</div>

      {/* Content area */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        {badge && (
          <span
            className="inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
            style={{
              borderColor: "rgba(192,56,107,0.35)",
              color: PINK,
              background: "rgba(192,56,107,0.06)",
            }}
          >
            <Square className="h-2.5 w-2.5" strokeWidth={2} />
            {badge}
          </span>
        )}
        <h3 className="mt-1 text-[16px] font-semibold leading-snug text-foreground">{title}</h3>
        <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] text-muted-foreground"
              style={{ borderColor: "hsl(0 0% 90%)", background: "hsl(0 0% 98%)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

/* ---------- Visuals ---------- */

/**
 * ParticleOrb — volumetric point-cloud sphere.
 * Dense shell, sparse translucent center, soft drift + breathe motion.
 * Rendered with deterministic pseudo-random distribution so SSR is stable.
 */
function ParticleOrb({ accent, seed = 1 }: { accent: string; seed?: number }) {
  // Deterministic PRNG (mulberry32)
  const rand = (() => {
    let s = seed >>> 0 || 1;
    return () => {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();

  const cx = 110;
  const cy = 85;
  const R = 62;

  // Soft palette — blush, dusty rose, lavender haze, pearl, white + accent
  const palette = ["#ffffff", "#f3eef5", "#ece2ee", "#e7dbe7", "#d9c9da", accent];

  type P = { x: number; y: number; r: number; o: number; fill: string; dur: number; delay: number };
  const particles: P[] = [];
  const COUNT = 140;

  for (let i = 0; i < COUNT; i++) {
    // Bias toward the shell: r = R * (0.55 + 0.45 * sqrt(u))^0.7 with shell weighting
    const u = rand();
    // shell-weighted radius: most particles near R, few near center
    const radial = R * Math.pow(0.35 + 0.65 * u, 0.55);
    const theta = rand() * Math.PI * 2;
    // Slight vertical squash for depth feel
    const x = cx + Math.cos(theta) * radial * (0.95 + rand() * 0.1);
    const y = cy + Math.sin(theta) * radial * 0.78;

    const shellProximity = radial / R; // 0 center -> 1 edge
    const r = 0.4 + rand() * (shellProximity > 0.7 ? 1.4 : 0.9);
    const o = 0.15 + shellProximity * 0.55 + rand() * 0.15;
    const pickAccent = rand() < 0.08;
    const fill = pickAccent ? accent : palette[Math.floor(rand() * (palette.length - 1))];
    const dur = 6 + rand() * 6;
    const delay = -rand() * dur;
    particles.push({ x, y, r, o, fill, dur, delay });
  }

  const gradId = `orb-glow-${seed}`;
  const coreId = `orb-core-${seed}`;

  return (
    <svg viewBox="0 0 220 170" className="h-full w-full">
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="55%" stopColor={accent} stopOpacity="0.05" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient bloom */}
      <circle cx={cx} cy={cy} r={R + 18} fill={`url(#${gradId})`} />
      {/* Faint core glow */}
      <circle cx={cx} cy={cy} r={R * 0.55} fill={`url(#${coreId})`}>
        <animate
          attributeName="r"
          values={`${R * 0.5};${R * 0.6};${R * 0.5}`}
          dur="7s"
          repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0.7;1;0.7" dur="7s" repeatCount="indefinite" />
      </circle>

      {/* Particle field — slow breathe via group transform */}
      <g style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.025;1"
          dur="9s"
          repeatCount="indefinite"
          additive="sum"
        />
        {particles.map((p, i) => {
          // Subtle drift offset, unique per particle
          const dx = (rand() - 0.5) * 3;
          const dy = (rand() - 0.5) * 3;
          return (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.fill} opacity={p.o}>
              <animate
                attributeName="cx"
                values={`${p.x};${p.x + dx};${p.x}`}
                dur={`${p.dur}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${p.y};${p.y + dy};${p.y}`}
                dur={`${p.dur}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values={`${p.o};${Math.min(1, p.o + 0.15)};${p.o}`}
                dur={`${p.dur}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      </g>
    </svg>
  );
}

/**
 * VoiceWaveform — animated audio player pill with play button, dynamic bars, duration.
 * Sits inside the lavender-tinted card area.
 */
function VoiceWaveform() {
  // Deterministic base heights for the bars (stable SSR), animated via CSS keyframes.
  const BAR_COUNT = 38;
  const seed = 11;
  const rand = (() => {
    let s = seed >>> 0 || 1;
    return () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    // Smooth envelope so the waveform feels like real audio (not noise)
    const env = Math.sin((i / BAR_COUNT) * Math.PI * 2.4) * 0.5 + 0.55;
    const jitter = 0.55 + rand() * 0.45;
    const base = Math.max(0.18, Math.min(1, env * jitter));
    return base;
  });

  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <style>{`
        @keyframes vitos-wave-bar {
          0%, 100% { transform: scaleY(var(--base)); }
          50% { transform: scaleY(var(--peak)); }
        }
        @keyframes vitos-play-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139,116,220,0.35); }
          50% { box-shadow: 0 0 0 8px rgba(139,116,220,0); }
        }
        @keyframes vitos-time-tick {
          0% { content: "0:39"; }
          25% { content: "0:40"; }
          50% { content: "0:41"; }
          75% { content: "0:42"; }
          100% { content: "0:43"; }
        }
      `}</style>

      <div
        className="flex items-center gap-3 rounded-full px-3 py-2.5 pr-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(139,116,220,0.95) 0%, rgba(118,96,210,0.95) 100%)",
          boxShadow:
            "0 10px 30px -10px rgba(118,96,210,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        {/* Play button */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            background: "rgba(255,255,255,0.95)",
            animation: "vitos-play-pulse 2.4s ease-out infinite",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 2L10 6L3 10V2Z" fill="#7660D2" />
          </svg>
        </div>

        {/* Waveform bars */}
        <div className="flex h-7 items-center gap-[3px]">
          {bars.map((base, i) => {
            const peak = Math.min(1, base + 0.35 + rand() * 0.25);
            const dur = 0.9 + (i % 5) * 0.12;
            const delay = -((i * 0.07) % 1.2);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  width: 2,
                  height: "100%",
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.92)",
                  transformOrigin: "center",
                  ["--base" as string]: base,
                  ["--peak" as string]: peak,
                  animation: `vitos-wave-bar ${dur}s ease-in-out ${delay}s infinite`,
                }}
              />
            );
          })}
        </div>

        {/* Duration */}
        <span
          className="ml-1 text-[13px] font-medium tabular-nums"
          style={{ color: "rgba(255,255,255,0.95)" }}
        >
          0:39
        </span>
      </div>
    </div>
  );
}

/**
 * ChatConversation — animated WhatsApp-style chat between a user and a bot.
 * Bubbles type in sequentially with a typing indicator before the bot reply.
 */
function ContactStack() {
  // Sequence (in seconds): user msg 1 -> bot reply -> user msg 2 -> typing -> bot reply 2
  const messages = [
    { from: "user", text: "Hey, I need to reschedule my delivery", delay: 0.1 },
    { from: "bot", text: "Sure! What date works for you?", delay: 0.9 },
    { from: "user", text: "This Friday afternoon 👍", delay: 1.8 },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden px-5 py-4">
      <style>{`
        @keyframes vitos-msg-in {
          0% { opacity: 0; transform: translateY(6px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes vitos-typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
        @keyframes vitos-typing-in {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex h-full flex-col justify-center gap-2">
        {messages.map((m, i) => {
          const isBot = m.from === "bot";
          return (
            <div
              key={i}
              className={`flex items-end gap-1.5 ${isBot ? "justify-start" : "justify-end"}`}
              style={{
                animation: `vitos-msg-in 0.45s cubic-bezier(0.2,0.8,0.2,1) ${m.delay}s both`,
              }}
            >
              {isBot && (
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg,#8fb6f0,#5b8fe0)" }}
                >
                  ✦
                </div>
              )}
              <div
                className="max-w-[75%] px-3 py-1.5 text-[11px] leading-snug shadow-sm"
                style={{
                  borderRadius: isBot ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
                  background: isBot ? "#ffffff" : "#3b82f6",
                  color: isBot ? "#1f2937" : "#ffffff",
                  border: isBot ? "1px solid rgba(0,0,0,0.05)" : "none",
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {/* Bot typing indicator at the end */}
        <div
          className="flex items-end gap-1.5 justify-start"
          style={{ animation: "vitos-typing-in 0.4s ease-out 2.6s both" }}
        >
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg,#8fb6f0,#5b8fe0)" }}
          >
            ✦
          </div>
          <div
            className="flex items-center gap-1 px-3 py-2 shadow-sm"
            style={{
              borderRadius: "14px 14px 14px 4px",
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="block h-1 w-1 rounded-full"
                style={{
                  background: "#94a3b8",
                  animation: `vitos-typing-dot 1.2s ease-in-out ${2.8 + d * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
