import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { History, Pin, MoreHorizontal, Share2, Trash2, MessageCircle, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
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

  const displayHistory = chatHistory.filter((c) => !c.archived);

  // Filter by type
  const getFilteredHistory = () => {
    switch (activeFilter) {
      case "general":
        return displayHistory.filter((c) => !c.chatbotId);
      case "chatbot":
        return displayHistory.filter((c) => !!c.chatbotId);
      default:
        return displayHistory;
    }
  };

  const filteredHistory = getFilteredHistory();

  // Sort: pinned first, then by date
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
    { key: "general", label: "일반", icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { key: "chatbot", label: "챗봇", icon: <Bot className="w-3.5 h-3.5" /> },
  ];

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
        <SheetHeader className="pb-3">
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            채팅 히스토리
          </SheetTitle>
        </SheetHeader>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-3">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
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
          {sortedHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              {activeFilter === "chatbot" ? (
                <>
                  <Bot className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">챗봇 대화 기록이 없습니다</p>
                </>
              ) : activeFilter === "general" ? (
                <>
                  <MessageCircle className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">일반 대화 기록이 없습니다</p>
                </>
              ) : (
                <>
                  <History className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">아직 대화 기록이 없습니다</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {sortedHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl transition-colors",
                    currentChatId === chat.id
                      ? "bg-primary/10"
                      : "hover:bg-muted/50 active:bg-muted"
                  )}
                >
                  <button
                    onClick={() => handleSelect(chat.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-2">
                      {chat.chatbotInfo && (
                        <span className="text-base shrink-0">{chat.chatbotInfo.icon}</span>
                      )}
                      {chat.pinned && (
                        <Pin className="w-3 h-3 text-primary shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-sm truncate",
                          currentChatId === chat.id
                            ? "text-primary font-medium"
                            : "text-foreground"
                        )}
                      >
                        {chat.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {chat.chatbotInfo && (
                        <span className="text-xs text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">
                          {chat.chatbotInfo.name}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(chat.createdAt).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 bg-card">
                      <DropdownMenuItem onClick={() => onShareChat(chat.id)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        공유
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPinChat(chat.id)}>
                        <Pin className="w-4 h-4 mr-2" />
                        {chat.pinned ? "고정 해제" : "고정"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteChat(chat.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileHistorySheet;
