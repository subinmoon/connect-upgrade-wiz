import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
interface TutorialModalProps {
  open: boolean;
  onComplete: (settings: UserSettings) => void;
  onSkip: () => void;
  onStartGuide?: () => void; // 화면 가이드 시작 콜백
  userName?: string; // 박경민 등 사전에 알고있는 이름
  initialStep?: TutorialStep; // 초기 스텝 (가이드 완료 후 돌아올 때 사용)
}
export interface UserSettings {
  userName: string;
  assistantName: string;
  interestTopics: string[];
  toneStyle: string;
  answerLength: string;
  allowWebSearch: boolean;
  allowFollowUpQuestions: boolean;
}

// 튜토리얼 스텝 타입
export type TutorialStep = "greeting" // STEP 1: 첫 인사
| "intro-ask" // STEP 2: 소개 여부 묻기
| "intro-skip" // STEP 2-1: 괜찮아 선택
| "intro-show-1" // STEP 2-2: 알려줘 선택 - 첫번째 소개
| "intro-show-2" // STEP 2-2: 두번째 소개
| "intro-show-3" // STEP 2-2: 이미지 생성 소개
| "intro-show-4" // STEP 2-2: 모바일 호환 소개
| "user-info-ask" // STEP 3: 사용자 정보 설정 여부
| "user-info-skip" // STEP 3-1: 싫어 선택
| "user-info-settings" // STEP 3-2: 좋아 선택 - 설정 시작
| "settings-name" // 호칭 설정
| "settings-interests" // 관심 주제 선택
| "settings-tone" // 말투 선택
| "settings-length" // 답변 길이
| "settings-websearch" // 자동 웹 검색
| "settings-recommend" // 다음 질문 추천
| "complete"; // 완료

// 목차 정의 - 클릭으로 이동 가능한 주요 단계
const stepPhases = [{
  id: "greeting",
  label: "인사",
  steps: ["greeting"]
}, {
  id: "intro",
  label: "소개",
  steps: ["intro-ask", "intro-skip", "intro-show-1", "intro-show-2", "intro-show-3", "intro-show-4"]
}, {
  id: "user-info",
  label: "설정",
  steps: ["user-info-ask", "user-info-skip", "user-info-settings", "settings-name", "settings-interests", "settings-tone", "settings-length", "settings-websearch", "settings-recommend"]
}, {
  id: "complete",
  label: "완료",
  steps: ["complete"]
}] as const;

// 현재 스텝이 속한 phase index 찾기
const getPhaseIndex = (step: TutorialStep): number => {
  for (let i = 0; i < stepPhases.length; i++) {
    if ((stepPhases[i].steps as readonly string[]).includes(step)) {
      return i;
    }
  }
  return 0;
};

// phase의 첫 번째 스텝 가져오기
const getPhaseFirstStep = (phaseIndex: number): TutorialStep => {
  const phaseSteps: Record<number, TutorialStep> = {
    0: "greeting",
    1: "intro-ask",
    2: "user-info-ask",
    3: "complete"
  };
  return phaseSteps[phaseIndex] || "greeting";
};
const toneOptions = [{
  id: "professional",
  label: "전문적인",
  emoji: "👔"
}, {
  id: "warm",
  label: "따뜻한",
  emoji: "🤗"
}, {
  id: "friendly",
  label: "친근한",
  emoji: "😊"
}];
const lengthOptions = [{
  id: "concise",
  label: "간결"
}, {
  id: "default",
  label: "보통"
}, {
  id: "detailed",
  label: "자세히"
}];

const topicOptions = [
  { id: "ai", label: "AI / 인공지능", emoji: "🤖" },
  { id: "cloud", label: "클라우드 / 보안", emoji: "☁️" },
  { id: "dev", label: "개발 / 프로그래밍", emoji: "💻" },
  { id: "business", label: "비즈니스 / 경영", emoji: "📊" },
  { id: "productivity", label: "생산성 / 협업", emoji: "⚡" },
  { id: "design", label: "디자인 / UX", emoji: "🎨" },
];

// 고퀄리티 마스코트 캐릭터 컴포넌트
function MascotCharacter({
  className,
  emotion = "happy"
}: {
  className?: string;
  emotion?: "happy" | "wave" | "excited" | "thinking";
}) {
  return <div className={cn("relative", className)}>
      {/* 그림자 */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black/10 rounded-[100%] blur-md" />
      
      {/* 메인 캐릭터 컨테이너 */}
      <div className={cn("relative transition-transform duration-300", emotion === "wave" && "animate-[bounce_1s_ease-in-out_infinite]", emotion === "excited" && "animate-[wiggle_0.5s_ease-in-out_infinite]")}>
        {/* 캐릭터 몸통 */}
        <div className="w-32 h-32 relative">
          {/* 메인 바디 - 3D 효과 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3BB8E8] via-[#2AABE2] to-[#1A8BC2] rounded-3xl shadow-2xl overflow-hidden">
            {/* 광택 하이라이트 */}
            <div className="absolute top-3 left-3 w-10 h-10 bg-white/40 rounded-full blur-md" />
            <div className="absolute top-4 left-5 w-4 h-4 bg-white/60 rounded-full" />
            
            {/* 바디 하단 그라데이션 */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#1A7BA8]/30 to-transparent" />
          </div>
          
          {/* 눈 컨테이너 */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-5">
            {/* 왼쪽 눈 */}
            <div className="relative">
              <div className={cn("w-6 h-7 bg-white rounded-full shadow-inner flex items-center justify-center transition-all duration-200", emotion === "thinking" && "h-5")}>
                {/* 눈동자 */}
                <div className={cn("w-3 h-3 bg-gray-800 rounded-full relative transition-all duration-300", emotion === "thinking" && "translate-y-0.5 translate-x-0.5", emotion === "excited" && "scale-110")}>
                  {/* 눈 반짝임 */}
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
                </div>
              </div>
              {/* 눈썹 (thinking 상태) */}
              {emotion === "thinking" && <div className="absolute -top-2 left-0 w-6 h-1 bg-[#1A7BA8] rounded-full transform -rotate-6" />}
            </div>
            
            {/* 오른쪽 눈 */}
            <div className="relative">
              <div className={cn("w-6 h-7 bg-white rounded-full shadow-inner flex items-center justify-center transition-all duration-200", emotion === "thinking" && "h-5")}>
                <div className={cn("w-3 h-3 bg-gray-800 rounded-full relative transition-all duration-300", emotion === "thinking" && "translate-y-0.5 -translate-x-0.5", emotion === "excited" && "scale-110")}>
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
                </div>
              </div>
              {emotion === "thinking" && <div className="absolute -top-2 right-0 w-6 h-1 bg-[#1A7BA8] rounded-full transform rotate-6" />}
            </div>
          </div>
          
          {/* 볼터치 */}
          <div className="absolute top-[4.5rem] left-4 w-4 h-2.5 bg-pink-400/40 rounded-full blur-[2px]" />
          <div className="absolute top-[4.5rem] right-4 w-4 h-2.5 bg-pink-400/40 rounded-full blur-[2px]" />
          
          {/* 입 */}
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2">
            {emotion === "happy" && <div className="w-8 h-4 border-b-[3px] border-white rounded-b-full" />}
            {emotion === "wave" && <div className="w-10 h-5 bg-white/90 rounded-b-xl rounded-t-sm flex items-center justify-center">
                <div className="w-4 h-2 bg-pink-300 rounded-full mt-1" />
              </div>}
            {emotion === "excited" && <div className="w-10 h-6 bg-white/90 rounded-full flex items-center justify-center">
                <div className="w-5 h-3 bg-pink-300 rounded-full" />
              </div>}
            {emotion === "thinking" && <div className="w-4 h-4 bg-white/70 rounded-full" />}
          </div>
        </div>
        
        {/* 손 (wave 상태) */}
        {emotion === "wave" && <div className="absolute -right-6 top-8 origin-bottom-left animate-[wave-hand_0.6s_ease-in-out_infinite_alternate]">
            <div className="w-7 h-12 bg-gradient-to-br from-[#3BB8E8] to-[#1A8BC2] rounded-xl shadow-lg relative">
              <div className="absolute top-1 left-1 w-2 h-2 bg-white/30 rounded-full" />
            </div>
          </div>}
        
        {/* 반짝이 효과 (excited 상태) */}
        {emotion === "excited" && <>
            <div className="absolute -top-3 -right-3 animate-[sparkle_1s_ease-in-out_infinite]">
              <Sparkles className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
            </div>
            <div className="absolute -top-2 -left-4 animate-[sparkle_1s_ease-in-out_infinite_0.3s]">
              <Sparkles className="w-5 h-5 text-yellow-300 drop-shadow-lg" />
            </div>
            <div className="absolute top-0 right-2 animate-[sparkle_1s_ease-in-out_infinite_0.6s]">
              <Sparkles className="w-4 h-4 text-orange-300 drop-shadow-lg" />
            </div>
          </>}
        
        {/* 물음표 (thinking 상태) */}
        {emotion === "thinking" && <div className="absolute -top-4 -right-2 animate-bounce">
            <span className="text-2xl font-bold text-primary drop-shadow-md">?</span>
          </div>}
      </div>
    </div>;
}

// 메시지 버블 컴포넌트
function MessageBubble({
  children,
  delay = 0
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg max-w-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500" style={{
    animationDelay: `${delay}ms`
  }}>
      <p className="text-gray-800 text-base leading-relaxed text-center">{children}</p>
    </div>;
}

// 버튼 선택지 컴포넌트
function ChoiceButtons({
  choices,
  onSelect,
  delay = 300
}: {
  choices: {
    label: string;
    value: string;
    variant?: "primary" | "secondary";
  }[];
  onSelect: (value: string) => void;
  delay?: number;
}) {
  return <div className="flex flex-wrap gap-3 justify-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300" style={{
    animationDelay: `${delay}ms`
  }}>
      {choices.map((choice, idx) => <Button key={choice.value} onClick={() => onSelect(choice.value)} variant={choice.variant === "secondary" ? "outline" : "default"} className={cn("px-6 py-3 rounded-full text-base font-medium transition-all hover:scale-105", choice.variant !== "secondary" && "bg-primary hover:bg-primary/90 shadow-md")} style={{
      animationDelay: `${delay + idx * 100}ms`
    }}>
          {choice.label}
        </Button>)}
    </div>;
}
export function TutorialModal({
  open,
  onComplete,
  onSkip,
  onStartGuide,
  userName: initialUserName = "경민",
  initialStep
}: TutorialModalProps) {
  const [step, setStep] = useState<TutorialStep>(initialStep || "greeting");

  // initialStep이 변경되거나 모달이 열릴 때 스텝 업데이트
  useEffect(() => {
    if (open && initialStep) {
      setStep(initialStep);
    }
  }, [initialStep, open]);
  const [userName, setUserName] = useState("");
  const [assistantName, setAssistantName] = useState("이수 GPT");
  const [interestTopics, setInterestTopics] = useState<string[]>([]);
  const [toneStyle, setToneStyle] = useState("warm");
  const [answerLength, setAnswerLength] = useState("default");
  const [allowWebSearch, setAllowWebSearch] = useState(true);
  const [allowFollowUpQuestions, setAllowFollowUpQuestions] = useState(true);

  const handleTopicToggle = (id: string) => {
    setInterestTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };
  const contentRef = useRef<HTMLDivElement>(null);

  // 스크롤 자동 이동
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [step]);
  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        x: 0.3,
        y: 0.6
      },
      colors: ['#2AABE2', '#A5CF4C', '#FFD700', '#FF69B4']
    });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        x: 0.7,
        y: 0.6
      },
      colors: ['#2AABE2', '#A5CF4C', '#FFD700', '#FF69B4']
    });
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: {
          x: 0.5,
          y: 0.5
        },
        colors: ['#2AABE2', '#A5CF4C', '#FFD700', '#FF69B4', '#9b87f5']
      });
    }, 200);
  };
  const handleComplete = () => {
    fireConfetti();
    setTimeout(() => {
      onComplete({
        userName: userName || initialUserName,
        assistantName,
        interestTopics,
        toneStyle,
        answerLength,
        allowWebSearch,
        allowFollowUpQuestions
      });
    }, 800);
  };
  const handleSkipAll = () => {
    onSkip();
  };

  // 스텝별 콘텐츠 렌더링
  const renderStepContent = () => {
    switch (step) {
      // STEP 1: 첫 인사
      case "greeting":
        return <div className="flex flex-col items-center gap-8 py-8">
            <MascotCharacter emotion="wave" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-500" />
            <MessageBubble>
              반가워요! 👋<br />
              놓치기 쉬운 업무까지 먼저 알려주는 업무 비서,<br />
              <strong className="text-primary">이수 GPT</strong>예요.
            </MessageBubble>
            <ChoiceButtons choices={[{
            label: "다음",
            value: "next"
          }]} onSelect={() => setStep("intro-ask")} />
          </div>;

      // STEP 2: 소개 여부 묻기
      case "intro-ask":
        return <div className="flex flex-col items-center gap-8 py-8">
            <MascotCharacter emotion="thinking" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-500" />
            <MessageBubble>
              저에 대해서 조금 알려드려도 될까요?
            </MessageBubble>
            <ChoiceButtons choices={[{
            label: "괜찮아",
            value: "skip",
            variant: "secondary"
          }, {
            label: "알려줘",
            value: "show"
          }]} onSelect={value => setStep(value === "skip" ? "intro-skip" : "intro-show-1")} />
          </div>;

      // STEP 2-1: 괜찮아 선택
      case "intro-skip":
        return <div className="flex flex-col items-center gap-8 py-8">
            <MascotCharacter emotion="happy" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-500" />
            <MessageBubble>
              알겠어요 🙂<br />
              이수 GPT가 궁금해질 때 언제든 다시 말씀해 주세요!
            </MessageBubble>
            <ChoiceButtons choices={[{
            label: "다음",
            value: "next"
          }]} onSelect={() => setStep("user-info-ask")} />
          </div>;

      // STEP 2-2: 알려줘 선택 - 이수 GPT 소개 (1/2)
      case "intro-show-1":
        return <div className="flex flex-col items-center gap-6 py-8">
            <MascotCharacter emotion="excited" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-500" />
            <MessageBubble>
              저는 일반 상식뿐만 아니라<br />
              <strong className="text-primary">사규와 생활 가이드</strong> 등 사내 정보까지 알고 있어요.<br />
              그래서 업무 중 생기는 다양한 궁금증을 도와드릴 수 있어요.
            </MessageBubble>
            <ChoiceButtons choices={[{
            label: "이전",
            value: "back",
            variant: "secondary"
          }, {
            label: "다음",
            value: "next"
          }]} onSelect={value => {
            if (value === "back") {
              setStep("intro-ask");
            } else {
              setStep("intro-show-2");
            }
          }} delay={300} />
          </div>;

      // STEP 2-2: 알려줘 선택 - 이수 GPT 소개 (2/2)
      case "intro-show-2":
        return <div className="flex flex-col items-center gap-6 py-8">
            <MascotCharacter emotion="happy" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-500" />
            <MessageBubble>
              단순히 질문에 답만 하는 AI가 아니라,<br />
              여러분을 먼저 생각하고 함께 소통하는<br />
              <strong className="text-primary">친구 같은 업무 비서</strong>를 목표로 하고 있어요. 💙
            </MessageBubble>
            <ChoiceButtons choices={[{
            label: "이전",
            value: "back",
            variant: "secondary"
          }, {
            label: "다음",
            value: "next"
          }]} onSelect={value => {
            if (value === "back") {
              setStep("intro-show-1");
            } else {
              setStep("intro-show-3");
            }
          }} delay={300} />
          </div>;

      // STEP 2-2: 이미지 생성 소개
      case "intro-show-3":
        return <div className="flex flex-col items-center gap-6 py-8">
            <MascotCharacter emotion="excited" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-500" />
            <MessageBubble>
              텍스트 답변뿐만 아니라<br />
              <strong className="text-primary">이미지 생성</strong>도 할 수 있어요! 🎨<br />
              원하는 이미지를 말로 설명해 주시면 만들어 드릴게요.
            </MessageBubble>
            <ChoiceButtons choices={[{
            label: "이전",
            value: "back",
            variant: "secondary"
          }, {
            label: "다음",
            value: "next"
          }]} onSelect={value => {
            if (value === "back") {
              setStep("intro-show-2");
            } else {
              setStep("intro-show-4");
            }
          }} delay={300} />
          </div>;

      // STEP 2-2: 모바일 호환 소개
      case "intro-show-4":
        return <div className="flex flex-col items-center gap-6 py-8">
            <MascotCharacter emotion="happy" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-500" />
            <MessageBubble>
              PC뿐만 아니라 <strong className="text-primary">모바일</strong>에서도<br />
              동일하게 사용할 수 있어요! 📱<br />
              언제 어디서든 편하게 이용해 주세요.
            </MessageBubble>
            <ChoiceButtons choices={[{
            label: "이전",
            value: "back",
            variant: "secondary"
          }, {
            label: "화면 둘러보기 🚀",
            value: "start-guide"
          }]} onSelect={value => {
            if (value === "back") {
              setStep("intro-show-3");
            } else if (onStartGuide) {
              onStartGuide();
            } else {
              setStep("user-info-ask");
            }
          }} delay={300} />
          </div>;

      // STEP 3: 사용자 정보 설정 여부
      case "user-info-ask":
        return <div className="flex flex-col items-center gap-8 py-8">
            <MascotCharacter emotion="happy" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-500" />
            <MessageBubble>
              이제 <strong className="text-primary">박{initialUserName}님</strong>에 대해서도 알려주실래요?
            </MessageBubble>
            <ChoiceButtons choices={[{
            label: "싫어",
            value: "skip",
            variant: "secondary"
          }, {
            label: "좋아",
            value: "settings"
          }]} onSelect={value => setStep(value === "skip" ? "user-info-skip" : "user-info-settings")} />
          </div>;

      // STEP 3-1: 싫어 선택 - 바로 시작
      case "user-info-skip":
        return <div className="flex flex-col items-center gap-8 py-8">
            <MascotCharacter emotion="happy" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-500" />
            <MessageBubble>
              괜찮아요 🙂<br />
              이제 이수 GPT를 바로 사용하실 수 있어요.<br />
              앞으로 <strong className="text-primary">{initialUserName}님</strong>이 놓치는 업무가 없도록 최선을 다할게요!
            </MessageBubble>
            <ChoiceButtons choices={[{
            label: "시작하기 🚀",
            value: "complete"
          }]} onSelect={handleComplete} />
          </div>;

      // STEP 3-2: 좋아 선택 - 설정 시작 안내
      case "user-info-settings":
        return <div className="flex flex-col items-center gap-8 py-8">
            <MascotCharacter emotion="excited" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-500" />
            <MessageBubble>
              좋아요! 몇 가지만 알려주시면<br />
              더 잘 도와드릴 수 있어요 😊
            </MessageBubble>
            <ChoiceButtons choices={[{
            label: "시작하기",
            value: "next"
          }]} onSelect={() => setStep("settings-name")} />
          </div>;

      // 설정: 호칭
      case "settings-name":
        return <div className="flex flex-col items-center gap-6 py-6">
            <MascotCharacter emotion="thinking" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-300" />
            <MessageBubble>
              어떻게 불러드릴까요?
            </MessageBubble>
            <div className="w-full max-w-sm px-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300" style={{
            animationDelay: "200ms"
          }}>
              <Input value={userName} onChange={e => setUserName(e.target.value)} placeholder={`예: ${initialUserName}님, 경민씨, 박과장님...`} className="w-full text-center text-lg py-4 rounded-xl border-2 border-primary/30 focus:border-primary bg-white/80" onKeyDown={e => e.key === "Enter" && setStep("settings-tone")} autoFocus />
            </div>
            <ChoiceButtons choices={[{
            label: "건너뛰기",
            value: "skip",
            variant: "secondary"
          }, {
            label: "다음",
            value: "next"
          }]} onSelect={() => setStep("settings-interests")} delay={300} />
          </div>;

      // 설정: 관심 주제
      case "settings-interests":
        return <div className="flex flex-col items-center gap-6 py-6">
            <MascotCharacter emotion="excited" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-300" />
            <MessageBubble>
              📰 어떤 분야에 관심 있으세요?<br />
              맞춤 뉴스를 알려드릴게요!
            </MessageBubble>
            <div className="grid grid-cols-2 gap-2 px-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" style={{
            animationDelay: "200ms"
          }}>
              {topicOptions.map((topic, idx) => <button key={topic.id} onClick={() => handleTopicToggle(topic.id)} className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all hover:scale-105", interestTopics.includes(topic.id) ? "border-primary bg-primary/10 shadow-md" : "border-gray-200 bg-white/80 hover:border-primary/50")} style={{
              animationDelay: `${300 + idx * 80}ms`
            }}>
                  <span className="text-xl">{topic.emoji}</span>
                  <span className={cn("text-sm font-medium", interestTopics.includes(topic.id) ? "text-primary" : "text-gray-700")}>
                    {topic.label}
                  </span>
                </button>)}
            </div>
            <p className="text-xs text-gray-500">여러 개 선택할 수 있어요! ✨</p>
            <ChoiceButtons choices={[{
            label: "건너뛰기",
            value: "skip",
            variant: "secondary"
          }, {
            label: "다음",
            value: "next"
          }]} onSelect={() => setStep("settings-tone")} delay={400} />
          </div>;

      // 설정: 말투
      case "settings-tone":
        return <div className="flex flex-col items-center gap-6 py-6">
            <MascotCharacter emotion="happy" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-300" />
            <MessageBubble>
              어떤 말투가 좋으세요?
            </MessageBubble>
            <div className="flex flex-wrap gap-3 justify-center px-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" style={{
            animationDelay: "200ms"
          }}>
              {toneOptions.map((option, idx) => <button key={option.id} onClick={() => setToneStyle(option.id)} className={cn("flex items-center gap-2 px-5 py-3 rounded-xl border-2 transition-all hover:scale-105", toneStyle === option.id ? "border-primary bg-primary/10 shadow-md" : "border-gray-200 bg-white/80 hover:border-primary/50")} style={{
              animationDelay: `${300 + idx * 80}ms`
            }}>
                  <span className="text-xl">{option.emoji}</span>
                  <span className={cn("text-base font-medium", toneStyle === option.id ? "text-primary" : "text-gray-700")}>
                    {option.label}
                  </span>
                </button>)}
            </div>
            <ChoiceButtons choices={[{
            label: "건너뛰기",
            value: "skip",
            variant: "secondary"
          }, {
            label: "다음",
            value: "next"
          }]} onSelect={() => setStep("settings-length")} delay={400} />
          </div>;

      // 설정: 답변 길이
      case "settings-length":
        return <div className="flex flex-col items-center gap-6 py-6">
            <MascotCharacter emotion="happy" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-300" />
            <MessageBubble>
              답변 길이는요?
            </MessageBubble>
            <div className="flex bg-white/80 rounded-full p-1.5 shadow-md motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" style={{
            animationDelay: "200ms"
          }}>
              {lengthOptions.map(option => <button key={option.id} onClick={() => setAnswerLength(option.id)} className={cn("px-6 py-3 text-base font-medium rounded-full transition-all", answerLength === option.id ? "bg-primary text-primary-foreground shadow-sm" : "text-gray-600 hover:text-gray-800")}>
                  {option.label}
                </button>)}
            </div>
            <ChoiceButtons choices={[{
            label: "건너뛰기",
            value: "skip",
            variant: "secondary"
          }, {
            label: "다음",
            value: "next"
          }]} onSelect={() => setStep("settings-websearch")} delay={300} />
          </div>;

      // 설정: 자동 웹 검색
      case "settings-websearch":
        return <div className="flex flex-col items-center gap-6 py-6">
            <MascotCharacter emotion="thinking" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-300" />
            <MessageBubble>
              필요할 때 자동으로 웹 검색할까요?
            </MessageBubble>
            <div className="flex gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" style={{
            animationDelay: "200ms"
          }}>
              <button onClick={() => setAllowWebSearch(true)} className={cn("flex flex-col items-center gap-2 px-8 py-4 rounded-xl border-2 transition-all hover:scale-105", allowWebSearch ? "border-primary bg-primary/10 shadow-md" : "border-gray-200 bg-white/80 hover:border-primary/50")}>
                <span className="text-3xl">🌐</span>
                <span className={cn("font-medium", allowWebSearch ? "text-primary" : "text-gray-700")}>ON</span>
              </button>
              <button onClick={() => setAllowWebSearch(false)} className={cn("flex flex-col items-center gap-2 px-8 py-4 rounded-xl border-2 transition-all hover:scale-105", !allowWebSearch ? "border-primary bg-primary/10 shadow-md" : "border-gray-200 bg-white/80 hover:border-primary/50")}>
                <span className="text-3xl">🔒</span>
                <span className={cn("font-medium", !allowWebSearch ? "text-primary" : "text-gray-700")}>OFF</span>
              </button>
            </div>
            <ChoiceButtons choices={[{
            label: "건너뛰기",
            value: "skip",
            variant: "secondary"
          }, {
            label: "다음",
            value: "next"
          }]} onSelect={() => setStep("settings-recommend")} delay={300} />
          </div>;

      // 설정: 다음 질문 추천
      case "settings-recommend":
        return <div className="flex flex-col items-center gap-6 py-6">
            <MascotCharacter emotion="happy" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-300" />
            <MessageBubble>
              대화 중 다음 질문을 추천해드릴까요?
            </MessageBubble>
            <div className="flex gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" style={{
            animationDelay: "200ms"
          }}>
              <button onClick={() => setAllowFollowUpQuestions(true)} className={cn("flex flex-col items-center gap-2 px-8 py-4 rounded-xl border-2 transition-all hover:scale-105", allowFollowUpQuestions ? "border-primary bg-primary/10 shadow-md" : "border-gray-200 bg-white/80 hover:border-primary/50")}>
                <span className="text-3xl">💡</span>
                <span className={cn("font-medium", allowFollowUpQuestions ? "text-primary" : "text-gray-700")}>ON</span>
              </button>
              <button onClick={() => setAllowFollowUpQuestions(false)} className={cn("flex flex-col items-center gap-2 px-8 py-4 rounded-xl border-2 transition-all hover:scale-105", !allowFollowUpQuestions ? "border-primary bg-primary/10 shadow-md" : "border-gray-200 bg-white/80 hover:border-primary/50")}>
                <span className="text-3xl">🤫</span>
                <span className={cn("font-medium", !allowFollowUpQuestions ? "text-primary" : "text-gray-700")}>OFF</span>
              </button>
            </div>
            <ChoiceButtons choices={[{
            label: "완료",
            value: "complete"
          }]} onSelect={() => setStep("complete")} delay={300} />
          </div>;

      // 완료
      case "complete":
        return <div className="flex flex-col items-center gap-8 py-8">
            <MascotCharacter emotion="excited" className="motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-500" />
            <MessageBubble>
              설정이 완료됐어요! 🎉<br />
              이제 이수 GPT를 사용하실 수 있어요.<br />
              앞으로 <strong className="text-primary">{userName || initialUserName}님</strong>이 놓치는 업무가 없도록 최선을 다할게요!
            </MessageBubble>
            <ChoiceButtons choices={[{
            label: "시작하기 🚀",
            value: "start"
          }]} onSelect={handleComplete} />
          </div>;
      default:
        return null;
    }
  };

  // 뒤로가기 가능 여부 체크
  const canGoBack = step !== "greeting";

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    const backMap: Record<TutorialStep, TutorialStep> = {
      "greeting": "greeting",
      "intro-ask": "greeting",
      "intro-skip": "intro-ask",
      "intro-show-1": "intro-ask",
      "intro-show-2": "intro-show-1",
      "intro-show-3": "intro-show-2",
      "intro-show-4": "intro-show-3",
      "user-info-ask": step === "intro-skip" ? "intro-skip" : "intro-show-4",
      "user-info-skip": "user-info-ask",
      "user-info-settings": "user-info-ask",
      "settings-name": "user-info-settings",
      "settings-interests": "settings-name",
      "settings-tone": "settings-interests",
      "settings-length": "settings-tone",
      "settings-websearch": "settings-length",
      "settings-recommend": "settings-websearch",
      "complete": "settings-recommend"
    };
    setStep(backMap[step] || "greeting");
  };
  return <Dialog open={open}>
      <DialogContent
        className="sm:max-w-2xl w-[95vw] overflow-hidden p-0 border-none bg-gradient-to-b from-sky-50 via-sky-100/50 to-white"
        style={{
          // 작은 화면에서 모달이 뷰포트를 넘어가며 겹치지 않도록 안전장치
          height: "min(560px, calc(100vh - 2rem))",
        }}
        aria-describedby={undefined}
        overlayClassName="bg-black/40"
      >
        <VisuallyHidden>
          <DialogTitle>이수 GPT 튜토리얼</DialogTitle>
        </VisuallyHidden>

        <div className="relative flex h-full flex-col">
        
        {/* 뒤로가기 버튼 */}
        {canGoBack && <button onClick={handleGoBack} className="absolute top-4 left-4 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 text-sm font-medium transition-all shadow-sm hover:shadow">
            <ChevronLeft className="w-4 h-4" />
            이전
          </button>}
        
        {/* 닫기/건너뛰기 버튼 */}
        <button onClick={handleSkipAll} className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 text-sm font-medium transition-all shadow-sm hover:shadow">
          건너뛰기
          <X className="w-4 h-4" />
        </button>
        
          {/* 메인 콘텐츠 영역 */}
          <div
            ref={contentRef}
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-6 py-4 flex flex-col",
              // 상단 absolute 버튼들과 겹치지 않도록 여유
              "pt-14",
            )}
          >
            {renderStepContent()}
          </div>

          {/* 목차 네비게이션 (footer로 분리: 스크롤 영역과 겹치지 않게) */}
          <div className="shrink-0 pb-4 flex justify-center">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
              {stepPhases.map((phase, idx) => {
                const currentPhaseIndex = getPhaseIndex(step);
                const isActive = idx === currentPhaseIndex;
                const isPast = idx < currentPhaseIndex;
                const isClickable = idx <= currentPhaseIndex; // 이전 단계만 클릭 가능

                return (
                  <button
                    key={phase.id}
                    onClick={() => {
                      if (isClickable && !isActive) {
                        setStep(getPhaseFirstStep(idx));
                      }
                    }}
                    disabled={!isClickable}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300",
                      isActive && "bg-primary text-white",
                      isPast && "text-primary hover:bg-primary/10 cursor-pointer",
                      !isClickable && "text-gray-300 cursor-not-allowed",
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isActive ? "bg-white" : isPast ? "bg-primary" : "bg-gray-300",
                      )}
                    />
                    {phase.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}