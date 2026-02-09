import { Home, FolderArchive, Settings, Bot, History } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onNewChat?: () => void;
  onOpenSettings?: () => void;
  onOpenChatbots?: () => void;
  onOpenHistory?: () => void;
  onOpenArchive?: () => void;
}

const MobileBottomNav = ({ 
  onNewChat, 
  onOpenSettings, 
  onOpenChatbots, 
  onOpenHistory,
  onOpenArchive 
}: MobileBottomNavProps) => {
  const location = useLocation();

  const navItems = [
    {
      id: "home",
      icon: Home,
      label: "홈",
      action: () => onNewChat?.(),
      isActive: location.pathname === "/" && !location.state,
    },
    {
      id: "history",
      icon: History,
      label: "히스토리",
      action: () => onOpenHistory?.(),
      isActive: false,
    },
    {
      id: "chatbots",
      icon: Bot,
      label: "나만의 챗봇",
      action: () => onOpenChatbots?.(),
      isActive: false,
    },
    {
      id: "archive",
      icon: FolderArchive,
      label: "아카이브",
      action: () => onOpenArchive?.(),
      isActive: false,
    },
    {
      id: "settings",
      icon: Settings,
      label: "설정",
      action: () => onOpenSettings?.(),
      isActive: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-18 px-2 py-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors min-h-[56px]",
              item.isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground active:text-primary"
            )}
          >
            <item.icon className={cn(
              "w-6 h-6",
              item.isActive && "fill-primary/20"
            )} />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
