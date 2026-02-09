import { useMemo, useRef, useEffect, useState } from "react";
import ChatMessage, { Source } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
}

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onRegenerate?: () => void;
  toneStyle?: string;
  answerLength?: string;
  searchMode?: string;
  onToneChange?: (tone: string) => void;
  onLengthChange?: (length: string) => void;
  onSearchModeChange?: (mode: string) => void;
  userName?: string;
  isMobile?: boolean;
}

const suggestionsMap: Record<string, string[]> = {
  default: [
    "더 자세히 설명해줘",
    "예시를 들어줄 수 있어?",
    "다른 방법은 없을까?",
    "요약해줘",
  ],
  복지: [
    "신청 절차가 어떻게 돼?",
    "필요한 서류는 뭐야?",
    "담당 부서 연락처 알려줘",
  ],
  출장: [
    "출장비 정산은 어떻게 해?",
    "숙박비 한도가 얼마야?",
    "출장 승인 절차 알려줘",
  ],
  회의: [
    "회의록 양식 보여줘",
    "참석자 목록 정리해줘",
    "다음 회의 일정 잡아줘",
  ],
};

const ChatView = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  onRegenerate,
  toneStyle,
  answerLength,
  searchMode,
  onToneChange,
  onLengthChange,
  onSearchModeChange,
  userName,
  isMobile = false,
}: ChatViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const prevMessagesLength = useRef(messages.length);

  // Find the last assistant message index
  const lastAssistantIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  }, [messages]);

  const suggestions = useMemo(() => {
    if (messages.length === 0) return suggestionsMap.default;
    
    const lastContent = messages[messages.length - 1]?.content.toLowerCase() || "";
    
    if (lastContent.includes("복지") || lastContent.includes("카드")) {
      return suggestionsMap.복지;
    }
    if (lastContent.includes("출장")) {
      return suggestionsMap.출장;
    }
    if (lastContent.includes("회의")) {
      return suggestionsMap.회의;
    }
    
    return suggestionsMap.default;
  }, [messages]);

  // Check if user is near bottom of scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsNearBottom(isBottom);
    }
  };

  // Only auto-scroll when new messages are added AND user is near bottom
  useEffect(() => {
    if (messages.length > prevMessagesLength.current && isNearBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, isNearBottom]);

  return (
    <div className={isMobile ? "flex flex-col h-full" : "flex flex-col h-[calc(100vh-120px)] max-h-[calc(100vh-120px)]"}>
      {/* Messages */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto space-y-2 min-h-0 px-4 ${isMobile ? 'pt-4 pb-[calc(var(--mobile-input-height)+var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom,0px)+48px)]' : 'pb-4'}`}>
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
            isLastAssistant={index === lastAssistantIndex}
            onRegenerate={onRegenerate}
            sources={message.sources}
          />
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <div className="w-5 h-5 rounded-full bg-primary/40 animate-pulse" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom area for mobile: Suggestions + Input */}
      {isMobile ? (
        <div 
          className="fixed left-0 right-0 z-40 bg-background border-t border-border"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--mobile-bottom-nav-height))' }}
        >
          {/* Suggestions - Horizontal scroll */}
          {!isLoading && messages.length > 0 && (
            <div 
              className="flex gap-2 py-2 px-4 overflow-x-auto scrollbar-hide max-w-full"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage(suggestion)}
                  className="px-3 py-1.5 text-menu-label-long bg-card hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-full transition-colors border border-border hover:border-primary/30 whitespace-nowrap flex-shrink-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          {/* Input */}
          <div className="px-4 py-2">
            <ChatInput 
              onSendMessage={onSendMessage} 
              disabled={isLoading}
              toneStyle={toneStyle}
              answerLength={answerLength}
              searchMode={searchMode}
              onToneChange={onToneChange}
              onLengthChange={onLengthChange}
              onSearchModeChange={onSearchModeChange}
              userName={userName}
              isMobile={isMobile}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Suggestions */}
          {!isLoading && messages.length > 0 && (
            <div className="flex flex-wrap gap-2 py-3 px-4">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage(suggestion)}
                  className="px-3 py-1.5 text-menu-label-long bg-card hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-full transition-colors border border-border hover:border-primary/30 whitespace-nowrap flex-shrink-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          {/* Input */}
          <div className="mt-auto pt-4">
            <ChatInput 
              onSendMessage={onSendMessage} 
              disabled={isLoading}
              toneStyle={toneStyle}
              answerLength={answerLength}
              searchMode={searchMode}
              onToneChange={onToneChange}
              onLengthChange={onLengthChange}
              onSearchModeChange={onSearchModeChange}
              userName={userName}
              isMobile={isMobile}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatView;
