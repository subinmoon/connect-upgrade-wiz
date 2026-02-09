import { useState, useEffect } from "react";
import logoIcon from "@/assets/logo-icon.png";
import { MessageSquare, Sparkles, Mail, Languages, Zap, TrendingUp, ListTree } from "lucide-react";

interface MobileWelcomeHeaderProps {
  userName?: string;
  onSelectAction?: (promptTemplate: string) => void;
}

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  iconColor: string;
  bgColor: string;
  promptTemplate?: string;
}

const actions: QuickAction[] = [
  {
    id: "summary",
    icon: <MessageSquare className="w-4 h-4" />,
    label: "요약",
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    promptTemplate: "다음 내용을 요약해주세요:\n\n[여기에 문서나 회의 내용을 붙여넣으세요]",
  },
  {
    id: "brainstorm",
    icon: <Sparkles className="w-4 h-4" />,
    label: "아이디어",
    iconColor: "text-amber-600",
    bgColor: "bg-amber-100",
    promptTemplate: "다음 주제에 대해 브레인스토밍을 도와주세요:\n\n주제: [주제를 입력하세요]\n목적: [브레인스토밍의 목적을 입력하세요]",
  },
  {
    id: "email",
    icon: <Mail className="w-4 h-4" />,
    label: "메일",
    iconColor: "text-rose-600",
    bgColor: "bg-rose-100",
    promptTemplate: "다음 조건에 맞는 메일 초안을 작성해주세요:\n\n받는 사람: [예: 팀장님]\n목적: [예: 회의 일정 조율]\n주요 내용: [전달하고 싶은 핵심 내용]",
  },
  {
    id: "market",
    icon: <TrendingUp className="w-4 h-4" />,
    label: "시장조사",
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-100",
    promptTemplate: "다음 주제에 대한 시장 동향을 조사해주세요:\n\n산업/분야: [예: AI, 핀테크, 헬스케어]\n관심 키워드: [예: 최신 트렌드, 경쟁사 분석, 시장 규모]",
  },
  {
    id: "translate",
    icon: <Languages className="w-4 h-4" />,
    label: "번역",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
    promptTemplate: "다음 내용을 번역해주세요:\n\n원본 언어: [예: 영어]\n번역할 언어: [예: 한국어]\n\n[번역할 내용을 여기에 붙여넣으세요]",
  },
  {
    id: "structure",
    icon: <ListTree className="w-4 h-4" />,
    label: "구조화",
    iconColor: "text-violet-600",
    bgColor: "bg-violet-100",
    promptTemplate: "다음 내용을 구조화해주세요:\n\n[정리가 필요한 텍스트를 여기에 붙여넣으세요]\n\n원하는 형식: [예: 목록, 표, 마인드맵 형태, 개요]",
  },
];

const greetingMessages = [
  "오늘은 무엇이 궁금하세요?",
  "무엇을 도와드릴까요?",
  "오늘 하루도 화이팅! 💪",
  "궁금한 것이 있으시면 물어보세요!",
  "좋은 하루 되세요! ☀️",
];

const MobileWelcomeHeader = ({ userName = "사용자", onSelectAction }: MobileWelcomeHeaderProps) => {
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
    <div className="w-full px-4 pt-4 pb-2">
      {/* Welcome Message - Compact for mobile */}
      <div className="flex items-center gap-3 mb-4">
        <img src={logoIcon} alt="Logo" className="w-10 h-10" />
        <div>
          <h1 className="text-lg font-bold text-foreground">
            <span className="text-gradient-name">{userName}</span>님
          </h1>
          <p className="text-sm text-muted-foreground">{greeting}</p>
        </div>
      </div>

      {/* Quick Actions - Card style like HRHelper */}
      <div className="bg-card rounded-2xl p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground">빠른 시작</h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-muted/60 transition-all group"
            >
              <div className={`w-9 h-9 rounded-xl ${action.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className={action.iconColor}>{action.icon}</span>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center whitespace-nowrap leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileWelcomeHeader;
