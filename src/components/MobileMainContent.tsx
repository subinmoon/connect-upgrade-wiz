import MobileWelcomeHeader from "./MobileWelcomeHeader";
import HRHelper from "./HRHelper";
import RecentInterests from "./RecentInterests";
import ChatInput from "./ChatInput";
import type { ChatSession } from "@/pages/Index";

interface MobileMainContentProps {
  userName?: string;
  chatHistory: ChatSession[];
  prefillMessage: string;
  onSendMessage: (msg: string) => void;
  onSelectAction: (template: string) => void;
  toneStyle?: string;
  answerLength?: string;
  searchMode?: string;
  onToneChange?: (tone: string) => void;
  onLengthChange?: (length: string) => void;
  onSearchModeChange?: (mode: string) => void;
}

const MobileMainContent = ({
  userName,
  chatHistory,
  prefillMessage,
  onSendMessage,
  onSelectAction,
  toneStyle,
  answerLength,
  searchMode,
  onToneChange,
  onLengthChange,
  onSearchModeChange,
}: MobileMainContentProps) => {
  return (
    <div className="flex flex-col h-full pb-16">
      {/* Welcome Header - Compact */}
      <MobileWelcomeHeader 
        userName={userName} 
        onSelectAction={onSelectAction} 
      />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        {/* HR Helper Card */}
        <HRHelper />
        
        {/* Recent Interests / Popular Questions */}
        <RecentInterests 
          hasHistory={chatHistory.length > 0} 
          onQuestionClick={(question) => onSelectAction(question)} 
        />
      </div>

      {/* Chat Input - Fixed at bottom above nav */}
      <div className="shrink-0 px-4 py-3 bg-background border-t border-border">
        <ChatInput
          onSendMessage={(msg) => {
            onSendMessage(msg);
          }}
          initialMessage={prefillMessage}
          onMessageChange={() => {}}
          toneStyle={toneStyle}
          answerLength={answerLength}
          searchMode={searchMode}
          onToneChange={onToneChange}
          onLengthChange={onLengthChange}
          onSearchModeChange={onSearchModeChange}
          userName={userName}
          isMobile
        />
      </div>
    </div>
  );
};

export default MobileMainContent;
