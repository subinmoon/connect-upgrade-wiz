import { useState, useEffect, useCallback } from "react";
import logoIcon from "@/assets/logo-icon.png";
import { MessageSquare, Sparkles, Mail, Languages, Zap, TrendingUp, ListTree, Menu, FileText } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface MobileWelcomeHeaderProps {
  userName?: string;
  onSelectAction?: (promptTemplate: string) => void;
  onOpenSidebar?: () => void;
}

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  iconColor: string;
  promptTemplate?: string;
}

const actions: QuickAction[] = [
  {
    id: "summary",
    icon: <MessageSquare className="w-5 h-5" />,
    label: "요약",
    iconColor: "text-primary",
    promptTemplate: "다음 내용을 요약해주세요:\n\n[여기에 문서나 회의 내용을 붙여넣으세요]",
  },
  {
    id: "brainstorm",
    icon: <Sparkles className="w-5 h-5" />,
    label: "아이디어",
    iconColor: "text-amber-600",
    promptTemplate: "다음 주제에 대해 브레인스토밍을 도와주세요:\n\n주제: [주제를 입력하세요]\n목적: [브레인스토밍의 목적을 입력하세요]",
  },
  {
    id: "email",
    icon: <Mail className="w-5 h-5" />,
    label: "메일",
    iconColor: "text-rose-600",
    promptTemplate: "다음 조건에 맞는 메일 초안을 작성해주세요:\n\n받는 사람: [예: 팀장님]\n목적: [예: 회의 일정 조율]\n주요 내용: [전달하고 싶은 핵심 내용]",
  },
  {
    id: "market",
    icon: <TrendingUp className="w-5 h-5" />,
    label: "시장조사",
    iconColor: "text-emerald-600",
    promptTemplate: "다음 주제에 대한 시장 동향을 조사해주세요:\n\n산업/분야: [예: AI, 핀테크, 헬스케어]\n관심 키워드: [예: 최신 트렌드, 경쟁사 분석, 시장 규모]",
  },
  {
    id: "translate",
    icon: <Languages className="w-5 h-5" />,
    label: "번역",
    iconColor: "text-blue-600",
    promptTemplate: "다음 내용을 번역해주세요:\n\n원본 언어: [예: 영어]\n번역할 언어: [예: 한국어]\n\n[번역할 내용을 여기에 붙여넣으세요]",
  },
  {
    id: "structure",
    icon: <ListTree className="w-5 h-5" />,
    label: "구조화",
    iconColor: "text-violet-600",
    promptTemplate: "다음 내용을 구조화해주세요:\n\n[정리가 필요한 텍스트를 여기에 붙여넣으세요]\n\n원하는 형식: [예: 목록, 표, 마인드맵 형태, 개요]",
  },
  {
    id: "report",
    icon: <FileText className="w-5 h-5" />,
    label: "보고서",
    iconColor: "text-orange-600",
    promptTemplate: "다음 내용을 바탕으로 보고서를 작성해주세요:\n\n주제: [보고서 주제]\n목적: [보고서 작성 목적]\n주요 내용: [포함할 핵심 내용]",
  },
];
const ITEMS_PER_PAGE = 6;

const greetingMessages = [
  "무엇이 궁금하세요?",
  "도와드릴까요?",
  "오늘도 화이팅! 💪",
  "좋은 하루 되세요! ☀️",
  "질문해 주세요!",
  "반갑습니다! ✨",
];

const MobileWelcomeHeader = ({ userName = "사용자", onSelectAction, onOpenSidebar }: MobileWelcomeHeaderProps) => {
  const [greeting, setGreeting] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const pages = [];
  for (let i = 0; i < actions.length; i += ITEMS_PER_PAGE) {
    pages.push(actions.slice(i, i + ITEMS_PER_PAGE));
  }

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * greetingMessages.length);
    setGreeting(greetingMessages[randomIndex]);
  }, []);

  const handleActionClick = (action: QuickAction) => {
    if (action.promptTemplate && onSelectAction) {
      onSelectAction(action.promptTemplate);
    }
  };

  return (
    <div className="w-full px-4 pt-2 pb-3">
      {/* Welcome Message */}
      <div className="flex items-center gap-2.5 mb-4">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 hover:bg-muted rounded-lg transition-colors -ml-1 shrink-0"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <img src={logoIcon} alt="Logo" className="w-10 h-10" />
        <h1 className="text-title text-foreground">
          <span className="text-gradient-name">{userName}</span>님, {greeting}
        </h1>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-card rounded-xl p-3 shadow-soft">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <h2 className="text-section-title text-foreground">빠른 시작</h2>
        </div>

        {pages.length > 1 ? (
          <>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {pages.map((page, pageIdx) => (
                  <div key={pageIdx} className="flex-[0_0_100%] min-w-0">
                    <div className="grid grid-cols-3 gap-2">
                      {page.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleActionClick(action)}
                          className="bg-[hsl(var(--background))] rounded-xl py-3 px-2 flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-[0.97]"
                        >
                          <span className={action.iconColor}>{action.icon}</span>
                          <span className="text-menu-label text-foreground whitespace-nowrap">
                            {action.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-1.5 mt-2">
              {pages.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === selectedIndex ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                  onClick={() => emblaApi?.scrollTo(idx)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className="bg-[hsl(var(--background))] rounded-xl py-3 px-2 flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-[0.97]"
              >
                <span className={action.iconColor}>{action.icon}</span>
                <span className="text-menu-label text-foreground whitespace-nowrap">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileWelcomeHeader;
