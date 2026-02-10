import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import type { ChatSession } from "@/pages/Index";

interface ChatSearchModalProps {
  open: boolean;
  onClose: () => void;
  chatHistory: ChatSession[];
  onSelectChat: (chatId: string) => void;
}

interface SearchResult {
  type: "content" | "title";
  chatId: string;
  text: string;
  date: Date;
  searchMode?: string;
  isChatbot: boolean;
  chatbotName?: string;
  chatbotIcon?: string;
}

const searchModeLabel: Record<string, string> = {
  general: "일반",
  web: "웹 검색",
  "web-search": "웹 검색",
  internal: "사규",
  "internal-rules": "사규",
};

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

const ChatSearchModal = ({ open, onClose, chatHistory, onSelectChat }: ChatSearchModalProps) => {
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: SearchResult[] = [];

    chatHistory.forEach((chat) => {
      // Title match
      if (chat.title.toLowerCase().includes(q)) {
        items.push({
          type: "title",
          chatId: chat.id,
          text: chat.title,
          date: chat.createdAt,
          isChatbot: !!chat.chatbotId,
          chatbotName: chat.chatbotInfo?.name,
          chatbotIcon: chat.chatbotInfo?.icon,
        });
      }

      // Content match (user messages)
      chat.messages.forEach((msg) => {
        if (msg.content.toLowerCase().includes(q)) {
          items.push({
            type: "content",
            chatId: chat.id,
            text: msg.content,
            date: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
            searchMode: msg.searchMode,
            isChatbot: !!chat.chatbotId,
            chatbotName: chat.chatbotInfo?.name,
            chatbotIcon: chat.chatbotInfo?.icon,
          });
        }
      });
    });

    return items;
  }, [query, chatHistory]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-semibold text-foreground">채팅 검색</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-5 pb-4">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="pr-10"
              autoFocus
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
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
              className="w-full flex flex-col gap-1.5 p-3 rounded-xl hover:bg-muted/60 transition-colors text-left border border-border"
            >
              {/* First line: tags + date */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-md ${
                    result.type === "content"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                      : "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400"
                  }`}
                >
                  {result.type === "content" ? "내용" : "제목"}
                </span>

                {result.type === "content" && result.searchMode && (
                  <span className="text-[11px] text-muted-foreground before:content-['·'] before:mr-1.5">
                    {searchModeLabel[result.searchMode] || result.searchMode}
                  </span>
                )}
                {result.type === "title" && (
                  <span className="text-[11px] text-muted-foreground before:content-['·'] before:mr-1.5">
                    {result.isChatbot ? `${result.chatbotIcon || "🤖"} ${result.chatbotName}` : "일반 채팅"}
                  </span>
                )}

                <span className="text-[11px] text-muted-foreground ml-auto shrink-0">
                  {format(result.date, "yyyy.MM.dd")}
                </span>
              </div>

              {/* Second line: text */}
              <p className="text-sm text-foreground truncate pl-0.5">
                <HighlightedText text={result.text} query={query} />
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSearchModal;
