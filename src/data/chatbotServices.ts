export interface ChatbotService {
  id: string;
  name: string;
  description: string;
  icon: string;
  isFavorite: boolean;
  url?: string;
}

export const chatbotServices: ChatbotService[] = [
  {
    id: "1",
    name: "코딩 도우미",
    description: "개발 관련 질문과 코드 리뷰를 도와드립니다",
    icon: "💻",
    isFavorite: true,
  },
  {
    id: "2",
    name: "AI 기술 정보",
    description: "최신 AI 트렌드와 기술 정보를 제공합니다",
    icon: "🤖",
    isFavorite: true,
  },
  {
    id: "3",
    name: "문서 작성 도우미",
    description: "보고서, 이메일, 기획서 작성을 도와드립니다",
    icon: "📝",
    isFavorite: true,
  },
  {
    id: "4",
    name: "데이터 분석 봇",
    description: "데이터 분석과 시각화를 도와드립니다",
    icon: "📊",
    isFavorite: true,
  },
  {
    id: "5",
    name: "HR 상담 챗봇",
    description: "인사 관련 질문에 답변해드립니다",
    icon: "👥",
    isFavorite: false,
  },
  {
    id: "6",
    name: "IT 헬프데스크",
    description: "IT 관련 문제 해결을 도와드립니다",
    icon: "🔧",
    isFavorite: false,
  },
];
