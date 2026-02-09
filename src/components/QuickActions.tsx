import { MessageSquare, Sparkles, Mail, TrendingUp, Languages, ListTree } from "lucide-react";

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
    label: "메일&메세지 초안",
    iconColor: "text-rose-500",
    promptTemplate: "다음 조건에 맞는 메일/메세지 초안을 작성해주세요:\n\n받는 사람: [예: 팀장님, 고객사 담당자]\n목적: [예: 회의 일정 조율, 프로젝트 진행 상황 공유]\n주요 내용: [전달하고 싶은 핵심 내용]\n톤앤매너: [예: 공식적, 친근한, 정중한]",
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

interface QuickActionsProps {
  onSelectAction?: (promptTemplate: string) => void;
}

const QuickActions = ({ onSelectAction }: QuickActionsProps) => {
  const handleActionClick = (action: QuickAction) => {
    if (action.promptTemplate && onSelectAction) {
      onSelectAction(action.promptTemplate);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
      <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
        <span>⚡</span>
        빠른 시작
      </h2>
      <div className="grid grid-cols-6 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="bg-blue-light rounded-xl py-3 px-4 flex items-center gap-3 transition-all duration-200 hover:shadow-soft hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className={`${action.iconColor} p-2 bg-white/80 rounded-lg`}>
              {action.icon}
            </div>
            <span className="text-sm font-medium text-foreground text-left">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
