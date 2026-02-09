import { useState, useEffect } from "react";
import logoIcon from "@/assets/logo-icon.png";
import { MessageSquare, Sparkles, Mail, TrendingUp, Languages, ListTree } from "lucide-react";

interface MobileWelcomeHeaderProps {
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
    label: "요약",
    iconColor: "text-primary",
    promptTemplate: "다음 내용을 요약해주세요:\n\n[여기에 문서나 회의 내용을 붙여넣으세요]",
  },
  {
    id: "brainstorm",
    icon: <Sparkles className="w-4 h-4" />,
    label: "아이디어",
    iconColor: "text-amber-500",
    promptTemplate: "다음 주제에 대해 브레인스토밍을 도와주세요:\n\n주제: [주제를 입력하세요]\n목적: [브레인스토밍의 목적을 입력하세요]",
  },
  {
    id: "email",
    icon: <Mail className="w-4 h-4" />,
    label: "메일",
    iconColor: "text-rose-500",
    promptTemplate: "다음 조건에 맞는 메일 초안을 작성해주세요:\n\n받는 사람: [예: 팀장님]\n목적: [예: 회의 일정 조율]\n주요 내용: [전달하고 싶은 핵심 내용]",
  },
  {
    id: "translate",
    icon: <Languages className="w-4 h-4" />,
    label: "번역",
    iconColor: "text-blue-500",
    promptTemplate: "다음 내용을 번역해주세요:\n\n원본 언어: [예: 영어]\n번역할 언어: [예: 한국어]\n\n[번역할 내용을 여기에 붙여넣으세요]",
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

      {/* Quick Actions - Horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="bg-card border border-border rounded-full py-2 px-4 flex items-center gap-2 transition-all duration-200 hover:shadow-soft active:scale-[0.98] shrink-0"
          >
            <div className={action.iconColor}>
              {action.icon}
            </div>
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileWelcomeHeader;
