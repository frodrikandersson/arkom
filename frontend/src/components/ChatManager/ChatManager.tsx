import { ChatWindow } from '../ChatWindow/ChatWindow';
import styles from './ChatManager.module.css';

interface OpenChat {
  conversationId: number;
  otherUserId: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  isMinimized: boolean;
}

interface ChatManagerProps {
  openChats: OpenChat[];
  onCloseChat: (conversationId: number) => void;
  onMinimizeChat: (conversationId: number) => void;
}

export const ChatManager = ({ openChats, onCloseChat, onMinimizeChat }: ChatManagerProps) => {
  return (
    <div className={styles.chatManager}>
      {openChats.map((chat, index) => (
        <div 
          key={chat.conversationId}
          style={{ right: `${1 + (index * (chat.isMinimized ? 260 : 390))}px` }}
        >
          <ChatWindow
            conversationId={chat.conversationId}
            otherUserId={chat.otherUserId}
            otherUserName={chat.otherUserName}
            otherUserAvatar={chat.otherUserAvatar}
            isMinimized={chat.isMinimized}
            onMinimize={() => onMinimizeChat(chat.conversationId)}
            onClose={() => onCloseChat(chat.conversationId)}
          />
        </div>
      ))}
    </div>
  );
};