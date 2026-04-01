import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import type { ChatSession } from "@/pages/Index";

interface MobileChatSearchSheetProps {
  open: boolean;
  onClose: () => void;
  chatHistory: ChatSession[];
  onSelectChat: (chatId: string) => void;
}

interface SearchResult {
  type: "content" | "title";
  chatId: string;
  chatTitle: string;
  text: string;
  date: Date;
  searchMode?: string;
  isChatbot: boolean;
  chatbotName?: string;
  chatbotIcon?: string;
}

const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-primary font-semibold">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const MobileChatSearchSheet = ({ open, onClose, chatHistory, onSelectChat }: MobileChatSearchSheetProps) => {
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: SearchResult[] = [];

    chatHistory.forEach((chat) => {
      const titleMatch = chat.title.toLowerCase().includes(q);

      const contentMatches: SearchResult[] = [];
      chat.messages.forEach((msg) => {
        if (msg.content.toLowerCase().includes(q)) {
          contentMatches.push({
            type: "content",
            chatId: chat.id,
            chatTitle: chat.title,
            text: msg.content,
            date: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
            searchMode: msg.searchMode,
            isChatbot: !!chat.chatbotId,
            chatbotName: chat.chatbotInfo?.name,
            chatbotIcon: chat.chatbotInfo?.icon,
          });
        }
      });

      if (contentMatches.length > 0) {
        items.push(...contentMatches);
      } else if (titleMatch) {
        items.push({
          type: "title",
          chatId: chat.id,
          chatTitle: chat.title,
          text: chat.title,
          date: chat.createdAt,
          isChatbot: !!chat.chatbotId,
          chatbotName: chat.chatbotInfo?.name,
          chatbotIcon: chat.chatbotInfo?.icon,
        });
      }
    });

    return items;
  }, [query, chatHistory]);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
          <SheetTitle className="text-base font-semibold">채팅 검색</SheetTitle>
        </SheetHeader>

        {/* Search Input */}
        <div className="px-4 py-3">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="pr-10"
              autoFocus
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            ) : (
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {query.trim() && results.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">검색 결과가 없습니다.</p>
          )}

          {results.map((result, i) => (
            <button
              key={`${result.chatId}-${result.type}-${i}`}
              onClick={() => {
                onSelectChat(result.chatId);
                onClose();
              }}
              className="w-full flex flex-col gap-1 p-3 rounded-xl hover:bg-muted/60 transition-colors text-left border border-border"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                    result.type === "content"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                      : "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400"
                  }`}
                >
                  {result.type === "content" ? "내용" : "제목"}
                </span>

                <p className="text-[13px] font-semibold text-foreground truncate min-w-0 flex-1">
                  {result.isChatbot && <span className="mr-0.5">{result.chatbotIcon || "🤖"}</span>}
                  {result.chatTitle}
                </p>

                <span className="text-[11px] text-muted-foreground shrink-0">
                  {format(result.date, "yyyy.MM.dd")}
                </span>
              </div>

              <p className="text-[12px] text-muted-foreground truncate pl-0.5">
                <HighlightedText text={result.text} query={query} />
              </p>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileChatSearchSheet;
