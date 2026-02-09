import { useState, useEffect } from "react";
import { MessageCircle, Settings, Star } from "lucide-react";
import { WorkItemSettingsModal, allWorkItems } from "./WorkItemSettingsModal";

const HRHelper = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("workItemFavorites");
    // Default favorites: first 8 items
    return saved ? JSON.parse(saved) : ["1", "2", "3", "4", "5", "6", "7", "8"];
  });

  useEffect(() => {
    localStorage.setItem("workItemFavorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Sort by favorites first, then take top 8
  const displayItems = [...allWorkItems]
    .sort((a, b) => {
      const aFav = favoriteIds.includes(a.id) ? 0 : 1;
      const bFav = favoriteIds.includes(b.id) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      // Keep original order for same favorite status
      return Number(a.id) - Number(b.id);
    })
    .slice(0, 8);

  return (
    <div className="bg-white rounded-xl p-3 shadow-soft h-full">
      <WorkItemSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        favoriteIds={favoriteIds}
        onFavoriteIdsChange={setFavoriteIds}
      />

      <div className="flex items-center gap-1.5 mb-2">
        <MessageCircle className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">
          대화로 업무 시작하기
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {displayItems.map((item) => {
          const Icon = item.icon;
          const isFavorite = favoriteIds.includes(item.id);
          return (
            <button 
              key={item.id} 
              className="flex flex-col items-center gap-1 py-1.5 px-1 rounded-lg hover:bg-muted/60 transition-all group"
            >
              {/* Icon with favorite star overlay */}
              <div className="relative">
                <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isFavorite && (
                  <Star className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                )}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center whitespace-nowrap leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HRHelper;
