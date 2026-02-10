import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Folder,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderArchive,
  FolderOutput,
  Palette,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/pages/Index";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

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

// Draggable chat item component
interface DraggableChatItemProps {
  chat: ChatSession;
  groupId: string;
  groups: ArchiveGroup[];
  onSelectChat: (chatId: string) => void;
  onMoveChat: (chatId: string, fromGroupId: string, toGroupId: string) => void;
  onUnarchive: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

const DraggableChatItem = ({
  chat,
  groupId,
  groups,
  onSelectChat,
  onMoveChat,
  onUnarchive,
  onDeleteChat,
}: DraggableChatItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `chat-${chat.id}`,
    data: {
      chatId: chat.id,
      fromGroupId: groupId,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between py-2 px-2 hover:bg-muted/30 rounded-lg transition-colors",
        isDragging && "bg-muted/50 shadow-lg"
      )}
    >
      <div
        {...listeners}
        {...attributes}
        className="p-1.5 cursor-grab active:cursor-grabbing hover:bg-muted rounded transition-colors mr-2 touch-none"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <button
        onClick={() => onSelectChat(chat.id)}
        className="flex-1 text-left text-sm text-foreground hover:text-primary transition-colors truncate"
      >
        {chat.title}
      </button>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {format(new Date(chat.createdAt), "MM.dd")}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-muted rounded transition-all">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-card">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderOutput className="w-4 h-4 mr-2" />
                그룹 이동
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-40 bg-card">
                {groups.filter(g => g.id !== groupId).map(targetGroup => (
                  <DropdownMenuItem
                    key={targetGroup.id}
                    onClick={() => onMoveChat(chat.id, groupId, targetGroup.id)}
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    {targetGroup.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onUnarchive(chat.id)}>
              아카이브 해제
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteChat(chat.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// Droppable group component
interface DroppableGroupProps {
  groupId: string;
  isOver: boolean;
  children: React.ReactNode;
}

const DroppableGroup = ({ groupId, isOver, children }: DroppableGroupProps) => {
  const { setNodeRef } = useDroppable({
    id: `group-${groupId}`,
    data: {
      groupId: groupId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-colors rounded-xl",
        isOver && "ring-2 ring-primary/30 bg-primary/5"
      )}
    >
      {children}
    </div>
  );
};

interface MobileArchiveSheetProps {
  open: boolean;
  onClose: () => void;
  chatHistory: ChatSession[];
  onSelectChat: (chatId: string) => void;
  onUnarchiveChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

const MobileArchiveSheet = ({
  open,
  onClose,
  chatHistory,
  onSelectChat,
  onUnarchiveChat,
  onDeleteChat,
}: MobileArchiveSheetProps) => {
  const archivedChats = chatHistory.filter(c => c.archived);

  const [groups, setGroups] = useState<ArchiveGroup[]>(() => {
    const saved = localStorage.getItem("archiveGroups");
    if (saved) {
      return JSON.parse(saved);
    }
    return [{ id: "default", name: "기본 그룹", chatIds: [], color: "gray" }];
  });

  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["default"]));
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overGroupId, setOverGroupId] = useState<string | null>(null);

  // Touch and mouse sensors for drag and drop
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    localStorage.setItem("archiveGroups", JSON.stringify(groups));
  }, [groups]);

  // Assign unassigned chats to default group
  useEffect(() => {
    const allAssignedChatIds = groups.flatMap(g => g.chatIds);
    const unassignedChats = archivedChats.filter(
      chat => !allAssignedChatIds.includes(chat.id)
    );

    if (unassignedChats.length > 0) {
      setGroups(prev =>
        prev.map(g =>
          g.id === "default"
            ? { ...g, chatIds: [...g.chatIds, ...unassignedChats.map(c => c.id)] }
            : g
        )
      );
    }
  }, [archivedChats, groups]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleAddGroup = () => {
    const newGroup: ArchiveGroup = {
      id: Date.now().toString(),
      name: "새 그룹",
      chatIds: [],
    };
    setGroups(prev => [...prev, newGroup]);
    setOpenGroups(prev => new Set(prev).add(newGroup.id));
    setEditingGroupId(newGroup.id);
    setEditGroupName("새 그룹");
    toast.success("새 그룹이 추가되었습니다");
  };

  const handleRenameGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setEditingGroupId(groupId);
      setEditGroupName(group.name);
    }
  };

  const handleSaveGroupName = (groupId: string) => {
    if (editGroupName.trim()) {
      setGroups(prev =>
        prev.map(g =>
          g.id === groupId ? { ...g, name: editGroupName.trim() } : g
        )
      );
      toast.success("그룹 이름이 변경되었습니다");
    }
    setEditingGroupId(null);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (groupId === "default") {
      toast.error("기본 그룹은 삭제할 수 없습니다");
      return;
    }

    const groupToDelete = groups.find(g => g.id === groupId);
    if (groupToDelete && groupToDelete.chatIds.length > 0) {
      setGroups(prev =>
        prev.map(g =>
          g.id === "default"
            ? { ...g, chatIds: [...g.chatIds, ...groupToDelete.chatIds] }
            : g
        )
      );
    }

    setGroups(prev => prev.filter(g => g.id !== groupId));
    toast.success("그룹이 삭제되었습니다");
  };

  const handleChangeGroupColor = (groupId: string, colorId: string) => {
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId ? { ...g, color: colorId } : g
      )
    );
    toast.success("그룹 색상이 변경되었습니다");
  };

  const getGroupColorClass = (colorId?: string) => {
    const color = GROUP_COLORS.find(c => c.id === colorId);
    return color?.class || "bg-muted-foreground";
  };

  const handleMoveChat = (chatId: string, fromGroupId: string, toGroupId: string) => {
    if (fromGroupId === toGroupId) return;

    setGroups(prev =>
      prev.map(g => {
        if (g.id === fromGroupId) {
          return { ...g, chatIds: g.chatIds.filter(id => id !== chatId) };
        }
        if (g.id === toGroupId) {
          return { ...g, chatIds: [...g.chatIds, chatId] };
        }
        return g;
      })
    );
    toast.success("대화가 이동되었습니다");
  };

  const handleUnarchive = (chatId: string) => {
    // Remove from groups
    setGroups(prev =>
      prev.map(g => ({
        ...g,
        chatIds: g.chatIds.filter(id => id !== chatId),
      }))
    );
    onUnarchiveChat(chatId);
    toast.success("아카이브가 해제되었습니다");
  };

  const handleDelete = (chatId: string) => {
    // Remove from groups
    setGroups(prev =>
      prev.map(g => ({
        ...g,
        chatIds: g.chatIds.filter(id => id !== chatId),
      }))
    );
    onDeleteChat(chatId);
    toast.success("대화가 삭제되었습니다");
  };

  const handleSelect = (chatId: string) => {
    handleUnarchive(chatId);
    onSelectChat(chatId);
    onClose();
  };

  const getChatsForGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];
    return archivedChats.filter(chat => group.chatIds.includes(chat.id));
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const over = event.over;
    if (over) {
      const overId = over.id as string;
      if (overId.startsWith("group-")) {
        setOverGroupId(overId.replace("group-", ""));
      }
    } else {
      setOverGroupId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverGroupId(null);

    if (!over) return;

    const activeData = active.data.current as {
      chatId: string;
      fromGroupId: string;
    };
    const overId = over.id as string;

    let toGroupId: string | null = null;

    if (overId.startsWith("group-")) {
      toGroupId = overId.replace("group-", "");
    } else if (overId.startsWith("chat-")) {
      // Find which group this chat belongs to
      for (const group of groups) {
        const chatId = overId.replace("chat-", "");
        if (group.chatIds.includes(chatId)) {
          toGroupId = group.id;
          break;
        }
      }
    }

    if (toGroupId && toGroupId !== activeData.fromGroupId) {
      handleMoveChat(activeData.chatId, activeData.fromGroupId, toGroupId);
    }
  };

  // Get active chat for drag overlay
  const activeChat = activeId
    ? archivedChats.find(c => `chat-${c.id}` === activeId)
    : null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader className="pb-3">
          <SheetTitle className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-primary" />
            아카이브
          </SheetTitle>
        </SheetHeader>

        {/* Add Group Button */}
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={handleAddGroup} className="gap-1.5">
            <Plus className="w-4 h-4" />
            그룹 추가
          </Button>
        </div>

        {/* Archive Content with DnD */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-y-auto h-[calc(100%-100px)] -mx-6 px-6 space-y-2">
            {groups.map(group => (
              <DroppableGroup key={group.id} groupId={group.id} isOver={overGroupId === group.id}>
                <div
                  className="border border-border rounded-xl overflow-hidden bg-card"
                >
                  <Collapsible
                    open={openGroups.has(group.id)}
                    onOpenChange={() => toggleGroup(group.id)}
                  >
                    <div className="flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 transition-colors">
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-2 flex-1 text-left">
                          <div className={cn("w-2.5 h-2.5 rounded-full", getGroupColorClass(group.color))} />
                          <Folder className="w-4 h-4 text-muted-foreground" />
                          {editingGroupId === group.id ? (
                            <Input
                              value={editGroupName}
                              onChange={e => setEditGroupName(e.target.value)}
                              onBlur={() => handleSaveGroupName(group.id)}
                              onKeyDown={e => {
                                if (e.key === "Enter") handleSaveGroupName(group.id);
                                if (e.key === "Escape") setEditingGroupId(null);
                              }}
                              onClick={e => e.stopPropagation()}
                              className="h-7 w-32"
                              autoFocus
                            />
                          ) : (
                            <span className="font-medium text-foreground text-sm">
                              {group.name}
                            </span>
                          )}
                        </button>
                      </CollapsibleTrigger>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground mr-1">
                          {getChatsForGroup(group.id).length}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                              onClick={e => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 bg-card">
                            <DropdownMenuItem onClick={() => handleRenameGroup(group.id)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              이름 변경
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Palette className="w-4 h-4 mr-2" />
                                색상 변경
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="w-32 bg-card">
                                {GROUP_COLORS.map(color => (
                                  <DropdownMenuItem
                                    key={color.id}
                                    onClick={() => handleChangeGroupColor(group.id, color.id)}
                                  >
                                    <div className={cn("w-3 h-3 rounded-full mr-2", color.class)} />
                                    {color.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            {group.id !== "default" && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteGroup(group.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                그룹 삭제
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <CollapsibleTrigger asChild>
                          <button className="p-1">
                            {openGroups.has(group.id) ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="px-3 pb-2 space-y-1 min-h-[40px]">
                        {getChatsForGroup(group.id).length > 0 ? (
                          getChatsForGroup(group.id).map(chat => (
                            <DraggableChatItem
                              key={chat.id}
                              chat={chat}
                              groupId={group.id}
                              groups={groups}
                              onSelectChat={handleSelect}
                              onMoveChat={handleMoveChat}
                              onUnarchive={handleUnarchive}
                              onDeleteChat={handleDelete}
                            />
                          ))
                        ) : (
                          <div className="py-3 text-center text-xs text-muted-foreground">
                            {overGroupId === group.id ? (
                              <span className="text-primary font-medium">여기에 놓으세요</span>
                            ) : (
                              "아카이브된 대화가 없습니다"
                            )}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </DroppableGroup>
            ))}

            {groups.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <FolderArchive className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">아카이브가 비어있습니다</p>
              </div>
            )}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeChat && (
              <div className="flex items-center gap-2 px-3 py-2 bg-card border border-primary rounded-lg shadow-lg">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {activeChat.title}
                </span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </SheetContent>
    </Sheet>
  );
};

export default MobileArchiveSheet;
