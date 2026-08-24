export function VitosLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8 rounded-lg bg-gradient-primary shadow-glow">
        <div className="absolute inset-1.5 rounded-md bg-background/20 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary-foreground">
          V
        </div>
      </div>
      <span className="text-xl font-semibold tracking-tight text-foreground">Vitos</span>
    </div>
  );
}
