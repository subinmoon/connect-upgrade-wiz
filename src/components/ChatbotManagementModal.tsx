import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Star, MoreHorizontal, Pencil, Trash2, Users, User, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

interface ChatbotManagementModalProps {
  open: boolean;
  onClose: () => void;
  onCreateClick: () => void;
  chatbots: Chatbot[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (chatbot: Chatbot) => void;
}

export const ChatbotManagementModal = ({
  open,
  onClose,
  onCreateClick,
  chatbots,
  onToggleFavorite,
  onDelete,
  onEdit,
}: ChatbotManagementModalProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("favorites");
  const [searchQuery, setSearchQuery] = useState("");

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

  const renderChatbotItem = (chatbot: Chatbot) => {
    const showActions = chatbot.isOwner;
    
    return (
      <div
        key={chatbot.id}
        className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
      >
        <span className="text-2xl shrink-0">{chatbot.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{chatbot.name}</span>
            {chatbot.visibility === "team" && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                팀
              </span>
            )}
            {chatbot.visibility === "public" && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                전체
              </span>
            )}
            {chatbot.isOwner && (
              <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                내 챗봇
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
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
          {showActions && (
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
    );
  };

  const getEmptyMessage = () => {
    if (searchQuery.trim()) {
      return {
        icon: <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />,
        title: `'${searchQuery}' 검색 결과가 없습니다`,
        desc: "다른 검색어로 시도해보세요",
      };
    }
    
    switch (activeFilter) {
      case "personal":
        return {
          icon: <User className="w-12 h-12 mx-auto mb-3 opacity-50" />,
          title: "만든 챗봇이 없습니다",
          desc: "챗봇생성 버튼을 눌러 나만의 챗봇을 만들어보세요",
        };
      case "favorites":
        return {
          icon: <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />,
          title: "즐겨찾기한 챗봇이 없습니다",
          desc: "별 아이콘을 눌러 즐겨찾기에 추가하세요",
        };
      default:
        return {
          icon: <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />,
          title: "챗봇이 없습니다",
          desc: "챗봇생성 버튼을 눌러 시작하세요",
        };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">챗봇 서비스 관리</DialogTitle>
          <Button onClick={onCreateClick} className="gap-2">
            <Plus className="w-4 h-4" />
            챗봇생성
          </Button>
        </DialogHeader>

        {/* 필터 + 검색 (한 줄에) */}
        <div className="flex items-center justify-between gap-3">
          {/* 필터 버튼들 */}
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

          {/* 검색창 */}
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>

        {/* 챗봇 목록 */}
        <div className="flex-1 overflow-y-auto space-y-3 mt-2">
          {filteredChatbots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {getEmptyMessage().icon}
              <p>{getEmptyMessage().title}</p>
              <p className="text-sm mt-1">{getEmptyMessage().desc}</p>
            </div>
          ) : (
            filteredChatbots.map((chatbot) => renderChatbotItem(chatbot))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
