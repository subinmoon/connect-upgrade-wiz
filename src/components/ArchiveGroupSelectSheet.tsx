import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Plus, Check, FolderArchive } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ArchiveGroup {
  id: string;
  name: string;
  chatIds: string[];
  color?: string;
}

const GROUP_COLORS = [
  { id: "gray", name: "기본", class: "bg-muted-foreground" },
  { id: "red", name: "빨강", class: "bg-red-500" },
  { id: "orange", name: "주황", class: "bg-orange-500" },
  { id: "yellow", name: "노랑", class: "bg-yellow-500" },
  { id: "green", name: "초록", class: "bg-green-500" },
  { id: "blue", name: "파랑", class: "bg-blue-500" },
  { id: "purple", name: "보라", class: "bg-purple-500" },
  { id: "pink", name: "분홍", class: "bg-pink-500" },
];

interface ArchiveGroupSelectSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (groupId: string) => void;
  chatTitle?: string;
}

const ArchiveGroupSelectSheet = ({
  open,
  onClose,
  onSelect,
  chatTitle,
}: ArchiveGroupSelectSheetProps) => {
  const [groups, setGroups] = useState<ArchiveGroup[]>(() => {
    const saved = localStorage.getItem("archiveGroups");
    if (saved) {
      return JSON.parse(saved);
    }
    return [{ id: "default", name: "기본 그룹", chatIds: [], color: "gray" }];
  });

  const [selectedGroupId, setSelectedGroupId] = useState<string>("default");
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem("archiveGroups");
      if (saved) {
        setGroups(JSON.parse(saved));
      }
      setSelectedGroupId("default");
      setIsAddingGroup(false);
      setNewGroupName("");
    }
  }, [open]);

  const getGroupColorClass = (colorId?: string) => {
    const color = GROUP_COLORS.find(c => c.id === colorId);
    return color?.class || "bg-muted-foreground";
  };

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: ArchiveGroup = {
        id: Date.now().toString(),
        name: newGroupName.trim(),
        chatIds: [],
        color: "gray",
      };
      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      localStorage.setItem("archiveGroups", JSON.stringify(updatedGroups));
      setSelectedGroupId(newGroup.id);
      setIsAddingGroup(false);
      setNewGroupName("");
    }
  };

  const handleConfirm = () => {
    onSelect(selectedGroupId);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-primary" />
            아카이브 그룹 선택
          </SheetTitle>
          {chatTitle && (
            <p className="text-sm text-muted-foreground text-left">
              "{chatTitle}" 대화를 저장할 그룹을 선택하세요
            </p>
          )}
        </SheetHeader>

        {/* Group List */}
        <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => setSelectedGroupId(group.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                selectedGroupId === group.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <div className={cn("w-3 h-3 rounded-full", getGroupColorClass(group.color))} />
              <Folder className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 text-left font-medium text-foreground">
                {group.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {group.chatIds.length}개
              </span>
              {selectedGroupId === group.id && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </button>
          ))}

          {/* Add New Group */}
          {isAddingGroup ? (
            <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl">
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="새 그룹 이름"
                className="flex-1 h-9"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddGroup();
                  if (e.key === "Escape") {
                    setIsAddingGroup(false);
                    setNewGroupName("");
                  }
                }}
              />
              <Button size="sm" onClick={handleAddGroup} disabled={!newGroupName.trim()}>
                추가
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingGroup(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">새 그룹 만들기</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            <FolderArchive className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ArchiveGroupSelectSheet;
