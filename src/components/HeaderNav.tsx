import { useState, useEffect } from "react";
import { LayoutGrid, Star, Search, ExternalLink, MoreHorizontal, Share2, Pin, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { chatbotServices, ChatbotService } from "@/data/chatbotServices";

interface ChatHistoryItem {
  id: string;
  pinned?: boolean;
}

interface HeaderNavProps {
  isChatMode?: boolean;
  currentChatId?: string | null;
  chatHistory?: ChatHistoryItem[];
  onShare?: (id: string) => void;
  onPin?: () => void;
  onDelete?: () => void;
}

const HeaderNav = ({ isChatMode, currentChatId, chatHistory, onShare, onPin, onDelete }: HeaderNavProps) => {
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<ChatbotService[]>([]);

  useEffect(() => {
    // Load favorites from localStorage or use defaults
    const savedFavorites = localStorage.getItem("favoriteServices");
    if (savedFavorites) {
      const favoriteIds = JSON.parse(savedFavorites) as string[];
      setServices(
        chatbotServices.map((s) => ({
          ...s,
          isFavorite: favoriteIds.includes(s.id),
        }))
      );
    } else {
      setServices(chatbotServices);
    }
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const updatedServices = services.map((s) =>
      s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
    );
    setServices(updatedServices);
    
    // Save to localStorage
    const favoriteIds = updatedServices.filter((s) => s.isFavorite).map((s) => s.id);
    localStorage.setItem("favoriteServices", JSON.stringify(favoriteIds));
  };

  const handleServiceClick = (service: ChatbotService) => {
    if (service.url) {
      window.open(service.url, "_blank");
    }
    setFavoritesOpen(false);
  };

  const favoriteServices = services.filter((s) => s.isFavorite);
  const nonFavoriteServices = services.filter((s) => !s.isFavorite);

  const filteredFavorites = favoriteServices.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNonFavorites = nonFavoriteServices.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPinned = chatHistory?.find(c => c.id === currentChatId)?.pinned;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1">
        {/* Chat mode: More actions dropdown - left of Home icon */}
        {isChatMode && currentChatId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 bg-card">
              <DropdownMenuItem onClick={() => onShare?.(currentChatId)}>
                <Share2 className="w-4 h-4 mr-2" />
                공유
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPin?.()}>
                <Pin className="w-4 h-4 mr-2" />
                {isPinned ? "고정 해제" : "채팅 고정"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.()}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* AI 포탈로 이동 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.3s ease-out';
                setTimeout(() => {
                  window.location.href = 'https://id-preview--8fa1e696-bb99-471c-9782-8f43f4311e6d.lovable.app/';
                }, 300);
              }}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <LayoutGrid className="w-5 h-5 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-card border border-border">
            <p>AI 포탈</p>
          </TooltipContent>
        </Tooltip>

        {/* 즐겨찾기 드롭다운 */}
        <DropdownMenu open={favoritesOpen} onOpenChange={setFavoritesOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            {!favoritesOpen && (
              <TooltipContent side="bottom" className="bg-card border border-border">
                <p>즐겨찾기</p>
              </TooltipContent>
            )}
          </Tooltip>
          <DropdownMenuContent 
            align="end" 
            className="w-72 bg-card border border-border z-50"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="서비스 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/50 border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            {/* Favorites Section */}
            {filteredFavorites.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-400" />
                  즐겨찾기
                </DropdownMenuLabel>
                <div className="max-h-32 overflow-y-auto">
                  {filteredFavorites.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer mx-1"
                    >
                      <button
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className="p-0.5 hover:bg-muted rounded transition-colors"
                      >
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                      </button>
                      <span className="text-base">{item.icon}</span>
                      <span
                        className="flex-1 text-sm cursor-pointer hover:text-primary"
                        onClick={() => handleServiceClick(item)}
                      >
                        {item.name}
                      </span>
                      {item.url && (
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {filteredFavorites.length > 0 && filteredNonFavorites.length > 0 && (
              <DropdownMenuSeparator />
            )}

            {/* All Services Section */}
            {filteredNonFavorites.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  전체 서비스
                </DropdownMenuLabel>
                <div className="max-h-40 overflow-y-auto">
                  {filteredNonFavorites.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer mx-1"
                    >
                      <button
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className="p-0.5 hover:bg-muted rounded transition-colors"
                      >
                        <Star className="w-4 h-4 text-muted-foreground hover:text-yellow-500" />
                      </button>
                      <span className="text-base">{item.icon}</span>
                      <span
                        className="flex-1 text-sm cursor-pointer hover:text-primary"
                        onClick={() => handleServiceClick(item)}
                      >
                        {item.name}
                      </span>
                      {item.url && (
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {filteredFavorites.length === 0 && filteredNonFavorites.length === 0 && (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                검색 결과가 없습니다
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};

export default HeaderNav;