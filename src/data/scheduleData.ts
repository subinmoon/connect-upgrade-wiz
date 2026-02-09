// Shared schedule data for the application
export interface ScheduleItem {
  type: "vacation" | "business" | "anniversary";
  title: string;
  date: string;
  startDate: string; // ISO format for D-day calculation
  message?: string;
  details?: {
    duration: string;
    location?: string;
    notes?: string;
  };
}

// Empty by default - schedules will be added by the user
export const scheduleData: ScheduleItem[] = [];

// Calculate D-day from today
export const calculateDday = (startDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(startDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get D-day display text
export const getDdayText = (dday: number): string => {
  if (dday === 0) return "D-DAY";
  if (dday > 0) return `D-${dday}`;
  return `D+${Math.abs(dday)}`;
};

// Get D-day badge color based on urgency
export const getDdayColor = (dday: number): { bg: string; text: string; border: string } => {
  if (dday <= 0) {
    // D-day or past
    return { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" };
  }
  if (dday <= 3) {
    // Very urgent: D-1 to D-3
    return { bg: "bg-red-100", text: "text-red-600", border: "border-red-200" };
  }
  if (dday <= 7) {
    // Warning: D-4 to D-7
    return { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" };
  }
  if (dday <= 14) {
    // Caution: D-8 to D-14
    return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" };
  }
  // Neutral: D-15+
  return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" };
};

// Helper function to generate AI response about schedules
export const generateScheduleResponse = (query: string): string | null => {
  const lowerQuery = query.toLowerCase();
  const scheduleKeywords = ["일정", "휴가", "출장", "스케줄", "예정", "계획", "다가오는", "언제"];
  
  const isScheduleRelated = scheduleKeywords.some(keyword => lowerQuery.includes(keyword));
  
  if (!isScheduleRelated) return null;
  
  // Check for specific schedule type queries
  if (lowerQuery.includes("휴가")) {
    const vacation = scheduleData.find(s => s.type === "vacation");
    if (vacation) {
      return `🏝️ **다가오는 휴가 일정**\n\n` +
        `• **${vacation.title}**: ${vacation.details?.duration || vacation.date}\n` +
        (vacation.details?.notes ? `• **메모**: ${vacation.details.notes}\n` : "") +
        `\n💬 ${vacation.message}`;
    }
  }
  
  if (lowerQuery.includes("출장")) {
    const business = scheduleData.find(s => s.type === "business");
    if (business) {
      return `✈️ **다가오는 출장 일정**\n\n` +
        `• **${business.title}**: ${business.details?.duration || business.date}\n` +
        (business.details?.location ? `• **장소**: ${business.details.location}\n` : "") +
        (business.details?.notes ? `• **메모**: ${business.details.notes}\n` : "") +
        `\n💬 ${business.message}`;
    }
  }
  
  // General schedule query
  let response = `📅 **다가오는 일정 안내**\n\n`;
  
  scheduleData.forEach((schedule, index) => {
    const icon = schedule.type === "vacation" ? "🏝️" : "✈️";
    response += `${icon} **${schedule.title}**\n`;
    response += `• 기간: ${schedule.details?.duration || schedule.date}\n`;
    if (schedule.details?.location) {
      response += `• 장소: ${schedule.details.location}\n`;
    }
    if (schedule.details?.notes) {
      response += `• 메모: ${schedule.details.notes}\n`;
    }
    response += `\n`;
  });
  
  response += `총 ${scheduleData.length}개의 일정이 예정되어 있습니다. 특정 일정에 대해 더 자세히 알고 싶으시면 말씀해 주세요! 😊`;
  
  return response;
};
