import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Search } from "lucide-react";
import { 
  FileText, Calendar, Users, Plane, Building2, UserCircle, 
  UtensilsCrossed, Mail
} from "lucide-react";

export interface WorkItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// 8 work items
export const allWorkItems: WorkItem[] = [
  { id: "1", label: "결재", icon: FileText, color: "bg-purple-100 text-purple-600" },
  { id: "2", label: "회의실", icon: Calendar, color: "bg-blue-100 text-blue-600" },
  { id: "3", label: "동료 일정", icon: Users, color: "bg-green-100 text-green-600" },
  { id: "4", label: "휴가", icon: Plane, color: "bg-orange-100 text-orange-600" },
  { id: "5", label: "조직도", icon: Building2, color: "bg-pink-100 text-pink-600" },
  { id: "6", label: "직원 검색", icon: UserCircle, color: "bg-cyan-100 text-cyan-600" },
  { id: "7", label: "오늘 메뉴", icon: UtensilsCrossed, color: "bg-amber-100 text-amber-600" },
  { id: "8", label: "메일", icon: Mail, color: "bg-indigo-100 text-indigo-600" },
];

interface WorkItemSettingsModalProps {
  open: boolean;
  onClose: () => void;
  favoriteIds: string[];
  onFavoriteIdsChange: (ids: string[]) => void;
}

export const WorkItemSettingsModal = ({
  open,
  onClose,
  favoriteIds,
  onFavoriteIdsChange,
}: WorkItemSettingsModalProps) => {
  const [localFavorites, setLocalFavorites] = useState<string[]>(favoriteIds);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      setLocalFavorites(favoriteIds);
      setSearchQuery("");
    }
  }, [open, favoriteIds]);

  const toggleFavorite = (id: string) => {
    setLocalFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onFavoriteIdsChange(localFavorites);
    onClose();
  };

  // Filter by search and sort: favorites first
  const sortedItems = useMemo(() => {
    return [...allWorkItems]
      .filter((item) => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const aFav = localFavorites.includes(a.id) ? 0 : 1;
        const bFav = localFavorites.includes(b.id) ? 0 : 1;
        return aFav - bFav;
      });
  }, [localFavorites, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span>⚙️</span>
            업무 바로가기 설정
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">
          즐겨찾기한 업무가 먼저 표시됩니다.
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="업무 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="py-2">
          <div className="space-y-1">
            {sortedItems.map((item) => {
              const Icon = item.icon;
              const isFav = localFavorites.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isFav 
                      ? "border-primary/30 bg-primary/5" 
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => toggleFavorite(item.id)}
                >
                  <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-foreground flex-1">{item.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className="p-1"
                  >
                    <Star 
                      className={`w-4 h-4 transition-colors ${
                        isFav 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-muted-foreground hover:text-yellow-400"
                      }`} 
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {localFavorites.length}개 즐겨찾기
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              취소
            </Button>
            <Button size="sm" onClick={handleSave}>
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
