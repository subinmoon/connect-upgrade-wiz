import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
  FolderArchive,
  FolderOutput,
  GripVertical,
  PanelLeftClose,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/pages/Index";
import Sidebar from "@/components/Sidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import HeaderNav from "@/components/HeaderNav";
import UpcomingSchedule from "@/components/UpcomingSchedule";
import logoIcon from "@/assets/logo-icon.png";

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
        "flex items-center justify-between py-3 pl-3 pr-3 hover:bg-muted/30 rounded-lg transition-colors group",
        isDragging && "bg-muted/50"
      )}
    >
      <div
        {...listeners}
        {...attributes}
        className="p-1.5 cursor-grab hover:bg-muted rounded transition-colors mr-2"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <button
        onClick={() => onSelectChat(chat.id)}
        className="flex-1 text-left text-sm text-foreground hover:text-primary transition-colors"
      >
        {chat.title}
      </button>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {format(new Date(chat.createdAt), "yyyy.MM.dd")}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-all">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderOutput className="w-4 h-4 mr-2" />
                그룹 이동
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-40">
                {groups
                  .filter(g => g.id !== groupId)
                  .map(targetGroup => (
                    <DropdownMenuItem
                      key={targetGroup.id}
                      onClick={() =>
                        onMoveChat(chat.id, groupId, targetGroup.id)
                      }
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
  group: ArchiveGroup;
  isOver: boolean;
  children: React.ReactNode;
}

const DroppableGroup = ({ group, isOver, children }: DroppableGroupProps) => {
  const { setNodeRef } = useDroppable({
    id: `group-${group.id}`,
    data: {
      groupId: group.id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "px-4 pb-4 space-y-1 min-h-[50px] transition-colors rounded-lg",
        isOver && "bg-primary/10 ring-2 ring-primary/30"
      )}
    >
      {children}
    </div>
  );
};

const ArchivePage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);
  const [userSettings] = useState(() => {
    const saved = localStorage.getItem("userSettings");
    return saved ? JSON.parse(saved) : null;
  });
  
  // Example archived chats for testing
  const EXAMPLE_ARCHIVED_CHATS: ChatSession[] = [
    { id: "archived-1", title: "프로젝트 회의 기록", messages: [], createdAt: new Date("2025-02-01T10:00:00Z"), archived: true },
    { id: "archived-2", title: "고객 미팅 노트", messages: [], createdAt: new Date("2025-02-02T14:30:00Z"), archived: true },
    { id: "archived-3", title: "기술 문서 검토", messages: [], createdAt: new Date("2025-02-03T09:15:00Z"), archived: true },
    { id: "archived-4", title: "제품 기획 브레인스토밍", messages: [], createdAt: new Date("2025-02-04T11:00:00Z"), archived: true },
    { id: "archived-5", title: "버그 수정 논의", messages: [], createdAt: new Date("2025-02-05T16:45:00Z"), archived: true },
    { id: "archived-6", title: "팀 스탠드업 미팅", messages: [], createdAt: new Date("2025-02-06T08:00:00Z"), archived: true },
    { id: "archived-7", title: "디자인 리뷰 세션", messages: [], createdAt: new Date("2025-02-07T13:20:00Z"), archived: true },
    { id: "archived-8", title: "인터뷰 질문 준비", messages: [], createdAt: new Date("2025-02-08T10:30:00Z"), archived: true },
  ];

  const EXAMPLE_GROUPS: ArchiveGroup[] = [
    { id: "default", name: "기본 그룹", chatIds: ["archived-1", "archived-2"], color: "gray" },
    { id: "work", name: "업무", chatIds: ["archived-3", "archived-4", "archived-5"], color: "blue" },
    { id: "meeting", name: "미팅", chatIds: ["archived-6", "archived-7"], color: "green" },
    { id: "personal", name: "개인", chatIds: ["archived-8"], color: "purple" },
  ];

  // Load archived chats from localStorage
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge example chats if not present
      const existingIds = parsed.map((c: ChatSession) => c.id);
      const newExamples = EXAMPLE_ARCHIVED_CHATS.filter(e => !existingIds.includes(e.id));
      return [...parsed, ...newExamples];
    }
    return EXAMPLE_ARCHIVED_CHATS;
  });

  const archivedChats = chatHistory.filter(c => c.archived);

  const [groups, setGroups] = useState<ArchiveGroup[]>(() => {
    const saved = localStorage.getItem("archiveGroups");
    if (saved) {
      const parsed = JSON.parse(saved);
      // If only default group exists, use example groups
      if (parsed.length === 1 && parsed[0].id === "default" && parsed[0].chatIds.length === 0) {
        return EXAMPLE_GROUPS;
      }
      return parsed;
    }
    return EXAMPLE_GROUPS;
  });

  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(["default"])
  );
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overGroupId, setOverGroupId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Save groups to localStorage
  useEffect(() => {
    localStorage.setItem("archiveGroups", JSON.stringify(groups));
  }, [groups]);

  // Save chat history to localStorage
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

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

  const handleMoveChat = (
    chatId: string,
    fromGroupId: string,
    toGroupId: string
  ) => {
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
    setChatHistory(prev =>
      prev.map(chat =>
        chat.id === chatId ? { ...chat, archived: false } : chat
      )
    );
    toast.success("아카이브가 해제되었습니다");
  };

  const handleDeleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    // Also remove from groups
    setGroups(prev =>
      prev.map(g => ({
        ...g,
        chatIds: g.chatIds.filter(id => id !== chatId),
      }))
    );
    toast.success("대화가 삭제되었습니다");
  };

  const handleSelectChat = (chatId: string) => {
    // Unarchive the chat and navigate to it
    setChatHistory(prev =>
      prev.map(chat =>
        chat.id === chatId ? { ...chat, archived: false } : chat
      )
    );
    // Remove from groups
    setGroups(prev =>
      prev.map(g => ({
        ...g,
        chatIds: g.chatIds.filter(id => id !== chatId),
      }))
    );
    // Navigate to home with chat ID in state
    navigate("/", { state: { selectChatId: chatId } });
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
      const chatId = overId.replace("chat-", "");
      const targetGroup = groups.find(g => g.chatIds.includes(chatId));
      if (targetGroup) {
        toGroupId = targetGroup.id;
      }
    }

    if (toGroupId && activeData.fromGroupId !== toGroupId) {
      handleMoveChat(activeData.chatId, activeData.fromGroupId, toGroupId);
    }
  };

  const getActiveChat = () => {
    if (!activeId) return null;
    const chatId = activeId.replace("chat-", "");
    return archivedChats.find(c => c.id === chatId);
  };

  const activeChat = getActiveChat();

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
            <span className="font-bold text-foreground">ISU GPT</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Right side header content - same as ChatbotsPage */}
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
          chatHistory={chatHistory}
          onSelectChat={handleSelectChat}
          onNewChat={() => navigate("/")}
          hideHeader={true}
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
                  <FolderArchive className="w-6 h-6 text-primary" />
                  채팅 아카이브
                </h1>
              </div>
              <Button onClick={handleAddGroup} className="gap-2">
                <Plus className="w-4 h-4" />
                새 그룹
              </Button>
            </div>

            {/* Archive Content */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="space-y-4">
                {groups.map(group => (
                  <div
                    key={group.id}
                    className="border border-border rounded-xl overflow-hidden bg-card"
                  >
                  <Collapsible
                    open={openGroups.has(group.id)}
                    onOpenChange={() => toggleGroup(group.id)}
                  >
                    <div className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors">
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-3 flex-1 text-left">
                          <div className={cn("w-3 h-3 rounded-full", getGroupColorClass(group.color))} />
                          <Folder className="w-5 h-5 text-muted-foreground" />
                          {editingGroupId === group.id ? (
                            <Input
                              value={editGroupName}
                              onChange={e => setEditGroupName(e.target.value)}
                              onBlur={() => handleSaveGroupName(group.id)}
                              onKeyDown={e => {
                                if (e.key === "Enter")
                                  handleSaveGroupName(group.id);
                                if (e.key === "Escape") setEditingGroupId(null);
                              }}
                              onClick={e => e.stopPropagation()}
                              className="h-8 w-56"
                              autoFocus
                            />
                          ) : (
                            <span className="font-medium text-foreground text-base">
                              {group.name}
                            </span>
                          )}
                        </button>
                      </CollapsibleTrigger>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-2">
                          {getChatsForGroup(group.id).length}개
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
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => handleRenameGroup(group.id)}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              이름 변경
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Palette className="w-4 h-4 mr-2" />
                                색상 변경
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="w-32">
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
                          <button className="p-1.5">
                            {openGroups.has(group.id) ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <DroppableGroup
                        group={group}
                        isOver={overGroupId === group.id}
                      >
                        {getChatsForGroup(group.id).length > 0 ? (
                          getChatsForGroup(group.id).map(chat => (
                            <DraggableChatItem
                              key={chat.id}
                              chat={chat}
                              groupId={group.id}
                              groups={groups}
                              onSelectChat={handleSelectChat}
                              onMoveChat={handleMoveChat}
                              onUnarchive={handleUnarchive}
                              onDeleteChat={handleDeleteChat}
                            />
                          ))
                        ) : (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            {overGroupId === group.id
                              ? "여기에 드롭하세요"
                              : "아카이브된 대화가 없습니다"}
                          </div>
                        )}
                      </DroppableGroup>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}

              {groups.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">
                  그룹이 없습니다. 새 그룹을 추가해주세요.
                </div>
              )}
              </div>

              {groups.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">
                  그룹이 없습니다. 새 그룹을 추가해주세요.
                </div>
              )}

              <DragOverlay>
                {activeChat && (
                  <div className="flex items-center gap-2 py-3 px-4 bg-card border border-border rounded-lg shadow-lg">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{activeChat.title}</span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArchivePage;
