import { useState, forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";
import { ChevronRight, Check, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface InitialSetupModalProps {
  open: boolean;
  onComplete: (settings: UserSettings) => void;
}

interface UserSettings {
  userName: string;
  assistantName: string;
  interestTopics: string[];
  toneStyle: string;
  answerLength: string;
  allowWebSearch: boolean;
  allowFollowUpQuestions: boolean;
}

const toneOptions = [
  { id: "professional", label: "전문적인 말투", emoji: "👔" },
  { id: "warm-formal", label: "따뜻함이 담긴 말투", emoji: "🤝" },
  { id: "default", label: "기본 말투", emoji: "💬" },
  { id: "friendly", label: "유쾌하고 친근함", emoji: "😊" },
];

const lengthOptions = [
  { id: "concise", label: "간결하게" },
  { id: "default", label: "기본" },
  { id: "detailed", label: "상세하게" },
];

const topicOptions = [
  { id: "ai", label: "AI / 인공지능", emoji: "🤖" },
  { id: "cloud", label: "클라우드 / 보안", emoji: "☁️" },
  { id: "dev", label: "개발 / 프로그래밍", emoji: "💻" },
  { id: "business", label: "비즈니스 / 경영", emoji: "📊" },
  { id: "productivity", label: "생산성 / 협업", emoji: "⚡" },
  { id: "design", label: "디자인 / UX", emoji: "🎨" },
];

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export function InitialSetupModal({ open, onComplete }: InitialSetupModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [userName, setUserName] = useState("");
  const [assistantName, setAssistantName] = useState("");
  const [interestTopics, setInterestTopics] = useState<string[]>([]);
  const [toneStyle, setToneStyle] = useState("default");
  const [answerLength, setAnswerLength] = useState("default");
  const [allowWebSearch, setAllowWebSearch] = useState(true);
  const [allowFollowUpQuestions, setAllowFollowUpQuestions] = useState(true);

  const handleTopicToggle = (id: string) => {
    setInterestTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const fireConfetti = () => {
    // 왼쪽에서 발사
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.2, y: 0.6 },
      colors: ['#2AABE2', '#A5CF4C', '#FFD700', '#FF69B4'],
    });
    // 오른쪽에서 발사
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.8, y: 0.6 },
      colors: ['#2AABE2', '#A5CF4C', '#FFD700', '#FF69B4'],
    });
    // 중앙에서 큰 폭발
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#2AABE2', '#A5CF4C', '#FFD700', '#FF69B4', '#9b87f5'],
      });
    }, 150);
  };

  const handleSubmit = () => {
    fireConfetti();
    setTimeout(() => {
      onComplete({
        userName,
        assistantName,
        interestTopics,
        toneStyle,
        answerLength,
        allowWebSearch,
        allowFollowUpQuestions,
      });
    }, 600);
  };

  const nextStep = () => {
    if (step < 6) setStep((step + 1) as Step);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return userName.trim().length > 0;
      case 2: return assistantName.trim().length > 0;
      case 3: return interestTopics.length > 0;
      case 4: return true;
      case 5: return true;
      case 6: return true;
      default: return false;
    }
  };

  // Assistant message bubble with animation
  // NOTE: previously used custom keyframes (fade-in/scale-in) that don't exist -> content stayed opacity-0.
  const AssistantMessage = forwardRef<HTMLDivElement, { children: React.ReactNode; delay?: number }>(
    ({ children, delay = 0 }, ref) => (
      <div
        ref={ref}
        className="flex items-start gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
        style={{ animationDelay: `${delay}ms` }}
      >
        <img
          src={logoIcon}
          alt="Assistant"
          className="w-8 h-8 rounded-full flex-shrink-0 motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-300"
          style={{ animationDelay: `${delay + 100}ms` }}
        />
        <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
          <p className="text-sm text-foreground leading-relaxed">{children}</p>
        </div>
      </div>
    ),
  );
  AssistantMessage.displayName = "AssistantMessage";

  // User input area with animation - using forwardRef to avoid ref warning
  const AnimatedInputArea = forwardRef<HTMLDivElement, { children: React.ReactNode; delay?: number }>(
    ({ children, delay = 200 }, ref) => (
      <div 
        ref={ref}
        className="flex justify-end motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200"
        style={{ animationDelay: `${delay}ms` }}
      >
        {children}
      </div>
    )
  );
  AnimatedInputArea.displayName = "AnimatedInputArea";

  const CompletedAnswer = ({ answer }: { answer: string }) => (
    <div className="flex justify-end items-center gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200">
      <Check className="w-4 h-4 text-primary" />
      <div className="bg-primary/10 text-primary rounded-full px-3 py-1.5">
        <p className="text-sm font-medium">{answer}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[440px] max-h-[85vh] overflow-hidden p-0 border-none bg-background flex flex-col" aria-describedby={undefined}>
        <VisuallyHidden>
          <DialogTitle>초기 설정</DialogTitle>
        </VisuallyHidden>
        {/* Header with warm welcome */}
        <div className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/70 px-5 py-5 text-center overflow-hidden shrink-0">
          {/* Sparkle decorations */}
          <div className="absolute top-2 left-4 animate-pulse">
            <Sparkles className="w-4 h-4 text-primary-foreground/60" />
          </div>
          <div className="absolute top-3 right-6 animate-pulse" style={{ animationDelay: '300ms' }}>
            <Sparkles className="w-3 h-3 text-primary-foreground/40" />
          </div>
          <div className="absolute bottom-2 left-8 animate-pulse" style={{ animationDelay: '600ms' }}>
            <Sparkles className="w-3 h-3 text-primary-foreground/50" />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={logoIcon} alt="Logo" className="w-10 h-10 animate-[bounce_1s_ease-out]" />
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-base font-bold text-primary-foreground leading-relaxed">
            놓치기 쉬운 업무까지 먼저 알려주는
            <br />
            <span className="text-primary-foreground/90">당신만의 업무 비서</span>가 될게요!
          </h2>
          <p className="text-xs text-primary-foreground/70 mt-2">
            잠깐! 먼저 서로 알아가는 시간을 가져볼까요? 💬
          </p>
          
          {/* Progress dots */}
          <div className="flex gap-1.5 mt-4 px-4">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 rounded-full flex-1 transition-all duration-300",
                  s <= step ? "bg-primary-foreground" : "bg-primary-foreground/30"
                )}
              />
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="px-5 py-4 space-y-4 flex-1 min-h-0 overflow-y-auto">
          {/* Step 1: User Name */}
          <AssistantMessage>
            반가워요! 👋 저는 <strong>이수 GPT</strong>예요~
            <br /><br />
            먼저, 제가 뭐라고 불러드리면 될까요? 😊
          </AssistantMessage>
          
          {step === 1 ? (
            <AnimatedInputArea>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="이름이나 닉네임을 알려주세요~"
                className="max-w-[75%] bg-card border-primary/30 focus:border-primary rounded-2xl rounded-tr-md text-sm"
                onKeyDown={(e) => e.key === "Enter" && canProceed() && nextStep()}
                autoFocus
              />
            </AnimatedInputArea>
          ) : (
            <CompletedAnswer answer={userName} />
          )}

          {/* Step 2: Assistant Name */}
          {step >= 2 && (
            <>
              <AssistantMessage>
                우와~ <strong>{userName}</strong>님이시군요! 이름 너무 예뻐요 🥰
                <br /><br />
                그럼 저는 뭐라고 불러주실 건가요~?
              </AssistantMessage>
              
              {step === 2 ? (
                <AnimatedInputArea>
                  <Input
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    placeholder="예: 수비니, 이수, 비서님..."
                    className="max-w-[75%] bg-card border-primary/30 focus:border-primary rounded-2xl rounded-tr-md text-sm"
                    onKeyDown={(e) => e.key === "Enter" && canProceed() && nextStep()}
                    autoFocus
                  />
                </AnimatedInputArea>
              ) : (
                <CompletedAnswer answer={assistantName} />
              )}
            </>
          )}

          {/* Step 3: Interest Topics */}
          {step >= 3 && (
            <>
              <AssistantMessage>
                헤헤~ 앞으로 <strong>{assistantName}</strong>이라고 불러주세요! 💕
                <br /><br />
                📰 어떤 분야에 관심 있으세요? 맞춤 뉴스를 알려드릴게요!
              </AssistantMessage>
              
              {step === 3 ? (
                <div className="space-y-2 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" style={{ animationDelay: "200ms" }}>
                  <div className="grid grid-cols-3 gap-2">
                    {topicOptions.map((topic, idx) => (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicToggle(topic.id)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200",
                          interestTopics.includes(topic.id)
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                        style={{ animationDelay: `${300 + idx * 80}ms` }}
                      >
                        <span className="text-base">{topic.emoji}</span>
                        <span className={cn(
                          "text-xs font-medium",
                          interestTopics.includes(topic.id) ? "text-primary" : "text-muted-foreground"
                        )}>
                          {topic.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    여러 개 선택할 수 있어요! ✨
                  </p>
                </div>
              ) : (
                <CompletedAnswer answer={`${interestTopics.length}개 주제 선택됨`} />
              )}
            </>
          )}

          {/* Step 4: Tone Style */}
          {step >= 4 && (
            <>
              <AssistantMessage>
                좋아요! 관심사 잘 기억해둘게요~ 🎯
                <br /><br />
                저한테 어떤 느낌으로 말해줬으면 해요?
              </AssistantMessage>
              
               {step === 4 ? (
                 <div className="space-y-2 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" style={{ animationDelay: "200ms" }}>
                  <div className="grid grid-cols-2 gap-2">
                    {toneOptions.map((option, idx) => (
                      <button
                        key={option.id}
                        onClick={() => setToneStyle(option.id)}
                        className={cn(
                           "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200",
                          toneStyle === option.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                        style={{ animationDelay: `${300 + idx * 80}ms` }}
                      >
                        <span className="text-base">{option.emoji}</span>
                        <span className={cn(
                          "text-xs font-medium",
                          toneStyle === option.id ? "text-primary" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <CompletedAnswer answer={toneOptions.find(t => t.id === toneStyle)?.label || ""} />
              )}
            </>
          )}

          {/* Step 5: Answer Length */}
          {step >= 5 && (
            <>
              <AssistantMessage>
                오케이! 그렇게 말씀드릴게요~ ✨
                <br /><br />
                답변은 어느 정도 길이가 좋으세요?
              </AssistantMessage>
              
               {step === 5 ? (
                 <div className="flex justify-end motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" style={{ animationDelay: "200ms" }}>
                  <div className="flex bg-muted rounded-full p-1 gap-1">
                    {lengthOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setAnswerLength(option.id)}
                        className={cn(
                          "px-4 py-2 text-xs font-medium rounded-full transition-all",
                          answerLength === option.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <CompletedAnswer answer={lengthOptions.find(l => l.id === answerLength)?.label || ""} />
              )}
            </>
          )}

          {/* Step 6: Additional Options */}
          {step >= 6 && (
            <>
              <AssistantMessage>
                거의 다 왔어요~! 🎉 마지막으로 몇 가지만 더요!
              </AssistantMessage>
              
               <div className="space-y-2 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" style={{ animationDelay: "200ms" }}>
                <button
                  onClick={() => setAllowWebSearch(!allowWebSearch)}
                  className={cn(
                     "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200",
                    allowWebSearch
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"
                  )}
                  style={{ animationDelay: '300ms' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🌐</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">자동 검색</p>
                      <p className="text-xs text-muted-foreground">필요할 때 인터넷 검색해드려요~</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={allowWebSearch}
                    className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </button>
                
                <button
                  onClick={() => setAllowFollowUpQuestions(!allowFollowUpQuestions)}
                  className={cn(
                     "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200",
                    allowFollowUpQuestions
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"
                  )}
                  style={{ animationDelay: '400ms' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💡</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">질문 추천</p>
                      <p className="text-xs text-muted-foreground">대화 중 다음 질문 추천해드릴게요!</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={allowFollowUpQuestions}
                    className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bottom action */}
        <div className="px-5 py-4 border-t border-border bg-card shrink-0">
          {step < 6 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 text-sm font-semibold rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              다음으로~
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground py-5 text-sm font-semibold rounded-xl shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              🚀 이제 시작해볼까요?
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
