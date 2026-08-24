import bgImage from "@/assets/auth-background.png";

interface Props {
  className?: string;
}

export function WaveBackground({ className = "" }: Props) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <img
        src={bgImage}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-cover"
      />
    </div>
  );
}
