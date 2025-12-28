import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMessagesDropdown } from '../../hooks/useMessagesDropdown';
import { ReportModal } from '../ReportModal/ReportModal';
import { OnOpenChatFunction } from '../../models';
import styles from './MessagesDropdown.module.css';
import { ChatWindow } from '../ChatWindow/ChatWindow';
import { useEffect, useState } from 'react';

interface MessagesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: OnOpenChatFunction;
  autoOpenData?: {
    conversationId: number;
    otherUserId: string;
    otherUserName?: string;
    otherUserAvatar?: string;
  };
}

export const MessagesDropdown = ({ isOpen, onClose, onOpenChat, autoOpenData }: MessagesDropdownProps) => {
  const { user } = useAuth();
  const [alignRight, setAlignRight] = useState(false);
  const [overflowThreshold, setOverflowThreshold] = useState<number | null>(null);
  const {
    conversations,
    searchTerm,
    filter,
    loading,
    isMobile,
    activeMobileChat,
    showReportModal,
    reportingUser,
    dropdownRef,
    setSearchTerm,
    setFilter,
    setActiveMobileChat,
    setShowReportModal,
    setReportingUser,
    loadConversations,
    getTimeAgo,
    getLocalTime,
  } = useMessagesDropdown({
    userId: user?.id || null,
    isOpen,
    onClose,
    autoOpenData,
  });

    // Detect if dropdown would overflow
  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;

    const checkOverflow = () => {
      const dropdown = dropdownRef.current;
      if (!dropdown) return;

      const rect = dropdown.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const wouldOverflow = rect.right > viewportWidth;
      
      if (wouldOverflow && !alignRight) {
        // Starting to overflow, save threshold and switch to right alignment
        setOverflowThreshold(viewportWidth);
        setAlignRight(true);
      } else if (!wouldOverflow && alignRight && overflowThreshold) {
        // Check if we're above the threshold again
        if (viewportWidth > overflowThreshold) {
          setAlignRight(false);
          setOverflowThreshold(null);
        }
      }
    };

    // Check immediately and on resize
    setTimeout(checkOverflow, 0);
    window.addEventListener('resize', checkOverflow);

    return () => window.removeEventListener('resize', checkOverflow);
  }, [isOpen, alignRight, overflowThreshold]);

  if (!isOpen) return null;

  // Mobile chat view - use ChatWindow component
  if (isMobile && activeMobileChat !== null) {
    const activeConv = conversations.find(c => c.conversationId === activeMobileChat);
    if (!activeConv) return null;

    const mobileChat = (
      <>
        <ChatWindow
          conversationId={activeMobileChat}
          otherUserId={activeConv.otherUserId}
          otherUserName={activeConv.otherUserName}
          otherUserUsername={activeConv.otherUserUsername}
          otherUserAvatar={activeConv.otherUserAvatar}
          isMinimized={false}
          onMinimize={() => {}} // Not used on mobile
          onClose={onClose}
          isMobile={true}
          onBack={() => setActiveMobileChat(null)}
        />
        {showReportModal && reportingUser && (
          <ReportModal
            reportedUserId={reportingUser.userId}
            reportedUserName={reportingUser.userName}
            conversationId={reportingUser.conversationId}
            onClose={async () => {
              setShowReportModal(false);
              setReportingUser(null);
              setActiveMobileChat(null);
              await loadConversations();
            }}
          />
        )}
      </>
    );

    return createPortal(mobileChat, document.body);
  }


  const dropdownContent = (
    <div className={`${styles.dropdown} ${alignRight ? styles.dropdownAlignRight : ''}`} ref={dropdownRef}>
      <div className={styles.header}>
        <h3>Messages</h3>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      <div className={styles.search}>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'active' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'requests' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('requests')}
        >
          Requests
        </button>
      </div>

      <div className={styles.conversationList}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : conversations.length === 0 ? (
          <div className={styles.empty}>No conversations yet</div>
        ) : (
          conversations.map((conv) => (
            <div 
              key={conv.conversationId} 
              className={styles.conversation}
              onClick={() => {
                if (isMobile) {
                  setActiveMobileChat(conv.conversationId);
                } else {
                  onOpenChat(conv.conversationId, conv.otherUserId, conv.otherUserName, conv.otherUserAvatar, conv.otherUserUsername);
                  onClose();
                }
              }}
            >
              <div className={styles.avatar}>
                {conv.otherUserAvatar ? (
                  <img src={conv.otherUserAvatar} alt={conv.otherUserName} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {conv.otherUserName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className={styles.conversationContent}>
                <div className={styles.conversationHeader}>
                  <span className={styles.userName}>{conv.otherUserName || conv.otherUserId}</span>
                  <span className={styles.time}>{getTimeAgo(conv.lastMessageAt)}</span>
                </div>
                <div className={styles.usernameLine}>
                  {getLocalTime()} • @{conv.otherUserUsername || conv.otherUserId.slice(0, 8)}
                </div>
                <div className={styles.lastMessage}>
                  {conv.lastMessage}
                  {conv.unreadCount > 0 && (
                    <span className={styles.unreadBadge}>{conv.unreadCount}</span>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );

  // Use portal on mobile to escape mobile nav container
  if (isMobile) {
    return createPortal(dropdownContent, document.body);
  }

  return dropdownContent;
};
