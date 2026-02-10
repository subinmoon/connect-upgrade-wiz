import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { History, Pin, MoreHorizontal, Share2, Trash2, MessageCircle, Bot, ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatSession } from "@/pages/Index";

type HistoryFilter = "all" | "general" | "chatbot";

interface MobileHistorySheetProps {
  open: boolean;
  onClose: () => void;
  chatHistory: ChatSession[];
  currentChatId?: string | null;
  onSelectChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onShareChat: (chatId: string) => void;
  onPinChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

const MobileHistorySheet = ({
  open,
  onClose,
  chatHistory,
  currentChatId,
  onSelectChat,
  onRenameChat,
  onShareChat,
  onPinChat,
  onDeleteChat,
}: MobileHistorySheetProps) => {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("all");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleGroup = (name: string) => {
    setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const isGroupOpen = (name: string) => openGroups[name] !== false; // default open

  const q = searchQuery.trim().toLowerCase();

  const displayHistory = chatHistory.filter((c) => {
    if (c.archived) return false;
    if (!q) return true;
    // Search in title and messages
    if (c.title.toLowerCase().includes(q)) return true;
    return c.messages.some((m) => m.content.toLowerCase().includes(q));
  });

  // General (non-chatbot) chats
  const generalChats = displayHistory.filter((c) => !c.chatbotId);
  const chatbotChats = displayHistory.filter((c) => !!c.chatbotId);

  const sortedGeneral = [...generalChats].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Group chatbot chats by chatbot name
  const chatbotGroups = chatbotChats.reduce((acc, chat) => {
    const key = chat.chatbotInfo?.name || "알 수 없는 챗봇";
    if (!acc[key]) acc[key] = { icon: chat.chatbotInfo?.icon || "🤖", chats: [] };
    acc[key].chats.push(chat);
    return acc;
  }, {} as Record<string, { icon: string; chats: ChatSession[] }>);

  // For "all" and "general" filters, use sortedGeneral
  const sortedHistory = activeFilter === "chatbot" ? [] : sortedGeneral;

  // Counts for filter badges
  const counts = {
    all: displayHistory.length,
    general: displayHistory.filter((c) => !c.chatbotId).length,
    chatbot: displayHistory.filter((c) => !!c.chatbotId).length,
  };

  const handleSelect = (chatId: string) => {
    onSelectChat(chatId);
    onClose();
  };

  const filters: { key: HistoryFilter; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "전체", icon: <History className="w-3.5 h-3.5" /> },
    { key: "general", label: "기본 모델", icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { key: "chatbot", label: "챗봇", icon: <Bot className="w-3.5 h-3.5" /> },
  ];

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
        <SheetHeader className="pb-3">
          <SheetTitle className="flex items-center gap-2">
            {searchMode ? (
              <>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="대화 검색"
                    className="pl-9 pr-9 h-9 text-sm font-normal"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { setSearchMode(false); setSearchQuery(""); }}
                  className="text-sm text-muted-foreground hover:text-foreground shrink-0"
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <History className="w-5 h-5 text-primary" />
                채팅 히스토리
                <button
                  onClick={() => setSearchMode(true)}
                  className="ml-auto p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Search className="w-4.5 h-4.5 text-muted-foreground" />
                </button>
              </>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                activeFilter === filter.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              {filter.icon}
              {filter.label}
              {counts[filter.key] > 0 && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    activeFilter === filter.key
                      ? "bg-primary-foreground/20"
                      : "bg-background"
                  )}
                >
                  {counts[filter.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto h-[calc(100%-100px)] -mx-6 px-6">
          {activeFilter === "chatbot" ? (
            // Chatbot filter: group by chatbot name
            (() => {
              const chatbotChats = displayHistory.filter(c => !!c.chatbotId);
              if (chatbotChats.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <Bot className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm">챗봇 대화 기록이 없습니다</p>
                  </div>
                );
              }
              const groups = chatbotChats.reduce((acc, chat) => {
                const key = chat.chatbotInfo?.name || "알 수 없는 챗봇";
                if (!acc[key]) acc[key] = { icon: chat.chatbotInfo?.icon || "🤖", chats: [] };
                acc[key].chats.push(chat);
                return acc;
              }, {} as Record<string, { icon: string; chats: ChatSession[] }>);
              return (
                <div className="space-y-3">
                  {Object.entries(groups).map(([botName, group]) => (
                    <div key={botName}>
                      <button
                        onClick={() => toggleGroup(botName)}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-foreground w-full"
                      >
                        {isGroupOpen(botName) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        <span className="text-base">{group.icon}</span>
                        {botName}
                        <span className="text-xs text-primary bg-primary/15 rounded-full w-5 h-5 flex items-center justify-center font-medium">{group.chats.length}</span>
                      </button>
                      {isGroupOpen(botName) && <div className="space-y-1 ml-1">
                        {[...group.chats].sort((a, b) => {
                          if (a.pinned && !b.pinned) return -1;
                          if (!a.pinned && b.pinned) return 1;
                          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        }).map(chat => (
                          <div
                            key={chat.id}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-xl transition-colors",
                              currentChatId === chat.id ? "bg-primary/10" : "hover:bg-muted/50 active:bg-muted"
                            )}
                          >
                            <button onClick={() => handleSelect(chat.id)} className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-2">
                                {chat.pinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
                                <span className={cn("text-sm truncate", currentChatId === chat.id ? "text-primary font-medium" : "text-foreground")}>
                                  {chat.title}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(chat.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0">
                                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36 bg-card">
                                <DropdownMenuItem onClick={() => onShareChat(chat.id)}><Share2 className="w-4 h-4 mr-2" />공유</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onPinChat(chat.id)}><Pin className="w-4 h-4 mr-2" />{chat.pinned ? "고정 해제" : "고정"}</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDeleteChat(chat.id)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />삭제</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </div>}
                    </div>
                  ))}
                </div>
              );
            })()
          ) : (sortedHistory.length === 0 && (activeFilter !== "all" || Object.keys(chatbotGroups).length === 0)) ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              {activeFilter === "general" ? (
                <>
                  <MessageCircle className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">기본 모델 대화 기록이 없습니다</p>
                </>
              ) : (
                <>
                  <History className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">아직 대화 기록이 없습니다</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* General chats */}
              {sortedHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl transition-colors",
                    currentChatId === chat.id ? "bg-primary/10" : "hover:bg-muted/50 active:bg-muted"
                  )}
                >
                  <button onClick={() => handleSelect(chat.id)} className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      {chat.pinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
                      <span className={cn("text-sm truncate", currentChatId === chat.id ? "text-primary font-medium" : "text-foreground")}>
                        {chat.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(chat.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 bg-card">
                      <DropdownMenuItem onClick={() => onShareChat(chat.id)}><Share2 className="w-4 h-4 mr-2" />공유</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPinChat(chat.id)}><Pin className="w-4 h-4 mr-2" />{chat.pinned ? "고정 해제" : "고정"}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteChat(chat.id)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />삭제</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}

              {/* Chatbot groups (shown in "all" filter) */}
              {activeFilter === "all" && Object.entries(chatbotGroups).map(([botName, group]) => (
                <div key={botName}>
                  <button
                    onClick={() => toggleGroup(botName)}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-foreground w-full"
                  >
                    {isGroupOpen(botName) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <span className="text-base">{group.icon}</span>
                    {botName}
                    <span className="text-xs text-primary bg-primary/15 rounded-full w-5 h-5 flex items-center justify-center font-medium">{group.chats.length}</span>
                  </button>
                  {isGroupOpen(botName) && <div className="space-y-1 ml-1">
                    {[...group.chats].sort((a, b) => {
                      if (a.pinned && !b.pinned) return -1;
                      if (!a.pinned && b.pinned) return 1;
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }).map(chat => (
                      <div
                        key={chat.id}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl transition-colors",
                          currentChatId === chat.id ? "bg-primary/10" : "hover:bg-muted/50 active:bg-muted"
                        )}
                      >
                        <button onClick={() => handleSelect(chat.id)} className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            {chat.pinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
                            <span className={cn("text-sm truncate", currentChatId === chat.id ? "text-primary font-medium" : "text-foreground")}>
                              {chat.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(chat.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 bg-card">
                            <DropdownMenuItem onClick={() => onShareChat(chat.id)}><Share2 className="w-4 h-4 mr-2" />공유</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onPinChat(chat.id)}><Pin className="w-4 h-4 mr-2" />{chat.pinned ? "고정 해제" : "고정"}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDeleteChat(chat.id)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />삭제</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search empty state */}
        {q && displayHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground -mt-40">
            <Search className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MobileHistorySheet;
