import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Star, MoreHorizontal, Pencil, Trash2, Users, User, Search, PanelLeftClose, Sparkles, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ChatbotCreateModal } from "@/components/ChatbotCreateModal";
import Sidebar from "@/components/Sidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import HeaderNav from "@/components/HeaderNav";
import UpcomingSchedule from "@/components/UpcomingSchedule";
import MobileBottomNav from "@/components/MobileBottomNav";
import { SettingsModal } from "@/components/SettingsModal";
import { useIsMobile } from "@/hooks/use-mobile";
import logoIcon from "@/assets/logo-icon.png";

export interface Chatbot {
  id: string;
  name: string;
  description: string;
  icon: string;
  isFavorite: boolean;
  visibility: "personal" | "team" | "public";
  isOwner: boolean;
}

type FilterType = "personal" | "favorites";

// 초기 챗봇 데이터
const initialChatbots: Chatbot[] = [
  {
    id: "1",
    name: "이수시스템 사규 챗봇",
    description: "회사 규정 및 정책에 대해 질문하세요",
    icon: "📊",
    isFavorite: true,
    visibility: "public",
    isOwner: false,
  },
  {
    id: "2",
    name: "코딩 도우미",
    description: "개발 관련 질문과 코드 리뷰를 도와드립니다",
    icon: "💻",
    isFavorite: true,
    visibility: "personal",
    isOwner: true,
  },
  {
    id: "3",
    name: "AI 기술 정보",
    description: "최신 AI 트렌드와 기술 정보를 제공합니다",
    icon: "🤖",
    isFavorite: true,
    visibility: "team",
    isOwner: false,
  },
];

const ChatbotsPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatbots, setChatbots] = useState<Chatbot[]>(initialChatbots);
  const [activeFilter, setActiveFilter] = useState<FilterType>("favorites");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userSettings] = useState(() => {
    const saved = localStorage.getItem("userSettings");
    return saved ? JSON.parse(saved) : null;
  });

  // 필터별 챗봇 목록
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

    // 검색어 필터링
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

  // 각 필터별 개수
  const counts = {
    personal: chatbots.filter((c) => c.isOwner).length,
    favorites: chatbots.filter((c) => c.isFavorite).length,
  };

  const handleToggleFavorite = (id: string) => {
    setChatbots((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
    toast.success("즐겨찾기가 변경되었습니다");
  };

  const handleDelete = (id: string) => {
    setChatbots((prev) => prev.filter((c) => c.id !== id));
    toast.success("챗봇이 삭제되었습니다");
  };

  const handleEdit = (chatbot: Chatbot) => {
    setEditingChatbot(chatbot);
    setIsCreateModalOpen(true);
  };

  const handleSaveChatbot = (data: Omit<Chatbot, "id" | "isFavorite" | "isOwner">) => {
    if (editingChatbot) {
      setChatbots((prev) =>
        prev.map((c) =>
          c.id === editingChatbot.id ? { ...c, ...data } : c
        )
      );
    } else {
      const newChatbot: Chatbot = {
        id: Date.now().toString(),
        ...data,
        isFavorite: false,
        isOwner: true,
      };
      setChatbots((prev) => [...prev, newChatbot]);
    }
    setEditingChatbot(null);
  };

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: "favorites", label: "즐겨찾기", icon: <Star className="w-3.5 h-3.5" /> },
    { key: "personal", label: "개인", icon: <User className="w-3.5 h-3.5" /> },
  ];

  const handleSelectChatbot = (chatbot: Chatbot) => {
    // Navigate to main page with chatbot info in state
    navigate("/", { 
      state: { 
        selectedChatbot: {
          id: chatbot.id,
          name: chatbot.name,
          icon: chatbot.icon,
          description: chatbot.description,
        }
      } 
    });
  };

  const renderChatbotItem = (chatbot: Chatbot, compact = false) => {
    const showActions = chatbot.isOwner;
    
    return (
      <div
        key={chatbot.id}
        onClick={() => handleSelectChatbot(chatbot)}
        className={`flex items-center gap-3 ${compact ? 'p-3' : 'p-5'} bg-card rounded-xl border border-border hover:shadow-md transition-all cursor-pointer`}
      >
        <span className={`${compact ? 'text-2xl' : 'text-3xl'} shrink-0`}>{chatbot.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-foreground ${compact ? 'text-base' : 'text-lg'}`}>{chatbot.name}</span>
            {chatbot.visibility === "team" && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                팀
              </span>
            )}
            {chatbot.visibility === "public" && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                전체
              </span>
            )}
            {chatbot.isOwner && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                내 챗봇
              </span>
            )}
          </div>
          <p className={`text-sm text-muted-foreground ${compact ? 'line-clamp-1' : ''} mt-1`}>
            {chatbot.description}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(chatbot.id); }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Star
              className={`w-5 h-5 ${
                chatbot.isFavorite
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-muted-foreground"
              }`}
            />
          </button>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(chatbot)}>
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
    );
  };

  const getEmptyMessage = () => {
    if (searchQuery.trim()) {
      return {
        icon: <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />,
        title: `'${searchQuery}' 검색 결과가 없습니다`,
        desc: "다른 검색어로 시도해보세요",
      };
    }
    
    switch (activeFilter) {
      case "personal":
        return {
          icon: <User className="w-16 h-16 mx-auto mb-4 opacity-30" />,
          title: "만든 챗봇이 없습니다",
          desc: "챗봇 생성 버튼을 눌러 나만의 챗봇을 만들어보세요",
        };
      case "favorites":
        return {
          icon: <Star className="w-16 h-16 mx-auto mb-4 opacity-30" />,
          title: "즐겨찾기한 챗봇이 없습니다",
          desc: "별 아이콘을 눌러 즐겨찾기에 추가하세요",
        };
      default:
        return {
          icon: <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />,
          title: "챗봇이 없습니다",
          desc: "챗봇 생성 버튼을 눌러 시작하세요",
        };
    }
  };

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <>
        <SettingsModal
          open={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={userSettings}
          onSave={() => {}}
        />

        <div className="h-screen bg-background flex flex-col">
          {/* Mobile Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              챗봇 서비스
            </h1>
            <div className="flex-1" />
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              생성
            </Button>
          </div>

          {/* Filters + Search */}
          <div className="px-4 py-3 space-y-3 border-b border-border">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="챗봇 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Filter Pills */}
            <div className="flex gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
          </div>

          {/* Chatbot List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 pb-20 space-y-3">
            {filteredChatbots.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {getEmptyMessage().icon}
                <p className="text-base font-medium">{getEmptyMessage().title}</p>
                <p className="text-sm mt-1">{getEmptyMessage().desc}</p>
              </div>
            ) : (
              filteredChatbots.map((chatbot) => renderChatbotItem(chatbot, true))
            )}
          </div>

        </div>

        {/* 챗봇 생성/수정 모달 */}
        <ChatbotCreateModal
          open={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingChatbot(null);
          }}
          onSave={handleSaveChatbot}
          editingChatbot={editingChatbot}
        />
      </>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sidebar Trigger - visible when sidebar closed */}
      {!sidebarOpen && <SidebarTrigger onClick={() => setSidebarOpen(true)} />}

      {/* Top Header Area - spans full width */}
      <div className="flex items-center">
        {/* Logo area - matches sidebar background, hidden when sidebar closed */}
        {sidebarOpen && (
          <div className="flex items-center gap-2 shrink-0 px-4 py-2 w-64 bg-card">
            <img src={logoIcon} alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-foreground">AI PORTAL</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Right side header content - same as Index */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2">
          <div className="flex-1" />
          <HeaderNav isChatMode={false} currentChatId={null} chatHistory={[]} onShare={() => {}} onPin={() => {}} onDelete={() => {}} />
          <UpcomingSchedule 
            isExpanded={scheduleExpanded} 
            onToggle={() => setScheduleExpanded(!scheduleExpanded)} 
            onGetHelp={() => {}} 
          />
          {/* User Profile */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
              {userSettings?.assistantName?.[0] || "문"}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">
              {userSettings?.assistantName || "문수빈"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Area - Sidebar + Content */}
      <div className="flex flex-1">
        {/* Sidebar Body (without header) */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          hideHeader={true}
          onNewChat={() => navigate("/")}
        />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {/* 페이지 제목 + 생성 버튼 */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate("/")}
                  className="shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  챗봇 서비스 관리
                </h1>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                챗봇 생성
              </Button>
            </div>

            {/* 필터 + 검색 */}
            <div className="flex items-center justify-between gap-4 mb-6">
              {/* 필터 버튼들 */}
              <div className="flex gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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

              {/* 검색창 */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="챗봇 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 챗봇 목록 */}
            <div className="space-y-4">
              {filteredChatbots.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  {getEmptyMessage().icon}
                  <p className="text-lg font-medium">{getEmptyMessage().title}</p>
                  <p className="text-sm mt-2">{getEmptyMessage().desc}</p>
                </div>
              ) : (
                filteredChatbots.map((chatbot) => renderChatbotItem(chatbot))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 챗봇 생성/수정 모달 */}
      <ChatbotCreateModal
        open={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingChatbot(null);
        }}
        onSave={handleSaveChatbot}
        editingChatbot={editingChatbot}
      />
    </div>
  );
};

export default ChatbotsPage;
