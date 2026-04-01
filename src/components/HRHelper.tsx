import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Star, Settings } from "lucide-react";
import { WorkItemSettingsModal, allWorkItems } from "./WorkItemSettingsModal";
import useEmblaCarousel from "embla-carousel-react";

interface HRHelperProps {
  onItemClick?: (label: string) => void;
}

const ITEMS_PER_PAGE = 8;

const HRHelper = ({ onItemClick }: HRHelperProps = {}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("workItemFavorites");
    return saved ? JSON.parse(saved) : ["1", "2", "3", "4", "5", "6", "7", "8"];
  });

  useEffect(() => {
    localStorage.setItem("workItemFavorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const displayItems = [...allWorkItems]
    .sort((a, b) => {
      const aFav = favoriteIds.includes(a.id) ? 0 : 1;
      const bFav = favoriteIds.includes(b.id) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return Number(a.id) - Number(b.id);
    });

  const pages = [];
  for (let i = 0; i < displayItems.length; i += ITEMS_PER_PAGE) {
    pages.push(displayItems.slice(i, i + ITEMS_PER_PAGE));
  }

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const renderGrid = (items: typeof displayItems) => (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isFavorite = favoriteIds.includes(item.id);
        return (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.label)}
            className="flex flex-col items-center gap-1 py-1.5 rounded-lg hover:bg-muted/60 transition-all group"
          >
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              {isFavorite && (
                <Star className="absolute -top-1 -right-1 w-3 h-3 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
              )}
            </div>
            <span className="text-menu-label-long text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="bg-card rounded-xl p-3 shadow-soft h-full">
      <WorkItemSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        favoriteIds={favoriteIds}
        onFavoriteIdsChange={setFavoriteIds}
      />

      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
          <MessageCircle className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="text-section-title text-foreground flex-1">
          대화로 업무 시작하기
        </h2>
        <button
          onClick={() => setShowSettings(true)}
          className="hidden lg:block p-1.5 rounded-lg hover:bg-muted transition-colors"
          title="업무 바로가기 설정"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {pages.length > 1 ? (
        <>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {pages.map((page, pageIdx) => (
                <div key={pageIdx} className="flex-[0_0_100%] min-w-0">
                  {renderGrid(page)}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-2">
            {pages.map((_, idx) => (
              <button
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === selectedIndex ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                onClick={() => emblaApi?.scrollTo(idx)}
              />
            ))}
          </div>
        </>
      ) : (
        renderGrid(displayItems)
      )}
    </div>
  );
};

export default HRHelper;