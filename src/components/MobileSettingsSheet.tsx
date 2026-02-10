import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Globe, MessageCircle, Settings, Check } from "lucide-react";
import type { UserSettings } from "./SettingsModal";

interface MobileSettingsSheetProps {
  open: boolean;
  onClose: () => void;
  settings: UserSettings | null;
  onSave: (settings: UserSettings) => void;
}

const searchModeOptions = [
  { id: "general", label: "기본 모델", emoji: "🌐" },
  { id: "web", label: "웹 검색", emoji: "🔍" },
  { id: "internal", label: "사내 규칙", emoji: "🏢" },
];

const toneOptions = [
  { id: "professional", label: "전문적인", emoji: "👔" },
  { id: "warm", label: "따뜻한", emoji: "🤗" },
  { id: "friendly", label: "친근한", emoji: "😊" },
];

const lengthOptions = [
  { id: "concise", label: "간결하게", emoji: "📝" },
  { id: "default", label: "적당히", emoji: "📄" },
  { id: "detailed", label: "자세하게", emoji: "📚" },
];

const MobileSettingsSheet = ({ open, onClose, settings, onSave }: MobileSettingsSheetProps) => {
  const [userName, setUserName] = useState(settings?.userName || "");
  const [assistantName, setAssistantName] = useState(settings?.assistantName || "이수 GPT");
  const [interestTopics, setInterestTopics] = useState<string[]>(settings?.interestTopics || []);
  const [toneStyle, setToneStyle] = useState(settings?.toneStyle || "warm");
  const [answerLength, setAnswerLength] = useState(settings?.answerLength || "default");
  const [searchMode, setSearchMode] = useState(settings?.searchMode || "general");
  const [allowWebSearch, setAllowWebSearch] = useState(settings?.allowWebSearch ?? true);
  const [allowFollowUpQuestions, setAllowFollowUpQuestions] = useState(settings?.allowFollowUpQuestions ?? true);

  useEffect(() => {
    if (settings) {
      setUserName(settings.userName || "");
      setAssistantName(settings.assistantName || "이수 GPT");
      setInterestTopics(settings.interestTopics || []);
      setToneStyle(settings.toneStyle || "warm");
      setAnswerLength(settings.answerLength || "default");
      setSearchMode(settings.searchMode || "general");
      setAllowWebSearch(settings.allowWebSearch ?? true);
      setAllowFollowUpQuestions(settings.allowFollowUpQuestions ?? true);
    }
  }, [settings]);

  const handleSave = () => {
    onSave({
      userName,
      assistantName,
      interestTopics,
      toneStyle,
      answerLength,
      searchMode,
      allowWebSearch,
      allowFollowUpQuestions,
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <SheetTitle className="text-lg font-bold">개인화 설정</SheetTitle>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-5">
            {/* 호칭 설정 */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">호칭</h3>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="예: 경민님, 박과장님..."
                className="h-10 text-sm rounded-lg border-border bg-muted/30 focus:bg-background"
              />
            </section>

            {/* 검색 모드 */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">검색 모드</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {searchModeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSearchMode(option.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border transition-all",
                      searchMode === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/20 active:bg-muted/40"
                    )}
                  >
                    <span className="text-base">{option.emoji}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      searchMode === option.id ? "text-primary" : "text-foreground"
                    )}>{option.label}</span>
                    {searchMode === option.id && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* 말투 스타일 */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">말투 스타일</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {toneOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setToneStyle(option.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border transition-all",
                      toneStyle === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/20 active:bg-muted/40"
                    )}
                  >
                    <span className="text-base">{option.emoji}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      toneStyle === option.id ? "text-primary" : "text-foreground"
                    )}>{option.label}</span>
                    {toneStyle === option.id && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* 답변 길이 */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">답변 길이</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {lengthOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setAnswerLength(option.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border transition-all",
                      answerLength === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/20 active:bg-muted/40"
                    )}
                  >
                    <span className="text-base">{option.emoji}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      answerLength === option.id ? "text-primary" : "text-foreground"
                    )}>{option.label}</span>
                    {answerLength === option.id && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* 토글 설정 */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">추가 설정</h3>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-3 py-3 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">자동 웹 검색</p>
                      <p className="text-[11px] text-muted-foreground">필요할 때 자동으로 검색</p>
                    </div>
                  </div>
                  <Switch
                    checked={allowWebSearch}
                    onCheckedChange={setAllowWebSearch}
                  />
                </div>

                <div className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">다음 질문 추천</p>
                      <p className="text-[11px] text-muted-foreground">대화에 맞는 질문 제안</p>
                    </div>
                  </div>
                  <Switch
                    checked={allowFollowUpQuestions}
                    onCheckedChange={setAllowFollowUpQuestions}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="shrink-0 px-4 py-3 border-t border-border bg-background">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-11 text-sm rounded-xl"
            >
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 h-11 text-sm rounded-xl font-medium"
            >
              저장
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSettingsSheet;
