import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import HeaderNav from "@/components/HeaderNav";
import WelcomeHeader from "@/components/WelcomeHeader";
import RecentInterests from "@/components/RecentInterests";
import HRHelper from "@/components/HRHelper";
import TodayContextCard from "@/components/TodayContextCard";
import ChatInput from "@/components/ChatInput";
import ChatView from "@/components/ChatView";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileHeader from "@/components/MobileHeader";
import MobileMainContent from "@/components/MobileMainContent";
import MobileHistorySheet from "@/components/MobileHistorySheet";
import MobileChatbotsSheet from "@/components/MobileChatbotsSheet";
import MobileArchiveSheet from "@/components/MobileArchiveSheet";
import ArchiveGroupSelectSheet from "@/components/ArchiveGroupSelectSheet";
import MobileSettingsSheet from "@/components/MobileSettingsSheet";
import MobileChatbotCreateSheet from "@/components/MobileChatbotCreateSheet";
import { generateScheduleResponse } from "@/data/scheduleData";
import logoIcon from "@/assets/logo-icon.png";
import { PanelLeftClose, ArrowLeft, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Source } from "@/components/ChatMessage";
import { TutorialModal, TutorialStep } from "@/components/TutorialModal";
import { TutorialGuideOverlay } from "@/components/TutorialGuideOverlay";
import { SettingsModal } from "@/components/SettingsModal";
import { ChatbotManagementModal, Chatbot } from "@/components/ChatbotManagementModal";
import { ChatbotService } from "@/data/chatbotServices";
import { ChatbotCreateModal } from "@/components/ChatbotCreateModal";
import { useIsMobile } from "@/hooks/use-mobile";
import UpcomingSchedule from "@/components/UpcomingSchedule";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
  searchMode?: string;
}
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  archived?: boolean;
  pinned?: boolean;
}

interface UserSettings {
  userName: string;
  assistantName: string;
  interestTopics: string[];
  toneStyle: string;
  answerLength: string;
  searchMode?: string;
  allowWebSearch: boolean;
  allowFollowUpQuestions: boolean;
}

const Index = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isChatMode, setIsChatMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState("새 대화");
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [prefillMessage, setPrefillMessage] = useState("");
  const [scheduleExpanded, setScheduleExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");

  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const [leftColumnHeight, setLeftColumnHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (isMobile) {
      setLeftColumnHeight(null);
      return;
    }

    const el = leftColumnRef.current;
    if (!el) return;

    const update = () => setLeftColumnHeight(el.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

  const rightColumnStyle = useMemo(() => {
    if (isMobile || !leftColumnHeight) return undefined;
    return { height: leftColumnHeight } as const;
  }, [isMobile, leftColumnHeight]);
  
  // Tutorial state
  const [showSetupModal, setShowSetupModal] = useState(!isMobile);
  const [showGuideOverlay, setShowGuideOverlay] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep | undefined>(undefined);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(() => {
    const saved = localStorage.getItem("userSettings");
    return saved ? JSON.parse(saved) : null;
  });

  // Chatbot management state
  const [showChatbotManagement, setShowChatbotManagement] = useState(false);
  const [showChatbotCreate, setShowChatbotCreate] = useState(false);
  const [showHistorySheet, setShowHistorySheet] = useState(false);
  const [showChatbotsSheet, setShowChatbotsSheet] = useState(false);
  const [showArchiveSheet, setShowArchiveSheet] = useState(false);
  const [showArchiveGroupSelect, setShowArchiveGroupSelect] = useState(false);
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | ChatbotService | null>(null);
  const [chatbots, setChatbots] = useState<Chatbot[]>(() => {
    const saved = localStorage.getItem("chatbots");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "default-1",
        name: "이수시스템 사규 챗봇",
        description: "이수시스템 사규에 대해 질문하고 회사 생활에 필요한 정보를 얻으세요.",
        icon: "🏢",
        isFavorite: true,
        visibility: "public" as const,
        isOwner: false,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("chatbots", JSON.stringify(chatbots));
  }, [chatbots]);

  const handleToggleChatbotFavorite = (id: string) => {
    setChatbots((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  const handleDeleteChatbot = (id: string) => {
    setChatbots((prev) => prev.filter((c) => c.id !== id));
  };

  const handleEditChatbot = (chatbot: Chatbot) => {
    setEditingChatbot(chatbot);
    setShowChatbotManagement(false);
    setShowChatbotCreate(true);
  };

  const handleSaveChatbot = (data: Omit<Chatbot, "id" | "isFavorite" | "isOwner">) => {
    if (editingChatbot) {
      setChatbots((prev) =>
        prev.map((c) =>
          c.id === editingChatbot.id ? { ...c, ...data } : c
        )
      );
    } else {
      const newChatbot: Chatbot = {
        ...data,
        id: Date.now().toString(),
        isFavorite: false,
        isOwner: true,
      };
      setChatbots((prev) => [...prev, newChatbot]);
    }
    setEditingChatbot(null);
  };

  useEffect(() => {
    const state = location.state as { selectChatId?: string } | null;
    if (state?.selectChatId) {
      const chat = chatHistory.find(c => c.id === state.selectChatId);
      if (chat) {
        setCurrentChatId(chat.id);
        setMessages(chat.messages);
        setChatTitle(chat.title);
        setIsChatMode(chat.messages.length > 0);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, chatHistory]);

  const handleStartGuide = () => {
    setShowSetupModal(false);
    setShowGuideOverlay(true);
  };

  const handleGuideComplete = () => {
    setShowGuideOverlay(false);
    setTimeout(() => {
      setTutorialStep("user-info-ask");
      setShowSetupModal(true);
    }, 100);
  };

  const handleSetupComplete = (settings: UserSettings) => {
    setUserSettings(settings);
    localStorage.setItem("userSettings", JSON.stringify(settings));
    setShowSetupModal(false);
  };

  const handleGuideSkip = () => {
    setShowGuideOverlay(false);
    setTimeout(() => {
      setTutorialStep("user-info-ask");
      setShowSetupModal(true);
    }, 100);
  };

  const handleSetupSkip = () => {
    setShowSetupModal(false);
  };

  const handleSettingsSave = (settings: UserSettings) => {
    setUserSettings(settings);
    localStorage.setItem("userSettings", JSON.stringify(settings));
  };

  const handleToneChange = (tone: string) => {
    if (userSettings) {
      const newSettings = { ...userSettings, toneStyle: tone };
      setUserSettings(newSettings);
      localStorage.setItem("userSettings", JSON.stringify(newSettings));
    }
  };

  const handleLengthChange = (length: string) => {
    if (userSettings) {
      const newSettings = { ...userSettings, answerLength: length };
      setUserSettings(newSettings);
      localStorage.setItem("userSettings", JSON.stringify(newSettings));
    }
  };

  const handleSearchModeChange = (mode: string) => {
    if (userSettings) {
      const newSettings = { ...userSettings, searchMode: mode };
      setUserSettings(newSettings);
      localStorage.setItem("userSettings", JSON.stringify(newSettings));
    }
  };

  const handleSendMessage = (content: string) => {
    const currentSearchMode = userSettings?.searchMode || "general";
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      searchMode: currentSearchMode
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    if (messages.length === 0) {
      const newTitle = content.length > 20 ? content.slice(0, 20) + "..." : content;
      setChatTitle(newTitle);

      const newChatId = Date.now().toString();
      setCurrentChatId(newChatId);
      setChatHistory(prev => [{
        id: newChatId,
        title: newTitle,
        messages: newMessages,
        createdAt: new Date()
      }, ...prev]);
    } else {
      setChatHistory(prev => prev.map(chat => chat.id === currentChatId ? {
        ...chat,
        messages: newMessages,
        title: chatTitle
      } : chat));
    }
    setIsChatMode(true);
    setIsLoading(true);

    setTimeout(() => {
      const scheduleResponse = generateScheduleResponse(content);
      const responseContent = scheduleResponse ? scheduleResponse : `"${content}"에 대해 답변드리겠습니다.\n\n이것은 UI 데모용 응답입니다.`;

      const demoSources: Source[] = [{
        title: "사내 복지 정책 가이드",
        url: "https://example.com/policy",
        description: "복지 정책에 대한 상세 안내 문서"
      }, {
        title: "HR 포털 FAQ",
        url: "https://example.com/hr-faq",
        description: "자주 묻는 질문 모음"
      }];
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        sources: demoSources,
        searchMode: currentSearchMode
      };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      setIsLoading(false);

      setChatHistory(prev => prev.map(chat => chat.id === currentChatId ? {
        ...chat,
        messages: updatedMessages
      } : chat));
    }, 1500);
  };

  const handleBack = () => {
    setIsChatMode(false);
    setSelectedChatbot(null);
  };

  const handleTitleChange = (newTitle: string) => {
    setChatTitle(newTitle);
    setChatHistory(prev => prev.map(chat => chat.id === currentChatId ? {
      ...chat,
      title: newTitle
    } : chat));
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;

    const newMessages = messages.slice(0, -1);
    setMessages(newMessages);
    setIsLoading(true);

    const lastUserMessage = newMessages[newMessages.length - 1];

    setTimeout(() => {
      const assistantMessage = {
        id: Date.now().toString(),
        role: "assistant" as const,
        content: `"${lastUserMessage.content}"에 대해 다시 답변드리겠습니다.\n\n이것은 재생성된 UI 데모용 응답입니다.`,
        timestamp: new Date()
      };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      setIsLoading(false);
      setChatHistory(prev => prev.map(chat => chat.id === currentChatId ? {
        ...chat,
        messages: updatedMessages
      } : chat));
    }, 1500);
  };

  const handleArchive = (chatId?: string, groupId?: string) => {
    const targetId = chatId || currentChatId;
    setChatHistory(prev => prev.map(chat => chat.id === targetId ? {
      ...chat,
      archived: true
    } : chat));

    if (targetId && groupId) {
      const savedGroups = localStorage.getItem("archiveGroups");
      if (savedGroups) {
        const groups = JSON.parse(savedGroups);
        const updatedGroups = groups.map((g: {id: string; name: string; chatIds: string[]}) => 
          g.id === groupId 
            ? { ...g, chatIds: [...(g.chatIds || []), targetId] }
            : g
        );
        localStorage.setItem("archiveGroups", JSON.stringify(updatedGroups));
      }
    }
  };

  const handleUnarchive = (chatId: string) => {
    setChatHistory(prev => prev.map(chat => chat.id === chatId ? {
      ...chat,
      archived: false
    } : chat));
  };

  const handlePin = (chatId?: string) => {
    const targetId = chatId || currentChatId;
    setChatHistory(prev => prev.map(chat => chat.id === targetId ? {
      ...chat,
      pinned: !chat.pinned
    } : chat));
  };

  const handleDelete = (chatId?: string) => {
    const targetId = chatId || currentChatId;
    setChatHistory(prev => prev.filter(chat => chat.id !== targetId));
    if (targetId === currentChatId) {
      handleNewChat();
    }
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setChatHistory(prev => prev.map(chat => chat.id === chatId ? {
      ...chat,
      title: newTitle
    } : chat));
    if (chatId === currentChatId) {
      setChatTitle(newTitle);
    }
  };

  const handleShareChat = async (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;
    const chatText = chat.messages.map(m => `[${m.role === "user" ? "나" : "AI"}] ${m.content}`).join("\n\n");
    if (navigator.share) {
      try {
        await navigator.share({
          title: chat.title,
          text: chatText
        });
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          await navigator.clipboard.writeText(chatText);
        }
      }
    } else {
      await navigator.clipboard.writeText(chatText);
    }
  };

  const handleSelectChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setChatTitle(chat.title);
      setIsChatMode(true);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setChatTitle("새 대화");
    setSelectedChatbot(null);
    setIsChatMode(false);
  };

  const handleSelectChatbot = (chatbot: Chatbot | ChatbotService) => {
    setSelectedChatbot(chatbot);
    setCurrentChatId(null);
    setMessages([]);
    setChatTitle(chatbot.name);
    setIsChatMode(true);
    setShowChatbotsSheet(false);
  };

  const isPinned = chatHistory.find(c => c.id === currentChatId)?.pinned;

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <>
        <MobileSettingsSheet
          open={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={userSettings}
          onSave={handleSettingsSave}
        />

        <MobileChatbotCreateSheet
          open={showChatbotCreate}
          onClose={() => {
            setShowChatbotCreate(false);
            setEditingChatbot(null);
          }}
          onSave={handleSaveChatbot}
          editingChatbot={editingChatbot}
        />

        <div className="h-screen bg-background flex flex-col overflow-hidden">
          {/* Archive Group Select Sheet */}
          <ArchiveGroupSelectSheet
            open={showArchiveGroupSelect}
            onClose={() => setShowArchiveGroupSelect(false)}
            onSelect={(groupId) => {
              handleArchive(currentChatId || undefined, groupId);
              toast.success("아카이브에 저장되었습니다");
              handleBack();
            }}
            chatTitle={chatTitle}
          />

          {/* Mobile Header - Only show in chat mode for back navigation */}
          {isChatMode && (
            <MobileHeader
              isChatMode={isChatMode}
              chatTitle={chatTitle}
              userName={userSettings?.assistantName}
              onBack={handleBack}
              onTitleChange={handleTitleChange}
              onShare={() => currentChatId && handleShareChat(currentChatId)}
              onPin={() => handlePin()}
              onDelete={() => handleDelete()}
              onArchive={() => setShowArchiveGroupSelect(true)}
              isPinned={isPinned}
            />
          )}
          <div className="flex-1 overflow-hidden">
            {isChatMode ? (
              <div className="h-full pb-16">
                <ChatView 
                  messages={messages} 
                  onSendMessage={handleSendMessage} 
                  isLoading={isLoading} 
                  onRegenerate={handleRegenerate}
                  toneStyle={userSettings?.toneStyle}
                  answerLength={userSettings?.answerLength}
                  searchMode={userSettings?.searchMode}
                  onToneChange={handleToneChange}
                  onLengthChange={handleLengthChange}
                  onSearchModeChange={handleSearchModeChange}
                  userName={userSettings?.userName}
                  isMobile
                  selectedChatbot={selectedChatbot}
                />
              </div>
            ) : (
              <MobileMainContent
                userName={userSettings?.userName || "사용자"}
                chatHistory={chatHistory}
                prefillMessage={prefillMessage}
                onSendMessage={(msg) => {
                  handleSendMessage(msg);
                  setPrefillMessage("");
                }}
                onSelectAction={(template) => setPrefillMessage(template)}
                toneStyle={userSettings?.toneStyle}
                answerLength={userSettings?.answerLength}
                searchMode={userSettings?.searchMode}
                onToneChange={handleToneChange}
                onLengthChange={handleLengthChange}
                onSearchModeChange={handleSearchModeChange}
              />
            )}
          </div>

          {/* Mobile History Sheet */}
          <MobileHistorySheet
            open={showHistorySheet}
            onClose={() => setShowHistorySheet(false)}
            chatHistory={chatHistory}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onRenameChat={handleRenameChat}
            onShareChat={handleShareChat}
            onPinChat={handlePin}
            onDeleteChat={handleDelete}
          />

          {/* Mobile Chatbots Sheet */}
          <MobileChatbotsSheet
            open={showChatbotsSheet}
            onClose={() => setShowChatbotsSheet(false)}
            chatbots={chatbots}
            onToggleFavorite={handleToggleChatbotFavorite}
            onDelete={handleDeleteChatbot}
            onEdit={handleEditChatbot}
            onSave={handleSaveChatbot}
            editingChatbot={editingChatbot}
            onClearEditing={() => setEditingChatbot(null)}
            onSelectChatbot={handleSelectChatbot}
          />

          {/* Mobile Archive Sheet */}
          <MobileArchiveSheet
            open={showArchiveSheet}
            onClose={() => setShowArchiveSheet(false)}
            chatHistory={chatHistory}
            onSelectChat={handleSelectChat}
            onUnarchiveChat={handleUnarchive}
            onDeleteChat={handleDelete}
          />

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav
            onNewChat={handleNewChat}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenChatbots={() => setShowChatbotsSheet(true)}
            onOpenHistory={() => setShowHistorySheet(true)}
            onOpenArchive={() => setShowArchiveSheet(true)}
          />
        </div>
      </>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <>
      <TutorialModal 
        open={showSetupModal} 
        onComplete={handleSetupComplete} 
        onSkip={handleSetupSkip}
        onStartGuide={handleStartGuide}
        userName="경민"
        initialStep={tutorialStep}
      />
      
      {showGuideOverlay && (
        <TutorialGuideOverlay 
          onComplete={handleGuideComplete}
          onSkip={handleGuideSkip}
        />
      )}
      
      <SettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={userSettings}
        onSave={handleSettingsSave}
      />

      <ChatbotManagementModal
        open={showChatbotManagement}
        onClose={() => setShowChatbotManagement(false)}
        onCreateClick={() => {
          setEditingChatbot(null);
          setShowChatbotManagement(false);
          setShowChatbotCreate(true);
        }}
        chatbots={chatbots}
        onToggleFavorite={handleToggleChatbotFavorite}
        onDelete={handleDeleteChatbot}
        onEdit={handleEditChatbot}
      />

      <ChatbotCreateModal
        open={showChatbotCreate}
        onClose={() => {
          setShowChatbotCreate(false);
          setEditingChatbot(null);
        }}
        onSave={handleSaveChatbot}
        editingChatbot={editingChatbot}
      />
      
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        {/* Top Header Area - spans full width */}
        <div className="flex items-center shrink-0" data-guide="header">
          {sidebarOpen && (
            <div className="flex items-center gap-2 shrink-0 px-4 py-2 w-64 bg-card">
              <img src={logoIcon} alt="Logo" className="w-8 h-8" />
              <span className="font-bold text-foreground">ISU GPT</span>
              <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1.5 hover:bg-muted rounded-lg transition-colors">
                <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
          
          <div className="flex-1 flex items-center gap-3 px-4 py-2">
            {isChatMode && (
              <div className="flex items-center gap-2">
                <button onClick={handleBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                
                {isEditingTitle ? (
                  <div className="flex items-center gap-1">
                    <Input 
                      value={editTitleValue} 
                      onChange={e => setEditTitleValue(e.target.value)} 
                      className="h-7 text-sm font-medium w-60" 
                      autoFocus 
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          if (editTitleValue.trim()) {
                            handleTitleChange(editTitleValue.trim());
                          }
                          setIsEditingTitle(false);
                        }
                        if (e.key === "Escape") {
                          setIsEditingTitle(false);
                        }
                      }} 
                    />
                    <button onClick={() => {
                      if (editTitleValue.trim()) {
                        handleTitleChange(editTitleValue.trim());
                      }
                      setIsEditingTitle(false);
                    }} className="p-1 hover:bg-accent rounded transition-colors">
                      <Check className="w-4 h-4 text-primary" />
                    </button>
                    <button onClick={() => setIsEditingTitle(false)} className="p-1 hover:bg-destructive/10 rounded transition-colors">
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 group">
                    <h2 className="text-base font-medium text-foreground">{chatTitle}</h2>
                    <button onClick={() => {
                      setEditTitleValue(chatTitle);
                      setIsEditingTitle(true);
                    }} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-all">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex-1" />
            
            <HeaderNav 
              isChatMode={isChatMode} 
              currentChatId={currentChatId} 
              chatHistory={chatHistory} 
              onShare={handleShareChat} 
              onPin={handlePin} 
              onDelete={handleDelete} 
            />
            <UpcomingSchedule 
              isExpanded={scheduleExpanded} 
              onToggle={() => setScheduleExpanded(!scheduleExpanded)} 
              onGetHelp={prompt => {
                setPrefillMessage(prompt);
                setScheduleExpanded(false);
              }}
              onRefresh={() => {
                window.location.reload();
              }}
            />
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
        <div className="flex flex-1 min-h-0">
          <Sidebar 
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(false)} 
            chatHistory={chatHistory} 
            currentChatId={currentChatId} 
            onSelectChat={handleSelectChat} 
            onNewChat={handleNewChat} 
            onRenameChat={handleRenameChat} 
            onShareChat={handleShareChat} 
            onPinChat={handlePin} 
            onArchiveChat={handleArchive} 
            onDeleteChat={handleDelete} 
            hideHeader 
            onOpenSettings={() => setShowSettingsModal(true)} 
          />
          
          {!sidebarOpen && <SidebarTrigger onClick={() => setSidebarOpen(true)} />}

          {/* Main Content */}
          <main className="flex-1 bg-background overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 w-full h-full flex flex-col">
              {isChatMode ? (
                <ChatView 
                  messages={messages} 
                  onSendMessage={handleSendMessage} 
                  isLoading={isLoading} 
                  onRegenerate={handleRegenerate}
                  toneStyle={userSettings?.toneStyle}
                  answerLength={userSettings?.answerLength}
                  searchMode={userSettings?.searchMode}
                  onToneChange={handleToneChange}
                  onLengthChange={handleLengthChange}
                  onSearchModeChange={handleSearchModeChange}
                  userName={userSettings?.userName}
                  selectedChatbot={selectedChatbot}
                />
              ) : (
                <div className="flex flex-col h-full justify-center">
                  <div className="shrink-0 mb-4">
                    <WelcomeHeader userName={userSettings?.userName || "사용자"} onSelectAction={template => setPrefillMessage(template)} />
                  </div>
                  
                  {/* Main Content Grid - 2 columns, matched height */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div ref={leftColumnRef} className="flex flex-col gap-3">
                      <div data-guide="work-life-helper" className="flex-1">
                        <HRHelper />
                      </div>
                      <div data-guide="popular-questions">
                        <RecentInterests hasHistory={chatHistory.length > 0} onQuestionClick={question => {
                          setPrefillMessage(question);
                        }} />
                      </div>
                    </div>
                    
                    {/* Right column - TodayContextCard */}
                    <div style={rightColumnStyle}>
                      <TodayContextCard 
                        onGetHelp={prompt => setPrefillMessage(prompt)} 
                        onNewsChat={prompt => setPrefillMessage(prompt)} 
                      />
                    </div>
                  </div>
                  
                  {/* Chat Input - Bottom */}
                  <div data-guide="chat-input" className="shrink-0">
                    <ChatInput 
                      onSendMessage={msg => {
                        handleSendMessage(msg);
                        setPrefillMessage("");
                      }} 
                      initialMessage={prefillMessage} 
                      onMessageChange={() => setPrefillMessage("")}
                      toneStyle={userSettings?.toneStyle}
                      answerLength={userSettings?.answerLength}
                      searchMode={userSettings?.searchMode}
                      onToneChange={handleToneChange}
                      onLengthChange={handleLengthChange}
                      onSearchModeChange={handleSearchModeChange}
                      userName={userSettings?.userName}
                      showWorkItemShortcut={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Index;
