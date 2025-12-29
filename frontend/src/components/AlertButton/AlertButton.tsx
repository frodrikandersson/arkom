import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification, OnOpenChatFunction } from '../../models';
import { getConversations } from '../../services/messageService';
import styles from './AlertButton.module.css';

interface AlertButtonProps {
  onOpenChat?: OnOpenChatFunction;
}

export const AlertButton = ({ onOpenChat }: AlertButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(user?.id || null);

  // Add mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle notification click with improved UX
  const handleNotificationClick = async (notification: Notification) => {
    // Close the dropdown immediately
    setIsOpen(false);

    // Handle navigation first, before deleting
    if (notification.actionUrl) {
      // Parse the actionUrl to check if it's a message notification
      const url = new URL(notification.actionUrl, window.location.origin);
      
      if (url.pathname === '/messages' && notification.type === 'message') {
        // Extract conversation ID from URL params
        const conversationId = url.searchParams.get('conversation');
        
        if (conversationId && notification.relatedUserId && user?.id) {
          // Fetch user conversations to get proper user details
          try {
            const conversations = await getConversations(user.id);
            const conversation = conversations.find(c => c.conversationId === parseInt(conversationId));
            
            // Check if mobile view
            if (window.innerWidth <= 768) {
              // For mobile: Navigate with state to trigger auto-open
              navigate('/', {
                state: {
                  openMobileChat: true,
                  conversationId: parseInt(conversationId),
                  otherUserId: notification.relatedUserId,
                  otherUserName: conversation?.otherUserName,
                  otherUserAvatar: conversation?.otherUserAvatar,
                }
              });
            } else if (onOpenChat) {
              // For desktop: Navigate and open chat window with proper user details
              navigate('/');
              
              onOpenChat(
                parseInt(conversationId),
                notification.relatedUserId,
                conversation?.otherUserName,
                conversation?.otherUserAvatar,
                conversation?.otherUserUsername
              );
            } else {
              // Fallback if no onOpenChat provided
              navigate(url.pathname + url.search);
            }
          } catch (error) {
            console.error('Failed to fetch conversation details:', error);
            // Fallback to navigation without details
            navigate(url.pathname + url.search);
          }
        } else {
          // Fallback to normal navigation if missing data
          navigate(url.pathname + url.search);
        }
      } else {
        // For other notification types, just navigate normally
        navigate(url.pathname + url.search);
      }
    }

    // Mark as read and delete AFTER navigation has been triggered
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    deleteNotification(notification.id);
  };


  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Refetch when dropdown opens
  useEffect(() => {
    if (isOpen && user?.id) {
      refetch();
    }
  }, [isOpen, user?.id, refetch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  // Create dropdown content
  const dropdownContent = isOpen && (
    <div className={styles.dropdown} ref={dropdownRef}>
      <div className={styles.header}>
        <h3>Notifications</h3>
        {isMobile && (
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            ×
          </button>
        )}
      </div>

      <div className={styles.notificationList}>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>No notifications</div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id}
              className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className={styles.notificationContent}>
                <div className={styles.notificationTitle}>{notification.title}</div>
                <div className={styles.notificationMessage}>{notification.message}</div>
                <div className={styles.notificationTime}>{formatTime(notification.createdAt)}</div>
              </div>
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                aria-label="Delete notification"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {unreadCount > 0 && (
        <button 
          className={styles.markAllReadBottom}
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      )}
    </div>
  );


  return (
    <div className={styles.container}>
      <button 
        className={styles.button}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Use portal on mobile to escape mobile nav container */}
      {isMobile && dropdownContent ? createPortal(dropdownContent, document.body) : dropdownContent}
    </div>
  );
};
