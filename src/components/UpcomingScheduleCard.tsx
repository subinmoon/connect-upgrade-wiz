import { useState } from "react";
import { Calendar, ChevronDown, ChevronUp, Plane, Palmtree, Sparkles, ExternalLink } from "lucide-react";
import { scheduleData, ScheduleItem } from "@/data/scheduleData";
import { Button } from "@/components/ui/button";

interface UpcomingScheduleCardProps {
  onGetHelp?: (prompt: string) => void;
}

const UpcomingScheduleCard = ({ onGetHelp }: UpcomingScheduleCardProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const schedules = scheduleData;

  const getIcon = (type: ScheduleItem["type"]) => {
    switch (type) {
      case "vacation":
        return <Palmtree className="w-4 h-4 text-green-500" />;
      case "business":
        return <Plane className="w-4 h-4 text-blue-500" />;
      case "anniversary":
        return <Calendar className="w-4 h-4 text-pink-500" />;
      default:
        return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getBgColor = (type: ScheduleItem["type"], isExpanded: boolean) => {
    const ring = isExpanded ? "ring-2 ring-primary/30" : "";
    switch (type) {
      case "vacation":
        return `bg-green-50 border-green-200 ${ring}`;
      case "business":
        return `bg-blue-50 border-blue-200 ${ring}`;
      case "anniversary":
        return `bg-pink-50 border-pink-200 ${ring}`;
      default:
        return `bg-muted border-border ${ring}`;
    }
  };

  const getMessageStyle = (type: ScheduleItem["type"]) => {
    switch (type) {
      case "vacation":
        return {
          bar: "from-green-500 to-green-400",
          text: "text-green-700",
          icon: "🌴"
        };
      case "business":
        return {
          bar: "from-blue-500 to-blue-400",
          text: "text-blue-700",
          icon: "✈️"
        };
      case "anniversary":
        return {
          bar: "from-pink-500 to-pink-400",
          text: "text-pink-700",
          icon: "💕"
        };
      default:
        return {
          bar: "from-primary to-lavender",
          text: "text-foreground/80",
          icon: "📌"
        };
    }
  };

  const getTypeLabel = (type: ScheduleItem["type"]) => {
    switch (type) {
      case "vacation":
        return "휴가";
      case "business":
        return "출장";
      case "anniversary":
        return "기념일";
      default:
        return "일정";
    }
  };

  const handleGetHelp = (schedule: ScheduleItem) => {
    const details = schedule.details;
    let prompt = `"${schedule.title}" 일정에 대해 도움이 필요해요.\n\n`;
    prompt += `📅 일자: ${schedule.date}\n`;
    prompt += `📌 유형: ${getTypeLabel(schedule.type)}\n`;
    
    if (details?.duration) {
      prompt += `⏱️ 기간: ${details.duration}\n`;
    }
    if (details?.location) {
      prompt += `📍 장소: ${details.location}\n`;
    }
    if (details?.notes) {
      prompt += `📝 메모: ${details.notes}\n`;
    }
    
    prompt += `\n이 일정과 관련해서 어떤 도움이 필요하신가요?`;
    
    onGetHelp?.(prompt);
  };

  const handleGoToDetail = (schedule: ScheduleItem) => {
    console.log("상세 사이트 이동:", schedule.title);
    window.open(`#/schedule/${schedule.title}`, '_blank');
  };

  if (schedules.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-soft h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-lavender-light flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground">다가오는 일정</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-3xl mb-3">📭</span>
          <p className="text-sm font-medium text-foreground mb-1">다가오는 일정이 없어요!</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            오늘은 여유롭게 보내도 좋겠네요 😊<br />
            새 일정이 생기면 바로 알려드릴게요 ✨
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-lavender-light flex items-center justify-center">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-bold text-foreground">다가오는 일정</h2>
        <span className="ml-auto text-xs text-muted-foreground">{schedules.length}개</span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-auto min-h-0 max-h-80">
        {schedules.map((schedule, index) => (
          <div
            key={index}
            className={`rounded-lg border transition-all overflow-hidden ${getBgColor(schedule.type, expandedIndex === index)}`}
          >
            {/* Header Row - Clickable */}
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full text-left p-2.5 hover:bg-black/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                {getIcon(schedule.type)}
                <span className="text-xs font-medium text-foreground flex-1 truncate">
                  {schedule.title}
                </span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {schedule.date}
                </span>
                {expandedIndex === index ? (
                  <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
              
              {/* Message - Highlighted style with type-based colors */}
              {schedule.message && (() => {
                const msgStyle = getMessageStyle(schedule.type);
                return (
                  <div className="mt-2 relative overflow-hidden rounded-lg bg-white shadow-sm border border-black/5">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${msgStyle.bar}`} />
                    <p className={`text-[11px] font-medium px-3 py-2 leading-relaxed ${msgStyle.text}`}>
                      <span className="mr-1.5">{msgStyle.icon}</span>
                      {schedule.message}
                    </p>
                  </div>
                );
              })()}
            </button>

            {/* Expanded Detail Section */}
            {expandedIndex === index && (
              <div className="px-2.5 pb-2.5 space-y-2 border-t border-black/10">
                {/* Detail Info */}
                <div className="bg-white/50 rounded-md p-2 space-y-1 mt-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">유형</span>
                    <span className="font-medium">{getTypeLabel(schedule.type)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">기간</span>
                    <span className="font-medium">{schedule.details?.duration || schedule.date}</span>
                  </div>
                  {schedule.details?.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">장소</span>
                      <span className="font-medium">{schedule.details.location}</span>
                    </div>
                  )}
                  {schedule.details?.notes && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">메모</span>
                      <span className="font-medium">{schedule.details.notes}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetHelp(schedule);
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    AI에게 물어보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGoToDetail(schedule);
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    상세 사이트
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingScheduleCard;
