import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EmojiPicker } from '../EmojiPicker/EmojiPicker';
import { ImageModal } from '../ImageModal/ImageModal';
import { ReportModal } from '../ReportModal/ReportModal';
import styles from './MessagesDropdown.module.css';

interface Conversation {
  conversationId: number;
  otherUserId: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

interface MessagesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (conversationId: number, otherUserId: string, otherUserName?: string, otherUserAvatar?: string) => void;
  autoOpenData?: {
    conversationId: number;
    otherUserId: string;
    otherUserName?: string;
    otherUserAvatar?: string;
  };
}


type FilterType = 'all' | 'active' | 'requests';

  export const MessagesDropdown = ({ isOpen, onClose, onOpenChat, autoOpenData }: MessagesDropdownProps) => {

  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileChat, setActiveMobileChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [imageModal, setImageModal] = useState<{ url: string; name: string } | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingUser, setReportingUser] = useState<{userId: string; userName: string; conversationId: number} | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user]);

  // Auto-open specific chat when navigating from profile
useEffect(() => {
  if (isOpen && autoOpenData && isMobile) {
    setActiveMobileChat(autoOpenData.conversationId);
    loadMessages(autoOpenData.conversationId);
  }
}, [isOpen, autoOpenData, isMobile]);


  const loadConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/messages/conversations/${user.id}`);
      const data = await res.json();
      
      // TODO: Fetch user details for each conversation
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/messages/${conversationId}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      
      // Mark messages as read
      if (user) {
        await markAsRead(conversationId);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const markAsRead = async (conversationId: number) => {
    if (!user) return;
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/messages/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: user.id,
        }),
      });
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const sendMessage = async (conversationId: number, otherUserId: string) => {
    if (!newMessage.trim() || !user) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          recipientId: otherUserId,
          content: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage('');
        await loadMessages(conversationId);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleViewProfile = (otherUserId: string) => {
    setShowOptions(false);
    setActiveMobileChat(null);
    onClose();
    navigate(`/profile/${otherUserId}`);
  };

  const handleRemoveChat = async (conversationId: number, otherUserName?: string) => {
    if (!user) return;
    
    if (!confirm(`Hide conversation with ${otherUserName || 'this user'}? You can still find it by searching for them.`)) {
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/messages/hide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          conversationId,
        }),
      });

      if (res.ok) {
        setShowOptions(false);
        setActiveMobileChat(null);
        await loadConversations();
      }
    } catch (err) {
      console.error('Failed to hide conversation:', err);
      alert('Failed to hide conversation. Please try again.');
    }
  };

  const handleBlock = async (conversationId: number, otherUserId: string, otherUserName?: string) => {
    if (!user) return;
    
    if (!confirm(`Block @${otherUserName || 'this user'}? They won't be able to message you.`)) {
      return;
    }

    try {
      // Block the user
      const blockRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          blockedUserId: otherUserId,
        }),
      });

      if (!blockRes.ok) {
        throw new Error('Failed to block user');
      }

      // Also hide the conversation
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/messages/hide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          conversationId,
        }),
      });

      setShowOptions(false);
      setActiveMobileChat(null);
      alert(`User has been blocked.`);
      await loadConversations();
    } catch (err) {
      console.error('Failed to block user:', err);
      alert('Failed to block user. Please try again.');
    }
  };


  const handleReport = (conversationId: number, otherUserId: string, otherUserName?: string) => {
    setShowOptions(false);
    setReportingUser({
      userId: otherUserId,
      userName: otherUserName || 'user',
      conversationId,
    });
    setShowReportModal(true);
  };


  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Recently';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return messageDate.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.otherUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    // TODO: Implement filter logic for active clients and requests
    return matchesSearch;
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
            <div className={styles.userMeta}>@{activeConv.otherUserId.slice(0, 8)}</div>
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
          {messages.map((msg: any) => (
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
                        url: msg.fileUrl,
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
                  sendMessage(activeMobileChat, activeConv.otherUserId);
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
            onClick={() => sendMessage(activeMobileChat, activeConv.otherUserId)}
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
            isOpen={showReportModal}
            reportedUserId={reportingUser.userId}
            reportedUserName={reportingUser.userName}
            conversationId={reportingUser.conversationId}
            onClose={() => {
              setShowReportModal(false);
              setReportingUser(null);
            }}
            onSuccess={async () => {
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
        ) : filteredConversations.length === 0 ? (
          <div className={styles.empty}>No conversations yet</div>
        ) : (
          filteredConversations.map((conv) => (
            <div 
              key={conv.conversationId} 
              className={styles.conversation}
              onClick={() => {
                if (isMobile) {
                  setActiveMobileChat(conv.conversationId);
                  loadMessages(conv.conversationId);
                } else {
                  onOpenChat(conv.conversationId, conv.otherUserId, conv.otherUserName, conv.otherUserAvatar);
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
