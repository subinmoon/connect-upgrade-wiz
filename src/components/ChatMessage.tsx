import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, ThumbsUp, ThumbsDown, MessageSquare, RotateCcw, ExternalLink, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import logoIcon from "@/assets/logo-icon.png";

export interface Source {
  title: string;
  url: string;
  description?: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
  sources?: Source[];
  searchMode?: string;
  workItemLabel?: string;
}

const getSearchModeLabel = (mode?: string) => {
  switch (mode) {
    case "web":
      return { label: "웹 검색", icon: "🌐" };
    case "internal":
      return { label: "사내 규칙", icon: "📋" };
    case "general":
    default:
      return { label: "일반", icon: "💬" };
  }
};

const ChatMessage = ({ role, content, timestamp, onRegenerate, isLastAssistant, sources, searchMode, workItemLabel }: ChatMessageProps) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const [showAllSources, setShowAllSources] = useState(false);
  const modeInfo = getSearchModeLabel(searchMode);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("텍스트가 복사되었습니다");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: "like" | "dislike") => {
    setFeedback(type);
    toast.success(type === "like" ? "긍정적 피드백 감사합니다!" : "피드백이 반영되었습니다");
  };

  const handleDetailedFeedback = () => {
    toast.info("피드백 전달 기능이 준비 중입니다");
  };

  const formattedTime = format(timestamp, "a h:mm", { locale: ko });

  return (
    <div className={cn("flex gap-3 mb-4 group", isUser && "justify-end")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <img src={logoIcon} alt="AI" className="w-5 h-5" />
        </div>
      )}
      <div className="flex flex-col max-w-[80%]">
        {/* Tags: search mode + work item */}
        {(searchMode || workItemLabel) && (
          <div className={cn("flex gap-1.5 mb-1.5 flex-wrap", isUser ? "justify-end" : "justify-start")}>
            {searchMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/30">
                <span>{modeInfo.icon}</span>
                <span>{modeInfo.label}</span>
              </span>
            )}
            {workItemLabel && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/30">
                <span>📌</span>
                <span>{workItemLabel}</span>
              </span>
            )}
          </div>
        )}
        
        <div className={cn("flex items-end gap-2", isUser && "flex-row-reverse")}>
          <div
            className={cn(
              "rounded-2xl px-4 py-3",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground border border-border shadow-soft"
            )}
          >
            <p className="text-body whitespace-pre-wrap">{content}</p>
          </div>
          <span className="text-[10px] text-muted-foreground mb-1 flex-shrink-0">
            {formattedTime}
          </span>
        </div>
        
        {/* Sources section - Collapsible pill outside bubble */}
        {!isUser && sources && sources.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowAllSources(!showAllSources)}
              className="flex items-center gap-1.5 text-menu-label-long text-muted-foreground hover:text-foreground transition-colors group/toggle"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border hover:bg-muted transition-colors">
                <FileText className="w-3 h-3" />
                <span className="font-medium">{sources.length}개 출처</span>
                <ChevronDown className={cn(
                  "w-3 h-3 transition-transform duration-200",
                  showAllSources && "rotate-180"
                )} />
              </div>
            </button>
            
            <div className={cn(
              "grid gap-1.5 overflow-hidden transition-all duration-300 ease-out mt-2",
              showAllSources ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            )}>
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/source flex items-start gap-2.5 px-3 py-2 bg-card hover:bg-primary/5 rounded-xl transition-all duration-200 hover:shadow-sm border border-border hover:border-primary/20"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-menu-label-long font-medium text-foreground truncate">
                        {source.title}
                      </span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover/source:text-primary transition-colors flex-shrink-0" />
                    </div>
                    {source.description && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {source.description}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions for all messages */}
        <div className={cn(
          "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "justify-end" : "justify-start"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-muted"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </Button>
          
          {/* Feedback buttons only for assistant */}
          {!isUser && (
            <>
              {isLastAssistant && onRegenerate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-muted"
                  onClick={onRegenerate}
                  title="답변 재생성"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-full hover:bg-muted",
                  feedback === "like" && "bg-green-100 text-green-600"
                )}
                onClick={() => handleFeedback("like")}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-full hover:bg-muted",
                  feedback === "dislike" && "bg-red-100 text-red-600"
                )}
                onClick={() => handleFeedback("dislike")}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-muted"
                onClick={handleDetailedFeedback}
              >
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
