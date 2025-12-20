import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMessagesDropdown } from '../../hooks/useMessagesDropdown';
import { EmojiPicker } from '../EmojiPicker/EmojiPicker';
import { ImageModal } from '../ImageModal/ImageModal';
import { ReportModal } from '../ReportModal/ReportModal';
import { OnOpenChatFunction } from '../../models';
import styles from './MessagesDropdown.module.css';

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
  
  const {
    conversations,
    searchTerm,
    filter,
    loading,
    isMobile,
    activeMobileChat,
    newMessage,
    messages,
    showEmojis,
    imageModal,
    showOptions,
    showReportModal,
    reportingUser,
    messagesEndRef,
    optionsRef,
    dropdownRef,
    setSearchTerm,
    setFilter,
    setActiveMobileChat,
    setNewMessage,
    setShowEmojis,
    setImageModal,
    setShowOptions,
    setShowReportModal,
    setReportingUser,
    loadConversations,
    loadMessages,
    sendMessageHandler,
    handleViewProfile,
    handleRemoveChat,
    handleBlock,
    handleReport,
    getTimeAgo,
    getLocalTime,
  } = useMessagesDropdown({
    userId: user?.id || null,
    isOpen,
    onClose,
    autoOpenData,
  });

  if (!isOpen) return null;

  // Mobile chat view
  if (isMobile && activeMobileChat !== null) {
    const activeConv = conversations.find(c => c.conversationId === activeMobileChat);
    if (!activeConv) return null;

    const mobileChatContent = (
      <div className={styles.mobileChat}>
        <div className={styles.mobileChatHeader}>
          <button className={styles.backBtn} onClick={() => setActiveMobileChat(null)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className={styles.avatar}>
            {activeConv.otherUserAvatar ? (
              <img src={activeConv.otherUserAvatar} alt={activeConv.otherUserName} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {activeConv.otherUserName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className={styles.conversationContent}>
            <div className={styles.userName}>{activeConv.otherUserName || activeConv.otherUserId}</div>
            <div className={styles.userMeta}>{getLocalTime()} • @{activeConv.otherUserUsername || activeConv.otherUserId.slice(0, 8)}</div>
          </div>
          
          <div className={styles.optionsContainer} ref={optionsRef}>
            <button className={styles.optionsBtn} onClick={() => setShowOptions(!showOptions)}>
              ⋯
            </button>
            {showOptions && (
              <div className={styles.optionsDropdown}>
                <button 
                  className={styles.optionItem}
                  onClick={() => handleViewProfile(activeConv.otherUserId)}
                >
                  View Profile
                </button>
                <button 
                  className={styles.optionItem}
                  onClick={() => handleRemoveChat(activeMobileChat, activeConv.otherUserName)}
                >
                  Remove Chat
                </button>
                <button 
                  className={styles.optionItem}
                  onClick={() => handleBlock(activeMobileChat, activeConv.otherUserId, activeConv.otherUserName)}
                >
                  Block @{activeConv.otherUserName || 'user'}
                </button>
                <button 
                  className={styles.optionItem}
                  onClick={() => handleReport(activeMobileChat, activeConv.otherUserId, activeConv.otherUserName)}
                >
                  Report @{activeConv.otherUserName || 'user'}
                </button>
              </div>
            )}
          </div>

          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.mobileChatMessages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.senderId === user?.id ? styles.ownMessage : styles.otherMessage}`}
            >
              {msg.fileUrl && (
                <div className={styles.messageFile}>
                  {msg.fileType?.startsWith('image/') ? (
                    <img 
                      src={msg.fileUrl}
                      alt={msg.fileName || 'Image'}
                      className={styles.messageImage}
                      onClick={() => setImageModal({
                        url: msg.fileUrl!,
                        name: msg.fileName || 'image'
                      })}
                    />
                  ) : msg.fileType?.startsWith('audio/') ? (
                    <div className={styles.audioWrapper}>
                      <audio 
                        controls 
                        className={styles.messageAudio}
                        src={msg.fileUrl}
                      >
                        Your browser does not support audio playback.
                      </audio>
                      <a
                        href={msg.fileUrl}
                        download={msg.fileName}
                        className={styles.downloadIcon}
                        title="Download"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </a>
                    </div>
                  ) : (
                    <a 
                      href={msg.fileUrl}
                      download={msg.fileName}
                      className={styles.messageDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                      </svg>
                      <span>{msg.fileName}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
              {msg.content && (
                <div className={styles.messageContent}>{msg.content}</div>
              )}
              <div className={styles.messageTime}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.mobileChatInput}>
          <div className={styles.inputWrapper}>
            <textarea
              className={styles.input}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                const target = e.target;
                target.style.height = '0px';
                const newHeight = Math.max(46, Math.min(target.scrollHeight, 120));
                target.style.height = newHeight + 'px';
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessageHandler(activeMobileChat, activeConv.otherUserId);
                }
              }}
              rows={1}
            />
            <div className={styles.emojiContainer}>
              <button className={styles.emojiBtn} onClick={() => setShowEmojis(!showEmojis)}>😊</button>
              {showEmojis && (
                <div className={styles.emojiPickerWrapper}>
                  <EmojiPicker
                    onEmojiSelect={(emoji) => {
                      setNewMessage(newMessage + emoji);
                      setShowEmojis(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <button className={styles.attachBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
          <button 
            className={styles.sendBtn} 
            onClick={() => sendMessageHandler(activeMobileChat, activeConv.otherUserId)}
            disabled={!newMessage.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    );

    return createPortal(
      <>
        {mobileChatContent}
        {imageModal && (
          <ImageModal
            imageUrl={imageModal.url}
            fileName={imageModal.name}
            onClose={() => setImageModal(null)}
          />
        )}
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
      </>,
      document.body
    );
  }

  const dropdownContent = (
    <div className={styles.dropdown} ref={dropdownRef}>
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
                  loadMessages(conv.conversationId);
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
