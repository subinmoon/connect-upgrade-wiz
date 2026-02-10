import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { Bot, Plus, Star, MoreHorizontal, Pencil, Trash2, User, Search, ArrowLeft, Upload, Sparkles, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { Chatbot } from "@/components/ChatbotManagementModal";

type FilterType = "personal" | "favorites";
type ViewMode = "list" | "create";

// 프롬프트 분석을 통한 자동 생성 함수
const analyzePromptAndGenerate = (prompt: string) => {
  const promptLower = prompt.toLowerCase();
  
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

  const extractMainTopic = (text: string) => {
    const sentences = text.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim() || text.slice(0, 50);
    return firstSentence.length > 30 ? firstSentence.slice(0, 30) + "..." : firstSentence;
  };

  const mainTopic = extractMainTopic(prompt);
  const generatedName = `${matchedCategory.category} 도우미`;
  const generatedDescription = prompt.length > 10 
    ? `${mainTopic}에 대해 답변하는 AI 어시스턴트입니다.`
    : `${matchedCategory.category} 관련 질문에 답변하는 AI 어시스턴트입니다.`;

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

interface MobileChatbotsSheetProps {
  open: boolean;
  onClose: () => void;
  chatbots: Chatbot[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (chatbot: Chatbot) => void;
  onSave: (chatbot: Omit<Chatbot, "id" | "isFavorite" | "isOwner">) => void;
  editingChatbot?: Chatbot | null;
  onClearEditing?: () => void;
  onSelectChatbot?: (chatbot: Chatbot) => void;
}

const MobileChatbotsSheet = ({
  open,
  onClose,
  chatbots,
  onToggleFavorite,
  onDelete,
  onEdit,
  onSave,
  editingChatbot,
  onClearEditing,
  onSelectChatbot,
}: MobileChatbotsSheetProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("favorites");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Create form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🤖");
  const [llmModel, setLlmModel] = useState("gpt-4o");
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle editing chatbot
  useEffect(() => {
    if (editingChatbot) {
      setName(editingChatbot.name);
      setDescription(editingChatbot.description);
      setIcon(editingChatbot.icon);
      setViewMode("create");
    }
  }, [editingChatbot]);

  // Reset form when switching to list view
  const resetForm = () => {
    setName("");
    setDescription("");
    setIcon("🤖");
    setLlmModel("gpt-4o");
    setGenerationPrompt("");
    setSystemPrompt("");
    onClearEditing?.();
  };

  const handleBackToList = () => {
    resetForm();
    setViewMode("list");
  };

  const handleCreateClick = () => {
    resetForm();
    setViewMode("create");
  };

  const handleAIGenerate = () => {
    if (!generationPrompt.trim()) {
      toast.error("프롬프트를 먼저 입력해주세요");
      return;
    }

    setIsGenerating(true);
    
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
      visibility: "personal",
    });

    toast.success(editingChatbot ? "챗봇이 수정되었습니다" : "챗봇이 생성되었습니다");
    handleBackToList();
  };

  const handleSheetClose = () => {
    resetForm();
    setViewMode("list");
    onClose();
  };

  const getFilteredChatbots = () => {
    let filtered: Chatbot[];
    
    switch (activeFilter) {
      case "personal":
        filtered = chatbots.filter((c) => c.isOwner);
        break;
      case "favorites":
        filtered = chatbots.filter((c) => c.isFavorite);
        break;
      default:
        filtered = chatbots;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredChatbots = getFilteredChatbots();

  const counts = {
    personal: chatbots.filter((c) => c.isOwner).length,
    favorites: chatbots.filter((c) => c.isFavorite).length,
  };

  const handleFavorite = (id: string) => {
    onToggleFavorite(id);
    toast.success("즐겨찾기가 변경되었습니다");
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    toast.success("챗봇이 삭제되었습니다");
  };

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: "favorites", label: "즐겨찾기", icon: <Star className="w-3.5 h-3.5" /> },
    { key: "personal", label: "개인", icon: <User className="w-3.5 h-3.5" /> },
  ];

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleSheetClose()}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {viewMode === "list" ? (
          <>
            <SheetHeader className="pb-3">
              <SheetTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                챗봇 서비스
              </SheetTitle>
            </SheetHeader>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="챗봇 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Pills with Create Button */}
            {/* Filter Pills with Create Button */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {filters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      activeFilter === filter.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                  >
                    {filter.icon}
                    {filter.label}
                    {counts[filter.key] > 0 && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          activeFilter === filter.key
                            ? "bg-primary-foreground/20"
                            : "bg-background"
                        }`}
                      >
                        {counts[filter.key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <Button size="sm" onClick={handleCreateClick} className="gap-1.5 shrink-0">
                <Plus className="w-4 h-4" />
                생성
              </Button>
            </div>

            {/* Chatbot List */}
            <div className="overflow-y-auto h-[calc(100%-140px)] -mx-6 px-6 space-y-2">
              {filteredChatbots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  {searchQuery.trim() ? (
                    <>
                      <Search className="w-10 h-10 mb-2 opacity-50" />
                      <p className="text-sm">'{searchQuery}' 검색 결과가 없습니다</p>
                    </>
                  ) : activeFilter === "favorites" ? (
                    <>
                      <Star className="w-10 h-10 mb-2 opacity-50" />
                      <p className="text-sm">즐겨찾기한 챗봇이 없습니다</p>
                    </>
                  ) : (
                    <>
                      <User className="w-10 h-10 mb-2 opacity-50" />
                      <p className="text-sm">만든 챗봇이 없습니다</p>
                    </>
                  )}
                </div>
              ) : (
                filteredChatbots.map((chatbot) => (
                  <div
                    key={chatbot.id}
                    onClick={() => onSelectChatbot?.(chatbot)}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <span className="text-2xl shrink-0">{chatbot.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground text-sm">{chatbot.name}</span>
                        {chatbot.visibility === "team" && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">팀</span>
                        )}
                        {chatbot.visibility === "public" && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">전체</span>
                        )}
                        {chatbot.isOwner && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">내 챗봇</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {chatbot.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleFavorite(chatbot.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            chatbot.isFavorite
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                      {chatbot.isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(chatbot)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(chatbot.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="pb-3">
              <SheetTitle className="flex items-center gap-2">
                <button 
                  onClick={handleBackToList}
                  className="p-1 -ml-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Bot className="w-5 h-5 text-primary" />
                {editingChatbot ? "챗봇 수정" : "새 챗봇 만들기"}
              </SheetTitle>
            </SheetHeader>

            <div className="overflow-y-auto h-[calc(100%-120px)] space-y-4 -mx-6 px-6">
              {/* AI 자동 생성 */}
              <div className="space-y-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-semibold">AI로 자동 생성</Label>
                </div>
                <Textarea
                  placeholder="예: HR 관련 질문에 답변하는 챗봇"
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  className="min-h-[80px] bg-background text-sm"
                />
                <Button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !generationPrompt.trim()}
                  className="w-full gap-2"
                  size="sm"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isGenerating ? "생성 중..." : "AI로 생성하기"}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">
                    또는 직접 입력
                  </span>
                </div>
              </div>

              {/* 챗봇 이름 */}
              <div className="space-y-1.5">
                <Label className="text-sm">챗봇 이름</Label>
                <Input
                  placeholder="챗봇의 이름을 입력하세요"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* 챗봇 설명 */}
              <div className="space-y-1.5">
                <Label className="text-sm">챗봇 설명</Label>
                <Textarea
                  placeholder="챗봇의 설명을 입력하세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>

              {/* 아이콘 & LLM */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">아이콘</Label>
                  <Select value={icon} onValueChange={setIcon}>
                    <SelectTrigger>
                      <SelectValue placeholder="아이콘" />
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

                <div className="space-y-1.5">
                  <Label className="text-sm">LLM 모델</Label>
                  <Select value={llmModel} onValueChange={setLlmModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="모델" />
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
              <div className="space-y-1.5">
                <Label className="text-sm">시스템 프롬프트</Label>
                <Textarea
                  placeholder="챗봇의 시스템 프롬프트를 입력하세요"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* 파일첨부 */}
              <div className="space-y-1.5">
                <Label className="text-sm">파일첨부</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                  <Upload className="w-6 h-6 mx-auto mb-1.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    참조할 파일을 업로드하세요
                  </p>
                </div>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={handleBackToList} className="flex-1">
                취소
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                {editingChatbot ? "수정" : "저장"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MobileChatbotsSheet;
