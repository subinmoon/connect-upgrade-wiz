import { ArrowLeft, Pencil, Check, X, MoreHorizontal, Share2, Pin, Trash2, Bell, FolderArchive } from "lucide-react";
import { useState } from "react";
import logoIcon from "@/assets/logo-icon.png";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileHeaderProps {
  isChatMode: boolean;
  chatTitle?: string;
  userName?: string;
  onBack?: () => void;
  onTitleChange?: (title: string) => void;
  onShare?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  isPinned?: boolean;
  onNotificationClick?: () => void;
}

const MobileHeader = ({
  isChatMode,
  chatTitle = "새 대화",
  userName,
  onBack,
  onTitleChange,
  onShare,
  onPin,
  onDelete,
  onArchive,
  isPinned,
  onNotificationClick,
}: MobileHeaderProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(chatTitle);

  const handleSaveTitle = () => {
    if (editTitleValue.trim()) {
      onTitleChange?.(editTitleValue.trim());
    }
    setIsEditingTitle(false);
  };

  if (isChatMode) {
    return (
      <header className="flex items-center gap-2 px-3 py-2 bg-card border-b border-border">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>

        {isEditingTitle ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              className="h-8 text-sm font-medium flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") setIsEditingTitle(false);
              }}
            />
            <button onClick={handleSaveTitle} className="p-1.5 hover:bg-accent rounded transition-colors">
              <Check className="w-4 h-4 text-primary" />
            </button>
            <button onClick={() => setIsEditingTitle(false)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors">
              <X className="w-4 h-4 text-destructive" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <h2 className="text-base font-medium text-foreground truncate">{chatTitle}</h2>
            <button 
              onClick={() => {
                setEditTitleValue(chatTitle);
                setIsEditingTitle(true);
              }}
              className="p-1 hover:bg-muted rounded transition-all shrink-0"
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-card">
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" />
              공유
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPin}>
              <Pin className="w-4 h-4 mr-2" />
              {isPinned ? "고정 해제" : "채팅 고정"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
              <FolderArchive className="w-4 h-4 mr-2" />
              아카이브 저장
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-transparent">
      <div className="flex items-center gap-2">
        <img src={logoIcon} alt="Logo" className="w-8 h-8" />
        <span className="font-bold text-foreground">AI PORTAL</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onNotificationClick}
          className="p-2 hover:bg-muted rounded-lg transition-colors relative"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
          {userName?.[0] || "U"}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
