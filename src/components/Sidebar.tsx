import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MessageSquarePlus, 
  Search, 
  Sparkles, 
  FolderArchive, 
  History,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  MoreHorizontal,
  Pencil,
  Share2,
  Pin,
  Trash2,
  Link,
  Home,
  Heart,
  Star,
  Settings,
  Bot
} from "lucide-react";
import { chatbotServices, ChatbotService } from "@/data/chatbotServices";
import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { ChatSession } from "@/pages/Index";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chatHistory?: ChatSession[];
  currentChatId?: string | null;
  onSelectChat?: (chatId: string) => void;
  onNewChat?: () => void;
  onRenameChat?: (chatId: string, newTitle: string) => void;
  onShareChat?: (chatId: string) => void;
  onPinChat?: (chatId: string) => void;
  onArchiveChat?: (chatId: string, groupId?: string) => void;
  onDeleteChat?: (chatId: string) => void;
  hideHeader?: boolean;
  onOpenSettings?: () => void;
}

const defaultChatHistory = [
  "인사 관련 요청",
  "AI UI 만족도 질문",
  "GD 의미 또는 정의",
  "복지카드 발급 비용",
  "회사 뽀잉뽀잉 1인자",
  "기분 안좋을 때 그림",
  "되는게 하나도 없네",
  "보고서 초안 작성",
  "가능한 능력 목록",
];

const Sidebar = ({ 
  isOpen, 
  onToggle, 
  chatHistory = [], 
  currentChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onShareChat,
  onPinChat,
  onArchiveChat,
  onDeleteChat,
  hideHeader = false,
  onOpenSettings,
}: SidebarProps) => {
  const navigate = useNavigate();
  const [historyOpen, setHistoryOpen] = useState(true);
  const [myChatbotOpen, setMyChatbotOpen] = useState(true);
  const [favoriteChatbotOpen, setFavoriteChatbotOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [favoriteServices, setFavoriteServices] = useState<ChatbotService[]>([]);
  const [archiveGroups, setArchiveGroups] = useState<{id: string; name: string; color?: string}[]>([]);
  const [chatbotHistoryOpen, setChatbotHistoryOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favoriteServices");
    if (savedFavorites) {
      const favoriteIds = JSON.parse(savedFavorites) as string[];
      setFavoriteServices(
        chatbotServices.filter((s) => favoriteIds.includes(s.id))
      );
    } else {
      // Use default favorites from chatbotServices
      setFavoriteServices(chatbotServices.filter(s => s.isFavorite));
    }

    // Load archive groups from localStorage
    const savedGroups = localStorage.getItem("archiveGroups");
    if (savedGroups) {
      setArchiveGroups(JSON.parse(savedGroups));
    } else {
      setArchiveGroups([{ id: "default", name: "기본 그룹" }]);
    }
  }, []);
  const displayHistory: ChatSession[] = chatHistory.length > 0 
    ? chatHistory.filter(c => !c.archived)
    : defaultChatHistory.map((title, i) => ({ id: `default-${i}`, title, messages: [], createdAt: new Date(), pinned: false, archived: false } as ChatSession));

  // Split into general and chatbot histories
  const generalHistory = displayHistory.filter(c => !c.chatbotId);
  const chatbotHistory = displayHistory.filter(c => !!c.chatbotId);

  // Group chatbot history by chatbot name
  const chatbotGroups = chatbotHistory.reduce((groups, chat) => {
    const key = chat.chatbotInfo?.name || "알 수 없는 챗봇";
    if (!groups[key]) {
      groups[key] = { icon: chat.chatbotInfo?.icon || "🤖", chats: [] };
    }
    groups[key].chats.push(chat);
    return groups;
  }, {} as Record<string, { icon: string; chats: typeof chatbotHistory }>);

  // Sort: pinned first
  const sortGeneral = [...generalHistory].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });


  const handleStartEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRenameChat?.(id, editTitle.trim());
      toast.success("대화 이름이 변경되었습니다");
    }
    setEditingId(null);
  };

  const handleShare = (id: string) => {
    onShareChat?.(id);
    toast.success("대화가 공유되었습니다");
  };

  const handlePin = (id: string) => {
    onPinChat?.(id);
    toast.success("채팅 고정 상태가 변경되었습니다");
  };

  const handleArchive = (id: string, groupId?: string) => {
    onArchiveChat?.(id, groupId);
    const groupName = groupId ? archiveGroups.find(g => g.id === groupId)?.name || "기본 그룹" : "기본 그룹";
    toast.success(`대화가 "${groupName}"에 저장되었습니다`);
  };

  const handleDelete = (id: string) => {
    onDeleteChat?.(id);
    toast.success("대화가 삭제되었습니다");
  };

  return (
    <aside 
      data-guide="sidebar"
      className={`${
        isOpen ? "w-64" : "w-0"
      } bg-card flex flex-col transition-all duration-300 overflow-hidden shrink-0`}
    >
      <div className="min-w-64 flex flex-col h-full">
        {/* Header - conditionally rendered */}
        {!hideHeader && (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoIcon} alt="Logo" className="w-8 h-8" />
              <span className="font-bold text-foreground">pear link</span>
            </div>
            <button 
              onClick={onToggle}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-3 flex-1 overflow-y-auto">
          {/* New Chat */}
          <button 
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            새 채팅
          </button>

          {/* Search */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors">
            <Search className="w-4 h-4" />
            채팅 검색
          </button>

          {/* Chat History - Moved up */}
          <div className="mt-4">
            <button 
              onClick={() => setHistoryOpen(!historyOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <History className="w-4 h-4" />
              채팅 히스토리
              {historyOpen ? <ChevronDown className="w-3 h-3 ml-auto" /> : <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
            {historyOpen && (
              <div className="ml-4 mt-1 space-y-0.5 max-h-64 overflow-y-auto">
                {/* General chats */}
                {sortGeneral.map((item) => (
                  <div key={item.id} className="group flex items-center gap-1">
                    {editingId === item.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveEdit(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(item.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="h-7 text-sm flex-1"
                        autoFocus
                      />
                    ) : (
                      <>
                        <button 
                          onClick={() => onSelectChat?.(item.id)}
                          className={cn(
                            "flex-1 text-left px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors truncate flex items-center gap-1.5",
                            currentChatId === item.id 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {item.pinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
                          <span className="truncate">{item.title}</span>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-all">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleStartEdit(item.id, item.title)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              이름변경
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(item.id)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              공유
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePin(item.id)}>
                              <Pin className="w-4 h-4 mr-2" />
                              {item.pinned ? "고정 해제" : "채팅 고정"}
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <FolderArchive className="w-4 h-4 mr-2" />
                                아카이브 저장
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="w-40">
                                {archiveGroups.map(group => (
                                  <DropdownMenuItem
                                    key={group.id}
                                    onClick={() => handleArchive(item.id, group.id)}
                                  >
                                    <div className={cn(
                                      "w-2.5 h-2.5 rounded-full mr-2",
                                      group.color === "red" && "bg-red-500",
                                      group.color === "orange" && "bg-orange-500",
                                      group.color === "yellow" && "bg-yellow-500",
                                      group.color === "green" && "bg-green-500",
                                      group.color === "blue" && "bg-blue-500",
                                      group.color === "purple" && "bg-purple-500",
                                      group.color === "pink" && "bg-pink-500",
                                      !group.color && "bg-muted-foreground"
                                    )} />
                                    {group.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(item.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                ))}

                {/* Chatbot groups */}
                {Object.entries(chatbotGroups).map(([botName, group]) => {
                  const isGroupOpen = chatbotHistoryOpen[botName] ?? false;
                  const sortedChats = [...group.chats].sort((a, b) => {
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    return 0;
                  });
                  return (
                    <div key={botName} className="mt-1">
                      <button
                        onClick={() => setChatbotHistoryOpen(prev => ({ ...prev, [botName]: !prev[botName] }))}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <span className="text-sm shrink-0">{group.icon}</span>
                        <span className="truncate font-medium">{botName}</span>
                        <span className="text-xs text-muted-foreground ml-auto mr-1">{sortedChats.length}</span>
                        {isGroupOpen ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                      </button>
                      {isGroupOpen && (
                        <div className="ml-4 mt-0.5 space-y-0.5">
                          {sortedChats.map((item) => (
                            <div key={item.id} className="group flex items-center gap-1">
                              {editingId === item.id ? (
                                <Input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onBlur={() => handleSaveEdit(item.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveEdit(item.id);
                                    if (e.key === "Escape") setEditingId(null);
                                  }}
                                  className="h-7 text-sm flex-1"
                                  autoFocus
                                />
                              ) : (
                                <>
                                  <button
                                    onClick={() => onSelectChat?.(item.id)}
                                    className={cn(
                                      "flex-1 text-left px-3 py-1.5 text-sm hover:bg-muted rounded-lg transition-colors truncate flex items-center gap-1.5",
                                      currentChatId === item.id
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    {item.pinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
                                    <span className="truncate">{item.title}</span>
                                  </button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-all">
                                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem onClick={() => handleStartEdit(item.id, item.title)}>
                                        <Pencil className="w-4 h-4 mr-2" />
                                        이름변경
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleShare(item.id)}>
                                        <Share2 className="w-4 h-4 mr-2" />
                                        공유
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handlePin(item.id)}>
                                        <Pin className="w-4 h-4 mr-2" />
                                        {item.pinned ? "고정 해제" : "채팅 고정"}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDelete(item.id)}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        삭제
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Archive - After history */}
          <button 
            onClick={() => navigate("/archive")}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors mt-2"
          >
            <FolderArchive className="w-4 h-4" />
            채팅 아카이브
          </button>

          {/* My Chatbots */}
          <div className="mt-4">
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
                {/* Favorite Chatbots - Collapsible */}
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
                
                {/* Manage Chatbots - Same level */}
                <button 
                  onClick={() => navigate("/chatbots")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  나만의 챗봇 관리
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Settings at bottom */}
        <div className="p-3 border-t border-border">
          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
            개인화 설정
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
