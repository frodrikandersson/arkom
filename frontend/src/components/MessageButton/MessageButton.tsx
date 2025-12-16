import { useState } from 'react';
import { MessagesDropdown } from '../MessagesDropdown/MessagesDropdown';
import styles from './MessageButton.module.css';

interface MessageButtonProps {
  unreadCount?: number;
  onOpenChat: (conversationId: number, otherUserId: string, otherUserName?: string, otherUserAvatar?: string) => void;
}

export const MessageButton = ({ unreadCount = 0, onOpenChat }: MessageButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={() => setIsOpen(!isOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      <MessagesDropdown 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        onOpenChat={onOpenChat}
      />
    </div>
  );
};