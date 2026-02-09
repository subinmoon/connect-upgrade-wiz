import { useCallback, useLayoutEffect, useRef, useState, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuideStep {
  id: string;
  selector: string; // DOM 선택자
  bubblePosition: "top" | "bottom" | "left" | "right"; // 말풍선이 캐릭터 기준 어디에 위치
  mascotPosition?: "top" | "bottom" | "left" | "right"; // 마스코트가 하이라이트 기준 어디에 위치 (없으면 bubblePosition 반대)
  message: string;
  padding?: number; // 하이라이트 패딩
}

type Placement = "left" | "right" | "top" | "bottom";

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

const getPreferredPlacement = (step: GuideStep): Placement => {
  // mascotPosition이 명시되어 있으면 그대로 사용 (마스코트가 하이라이트 기준 해당 위치에)
  if (step.mascotPosition) {
    return step.mascotPosition;
  }
  // 없으면 bubblePosition의 반대 방향 (기존 동작)
  switch (step.bubblePosition) {
    case "left":
      return "right";
    case "right":
      return "left";
    case "top":
      return "bottom";
    case "bottom":
      return "top";
    default:
      return "bottom";
  }
};

// 가이드 스텝 - DOM 선택자 기반
const guideSteps: GuideStep[] = [
  {
    id: "sidebar",
    selector: "[data-guide='sidebar']",
    bubblePosition: "right",
    message: "여기는 사이드바예요! 🗂️\n새 채팅을 시작하거나\n이전 대화를 찾을 수 있어요.",
    padding: 0,
  },
  {
    id: "header",
    selector: "[data-guide='header']",
    bubblePosition: "bottom",
    message: "🔔 상단 헤더에서 홈으로 이동하거나\n즐겨찾기, 알림을 확인할 수 있어요!",
    padding: 4,
  },
  {
    id: "quick-actions",
    selector: "[data-guide='quick-actions']",
    bubblePosition: "bottom",
    message: "⚡ 빠른 시작 버튼들이에요!\n자주 사용하는 작업을\n한 번의 클릭으로 시작할 수 있어요.",
    padding: 8,
  },
  {
    id: "work-life-helper",
    selector: "[data-guide='work-life-helper']",
    bubblePosition: "right",
    message: "🏢 회사생활도우미예요!\n결재, 회의실, 식단 조회 등\n자주 쓰는 기능을 모아뒀어요.",
    padding: 8,
  },
  {
    id: "popular-questions",
    selector: "[data-guide='popular-questions']",
    bubblePosition: "right",
    message: "💬 다른 임직원들이 자주 묻는\n인기 질문들이에요!\n클릭하면 바로 질문할 수 있어요.",
    padding: 8,
  },
  {
    id: "daily-check",
    selector: "[data-guide='daily-check']",
    bubblePosition: "left",
    message: "✨ AI 데일리 체크예요!\nAI가 오늘의 일정과 관심 뉴스를\n미리 챙겨서 알려드려요.",
    padding: 8,
  },
  {
    id: "chat-input",
    selector: "[data-guide='chat-input']",
    bubblePosition: "right",
    mascotPosition: "top",
    message: "💬 여기에 질문을 입력하세요!\nAI 모델을 선택하고\n답변 길이도 조절할 수 있어요.",
    padding: 8,
  },
];

interface TutorialGuideOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

// 마스코트 캐릭터
const MascotCharacter = forwardRef<HTMLDivElement, { emotion?: "happy" | "excited" }>(
  ({ emotion = "happy" }, ref) => {
    return (
      <div ref={ref} className="relative w-16 h-16 flex-shrink-0">
        {/* 그림자 */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/15 rounded-[100%] blur-sm" />
        
        {/* 메인 바디 */}
        <div className={cn(
          "relative w-16 h-16 transition-transform duration-300",
          emotion === "excited" && "animate-[wiggle_0.5s_ease-in-out_infinite]"
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#3BB8E8] via-[#2AABE2] to-[#1A8BC2] rounded-2xl shadow-lg overflow-hidden">
            {/* 광택 */}
            <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-white/40 rounded-full blur-md" />
            <div className="absolute top-2 left-3 w-2 h-2 bg-white/60 rounded-full" />
          </div>
          
          {/* 눈 */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-2.5">
            <div className="w-3.5 h-4 bg-white rounded-full shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-gray-800 rounded-full relative">
                <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-white rounded-full" />
              </div>
            </div>
            <div className="w-3.5 h-4 bg-white rounded-full shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-gray-800 rounded-full relative">
                <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-white rounded-full" />
              </div>
            </div>
          </div>
          
          {/* 볼터치 */}
          <div className="absolute top-9 left-1.5 w-2.5 h-1.5 bg-pink-400/40 rounded-full blur-[1px]" />
          <div className="absolute top-9 right-1.5 w-2.5 h-1.5 bg-pink-400/40 rounded-full blur-[1px]" />
          
          {/* 입 */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            {emotion === "happy" ? (
              <div className="w-5 h-2.5 border-b-2 border-white rounded-b-full" />
            ) : (
              <div className="w-6 h-4 bg-white/90 rounded-full flex items-center justify-center">
                <div className="w-3 h-2 bg-pink-300 rounded-full" />
              </div>
            )}
          </div>
          
          {/* 반짝이 (excited) */}
          {emotion === "excited" && (
            <>
              <div className="absolute -top-1 -right-1 animate-[sparkle_1s_ease-in-out_infinite]">
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </div>
              <div className="absolute -top-0.5 -left-2 animate-[sparkle_1s_ease-in-out_infinite_0.3s]">
                <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);
MascotCharacter.displayName = "MascotCharacter";

// 말풍선 컴포넌트
function SpeechBubble({ 
  children, 
  tailPosition = "left"
}: { 
  children: React.ReactNode; 
  tailPosition?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <div className="relative bg-white rounded-2xl px-4 py-3 shadow-xl min-w-[180px] max-w-[260px] animate-in fade-in zoom-in-95 duration-300">
      {/* 말풍선 꼬리 */}
      {tailPosition === "left" && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
          <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-r-[10px] border-t-transparent border-b-transparent border-r-white" />
        </div>
      )}
      {tailPosition === "right" && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
          <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[10px] border-t-transparent border-b-transparent border-l-white" />
        </div>
      )}
      {tailPosition === "top" && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-white" />
        </div>
      )}
      {tailPosition === "bottom" && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-white" />
        </div>
      )}
      
      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line font-medium text-center">
        {children}
      </p>
    </div>
  );
}

export const TutorialGuideOverlay = forwardRef<HTMLDivElement, TutorialGuideOverlayProps>(
  ({ onComplete, onSkip }, ref) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [anchoredPos, setAnchoredPos] = useState<{ left: number; top: number } | null>(null);
    const [highlightRect, setHighlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const floatingRef = useRef<HTMLDivElement | null>(null);
    const highlightRef = useRef<HTMLDivElement | null>(null);

    // 안전한 step 접근 (범위 체크)
    const safeCurrentStep = Math.min(currentStep, guideSteps.length - 1);
    const step = guideSteps[safeCurrentStep];
    const isLastStep = safeCurrentStep === guideSteps.length - 1;
    
    // step이 없으면 렌더링하지 않음
    if (!step) return null;

    const preferredPlacement = getPreferredPlacement(step);

    // DOM 요소의 위치를 계산하는 함수
    const computeHighlightRect = useCallback(() => {
      const targetEl = document.querySelector(step.selector);
      if (!targetEl) return;

      const rect = targetEl.getBoundingClientRect();
      const padding = step.padding ?? 0;
      
      setHighlightRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    }, [step.selector, step.padding]);

    const computeAnchoredPos = useCallback(() => {
      const floatingEl = floatingRef.current;
      const highlightEl = highlightRef.current;
      if (!floatingEl || !highlightEl || !highlightRect) return;

      const floatingRect = floatingEl.getBoundingClientRect();

      const gap = 16;
      const pad = 12;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const centerX = highlightRect.left + highlightRect.width / 2;
      const centerY = highlightRect.top + highlightRect.height / 2;

      const placements: Placement[] = [
        preferredPlacement,
        ...(["left", "right", "top", "bottom"] as const).filter(
          (p) => p !== preferredPlacement
        ),
      ];

      const candidates = placements.map((placement) => {
        let left = centerX;
        let top = centerY;

        switch (placement) {
          case "right":
            left = highlightRect.left + highlightRect.width + gap;
            top = centerY - floatingRect.height / 2;
            break;
          case "left":
            left = highlightRect.left - gap - floatingRect.width;
            top = centerY - floatingRect.height / 2;
            break;
          case "bottom":
            left = centerX - floatingRect.width / 2;
            top = highlightRect.top + highlightRect.height + gap;
            break;
          case "top":
            left = centerX - floatingRect.width / 2;
            top = highlightRect.top - gap - floatingRect.height;
            break;
        }

        const fits =
          left >= pad &&
          top >= pad &&
          left + floatingRect.width <= vw - pad &&
          top + floatingRect.height <= vh - pad;

        return { placement, left, top, fits };
      });

      const best = candidates.find((c) => c.fits) ?? candidates[0];
      const left = clamp(best.left, pad, vw - pad - floatingRect.width);
      const top = clamp(best.top, pad, vh - pad - floatingRect.height);

      setAnchoredPos({ left, top });
    }, [preferredPlacement, highlightRect]);

    // 하이라이트 영역 계산
    useEffect(() => {
      setHighlightRect(null);
      setAnchoredPos(null);

      // DOM이 렌더링된 후 위치 계산
      const raf = requestAnimationFrame(() => {
        computeHighlightRect();
      });

      const onResize = () => computeHighlightRect();
      window.addEventListener("resize", onResize);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
      };
    }, [safeCurrentStep, computeHighlightRect]);

    // 하이라이트 위치가 계산된 후 마스코트 위치 계산
    useLayoutEffect(() => {
      if (!highlightRect) return;

      let raf1 = 0;
      let raf2 = 0;
      let timeoutId: number | undefined;

      const run = () => computeAnchoredPos();

      raf1 = window.requestAnimationFrame(() => {
        run();
        raf2 = window.requestAnimationFrame(run);
      });

      // 하이라이트 transition(500ms) 종료 이후 한번 더
      timeoutId = window.setTimeout(run, 520);

      const onResize = () => {
        computeHighlightRect();
        run();
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.cancelAnimationFrame(raf1);
        window.cancelAnimationFrame(raf2);
        if (timeoutId) window.clearTimeout(timeoutId);
        window.removeEventListener("resize", onResize);
      };
    }, [highlightRect, computeAnchoredPos, computeHighlightRect]);

    const handleNext = () => {
      if (isLastStep) {
        onComplete();
      } else {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setIsAnimating(false);
        }, 300);
      }
    };

    const handlePrev = () => {
      if (currentStep > 0) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStep(prev => prev - 1);
          setIsAnimating(false);
        }, 300);
      }
    };

    // 캐릭터와 말풍선의 flex 방향 결정
    const getFlexDirection = () => {
      switch (step.bubblePosition) {
        case "left": return "flex-row-reverse";
        case "right": return "flex-row";
        case "top": return "flex-col-reverse";
        case "bottom": return "flex-col";
        default: return "flex-row";
      }
    };

    // 말풍선 꼬리 방향 (캐릭터를 향함)
    const getTailPosition = () => {
      switch (step.bubblePosition) {
        case "left": return "right";
        case "right": return "left";
        case "top": return "bottom";
        case "bottom": return "top";
        default: return "left";
      }
    };

    return (
      <div ref={ref} className="fixed inset-0 z-[100]">
        {/* 반투명 오버레이 */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* 하이라이트 영역 */}
        {highlightRect && (
          <div 
            ref={highlightRef}
            className="absolute bg-transparent border-2 border-primary/60 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out z-[101]"
            style={{
              top: highlightRect.top,
              left: highlightRect.left,
              width: highlightRect.width,
              height: highlightRect.height,
            }}
          />
        )}
        
        {/* 캐릭터 + 말풍선 */}
        <div 
          ref={floatingRef}
          className={cn(
            "absolute z-[102] flex items-center gap-3 transition-all duration-500 ease-out",
            getFlexDirection(),
            // anchoredPos 계산 전에는 잠깐 숨겨서 하이라이트를 가리는 플래시를 방지
            !anchoredPos && "opacity-0",
            isAnimating && "opacity-0 scale-90"
          )}
          style={{
            left: anchoredPos?.left ?? 0,
            top: anchoredPos?.top ?? 0,
          }}
        >
          <MascotCharacter emotion={isLastStep ? "excited" : "happy"} />
          <SpeechBubble tailPosition={getTailPosition()}>
            {step.message}
          </SpeechBubble>
        </div>
        
        {/* 하단 컨트롤 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[103] flex items-center gap-6">
          {/* 진행 표시 */}
          <div className="flex gap-2">
            {guideSteps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  idx === currentStep 
                    ? "bg-primary w-6" 
                    : idx < currentStep 
                      ? "bg-primary/60" 
                      : "bg-white/40"
                )}
              />
            ))}
          </div>
          
          {/* 버튼들 */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              건너뛰기
            </Button>
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                이전
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 gap-1"
            >
              {isLastStep ? "완료! 🎉" : "다음"}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

TutorialGuideOverlay.displayName = "TutorialGuideOverlay";
