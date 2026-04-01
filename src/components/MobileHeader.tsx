import { ArrowLeft, Pencil, Check, X, MoreHorizontal, Share2, Pin, Trash2, Bell, FolderArchive, History, Bot, Settings, Menu, MessageSquarePlus, Search, Sparkles, GraduationCap, ChevronDown, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import logoIcon from "@/assets/logo-icon.png";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { chatbotServices } from "@/data/chatbotServices";

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
  onOpenHistory?: () => void;
  onOpenChatbots?: () => void;
  onOpenArchive?: () => void;
  onOpenSettings?: () => void;
  onNewChat?: () => void;
  onOpenSearch?: () => void;
  onOpenOnboarding?: () => void;
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
  onOpenHistory,
  onOpenChatbots,
  onOpenArchive,
  onOpenSettings,
  onNewChat,
  onOpenSearch,
  onOpenOnboarding,
}: MobileHeaderProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(chatTitle);
  const [menuOpen, setMenuOpen] = useState(false);
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


  const [myChatbotOpen, setMyChatbotOpen] = useState(false);
  const [favoriteChatbotOpen, setFavoriteChatbotOpen] = useState(false);

  const favoriteServices = chatbotServices.filter(s => {
    const saved = localStorage.getItem("favoriteServices");
    if (saved) {
      const ids = JSON.parse(saved) as string[];
      return ids.includes(s.id);
    }
    return s.isFavorite;
  });

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-transparent">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMenuOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors -ml-2"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <img src={logoIcon} alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-foreground">AI PORTAL</span>
        </div>
        
        <div className="flex items-center gap-1">
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

      {/* Floating Side Menu - matching desktop sidebar structure */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <SheetHeader className="px-4 pt-5 pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <img src={logoIcon} alt="Logo" className="w-8 h-8" />
              <SheetTitle className="text-base font-bold">AI PORTAL</SheetTitle>
            </div>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {/* 새 채팅 */}
            <button
              onClick={() => { setMenuOpen(false); onNewChat?.(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4" />
              새 채팅
            </button>

            {/* 채팅 검색 */}
            <button
              onClick={() => { setMenuOpen(false); onOpenSearch?.(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" />
              채팅 검색
            </button>

            {/* 채팅 히스토리 */}
            <button
              onClick={() => { setMenuOpen(false); onOpenHistory?.(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors mt-3"
            >
              <History className="w-4 h-4" />
              채팅 히스토리
            </button>

            {/* 채팅 아카이브 */}
            <button
              onClick={() => { setMenuOpen(false); onOpenArchive?.(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <FolderArchive className="w-4 h-4" />
              채팅 아카이브
            </button>

            {/* 나만의 챗봇 - collapsible */}
            <div className="mt-3">
              <button
                onClick={() => setMyChatbotOpen(!myChatbotOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
              >
                <Bot className="w-4 h-4" />
                나만의 챗봇
                {myChatbotOpen ? <ChevronDown className="w-3 h-3 ml-auto" /> : <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
              {myChatbotOpen && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {/* 즐겨찾는 챗봇 */}
                  <div>
                    <button
                      onClick={() => setFavoriteChatbotOpen(!favoriteChatbotOpen)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                      즐겨찾는 챗봇
                      {favoriteChatbotOpen ? <ChevronDown className="w-3 h-3 ml-auto" /> : <ChevronRight className="w-3 h-3 ml-auto" />}
                    </button>
                    {favoriteChatbotOpen && (
                      <div className="ml-4 mt-1 space-y-0.5">
                        {favoriteServices.length > 0 ? (
                          favoriteServices.map((service) => (
                            <button
                              key={service.id}
                              onClick={() => setMenuOpen(false)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                              <span>{service.icon}</span>
                              {service.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-xs text-muted-foreground">
                            즐겨찾기가 없습니다
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 나만의 챗봇 관리 */}
                  <button
                    onClick={() => { setMenuOpen(false); onOpenChatbots?.(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    나만의 챗봇 관리
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Bottom section - 시작 가이드 & 설정 */}
          <div className="p-3 border-t border-border space-y-1 mt-auto">
            <button
              onClick={() => { setMenuOpen(false); onOpenOnboarding?.(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              시작 가이드
            </button>
            <button
              onClick={() => { setMenuOpen(false); onOpenSettings?.(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4" />
              개인화 설정
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileHeader;
