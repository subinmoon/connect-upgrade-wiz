import MobileWelcomeHeader from "./MobileWelcomeHeader";
import HRHelper from "./HRHelper";
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
    <div className="flex flex-col h-full pb-[calc(env(safe-area-inset-bottom,0px)+var(--mobile-bottom-nav-height)+var(--mobile-input-height))]">
      {/* Content Area - Centered */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto pb-2">
        {/* Welcome Header */}
        <MobileWelcomeHeader 
          userName={userName} 
          onSelectAction={onSelectAction} 
        />

        {/* HR Helper Card */}
        <div className="px-4 pb-3">
          <HRHelper />
        </div>
      </div>

      {/* Chat Input - Fixed above bottom nav */}
      <div className="fixed left-0 right-0 z-40 px-4 py-2 bg-background border-t border-border"
           style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--mobile-bottom-nav-height))' }}>
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
          showWorkItemShortcut={false}
        />
      </div>
    </div>
  );
};

export default MobileMainContent;
