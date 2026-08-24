import { ReactNode } from "react";
import { WaveBackground } from "./WaveBackground";
import vitosLogo from "@/assets/vitos-logo.png";

interface Props {
  children: ReactNode;
  brandTitle?: string;
  brandSubtitle?: string;
}

export function AuthCardShell({
  children,
  brandTitle = "Welcome to Vitos!",
  brandSubtitle = "Explore, Innovate, and Elevate with AI-Centric Solutions for Your Enterprise.",
}: Props) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-x-hidden overflow-y-auto p-4 sm:p-6">
      <WaveBackground />

      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl bg-card shadow-card md:grid-cols-2">
        {/* Left brand panel */}
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 p-8 text-center md:min-h-[520px] md:gap-6 md:p-10">
          <BrandMark />
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{brandTitle}</h1>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
              {brandSubtitle}
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex min-h-[440px] items-center justify-center border-t-[1.5px] border-dashed border-border p-6 sm:p-8 md:min-h-[520px] md:border-t-0 md:p-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        {/* Dashed divider — vertical on md+ */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-10 left-1/2 hidden -translate-x-1/2 border-l-[1.5px] border-dashed border-border md:block"
        />
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <img
      src={vitosLogo}
      alt="Vitos"
      className="h-24 w-24 select-none md:h-32 md:w-32"
      draggable={false}
      style={{
        filter: "drop-shadow(0 18px 30px oklch(0.3 0.18 350 / 0.45))",
      }}
    />
  );
}
