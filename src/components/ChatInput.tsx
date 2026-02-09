import { useState, useEffect, useRef } from "react";
import { ChevronDown, Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { allWorkItems } from "@/components/WorkItemSettingsModal";
import { cn } from "@/lib/utils";

const searchModeOptions = [
  { id: "general", label: "일반", emoji: "🌐" },
  { id: "web", label: "웹 검색", emoji: "🔍" },
  { id: "internal", label: "사내 규칙", emoji: "🏢" },
];

const modelOptions = [
  { id: "gemini-flash", label: "Gemini Flash", emoji: "⚡" },
  { id: "gemini-pro", label: "Gemini Pro", emoji: "🧠" },
  { id: "gpt-5", label: "GPT-5", emoji: "🤖" },
  { id: "gpt-5-mini", label: "GPT-5 Mini", emoji: "🚀" },
];

const toneOptions = [
  { id: "professional", label: "전문적인", emoji: "👔" },
  { id: "warm", label: "따뜻한", emoji: "🤗" },
  { id: "friendly", label: "친근한", emoji: "😊" },
];

const lengthOptions = [
  { id: "concise", label: "간결" },
  { id: "default", label: "보통" },
  { id: "detailed", label: "자세히" },
];

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  disabled?: boolean;
  initialMessage?: string;
  onMessageChange?: (message: string) => void;
  toneStyle?: string;
  answerLength?: string;
  onToneChange?: (tone: string) => void;
  onLengthChange?: (length: string) => void;
  userName?: string;
  searchMode?: string;
  onSearchModeChange?: (mode: string) => void;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  isMobile?: boolean;
  showWorkItemShortcut?: boolean;
}

const ChatInput = ({ 
  onSendMessage, 
  disabled, 
  initialMessage, 
  onMessageChange,
  toneStyle = "warm",
  answerLength = "default",
  onToneChange,
  onLengthChange,
  userName,
  searchMode = "general",
  onSearchModeChange,
  selectedModel = "gemini-flash",
  onModelChange,
  isMobile = false,
  showWorkItemShortcut = true,
}: ChatInputProps) => {
  const [message, setMessage] = useState(initialMessage || "");
  const [selectedTone, setSelectedTone] = useState(toneStyle);
  const [selectedLength, setSelectedLength] = useState(answerLength);
  const [selectedSearchMode, setSelectedSearchMode] = useState(searchMode);
  const [currentModel, setCurrentModel] = useState(selectedModel);
  const [showWorkItems, setShowWorkItems] = useState(false);
  const [workItemFilter, setWorkItemFilter] = useState("");
  const [selectedWorkItem, setSelectedWorkItem] = useState<typeof allWorkItems[0] | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync with props when they change
  useEffect(() => {
    setSelectedTone(toneStyle);
  }, [toneStyle]);

  useEffect(() => {
    setSelectedLength(answerLength);
  }, [answerLength]);

  useEffect(() => {
    setSelectedSearchMode(searchMode);
  }, [searchMode]);

  useEffect(() => {
    setCurrentModel(selectedModel);
  }, [selectedModel]);

  // Sync with initialMessage when it changes externally
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleMessageChange = (value: string) => {
    setMessage(value);
    onMessageChange?.(value);
  };

  const handleToneSelect = (tone: string) => {
    setSelectedTone(tone);
    onToneChange?.(tone);
  };

  const handleLengthSelect = (length: string) => {
    setSelectedLength(length);
    onLengthChange?.(length);
  };

  const handleSearchModeSelect = (mode: string) => {
    setSelectedSearchMode(mode);
    onSearchModeChange?.(mode);
  };

  const handleModelSelect = (model: string) => {
    setCurrentModel(model);
    onModelChange?.(model);
  };

  const currentTone = toneOptions.find(t => t.id === selectedTone);
  const currentSearchMode = searchModeOptions.find(m => m.id === selectedSearchMode);
  const currentModelOption = modelOptions.find(m => m.id === currentModel);

  // Filter work items based on search after #
  const filteredWorkItems = allWorkItems.filter(item =>
    item.label.toLowerCase().includes(workItemFilter.toLowerCase())
  );

  const handleWorkItemSelect = (item: typeof allWorkItems[0]) => {
    const hashIndex = message.lastIndexOf('#');
    const newMessage = hashIndex >= 0 
      ? message.substring(0, hashIndex).trim()
      : message.trim();
    setMessage(newMessage);
    onMessageChange?.(newMessage);
    setSelectedWorkItem(item);
    setShowWorkItems(false);
    setWorkItemFilter("");
    textareaRef.current?.focus();
  };

  const handleRemoveWorkItem = () => {
    setSelectedWorkItem(null);
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (value: string) => {
    setMessage(value);
    onMessageChange?.(value);

    // Only show work items if enabled
    if (!showWorkItemShortcut) {
      return;
    }

    const lastHashIndex = value.lastIndexOf('#');
    if (lastHashIndex >= 0) {
      const textAfterHash = value.substring(lastHashIndex + 1);
      if (!textAfterHash.includes(' ') && !textAfterHash.includes('\n')) {
        setShowWorkItems(true);
        setWorkItemFilter(textAfterHash);
      } else {
        setShowWorkItems(false);
        setWorkItemFilter("");
      }
    } else {
      setShowWorkItems(false);
      setWorkItemFilter("");
    }
  };

  const getPlaceholderText = () => {
    const namePrefix = userName ? `${userName}님, ` : "";
    switch (selectedSearchMode) {
      case "web":
        return `${namePrefix}웹에서 검색할 내용을 입력하세요...`;
      case "internal":
        return `${namePrefix}사내 규칙에 대해 물어보세요...`;
      default:
        return `${namePrefix}무엇이든 물어보세요...`;
    }
  };

  const placeholderText = getPlaceholderText();

  return (
    <div className="chat-input-gradient bg-background shadow-lg">
      <div className="p-4 pb-2 relative">
        {/* Selected Work Item Tag */}
        {selectedWorkItem && (
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary rounded-lg text-sm border border-primary/20">
              <div className={`p-1 rounded ${selectedWorkItem.color}`}>
                <selectedWorkItem.icon className="w-3 h-3" />
              </div>
              <span>{selectedWorkItem.label}</span>
              <button
                onClick={handleRemoveWorkItem}
                className="ml-1 hover:bg-primary/20 rounded p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        {showWorkItemShortcut ? (
          <Popover open={showWorkItems} onOpenChange={setShowWorkItems}>
            <PopoverTrigger asChild>
              <div className="w-full">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => handleTextareaChange(e.target.value)}
                  placeholder={placeholderText}
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base resize-none min-h-[24px] max-h-[200px]"
                  rows={message.split('\n').length > 5 ? 5 : message.split('\n').length || 1}
                  onKeyDown={(e) => {
                    if (showWorkItems) {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        setShowWorkItems(false);
                        setWorkItemFilter("");
                      } else if (e.key === 'Enter' && filteredWorkItems.length > 0) {
                        e.preventDefault();
                        handleWorkItemSelect(filteredWorkItems[0]);
                      }
                      return;
                    }
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (message.trim() && onSendMessage) {
                        onSendMessage(message.trim());
                        setMessage("");
                      }
                    }
                  }}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent 
              align="start" 
              side="top"
              sideOffset={8}
              className="w-72 p-0 bg-background border shadow-lg z-50"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="p-2 border-b">
                <p className="text-xs text-muted-foreground font-medium">업무 바로가기</p>
              </div>
              <ScrollArea className="max-h-64">
                <div className="p-1">
                  {filteredWorkItems.length > 0 ? (
                    filteredWorkItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleWorkItemSelect(item)}
                          className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent text-left transition-colors"
                        >
                          <div className={`p-1.5 rounded-md ${item.color}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-sm">{item.label}</span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      검색 결과가 없습니다
                    </p>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        ) : (
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleTextareaChange(e.target.value)}
            placeholder={placeholderText}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base resize-none min-h-[24px] max-h-[200px]"
            rows={message.split('\n').length > 5 ? 5 : message.split('\n').length || 1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (message.trim() && onSendMessage) {
                  onSendMessage(message.trim());
                  setMessage("");
                }
              }
            }}
          />
        )}
      </div>
      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Mode Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full gap-1.5 hover:bg-[hsl(var(--border))] text-muted-foreground border border-border",
                  isMobile ? "h-10 px-3 text-sm min-w-[44px]" : "h-8 px-3 text-xs"
                )}
              >
                <span className={isMobile ? "text-base" : ""}>{currentSearchMode?.emoji}</span>
                <span>{currentSearchMode?.label}</span>
                <ChevronDown className={isMobile ? "w-4 h-4" : "w-3 h-3"} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-background border shadow-lg z-50">
              {searchModeOptions.map((mode) => (
                <DropdownMenuItem 
                  key={mode.id}
                  onClick={() => handleSearchModeSelect(mode.id)}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer hover:bg-[hsl(var(--border))]",
                    isMobile && "py-3 text-base",
                    selectedSearchMode === mode.id && "bg-primary/10 text-primary"
                  )}
                >
                  <span>{mode.emoji}</span>
                  <span>{mode.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full gap-1.5 hover:bg-[hsl(var(--border))] text-muted-foreground border border-border",
              isMobile ? "h-10 px-3 text-sm min-w-[44px]" : "h-8 px-3 text-xs"
            )}
          >
            <Paperclip className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
            {!isMobile && <span>파일첨부</span>}
          </Button>
          
          {/* Tone Style Dropdown - Hidden on mobile */}
          {!isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full gap-1.5 hover:bg-[hsl(var(--border))] text-muted-foreground h-8 px-3 text-xs border border-border"
                >
                  <span>{currentTone?.emoji}</span>
                  <span className="hidden sm:inline">{currentTone?.label}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-background border shadow-lg z-50">
                {toneOptions.map((tone) => (
                  <DropdownMenuItem 
                    key={tone.id}
                    onClick={() => handleToneSelect(tone.id)}
                    className={`flex items-center gap-2 cursor-pointer hover:bg-[hsl(var(--border))] ${selectedTone === tone.id ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    <span>{tone.emoji}</span>
                    <span>{tone.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Answer Length Dropdown - Hidden on mobile */}
          {!isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full gap-1.5 hover:bg-[hsl(var(--border))] text-muted-foreground h-8 px-3 text-xs border border-border"
                >
                  <span>📏</span>
                  <span className="hidden sm:inline">{lengthOptions.find(l => l.id === selectedLength)?.label}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-background border shadow-lg z-50">
                {lengthOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.id}
                    onClick={() => handleLengthSelect(option.id)}
                    className={`flex items-center gap-2 cursor-pointer hover:bg-[hsl(var(--border))] ${selectedLength === option.id ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    <span>{option.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Model Selection Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full gap-1.5 hover:bg-[hsl(var(--border))] text-muted-foreground border border-border",
                  isMobile ? "h-10 px-3 text-sm min-w-[44px]" : "h-8 px-3 text-xs"
                )}
              >
                <span className={isMobile ? "text-base" : ""}>{currentModelOption?.emoji}</span>
                <span>{currentModelOption?.label}</span>
                <ChevronDown className={isMobile ? "w-4 h-4" : "w-3 h-3"} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-background border shadow-lg z-50">
              {modelOptions.map((model) => (
                <DropdownMenuItem 
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer hover:bg-[hsl(var(--border))]",
                    isMobile && "py-3 text-base",
                    currentModel === model.id && "bg-primary/10 text-primary"
                  )}
                >
                  <span>{model.emoji}</span>
                  <span>{model.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          size="icon"
          className={cn(
            "rounded-full transition-colors",
            isMobile ? "h-12 w-12" : "h-10 w-10",
            message.trim() && !disabled
              ? "bg-primary hover:bg-lavender-dark text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}
          disabled={!message.trim() || disabled}
          onClick={() => {
            if (message.trim() && onSendMessage) {
              const finalMessage = selectedWorkItem 
                ? `[${selectedWorkItem.label}] ${message.trim()}`
                : message.trim();
              onSendMessage(finalMessage);
              setMessage("");
              setSelectedWorkItem(null);
            }
          }}
        >
          <Send className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
