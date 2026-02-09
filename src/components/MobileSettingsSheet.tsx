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
  { id: "general", label: "일반", emoji: "🌐" },
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
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <SheetTitle className="text-xl font-bold">개인화 설정</SheetTitle>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-7">
            {/* 호칭 설정 */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">호칭</h3>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="예: 경민님, 박과장님..."
                className="h-12 text-base rounded-xl border-border bg-muted/30 focus:bg-background"
              />
              <p className="text-xs text-muted-foreground">이수 GPT가 어떻게 불러드릴까요?</p>
            </section>

            {/* 검색 모드 */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">검색 모드</h3>
              <div className="grid grid-cols-3 gap-2">
                {searchModeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSearchMode(option.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border-2 transition-all",
                      searchMode === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/20 active:bg-muted/40"
                    )}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      searchMode === option.id ? "text-primary" : "text-foreground"
                    )}>{option.label}</span>
                    {searchMode === option.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* 말투 스타일 */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">말투 스타일</h3>
              <div className="grid grid-cols-3 gap-2">
                {toneOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setToneStyle(option.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border-2 transition-all",
                      toneStyle === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/20 active:bg-muted/40"
                    )}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      toneStyle === option.id ? "text-primary" : "text-foreground"
                    )}>{option.label}</span>
                    {toneStyle === option.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* 답변 길이 */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">답변 길이</h3>
              <div className="grid grid-cols-3 gap-2">
                {lengthOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setAnswerLength(option.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border-2 transition-all",
                      answerLength === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/20 active:bg-muted/40"
                    )}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      answerLength === option.id ? "text-primary" : "text-foreground"
                    )}>{option.label}</span>
                    {answerLength === option.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* 토글 설정 */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">추가 설정</h3>
              <div className="rounded-2xl border border-border bg-muted/10 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">자동 웹 검색</p>
                      <p className="text-xs text-muted-foreground">필요할 때 자동으로 검색</p>
                    </div>
                  </div>
                  <Switch
                    checked={allowWebSearch}
                    onCheckedChange={setAllowWebSearch}
                    className="scale-110"
                  />
                </div>

                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">다음 질문 추천</p>
                      <p className="text-xs text-muted-foreground">대화에 맞는 질문 제안</p>
                    </div>
                  </div>
                  <Switch
                    checked={allowFollowUpQuestions}
                    onCheckedChange={setAllowFollowUpQuestions}
                    className="scale-110"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="shrink-0 px-5 py-4 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-12 text-base rounded-xl"
            >
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 h-12 text-base rounded-xl font-semibold"
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
