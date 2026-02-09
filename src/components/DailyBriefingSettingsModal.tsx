import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar, Newspaper, Palmtree, Plane, Heart, X } from "lucide-react";

interface DailyBriefingSettingsModalProps {
  open: boolean;
  onClose: () => void;
  scheduleFilters: string[];
  onScheduleFiltersChange: (filters: string[]) => void;
  interestTopics: string[];
  onInterestTopicsChange: (topics: string[]) => void;
}

const scheduleTypes = [
  { id: "vacation", label: "휴가", icon: Palmtree, color: "text-green-500" },
  { id: "business", label: "출장", icon: Plane, color: "text-blue-500" },
  { id: "anniversary", label: "기념일", icon: Heart, color: "text-pink-500" },
];

const topicOptions = [
  { id: "ai", label: "AI / 인공지능", emoji: "🤖" },
  { id: "cloud", label: "클라우드 / 보안", emoji: "☁️" },
  { id: "dev", label: "개발 / 프로그래밍", emoji: "💻" },
  { id: "business", label: "비즈니스 / 경영", emoji: "📊" },
  { id: "productivity", label: "생산성 / 협업", emoji: "⚡" },
  { id: "design", label: "디자인 / UX", emoji: "🎨" },
];

export const DailyBriefingSettingsModal = ({
  open,
  onClose,
  scheduleFilters,
  onScheduleFiltersChange,
  interestTopics,
  onInterestTopicsChange,
}: DailyBriefingSettingsModalProps) => {
  const [localScheduleFilters, setLocalScheduleFilters] = useState<string[]>(scheduleFilters);
  const [localInterestTopics, setLocalInterestTopics] = useState<string[]>(interestTopics);

  const handleScheduleToggle = (id: string) => {
    setLocalScheduleFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleTopicToggle = (id: string) => {
    setLocalInterestTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onScheduleFiltersChange(localScheduleFilters);
    onInterestTopicsChange(localInterestTopics);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span>⚙️</span>
            AI 데일리 체크 설정
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Schedule Filter Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">다음 일정 알림</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              브리핑에 표시할 일정 유형을 선택하세요.
            </p>
            <div className="space-y-2">
              {scheduleTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label
                    key={type.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={localScheduleFilters.includes(type.id)}
                      onCheckedChange={() => handleScheduleToggle(type.id)}
                    />
                    <Icon className={`w-4 h-4 ${type.color}`} />
                    <span className="text-sm text-foreground">{type.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Interest Topics Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-semibold text-foreground">관심 이야기 주제</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              관심 있는 주제를 선택하면 맞춤 뉴스를 추천해드려요.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {topicOptions.map((topic) => (
                <label
                  key={topic.id}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    localInterestTopics.includes(topic.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={localInterestTopics.includes(topic.id)}
                    onCheckedChange={() => handleTopicToggle(topic.id)}
                    className="sr-only"
                  />
                  <span className="text-sm">{topic.emoji}</span>
                  <span className="text-xs text-foreground">{topic.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            취소
          </Button>
          <Button size="sm" onClick={handleSave}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
