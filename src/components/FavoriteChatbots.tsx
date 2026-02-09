import { useState, useEffect } from "react";
import { Bot, Star, ArrowRight, Plus, Sparkles } from "lucide-react";
import { chatbotServices, ChatbotService } from "@/data/chatbotServices";
import { Button } from "@/components/ui/button";

interface FavoriteChatbotsProps {
  onSelectChatbot?: (chatbot: ChatbotService) => void;
  hasHistory?: boolean;
}

const FavoriteChatbots = ({ onSelectChatbot, hasHistory = false }: FavoriteChatbotsProps) => {
  const [showList, setShowList] = useState(false);
  const [services, setServices] = useState<ChatbotService[]>([]);

  useEffect(() => {
    // Load favorites from localStorage or use defaults from chatbotServices
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
      // Use default favorites from chatbotServices (3 are already marked as favorite)
      setServices(chatbotServices);
      // Save default favorites to localStorage
      const defaultFavoriteIds = chatbotServices.filter(s => s.isFavorite).map(s => s.id);
      localStorage.setItem("favoriteServices", JSON.stringify(defaultFavoriteIds));
    }
  }, []);

  const favoriteChatbots = services.filter(c => c.isFavorite);

  // 첫 진입 시 또는 즐겨찾기가 없을 때 빈 상태 표시
  if (!hasHistory && !showList) {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-lavender-light flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">즐겨찾는 챗봇</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">나만의 챗봇을 만들어보세요~</span>
            </div>
            <Button 
              variant="outline"
              size="sm"
              className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 h-8 text-xs"
              onClick={() => setShowList(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              챗봇 만들기
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 즐겨찾기 없을 때
  if (favoriteChatbots.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-lavender-light flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">즐겨찾는 챗봇</h2>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          즐겨찾는 챗봇이 없습니다. 헤더의 ⭐ 버튼에서 추가해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-lavender-light flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">즐겨찾는 챗봇</h2>
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {favoriteChatbots.map((chatbot) => (
          <button
            key={chatbot.id}
            onClick={() => onSelectChatbot?.(chatbot)}
            className="group flex items-start gap-3 p-3 bg-muted/40 hover:bg-primary/10 rounded-xl transition-all text-left border border-transparent hover:border-primary/20"
          >
            <span className="text-xl shrink-0">{chatbot.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm text-foreground truncate">
                  {chatbot.name}
                </span>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {chatbot.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FavoriteChatbots;
