import { Star, ArrowRight, TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ko } from "date-fns/locale";

interface InterestItem {
  id: string;
  title: string;
  description: string;
  date?: string;
}

// 실제 대화 이력이 있을 때 표시할 데이터
const interests: InterestItem[] = [
  {
    id: "1",
    title: "복지카드 발급",
    description: "복지카드 발급 방법에 대한 궁금증이 다 해결되었나요?",
    date: "2025-01-18",
  },
  {
    id: "2",
    title: "출장 신청 방법",
    description: "출장 신청은 잘 되었나요? 더 궁금한게 있으신가요?",
    date: "2025-01-17",
  },
];

// 첫 진입 시 표시할 인기 질문 (다른 임직원들이 자주 묻는 질문)
const popularQuestions: InterestItem[] = [
  {
    id: "1",
    title: "휴가 신청 방법",
    description: "다른 임직원들이 가장 많이 물어본 질문이에요!",
  },
  {
    id: "2",
    title: "복지 포인트 사용처",
    description: "복지 포인트 어디서 쓸 수 있는지 궁금하시죠?",
  },
];

interface RecentInterestsProps {
  hasHistory?: boolean;
  onQuestionClick?: (question: string) => void;
}

const RecentInterests = ({ hasHistory = false, onQuestionClick }: RecentInterestsProps) => {
  const displayItems = hasHistory ? interests : popularQuestions;
  const title = hasHistory ? "최근 관심사를 이어서 도와드릴까요?" : "다른 임직원들은 이런걸 자주 물어봐요!";
  const icon = hasHistory ? <Star className="w-3.5 h-3.5 text-primary" /> : <TrendingUp className="w-3.5 h-3.5 text-primary" />;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-lavender-light flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-base font-bold text-foreground flex-1">{title}</h2>
        <button
          onClick={() => window.location.reload()}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          title="새로고침"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="space-y-2">
        {displayItems.map((item) => {
          const formatDate = (dateStr?: string) => {
            if (!dateStr) return null;
            const date = parseISO(dateStr);
            if (isToday(date)) return "오늘";
            if (isYesterday(date)) return "어제";
            return format(date, "M월 d일", { locale: ko });
          };

          return (
            <div 
              key={item.id} 
              className="bg-blue-light rounded-xl p-3 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                    {item.date && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-white/60 px-1.5 py-0.5 rounded-full">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatDate(item.date)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <Button
                  size="sm"
                  className="shrink-0 bg-primary hover:bg-lavender-dark text-primary-foreground gap-0.5 rounded-full px-3 h-7 text-[11px]"
                  onClick={() => onQuestionClick?.(item.title)}
                >
                  질문하기
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentInterests;
