import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Chatbot } from "./ChatbotManagementModal";

// 프롬프트 분석을 통한 자동 생성 함수
const analyzePromptAndGenerate = (prompt: string) => {
  const promptLower = prompt.toLowerCase();
  
  // 키워드 기반 카테고리 매핑
  const categoryMappings = [
    { keywords: ["hr", "인사", "채용", "급여", "휴가", "복리후생", "인재"], icon: "👥", category: "HR", role: "HR 전문가" },
    { keywords: ["코딩", "개발", "프로그래밍", "코드", "버그", "디버깅", "개발자"], icon: "💻", category: "개발", role: "시니어 개발자" },
    { keywords: ["ai", "인공지능", "머신러닝", "딥러닝", "gpt", "llm"], icon: "🤖", category: "AI", role: "AI 전문가" },
    { keywords: ["데이터", "분석", "통계", "차트", "리포트", "대시보드"], icon: "📊", category: "데이터", role: "데이터 분석가" },
    { keywords: ["it", "기술", "시스템", "서버", "네트워크", "보안"], icon: "🔧", category: "IT", role: "IT 엔지니어" },
    { keywords: ["문서", "매뉴얼", "가이드", "규정", "정책", "사규"], icon: "📚", category: "문서", role: "문서 전문가" },
    { keywords: ["아이디어", "브레인스토밍", "창의", "기획", "전략"], icon: "💡", category: "기획", role: "전략 기획자" },
    { keywords: ["목표", "kpi", "성과", "평가", "프로젝트"], icon: "🎯", category: "목표", role: "프로젝트 매니저" },
    { keywords: ["메모", "노트", "기록", "일지", "회의록"], icon: "📝", category: "기록", role: "비서" },
    { keywords: ["회사", "조직", "부서", "팀", "경영", "비즈니스"], icon: "🏢", category: "경영", role: "경영 컨설턴트" },
  ];

  let matchedCategory = categoryMappings.find(cat => 
    cat.keywords.some(keyword => promptLower.includes(keyword))
  );

  if (!matchedCategory) {
    matchedCategory = { keywords: [], icon: "🤖", category: "일반", role: "AI 어시스턴트" };
  }

  // 프롬프트에서 핵심 주제 추출
  const extractMainTopic = (text: string) => {
    const sentences = text.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim() || text.slice(0, 50);
    return firstSentence.length > 30 ? firstSentence.slice(0, 30) + "..." : firstSentence;
  };

  const mainTopic = extractMainTopic(prompt);
  
  // 이름 생성
  const generatedName = `${matchedCategory.category} 도우미`;
  
  // 설명 생성
  const generatedDescription = prompt.length > 10 
    ? `${mainTopic}에 대해 답변하는 AI 어시스턴트입니다.`
    : `${matchedCategory.category} 관련 질문에 답변하는 AI 어시스턴트입니다.`;

  // 시스템 프롬프트 생성 (사용자 입력과 다르게!)
  const generatedSystemPrompt = `당신은 ${matchedCategory.role}입니다.

## 역할
${prompt}

## 지침
- 사용자의 질문에 친절하고 전문적으로 답변합니다.
- 정확한 정보를 제공하고, 불확실한 경우 솔직하게 알려줍니다.
- 복잡한 내용은 단계별로 쉽게 설명합니다.
- 한국어로 답변합니다.`;

  return {
    name: generatedName,
    description: generatedDescription,
    icon: matchedCategory.icon,
    systemPrompt: generatedSystemPrompt,
  };
};

const ICON_OPTIONS = [
  { value: "📊", label: "📊 차트" },
  { value: "💻", label: "💻 코딩" },
  { value: "🤖", label: "🤖 로봇" },
  { value: "👥", label: "👥 사람들" },
  { value: "🔧", label: "🔧 도구" },
  { value: "📚", label: "📚 책" },
  { value: "💡", label: "💡 아이디어" },
  { value: "🎯", label: "🎯 목표" },
  { value: "📝", label: "📝 메모" },
  { value: "🏢", label: "🏢 회사" },
];

const LLM_OPTIONS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "gemini-pro", label: "Gemini Pro" },
];

type VisibilityType = "personal";

interface ChatbotCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (chatbot: Omit<Chatbot, "id" | "isFavorite" | "isOwner">) => void;
  editingChatbot?: Chatbot | null;
}

export const ChatbotCreateModal = ({
  open,
  onClose,
  onSave,
  editingChatbot,
}: ChatbotCreateModalProps) => {
  const [name, setName] = useState(editingChatbot?.name || "");
  const [description, setDescription] = useState(editingChatbot?.description || "");
  const [icon, setIcon] = useState(editingChatbot?.icon || "🤖");
  const [llmModel, setLlmModel] = useState("gpt-4o");
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [visibility] = useState<VisibilityType>("personal");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = () => {
    if (!generationPrompt.trim()) {
      toast.error("프롬프트를 먼저 입력해주세요");
      return;
    }

    setIsGenerating(true);
    
    // 자연스러운 UX를 위한 딜레이
    setTimeout(() => {
      const generated = analyzePromptAndGenerate(generationPrompt);
      setName(generated.name);
      setDescription(generated.description);
      setIcon(generated.icon);
      setSystemPrompt(generated.systemPrompt);
      setIsGenerating(false);
      toast.success("AI가 챗봇 정보를 자동 생성했습니다!");
    }, 800);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("챗봇 이름을 입력해주세요");
      return;
    }
    if (!description.trim()) {
      toast.error("챗봇 설명을 입력해주세요");
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      icon,
      visibility,
    });

    toast.success(editingChatbot ? "챗봇이 수정되었습니다" : "챗봇이 생성되었습니다");
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setIcon("🤖");
    setLlmModel("gpt-4o");
    setGenerationPrompt("");
    setSystemPrompt("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">
            {editingChatbot ? "✏️ 챗봇 수정" : "✨ 새 챗봇 만들기"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 프롬프트 - 가장 먼저! */}
          <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <Label htmlFor="prompt" className="text-base font-semibold">
                프롬프트로 챗봇 만들기
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              원하는 챗봇의 역할을 설명하면 AI가 이름, 설명, 아이콘을 자동으로 생성합니다
            </p>
            <Textarea
              id="generationPrompt"
              placeholder="예: HR 관련 질문에 답변하고 휴가 신청 방법을 안내하는 챗봇을 만들어줘"
              value={generationPrompt}
              onChange={(e) => setGenerationPrompt(e.target.value)}
              className="min-h-[100px] bg-background"
            />
            <Button
              type="button"
              onClick={handleAIGenerate}
              disabled={isGenerating || !generationPrompt.trim()}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isGenerating ? "생성 중..." : "AI로 챗봇 정보 생성하기"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는 직접 입력
              </span>
            </div>
          </div>

          {/* 챗봇 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">챗봇 이름</Label>
            <Input
              id="name"
              placeholder="챗봇의 이름을 작성해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 챗봇 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">챗봇 설명</Label>
            <Textarea
              id="description"
              placeholder="챗봇의 설명을 작성해주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* 챗봇 아이콘 & LLM 모델 - 한 줄에 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>챗봇 아이콘</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue placeholder="아이콘 선택" />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>LLM 모델</Label>
              <Select value={llmModel} onValueChange={setLlmModel}>
                <SelectTrigger>
                  <SelectValue placeholder="모델 선택" />
                </SelectTrigger>
                <SelectContent>
                  {LLM_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 시스템 프롬프트 */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">시스템 프롬프트</Label>
            <Textarea
              id="systemPrompt"
              placeholder="챗봇이 응답할 때 사용할 시스템 프롬프트를 입력하세요"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              AI 자동 생성 시 위에서 입력한 프롬프트가 자동으로 채워집니다
            </p>
          </div>

          {/* 파일첨부 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>파일첨부</Label>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Upload className="w-4 h-4" />
                파일첨부
              </Button>
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                참조할 파일을 업로드 해주세요
              </p>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={handleSubmit}>저장</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
