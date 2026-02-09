import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { History, Pin, MoreHorizontal, Pencil, Share2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatSession } from "@/pages/Index";

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
  const displayHistory = chatHistory.filter((c) => !c.archived);

  // Sort: pinned first, then by date
  const sortedHistory = [...displayHistory].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleSelect = (chatId: string) => {
    onSelectChat(chatId);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            채팅 히스토리
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100%-60px)] -mx-6 px-6">
          {sortedHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <History className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">아직 대화 기록이 없습니다</p>
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
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(chat.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
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
