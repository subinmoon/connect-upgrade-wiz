import { PanelLeft } from "lucide-react";

interface SidebarTriggerProps {
  onClick: () => void;
}

const SidebarTrigger = ({ onClick }: SidebarTriggerProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-xl shadow-soft hover:bg-muted transition-colors"
    >
      <PanelLeft className="w-5 h-5 text-foreground" />
    </button>
  );
};

export default SidebarTrigger;
