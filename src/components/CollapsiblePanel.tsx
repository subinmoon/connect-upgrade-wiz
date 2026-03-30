import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsiblePanelProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  direction?: "left" | "right"; // collapse direction
  defaultCollapsed?: boolean;
  className?: string;
}

const CollapsiblePanel = ({
  children,
  title,
  icon,
  direction = "left",
  defaultCollapsed = false,
  className,
}: CollapsiblePanelProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-card shadow-soft hover:bg-muted/50 transition-all cursor-pointer border border-border/50",
          direction === "left" ? "flex-row" : "flex-row-reverse",
          className
        )}
        title={`${title} 펼치기`}
      >
        {direction === "left" ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          {title}
        </span>
      </button>
    );
  }

  return (
    <div className={cn("relative group/panel", className)}>
      <button
        onClick={() => setCollapsed(true)}
        className={cn(
          "absolute top-3 z-10 p-1 rounded-md bg-card/80 backdrop-blur-sm border border-border/50 opacity-0 group-hover/panel:opacity-100 transition-opacity hover:bg-muted",
          direction === "left" ? "right-2" : "left-2"
        )}
        title={`${title} 접기`}
      >
        {direction === "left" ? (
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>
      {children}
    </div>
  );
};

export default CollapsiblePanel;
