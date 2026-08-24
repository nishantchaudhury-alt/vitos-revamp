import { Home } from "lucide-react";

interface Props {
  workspaceName: string;
  onHome?: () => void;
  isHome?: boolean;
}

export function WorkspaceSwitcher({ workspaceName, onHome, isHome }: Props) {
  const display = workspaceName || "Kapture CX";

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => onHome?.()}
        className={`flex w-full items-center gap-2 rounded-full px-3 py-1 text-left transition ${
          isHome ? "bg-[#B22257] text-[#F0CEDB]" : "hover:bg-hover"
        }`}
      >
        <Home
          className={`h-3.5 w-3.5 shrink-0 ${isHome ? "text-[#F0CEDB]" : "text-muted-foreground"}`}
        />
        <span
          className={`truncate text-sm font-semibold ${
            isHome ? "text-[#F0CEDB]" : "text-sidebar-foreground"
          }`}
        >
          {display}
        </span>
      </button>
    </div>
  );
}
