import { useAuth } from '../../contexts/AuthContext';
import { useChatWindow } from '../../hooks/useChatWindow';
import { EmojiPicker } from './EmojiPicker';
import { ImageModal } from '../modals/ImageModal';
import { ReportModal } from '../modals/ReportModal';
import { useConversationActivity } from '../../hooks/useConversationActivity';
import { FILE_RULES } from '../../../../backend/src/config/fileConstraints';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  conversationId: number;
  otherUserId: string;
  otherUserName?: string;
  otherUserUsername?: string;
  otherUserAvatar?: string;
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  isMobile?: boolean;  
  onBack?: () => void; // for mobile back button
}


export const ChatWindow = ({
  conversationId,
  otherUserId,
  otherUserName = 'User',
  otherUserUsername,
  otherUserAvatar,
  isMinimized,
  onMinimize,
  onClose,
  isMobile = false,
  onBack,
}: ChatWindowProps) => {
  const { user } = useAuth();
  useConversationActivity(user?.id || null, conversationId, !isMinimized);
  const {
    messages,
    newMessage,
    setNewMessage,
    showOptions,
    setShowOptions,
    showEmojis,
    setShowEmojis,
    attachedFile,
    imageModal,
    setImageModal,
    showReportModal,
    setShowReportModal,
    messagesEndRef,
    optionsRef,
    fileInputRef,
    sendMessage,
    retryMessage,
    handleFileSelect,
    removeAttachment,
    handleViewProfile,
    handleRemoveChat,
    handleBlock,
    handleReport,
    formatMessageTime,
    getLocalTime,
  } = useChatWindow(conversationId, otherUserId, otherUserName, user?.id || null, onClose);

  if (isMinimized) {
    return (
      <div className={styles.minimized}>
        <div className={styles.minimizedHeader} onClick={onMinimize}>
          <div className={styles.minimizedAvatar}>
            {otherUserAvatar ? (
              <img src={otherUserAvatar} alt={otherUserName} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {otherUserName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <span className={styles.minimizedName}>{otherUserName}</span>
        </div>
        <button className={styles.minimizedClose} onClick={onClose}>×</button>
      </div>
    );
  }

  return (
    <div className={`${styles.chatWindow} ${isMobile ? styles.mobile : ''}`}>
      {/* Row 1: Header */}
      <div className={styles.header}>
        {isMobile && onBack && (
          <button className={styles.backBtn} onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
        
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {otherUserAvatar ? (
              <img src={otherUserAvatar} alt={otherUserName} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {otherUserName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>{otherUserName}</div>
            <div className={styles.userMeta}>
              {getLocalTime()} • @{otherUserUsername || otherUserId.slice(0, 8)}
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.optionsContainer} ref={optionsRef}>
            <button className={styles.headerBtn} onClick={() => setShowOptions(!showOptions)}>
              ⋯
            </button>
            {showOptions && (
              <div className={styles.optionsDropdown}>
                <button className={styles.optionItem} onClick={handleViewProfile}>
                  View Profile
                </button>
                <button className={styles.optionItem} onClick={handleRemoveChat}>
                  Remove Chat
                </button>
                <button className={styles.optionItem} onClick={handleBlock}>
                  Block @{otherUserName}
                </button>
                <button className={styles.optionItem} onClick={handleReport}>
                  Report @{otherUserName}
                </button>
              </div>
            )}
          </div>
          {!isMobile && (
            <button className={styles.headerBtn} onClick={onMinimize} title="Minimize">
              <svg className={styles.minimizeIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2 5, 8 11, 14 5"></polyline>
              </svg>
            </button>
          )}
          <button className={styles.headerBtn} onClick={onClose}>×</button>
        </div>
      </div>

      {/* Row 2: Messages */}
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${message.senderId === user?.id ? styles.ownMessage : styles.otherMessage}`}
          >
            {message.fileUrl && (
              <div className={styles.messageFile}>
                {message.fileType?.startsWith('image/') ? (
                  <img 
                    src={message.fileUrl}
                    alt={message.fileName || 'Image'}
                    className={styles.messageImage}
                    onClick={() => setImageModal({
                      url: message.fileUrl!,
                      name: message.fileName || 'image'
                    })}
                  />
                ) : message.fileType?.startsWith('audio/') ? (
                  <div className={styles.audioWrapper}>
                    <audio 
                      controls 
                      className={styles.messageAudio}
                      src={message.fileUrl}
                    >
                      Your browser does not support audio playback.
                    </audio>
                    <a
                      href={message.fileUrl}
                      download={message.fileName}
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
                    href={message.fileUrl}
                    download={message.fileName}
                    className={styles.messageDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                      <polyline points="13 2 13 9 20 9"/>
                    </svg>
                    <span>{message.fileName}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
            {message.content && (
              <div className={styles.messageContent}>{message.content}</div>
            )}
            <div className={styles.messageTime}>{formatMessageTime(message.createdAt)}</div>
            
            {/* Status indicator for own messages */}
            {message.senderId === user?.id && (
              <>
                {message.status === 'pending' && (
                  <div className={styles.messageStatus}>
                    <span className={styles.loadingSpinner}>⏳</span> Sending...
                  </div>
                )}
                
                {message.status === 'failed' && (
                  <div className={styles.messageStatus}>
                    <span className={styles.errorIcon}>❌</span> Failed to send
                    <button 
                      className={styles.retryBtn} 
                      onClick={() => retryMessage(message.tempId!)}
                    >
                      Retry
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Row 3: Input */}
      <div className={styles.inputContainer}>
        {attachedFile && (
          <div className={styles.attachmentPreview}>
            <div className={styles.attachmentInfo}>
              {attachedFile.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(attachedFile)} 
                  alt="Preview" 
                  className={styles.attachmentImage}
                />
              ) : (
                <div className={styles.attachmentFile}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                  <span className={styles.fileName}>{attachedFile.name}</span>
                </div>
              )}
            </div>
            <button className={styles.removeAttachment} onClick={removeAttachment}>×</button>
          </div>
        )}
        <div>
          <div className={styles.inputWrapper}>
            <textarea
              className={styles.input}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                const target = e.target;
                target.style.height = '0px';
                const newHeight = Math.max(42, Math.min(target.scrollHeight, 100));
                target.style.height = newHeight + 'px';
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={1}
            />
            <div className={styles.emojiContainer}>
              <button 
                className={styles.emojiBtn} 
                onClick={() => setShowEmojis(!showEmojis)}
                title="Add emoji"
              >
                😊
              </button>
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
          <input
            ref={fileInputRef}
            type="file"
            accept={FILE_RULES.MESSAGE_ATTACHMENT.accept}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button 
            className={styles.attachBtn} 
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
          <button 
            className={styles.sendBtn} 
            onClick={sendMessage} 
            disabled={!newMessage.trim() && !attachedFile}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      {imageModal && (
        <ImageModal
          imageUrl={imageModal.url}
          fileName={imageModal.name}
          onClose={() => setImageModal(null)}
        />
      )}

      {showReportModal && (
        <ReportModal
          reportedUserId={otherUserId}
          reportedUserName={otherUserName}
          conversationId={conversationId}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
