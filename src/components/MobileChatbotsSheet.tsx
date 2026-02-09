import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Plus, Star, MoreHorizontal, Pencil, Trash2, User, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { Chatbot } from "@/components/ChatbotManagementModal";

type FilterType = "personal" | "favorites";

interface MobileChatbotsSheetProps {
  open: boolean;
  onClose: () => void;
  chatbots: Chatbot[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (chatbot: Chatbot) => void;
  onCreateClick: () => void;
}

const MobileChatbotsSheet = ({
  open,
  onClose,
  chatbots,
  onToggleFavorite,
  onDelete,
  onEdit,
  onCreateClick,
}: MobileChatbotsSheetProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("favorites");
  const [searchQuery, setSearchQuery] = useState("");

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
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader className="pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              챗봇 서비스
            </SheetTitle>
            <Button size="sm" onClick={() => { onCreateClick(); onClose(); }} className="gap-1.5">
              <Plus className="w-4 h-4" />
              생성
            </Button>
          </div>
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

        {/* Filter Pills */}
        <div className="flex gap-2 mb-3">
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
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
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
                        <DropdownMenuItem onClick={() => { onEdit(chatbot); onClose(); }}>
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
      </SheetContent>
    </Sheet>
  );
};

export default MobileChatbotsSheet;
