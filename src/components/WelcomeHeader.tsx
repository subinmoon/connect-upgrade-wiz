import { useState, useEffect } from "react";
import logoIcon from "@/assets/logo-icon.png";
import { MessageSquare, Sparkles, Mail, TrendingUp, Languages, ListTree } from "lucide-react";

interface WelcomeHeaderProps {
  userName?: string;
  onSelectAction?: (promptTemplate: string) => void;
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
    icon: <MessageSquare className="w-4 h-4" />,
    label: "문서/회의요약",
    iconColor: "text-primary",
    promptTemplate: "다음 내용을 요약해주세요:\n\n[여기에 문서나 회의 내용을 붙여넣으세요]",
  },
  {
    id: "brainstorm",
    icon: <Sparkles className="w-4 h-4" />,
    label: "브레인스토밍",
    iconColor: "text-amber-500",
    promptTemplate: "다음 주제에 대해 브레인스토밍을 도와주세요:\n\n주제: [주제를 입력하세요]\n목적: [브레인스토밍의 목적을 입력하세요]",
  },
  {
    id: "email",
    icon: <Mail className="w-4 h-4" />,
    label: "메일/문자 초안",
    iconColor: "text-rose-500",
    promptTemplate: "다음 조건에 맞는 메일/문자 초안을 작성해주세요:\n\n받는 사람: [예: 팀장님, 고객사 담당자]\n목적: [예: 회의 일정 조율, 프로젝트 진행 상황 공유]\n주요 내용: [전달하고 싶은 핵심 내용]\n톤앤매너: [예: 공식적, 친근한, 정중한]",
  },
  {
    id: "market",
    icon: <TrendingUp className="w-4 h-4" />,
    label: "시장 동향 조사",
    iconColor: "text-emerald-500",
    promptTemplate: "다음 주제에 대한 시장 동향을 조사해주세요:\n\n산업/분야: [예: AI, 핀테크, 헬스케어]\n관심 키워드: [예: 최신 트렌드, 경쟁사 분석, 시장 규모]",
  },
  {
    id: "translate",
    icon: <Languages className="w-4 h-4" />,
    label: "번역 요청",
    iconColor: "text-blue-500",
    promptTemplate: "다음 내용을 번역해주세요:\n\n원본 언어: [예: 영어]\n번역할 언어: [예: 한국어]\n\n[번역할 내용을 여기에 붙여넣으세요]",
  },
  {
    id: "structure",
    icon: <ListTree className="w-4 h-4" />,
    label: "텍스트 구조화",
    iconColor: "text-violet-500",
    promptTemplate: "다음 내용을 구조화해주세요:\n\n[정리가 필요한 텍스트를 여기에 붙여넣으세요]\n\n원하는 형식: [예: 목록, 표, 마인드맵 형태, 개요]",
  },
];

const greetingMessages = [
  "무엇이 궁금하세요?",
  "도와드릴까요?",
  "오늘도 화이팅! 💪",
  "좋은 하루 되세요! ☀️",
  "질문해 주세요!",
  "반갑습니다! ✨",
];

const WelcomeHeader = ({ userName = "이수", onSelectAction }: WelcomeHeaderProps) => {
  const [greeting, setGreeting] = useState("");

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
    <div className="w-full">
      {/* Welcome Message */}
      <div className="flex items-center gap-4 mb-4">
        <img src={logoIcon} alt="Logo" className="w-12 h-12" />
        <h1 className="text-2xl font-bold text-foreground">
          <span className="text-gradient-name">{userName}</span>님, {greeting}
        </h1>
      </div>

      {/* Quick Actions - Full labels (wide screens) */}
      <div className="hidden lg:flex gap-2" data-guide="quick-actions">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="flex-1 min-w-0 bg-card border border-border rounded-full py-2 px-3 flex items-center justify-center gap-1.5 transition-all duration-200 hover:shadow-soft hover:bg-muted/50 active:scale-[0.98]"
          >
            <div className={`shrink-0 ${action.iconColor}`}>
              {action.icon}
            </div>
            <span className="text-sm font-medium text-foreground truncate">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Quick Actions - Compact (narrow screens) */}
      <div className="flex lg:hidden gap-1.5" data-guide="quick-actions">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="flex-1 min-w-0 bg-card border border-border rounded-xl py-2 px-1.5 flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:shadow-soft hover:bg-muted/50 active:scale-[0.98]"
          >
            <div className={`${action.iconColor}`}>
              {action.icon}
            </div>
            <span className="text-[10px] font-medium text-foreground truncate max-w-full">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeHeader;
