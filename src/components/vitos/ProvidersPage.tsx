import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, MoreHorizontal, X, KeyRound, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer } from "./PageContainer";
import vitosProviderLogo from "@/assets/vitos-provider-logo.png.asset.json";
import integrationsHeroBg from "@/assets/integrations-hero-bg.webp";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Provider = {
  id: string;
  name: string;
  description: string;
  logo: React.ReactNode;
  connected?: boolean;
  recommended?: boolean;
  inHouse?: boolean;
  models?: string[];
};

type Section = {
  id: string;
  title: string;
  subtitle: string;
  providers: Provider[];
};

/* -------- Brand logo marks (inline SVG, no external deps) -------- */

const LogoWrap = ({ bg = "#fff", children }: { bg?: string; children: React.ReactNode }) => (
  <div
    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e8e6e1]"
    style={{ background: bg }}
  >
    {children}
  </div>
);

const ChatGPTLogo = () => (
  <LogoWrap>
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#10a37f">
      <path d="M22.28 10.11a5.6 5.6 0 0 0-.48-4.6 5.66 5.66 0 0 0-6.1-2.71A5.66 5.66 0 0 0 6.1 4.06a5.6 5.6 0 0 0-3.75 2.72 5.66 5.66 0 0 0 .7 6.63 5.6 5.6 0 0 0 .48 4.6 5.66 5.66 0 0 0 6.1 2.71 5.6 5.6 0 0 0 4.23 1.89 5.66 5.66 0 0 0 5.4-3.92 5.6 5.6 0 0 0 3.75-2.72 5.66 5.66 0 0 0-.72-6.86Zm-8.5 11.87a4.2 4.2 0 0 1-2.7-.98l.13-.08 4.5-2.6a.74.74 0 0 0 .37-.64v-6.35l1.9 1.1c.02 0 .03.03.04.05v5.26a4.21 4.21 0 0 1-4.24 4.24Zm-9.09-3.88a4.2 4.2 0 0 1-.5-2.82l.13.08 4.5 2.6a.73.73 0 0 0 .74 0l5.5-3.17v2.19a.07.07 0 0 1-.03.06L11 19.68a4.21 4.21 0 0 1-5.75-1.54Zm-1.18-9.8a4.2 4.2 0 0 1 2.2-1.85V11.8a.74.74 0 0 0 .36.64l5.5 3.17-1.9 1.1a.07.07 0 0 1-.06 0L5.05 14.08a4.21 4.21 0 0 1-1.54-5.75Zm15.4 3.58L13.4 8.72l1.9-1.1a.07.07 0 0 1 .06 0l4.55 2.62a4.21 4.21 0 0 1-.64 7.6v-5.4a.74.74 0 0 0-.37-.63Zm1.9-2.86-.13-.08-4.5-2.6a.73.73 0 0 0-.74 0L10 9.5V7.3a.07.07 0 0 1 .03-.06L14.55 4.6a4.21 4.21 0 0 1 6.24 4.4Zm-11.9 4L7 12l.03-2.19 4.53-2.61 1.9 1.1v5.22l-4.5 2.6Z" />
    </svg>
  </LogoWrap>
);

const GeminiLogo = () => (
  <LogoWrap>
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <defs>
        <linearGradient id="gem-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4285f4" />
          <stop offset=".5" stopColor="#9b72cb" />
          <stop offset="1" stopColor="#d96570" />
        </linearGradient>
      </defs>
      <path
        fill="url(#gem-g)"
        d="M12 2c.5 4.7 3.3 7.5 8 8-4.7.5-7.5 3.3-8 8-.5-4.7-3.3-7.5-8-8 4.7-.5 7.5-3.3 8-8Z"
      />
    </svg>
  </LogoWrap>
);

const DeepSeekLogo = () => (
  <LogoWrap>
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#4d6bfe">
      <path d="M20.5 6.2c-.4-.2-.7.1-1 .4-.1.1-.2.2-.3.4-.6.9-1.5 1.5-2.9 1.4-2.1-.1-3.8 1-4.7 2.4-.5-2.2-1.7-3.5-3.5-4.4-.7-.4-1.5-.6-2.3-.9v.9c.1 1.4.7 2.4 1.7 3.2.2.2.3.4.2.6-.1.4-.2.7-.3 1.1-.3.7-.2 1.4.2 2 .5.9 1.4 1.4 2.5 1.5.4.1.7.1 1 .2-.5 1.7.4 3.2 1.5 3.6.4.1.8.2 1.2 0 .5-.3.3-.7.1-1.1-.1-.3-.1-.6 0-.9.2-.5.5-.7 1-.5.4.2.7.5 1.1.6.7.3 1.4.2 2-.4.6-.7.6-1.6 0-2.3-.4-.5-1.1-.7-1.8-.8-.4 0-.7 0-1.1-.1.5-1.6 1.8-2.4 3.7-2.5.4 0 .8 0 1.2-.1.9-.2 1.7-.7 2.1-1.5.4-.9.4-1.8-.6-2.3z" />
    </svg>
  </LogoWrap>
);

const AzureLogo = () => (
  <LogoWrap>
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <defs>
        <linearGradient id="az-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0078d4" />
          <stop offset="1" stopColor="#5ea0ef" />
        </linearGradient>
      </defs>
      <path
        fill="url(#az-g)"
        d="M8.2 3h6.2l-6.7 12.6-4 .1L8.2 3Zm.6 14.3 6.3-6.6L20 21H6.5l2.3-3.7Z"
      />
    </svg>
  </LogoWrap>
);

const DeepgramLogo = () => (
  <LogoWrap bg="#0b0b0b">
    <span
      className="font-bold text-white text-lg leading-none"
      style={{ fontFamily: "'Inter',sans-serif" }}
    >
      D
    </span>
  </LogoWrap>
);

const GoogleLogo = () => (
  <LogoWrap>
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <path
        fill="#4285F4"
        d="M22 12.2c0-.8-.1-1.4-.2-2.1H12v3.9h5.6c-.1 1-.7 2.5-2.1 3.5l3.1 2.4c1.9-1.7 3-4.3 3-7.7Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.8 0 5.1-.9 6.7-2.5l-3.1-2.4c-.9.6-2 1-3.6 1-2.7 0-5-1.8-5.9-4.3H2.9v2.5C4.6 19.6 8 22 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.1 13.8c-.2-.6-.4-1.2-.4-1.9s.1-1.3.4-1.9V7.5H2.9C2.3 8.9 2 10.4 2 12s.3 3.1.9 4.5l3.2-2.7Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17.1 3 14.8 2 12 2 8 2 4.6 4.4 2.9 7.5l3.2 2.5C7 7.7 9.3 5.9 12 5.9Z"
      />
    </svg>
  </LogoWrap>
);

const GrokLogo = () => (
  <LogoWrap bg="#0b0b0b">
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#fff" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <path d="M6 18 18 6" />
    </svg>
  </LogoWrap>
);

const ElevenLabsLogo = () => (
  <LogoWrap bg="#0b0b0b">
    <span className="font-bold text-white text-[13px] leading-none tracking-tight">II</span>
  </LogoWrap>
);

const KaptureLogo = () => (
  <LogoWrap bg="#e11d48">
    <span className="font-bold text-white text-lg leading-none">K</span>
  </LogoWrap>
);

const ZendeskLogo = () => (
  <LogoWrap bg="#03363d">
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#fff">
      <path d="M11 7 4 16h7V7Zm2 0v9h7l-7-9Zm-2 10c0 1.7-1.3 3-3 3s-3-1.3-3-3h6Zm2 0h6c0 1.7-1.3 3-3 3s-3-1.3-3-3Z" />
    </svg>
  </LogoWrap>
);

const ZohoLogo = () => (
  <LogoWrap>
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <rect x="2" y="4" width="6" height="6" fill="#e79225" />
      <rect x="9" y="4" width="6" height="6" fill="#009ada" />
      <rect x="16" y="4" width="6" height="6" fill="#66bf3c" />
      <rect x="2" y="11" width="6" height="6" fill="#e42527" />
      <rect x="9" y="11" width="6" height="6" fill="#e79225" />
      <rect x="16" y="11" width="6" height="6" fill="#009ada" />
    </svg>
  </LogoWrap>
);

const FreshdeskLogo = () => (
  <LogoWrap bg="#25c16f">
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#fff">
      <path d="M12 3a9 9 0 0 0-9 9v4a3 3 0 0 0 3 3h1v-7H5v-1a7 7 0 1 1 14 0v1h-2v7h1a3 3 0 0 0 3-3v-4a9 9 0 0 0-9-9Z" />
    </svg>
  </LogoWrap>
);

const SalesforceLogo = () => (
  <LogoWrap bg="#00a1e0">
    <span className="font-bold text-white text-[11px] leading-none tracking-tight">SF</span>
  </LogoWrap>
);

const IntercomLogo = () => (
  <LogoWrap bg="#1f8ded">
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#fff">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path
        d="M7 8v6M10 8v8M13 8v8M16 8v6"
        stroke="#1f8ded"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  </LogoWrap>
);

const OtherLogo = () => (
  <LogoWrap>
    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
  </LogoWrap>
);

const VitosProviderLogo = () => (
  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e8e6e1] bg-white">
    <img src={vitosProviderLogo.url} alt="Vitos" className="h-full w-full object-cover" />
  </div>
);

/* -------- Data -------- */

const SECTIONS: Section[] = [
  {
    id: "llm",
    title: "LLM Provider",
    subtitle:
      "Power your agents with a large language model for reasoning, generation and tool use.",
    providers: [
      {
        id: "chatgpt",
        name: "ChatGPT",
        description:
          "OpenAI's GPT models for high-quality reasoning, function calling and structured output.",
        logo: <ChatGPTLogo />,
        recommended: true,
        models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "o3-mini"],
      },
      {
        id: "gemini",
        name: "Gemini",
        description:
          "Google's multimodal models with long context and strong grounding on real-world tasks.",
        logo: <GeminiLogo />,
        models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"],
      },
      {
        id: "deepseek",
        name: "DeepSeek",
        description:
          "Cost-efficient open-weight models tuned for chat, code and step-by-step reasoning.",
        logo: <DeepSeekLogo />,
        models: ["deepseek-v3", "deepseek-r1", "deepseek-chat"],
      },
    ],
  },
  {
    id: "stt",
    title: "Transcriber Provider",
    subtitle: "Convert live speech to text so your agents can understand callers in real time.",
    providers: [
      {
        id: "azure-stt",
        name: "Azure",
        description:
          "Microsoft's speech-to-text with strong multi-language coverage and streaming support.",
        logo: <AzureLogo />,
        models: ["azure-stt-standard", "azure-stt-conversation", "azure-stt-phone"],
      },
      {
        id: "deepgram",
        name: "Deepgram",
        description: "Low-latency streaming ASR built for phone-quality audio and voice agents.",
        logo: <DeepgramLogo />,
        recommended: true,
        models: ["nova-3", "nova-2", "nova-2-phonecall", "enhanced"],
      },
      {
        id: "google-stt",
        name: "Google",
        description: "Google Speech-to-Text with word-level timestamps and telephony models.",
        logo: <GoogleLogo />,
        models: ["chirp-2", "latest_long", "telephony", "medical_conversation"],
      },
      {
        id: "grok-stt",
        name: "Grok",
        description: "xAI transcription for fast conversational speech recognition.",
        logo: <GrokLogo />,
        models: ["grok-stt-1"],
      },
    ],
  },
  {
    id: "tts",
    title: "Voice Provider",
    subtitle: "Give your agents a natural, expressive voice with a text-to-speech synthesizer.",
    providers: [
      {
        id: "azure-tts",
        name: "Azure",
        description: "Neural TTS voices across 140+ locales with SSML and prosody control.",
        logo: <AzureLogo />,
        models: ["neural-en-US-JennyNeural", "neural-en-US-GuyNeural", "neural-en-IN-NeerjaNeural"],
      },
      {
        id: "google-tts",
        name: "Google",
        description: "WaveNet and Neural2 voices with fine-grained pitch and speed tuning.",
        logo: <GoogleLogo />,
        models: ["Neural2-A", "Neural2-C", "WaveNet-D", "Studio-M"],
      },
      {
        id: "elevenlabs",
        name: "Eleven Labs",
        description:
          "Ultra-realistic, emotionally expressive voices ideal for premium customer experiences.",
        logo: <ElevenLabsLogo />,
        recommended: true,
        models: ["eleven_turbo_v2_5", "eleven_multilingual_v2", "eleven_flash_v2_5"],
      },
      {
        id: "grok-tts",
        name: "Grok",
        description: "xAI voices for conversational, latency-sensitive playback.",
        logo: <GrokLogo />,
        models: ["grok-tts-1"],
      },
    ],
  },
  {
    id: "platform",
    title: "Agents Platform",
    subtitle:
      "Connect a live agent platform so Vitos can hand off, sync tickets, and share context.",
    providers: [
      {
        id: "kapture",
        name: "Kapture",
        description:
          "Native Kapture CX integration — tickets, customer 360 and unified live agent handoff.",
        logo: <KaptureLogo />,
        recommended: true,
      },
      {
        id: "zendesk",
        name: "Zendesk",
        description:
          "Sync tickets, macros and customer history with your Zendesk Support workspace.",
        logo: <ZendeskLogo />,
      },
      {
        id: "zoho",
        name: "Zoho",
        description:
          "Bridge conversations with Zoho Desk and CRM records for a unified support view.",
        logo: <ZohoLogo />,
      },
      {
        id: "freshdesk",
        name: "Freshdesk",
        description: "Route AI-handled cases into Freshdesk queues with full transcript context.",
        logo: <FreshdeskLogo />,
      },
      {
        id: "salesforce",
        name: "Salesforce",
        description: "Connect Service Cloud cases, contacts and knowledge articles to your agents.",
        logo: <SalesforceLogo />,
      },
      {
        id: "intercom",
        name: "Intercom",
        description:
          "Blend AI conversations with Intercom inbox, contacts and messaging automations.",
        logo: <IntercomLogo />,
      },
      {
        id: "other",
        name: "Other",
        description: "Bring your own platform via webhook or REST — we'll help you wire it up.",
        logo: <OtherLogo />,
      },
    ],
  },
];

/* -------- Component -------- */

export function ProvidersPage() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>(SECTIONS[0].id);

  const toggleConnected = (id: string) => setConnected((s) => ({ ...s, [id]: !s[id] }));

  const toggleOpen = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  const activeProvider = openId
    ? (SECTIONS.flatMap((s) => s.providers).find((p) => p.id === openId) ?? null)
    : null;

  const activeSectionId = openId
    ? (SECTIONS.find((s) => s.providers.some((p) => p.id === openId))?.id ?? null)
    : null;

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Providers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick the models, voices and platforms that power every agent in this workspace. You can
          change or add more at any time.
        </p>
      </div>

      <VitosInHouseSection />

      <div className="rounded-2xl border border-[#e8e6e1] bg-white">
        <div
          role="tablist"
          aria-label="Provider categories"
          className="flex flex-wrap gap-2 border-b border-[#e8e6e1] px-6 py-4 md:px-8"
        >
          {SECTIONS.map((s) => {
            const isActive = activeTab === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(s.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40",
                  isActive
                    ? "border-[#B22257] bg-[#B22257] text-white shadow-[0_1px_2px_rgba(178,34,87,0.25)]"
                    : "border-[#e8e6e1] bg-white text-foreground hover:border-[#B22257]/40 hover:text-[#B22257]",
                )}
              >
                {s.title}
              </button>
            );
          })}
        </div>
        {SECTIONS.filter((s) => s.id === activeTab).map((section) => (
          <section key={section.id} className="px-6 py-6 md:px-8 md:py-7">
            <header className="mb-5">
              <h2 className="text-[15px] font-semibold text-foreground">{section.title}</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{section.subtitle}</p>
            </header>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {section.providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  connected={!!connected[p.id]}
                  open={openId === p.id}
                  onConfigure={() => toggleOpen(p.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <ProviderConfigDrawer
        provider={activeProvider}
        sectionId={activeSectionId}
        connected={activeProvider ? !!connected[activeProvider.id] : false}
        selectedModel={activeProvider ? selectedModel[activeProvider.id] : undefined}
        onSelectModel={(m: string) =>
          activeProvider && setSelectedModel((s) => ({ ...s, [activeProvider.id]: m }))
        }
        onClose={() => setOpenId(null)}
        onToggleConnected={() => activeProvider && toggleConnected(activeProvider.id)}
      />
    </PageContainer>
  );
}

function ProviderCard({
  provider,
  connected,
  open,
  onConfigure,
}: {
  provider: Provider;
  connected: boolean;
  open: boolean;
  onConfigure: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onConfigure}
      aria-expanded={open}
      aria-label={`Configure ${provider.name}`}
      className={cn(
        "group relative flex flex-col rounded-xl border bg-white p-3.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B22257]/40",
        open
          ? "border-[#B22257] ring-1 ring-[#B22257]/20"
          : connected
            ? "border-[#B22257]/40 ring-1 ring-[#B22257]/10"
            : "border-[#e8e6e1] hover:border-[#B22257]/40 hover:shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
      )}
    >
      {provider.logo}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="truncate text-[14px] font-semibold text-foreground">{provider.name}</span>
        {provider.inHouse && !connected && (
          <span className="rounded-full bg-[#F7E0EA] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-[#B22257]">
            In-house model
          </span>
        )}
        {connected && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-emerald-700">
            <Check className="h-2.5 w-2.5" /> Connected
          </span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
        {provider.description}
      </p>
    </button>
  );
}

/* -------- Vitos in-house models section -------- */

type InHouseModel = { name: string; description: string };
const IN_HOUSE_GROUPS: {
  id: string;
  title: string;
  tagline: string;
  models: InHouseModel[];
}[] = [
  {
    id: "llm",
    title: "LLM",
    tagline: "Reasoning engines that power every agent conversation.",
    models: [
      {
        name: "Aether-Pulse",
        description: "Balanced in-house LLM for everyday reasoning and tool use.",
      },
      {
        name: "Aether-Nova",
        description: "Higher-capacity model tuned for complex, multi-step tasks.",
      },
      {
        name: "Aether-Drift",
        description: "Lightweight, low-latency model optimised for real-time voice.",
      },
      {
        name: "Bolt-Halo",
        description: "Fast general-purpose model for high-throughput workloads.",
      },
      {
        name: "Bolt-Surge",
        description: "Peak-performance variant for the most demanding conversations.",
      },
      {
        name: "google/gemma-4 E4B-it",
        description: "Fine-tuned Gemma model hosted in the Vitos stack.",
      },
    ],
  },
  {
    id: "transcriber",
    title: "Transcriber",
    tagline: "Turn caller audio into accurate, real-time text.",
    models: [
      { name: "Lit", description: "Low-latency streaming ASR optimised for telephony audio." },
      { name: "Gemma", description: "Accuracy-first transcriber for noisy, multi-speaker calls." },
    ],
  },
  {
    id: "voice",
    title: "Voice",
    tagline: "Natural, expressive speech for your agent's replies.",
    models: [
      {
        name: "Flowtts",
        description: "Expressive in-house TTS voice tuned for natural phone conversations.",
      },
    ],
  },
];

function VitosInHouseSection() {
  return (
    <TooltipProvider delayDuration={120}>
      <section
        aria-label="Vitos in-house models"
        className="group/vitos relative mb-6 overflow-hidden rounded-2xl border border-white/5 text-white shadow-card bg-cover bg-center"
        style={{ backgroundImage: `url(${integrationsHeroBg})` }}
      >
        {/* Rotating conic glow ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-[1px] rounded-2xl opacity-70"
        >
          <div
            className="animate-conic-spin absolute left-1/2 top-1/2 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(242,86,145,0.55) 15%, transparent 30%, transparent 55%, rgba(139,92,246,0.5) 70%, transparent 85%)",
              filter: "blur(28px)",
            }}
          />
        </div>

        {/* Animated ambient layers tied to the "in-house AI" story */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* drifting glow orb */}
          <div
            className="animate-orb-drift absolute -top-16 -left-10 h-56 w-56 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(242,86,145,0.55), transparent 65%)",
            }}
          />
          <div
            className="animate-orb-drift absolute -bottom-20 right-0 h-64 w-64 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.45), transparent 65%)",
              animationDelay: "-4s",
            }}
          />
          {/* aurora sweep */}
          <div
            className="animate-aurora-sweep absolute -inset-y-4 -left-1/3 w-1/2"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
            }}
          />
          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage: "radial-gradient(ellipse at 50% 40%, black 40%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative z-10 px-5 py-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="animate-badge-float relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-[0_6px_20px_-8px_rgba(242,86,145,0.6)]">
              <img src={vitosProviderLogo.url} alt="Vitos" className="h-full w-full object-cover" />
              <span
                aria-hidden
                className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10"
              />
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[15px] font-semibold text-white">
                Vitos in-house models
              </span>
              <span className="truncate text-[11.5px] text-[#F8CFDF]/80">
                Ready to use — zero setup, tuned end-to-end
              </span>
            </div>
            <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F8CFDF] backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live · In-house
            </span>
          </div>

          {/* 3-panel grid */}
          <div className="mt-4 grid gap-2.5 md:grid-cols-3">
            {IN_HOUSE_GROUPS.map((group, gi) => (
              <div
                key={group.id}
                className="group/panel relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.045] p-3.5 backdrop-blur-[2px] transition duration-300 hover:-translate-y-[2px] hover:border-[#F25691]/40 hover:bg-white/[0.08]"
              >
                {/* accent bar */}
                <span
                  aria-hidden
                  className="animate-panel-pulse absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#F25691] via-[#F25691]/70 to-transparent"
                  style={{ animationDelay: `${gi * 400}ms` }}
                />
                {/* hover glow */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover/panel:opacity-100"
                  style={{
                    background:
                      "radial-gradient(140px 80px at 20% 0%, rgba(242,86,145,0.28), transparent 70%)",
                  }}
                />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#F25691]/25 bg-[#F25691]/10">
                      <GroupGlyph id={group.id} />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FBD3E1]">
                      {group.title}
                    </span>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[9.5px] font-semibold text-white/70">
                    {group.models.length}
                  </span>
                </div>

                <div className="relative mt-3 flex flex-wrap gap-1.5">
                  {group.models.map((m, mi) => (
                    <Tooltip key={m.name}>
                      <TooltipTrigger asChild>
                        <span
                          tabIndex={0}
                          className="chip-shimmer animate-chip-in inline-flex cursor-help items-center rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-0.5 text-[11.5px] font-medium text-white/90 backdrop-blur-sm transition hover:-translate-y-[1px] hover:border-[#F25691]/70 hover:bg-white/[0.14] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F25691]/40"
                          style={{ animationDelay: `${gi * 120 + mi * 60}ms` }}
                        >
                          {m.name}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-[240px] border-white/10 bg-[#1a0a14] text-white shadow-xl"
                      >
                        <div className="text-[12px] font-semibold text-white">{m.name}</div>
                        <div className="mt-0.5 text-[11.5px] leading-snug text-[#F8CFDF]/80">
                          {m.description}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}

/* Small contextual glyph per in-house group */
function GroupGlyph({ id }: { id: string }) {
  if (id === "llm") {
    // Thinking dots — reasoning
    return (
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-think-dot inline-block h-1.5 w-1.5 rounded-full bg-[#F25691]"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </span>
    );
  }
  if (id === "transcriber") {
    // Waveform bars — audio → text
    const heights = [6, 10, 4, 12, 7];
    return (
      <span className="inline-flex h-3.5 items-center gap-[2px]" aria-hidden>
        {heights.map((h, i) => (
          <span
            key={i}
            className="animate-wave-bar block w-[2px] rounded-sm bg-[#F25691]"
            style={{ height: `${h}px`, animationDelay: `${i * 120}ms`, animationDuration: "0.9s" }}
          />
        ))}
      </span>
    );
  }
  // voice — concentric ripple rings
  return (
    <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center" aria-hidden>
      <span
        className="animate-ripple absolute inset-0 rounded-full border border-[#F25691]"
        style={{ animationDelay: "0s" }}
      />
      <span
        className="animate-ripple absolute inset-0 rounded-full border border-[#F25691]"
        style={{ animationDelay: "0.6s" }}
      />
      <span className="relative h-1.5 w-1.5 rounded-full bg-[#F25691]" />
    </span>
  );
}

/* -------- Config panel (inline) -------- */

type AuthMode = "vitos" | "client";

/* -------- Agents Platform configuration schemas -------- */

type PField = {
  id: string;
  label: string;
  type?: "text" | "password" | "select" | "multiselect" | "checkbox";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  full?: boolean;
};
type PGroup = { title?: string; fields: PField[]; columns?: 1 | 2 };
type PConfig = { groups: PGroup[] };

const PLATFORM_CONFIGS: Record<string, PConfig> = {
  zendesk: {
    groups: [
      {
        columns: 1,
        fields: [
          { id: "name", label: "Configuration Name", required: true, full: true },
          { id: "email", label: "Email", placeholder: "you@company.com", full: true },
          { id: "subdomain", label: "Subdomain", placeholder: "your-company", full: true },
          { id: "apiKey", label: "API Key", type: "password", full: true },
        ],
      },
    ],
  },
  zoho: {
    groups: [
      {
        columns: 1,
        fields: [
          { id: "name", label: "Configuration Name", required: true, full: true },
          {
            id: "region",
            label: "Region",
            type: "select",
            options: [
              "India (IN)",
              "United States (US)",
              "Europe (EU)",
              "Australia (AU)",
              "Japan (JP)",
            ],
            full: true,
          },
          {
            id: "scope",
            label: "Scope",
            type: "multiselect",
            options: ["DESK", "CRM", "CHAT"],
            placeholder: "Select options",
            full: true,
          },
        ],
      },
    ],
  },
  freshdesk: {
    groups: [
      {
        columns: 1,
        fields: [
          { id: "name", label: "Configuration Name", required: true, full: true },
          { id: "domain", label: "Domain", placeholder: "yourbrand.freshdesk.com", full: true },
          { id: "apiKey", label: "API Key", type: "password", full: true },
        ],
      },
    ],
  },
  salesforce: {
    groups: [
      {
        columns: 1,
        fields: [
          { id: "name", label: "Configuration Name", required: true, full: true },
          {
            id: "environment",
            label: "Environment",
            type: "select",
            options: ["Production", "Sandbox", "Developer"],
            placeholder: "Select options",
            full: true,
          },
        ],
      },
      {
        title: "Additional Info",
        columns: 2,
        fields: [
          { id: "orgId", label: "Organization ID" },
          { id: "baseUrl", label: "Base URL" },
          { id: "language", label: "Language" },
          { id: "platform", label: "Platform" },
          { id: "esDevName", label: "ES Developer Name" },
          { id: "capabilitiesVersion", label: "Capabilities Version" },
          { id: "defaultEmployeeId", label: "Default Employee ID" },
          { id: "isRegistered", label: "Is Registered", type: "checkbox", full: true },
        ],
      },
    ],
  },
  intercom: {
    groups: [
      {
        columns: 1,
        fields: [
          { id: "name", label: "Configuration Name", required: true, full: true },
          { id: "apiKey", label: "API Key", type: "password", full: true },
        ],
      },
      {
        title: "Additional Info",
        columns: 2,
        fields: [
          { id: "adminId", label: "Admin ID" },
          { id: "appId", label: "App ID" },
          { id: "ticketTypeId", label: "Ticket Type ID" },
          { id: "webhookSecret", label: "Webhook Secret", type: "password" },
          { id: "intercomVersion", label: "Intercom Version" },
        ],
      },
    ],
  },
  kapture: {
    groups: [
      {
        columns: 1,
        fields: [
          { id: "name", label: "Configuration Name", required: true, full: true },
          { id: "subdomain", label: "Subdomain", placeholder: "your-company", full: true },
          { id: "apiKey", label: "API Key", type: "password", full: true },
        ],
      },
    ],
  },
  other: {
    groups: [
      {
        columns: 1,
        fields: [
          { id: "name", label: "Configuration Name", required: true, full: true },
          { id: "apiKey", label: "API Key", type: "password", full: true },
        ],
      },
    ],
  },
};

function PlatformConfigForm({
  provider,
  onClose,
  onConnected,
}: {
  provider: Provider;
  onClose: () => void;
  onConnected: () => void;
}) {
  const config = PLATFORM_CONFIGS[provider.id] ?? PLATFORM_CONFIGS.other;
  const [values, setValues] = useState<Record<string, string | string[] | boolean>>({});
  const [openMulti, setOpenMulti] = useState<string | null>(null);

  const setValue = (id: string, v: string | string[] | boolean) =>
    setValues((s) => ({ ...s, [id]: v }));

  const nameValue = typeof values.name === "string" ? values.name : "";
  const canConnect = nameValue.trim().length > 0;

  const handleConnect = () => {
    if (!canConnect) return;
    onConnected();
    onClose();
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {config.groups.map((group, gi) => (
          <div
            key={gi}
            className={cn("rounded-xl border border-[#e8e6e1] bg-white p-4", gi > 0 && "mt-5")}
          >
            <div className="mb-3 text-[13px] font-semibold text-foreground">
              {group.title ?? (gi === 0 ? "Account Details" : "Additional Info")}
            </div>
            <div
              className={cn(
                "grid gap-4",
                group.columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
              )}
            >
              {group.fields.map((f) => {
                const spanFull = f.full || group.columns !== 2;
                const wrapperCls = spanFull && group.columns === 2 ? "sm:col-span-2" : "";
                if (f.type === "checkbox") {
                  const checked = values[f.id] === true;
                  return (
                    <label
                      key={f.id}
                      className={cn(
                        "flex items-center gap-2 text-[13px] text-foreground",
                        wrapperCls,
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setValue(f.id, e.target.checked)}
                        className="h-4 w-4 rounded border-[#c9c6c0] accent-[#B22257]"
                      />
                      {f.label}
                    </label>
                  );
                }
                if (f.type === "select") {
                  const current = (values[f.id] as string) ?? "";
                  return (
                    <Field key={f.id} label={f.label} required={f.required}>
                      <div className="relative">
                        <select
                          value={current}
                          onChange={(e) => setValue(f.id, e.target.value)}
                          className="w-full appearance-none rounded-lg border border-[#e8e6e1] bg-white px-3 py-2 pr-9 text-[13px] text-foreground outline-none transition focus:border-[#B22257]"
                        >
                          {!current && (
                            <option value="" disabled>
                              {f.placeholder ?? "Select options"}
                            </option>
                          )}
                          {f.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </Field>
                  );
                }
                if (f.type === "multiselect") {
                  const selected = (values[f.id] as string[]) ?? [];
                  const isOpen = openMulti === f.id;
                  return (
                    <Field key={f.id} label={f.label} required={f.required}>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenMulti(isOpen ? null : f.id)}
                          className="flex w-full items-center justify-between rounded-lg border border-[#e8e6e1] bg-white px-3 py-2 text-left text-[13px] outline-none transition focus:border-[#B22257]"
                        >
                          <span
                            className={
                              selected.length === 0 ? "text-muted-foreground/70" : "text-foreground"
                            }
                          >
                            {selected.length === 0
                              ? (f.placeholder ?? "Select options")
                              : selected.join(", ")}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              isOpen && "rotate-180",
                            )}
                          />
                        </button>
                        {isOpen && (
                          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-[#e8e6e1] bg-white shadow-lg">
                            {f.options?.map((opt) => {
                              const active = selected.includes(opt);
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() =>
                                    setValue(
                                      f.id,
                                      active
                                        ? selected.filter((x) => x !== opt)
                                        : [...selected, opt],
                                    )
                                  }
                                  className={cn(
                                    "flex w-full items-center justify-between px-3 py-2 text-left text-[13px] transition hover:bg-[#faf7f5]",
                                    active && "bg-[#FBEEF3]/50",
                                  )}
                                >
                                  <span className="text-foreground">{opt}</span>
                                  {active && <Check className="h-3.5 w-3.5 text-[#B22257]" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </Field>
                  );
                }
                return (
                  <div key={f.id} className={wrapperCls}>
                    <Field label={f.label} required={f.required}>
                      <input
                        value={(values[f.id] as string) ?? ""}
                        onChange={(e) => setValue(f.id, e.target.value)}
                        placeholder={f.placeholder}
                        type={f.type ?? "text"}
                        className="w-full rounded-lg border border-[#e8e6e1] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground/70 focus:border-[#B22257]"
                      />
                    </Field>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#e8e6e1] bg-white px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#e8e6e1] bg-white px-4 py-1.5 text-[13px] font-medium text-foreground transition hover:bg-[#faf7f5]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConnect}
          disabled={!canConnect}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#B22257] px-4 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span aria-hidden>→]</span>
          Connect Now
        </button>
      </div>
    </>
  );
}

function ProviderConfigPanel({
  provider,
  sectionId,
  connected,
  selectedModel,
  onSelectModel,
  onClose,
  onToggleConnected,
}: {
  provider: Provider;
  sectionId: string | null;
  connected: boolean;
  selectedModel?: string;
  onSelectModel: (m: string) => void;
  onClose: () => void;
  onToggleConnected: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>("vitos");
  const [keyName, setKeyName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [savedKeys, setSavedKeys] = useState<{ name: string }[]>([]);

  const generatedKeyLabel = `VG_${provider.name.replace(/\s+/g, "")}`;
  const models = provider.models ?? [];
  const currentModel = selectedModel ?? models[0];
  const hideAuthType = sectionId === "stt" || sectionId === "tts";
  const isPlatform = sectionId === "platform";

  const handleSave = () => {
    if (!keyName.trim() || !apiKey.trim()) return;
    setSavedKeys((k) => [...k, { name: keyName.trim() }]);
    setKeyName("");
    setApiKey("");
    if (!connected) onToggleConnected();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#faf9f7]">
      <div className="flex shrink-0 items-start gap-3 border-b border-[#e8e6e1] px-5 py-4">
        {provider.logo}
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-foreground">
            {isPlatform ? provider.name : `${provider.name} Configuration`}
          </div>
          <div className="text-[12.5px] text-muted-foreground">
            {isPlatform
              ? "Account Details"
              : `Configure authentication for ${provider.name} provider`}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-muted-foreground hover:bg-white hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isPlatform ? (
        <PlatformConfigForm
          provider={provider}
          onClose={onClose}
          onConnected={() => {
            if (!connected) onToggleConnected();
          }}
        />
      ) : (
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {models.length > 0 && !hideAuthType && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                Model
              </div>
              <div className="relative">
                <select
                  value={currentModel}
                  onChange={(e) => onSelectModel(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-[#e8e6e1] bg-white px-3 py-2 pr-9 text-[13px] font-medium text-foreground outline-none transition focus:border-[#B22257]"
                >
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          )}

          {!hideAuthType && (
            <div>
              <div className="mb-2 text-[13px] font-semibold text-foreground">
                Authentication Type
              </div>
              <div className="grid gap-3">
                <AuthOption
                  selected={mode === "vitos"}
                  onClick={() => setMode("vitos")}
                  title="Vitos Generated"
                  subtitle="Auto-generated key managed by Vitos"
                />
                <AuthOption
                  selected={mode === "client"}
                  onClick={() => setMode("client")}
                  title="Client Key"
                  subtitle="Use your own API credentials"
                />
              </div>
            </div>
          )}

          {!hideAuthType && mode === "vitos" ? (
            <div>
              <div className="mb-2 text-[13px] font-semibold text-foreground">Generated Keys</div>
              <div className="rounded-lg border border-[#e8e6e1] bg-white px-4 py-3 text-[13px] font-medium text-foreground">
                {generatedKeyLabel}
              </div>
            </div>
          ) : (
            <div>
              <div className="rounded-xl border border-[#e8e6e1] bg-white p-4">
                <div className="mb-3 text-[13px] font-semibold text-foreground">Add New Key</div>
                <div className="space-y-3">
                  <Field label="Key Name" required>
                    <input
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder="Enter key name"
                      className="w-full rounded-lg border border-[#e8e6e1] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground/70 focus:border-[#B22257]"
                    />
                  </Field>
                  <Field label="API Key" required>
                    <input
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key"
                      type="password"
                      className="w-full rounded-lg border border-[#e8e6e1] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground/70 focus:border-[#B22257]"
                    />
                  </Field>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!keyName.trim() || !apiKey.trim()}
                      className="rounded-lg bg-[#B22257] px-4 py-1.5 text-[13px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 mb-2 text-[13px] font-semibold text-foreground">
                Available Keys
              </div>
              <div className="rounded-xl border border-[#e8e6e1] bg-white px-4 py-8">
                {savedKeys.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f3f1] text-muted-foreground">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div className="text-[13px] font-semibold text-foreground">
                      No API keys added yet
                    </div>
                    <div className="text-[12.5px] text-muted-foreground">
                      Add a client API key to get started
                    </div>
                  </div>
                ) : (
                  <ul className="divide-y divide-[#e8e6e1]">
                    {savedKeys.map((k, idx) => (
                      <li key={idx} className="flex items-center justify-between py-2 text-[13px]">
                        <span className="inline-flex items-center gap-2 font-medium text-foreground">
                          <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                          {k.name}
                        </span>
                        <span className="text-[11px] uppercase tracking-wider text-emerald-700">
                          Active
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AuthOption({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-white px-4 py-3 text-left transition",
        selected ? "border-[#B22257] bg-[#FBEEF3]" : "border-[#e8e6e1] hover:border-[#d8d5cf]",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-[#B22257]" : "border-[#c9c6c0]",
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-[#B22257]" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-[12px] text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12.5px] font-medium text-foreground">
        {label} {required && <span className="text-[#B22257]">*</span>}
      </span>
      {children}
    </label>
  );
}

/* -------- Right-side slide-in drawer (matches NewAopPanel pattern) -------- */

function ProviderConfigDrawer({
  provider,
  sectionId,
  connected,
  selectedModel,
  onSelectModel,
  onClose,
  onToggleConnected,
}: {
  provider: Provider | null;
  sectionId: string | null;
  connected: boolean;
  selectedModel?: string;
  onSelectModel: (m: string) => void;
  onClose: () => void;
  onToggleConnected: () => void;
}) {
  const open = !!provider;
  const [mounted, setMounted] = useState<Provider | null>(provider);

  useEffect(() => {
    if (provider) setMounted(provider);
  }, [provider]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  const p = mounted;

  return createPortal(
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-label={p ? `${p.name} configuration` : "Provider configuration"}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {p && (
          <ProviderConfigPanel
            provider={p}
            sectionId={sectionId}
            connected={connected}
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
            onClose={onClose}
            onToggleConnected={onToggleConnected}
          />
        )}
      </aside>
    </>,
    document.body,
  );
}
