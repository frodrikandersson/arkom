import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './useNotifications';
import { Notification, OnOpenChatFunction } from '../models';
import { getConversations } from '../services/messageService';

export const useAlertButton = (onOpenChat?: OnOpenChatFunction) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Extract userId as stable primitive
  const userId = user?.id ?? null;
  
  const {
    notifications,
    unreadCount,
    loading,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(userId);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Refetch when dropdown opens
  useEffect(() => {
    if (isOpen && userId) {
      refetch();
    }
  }, [isOpen, userId, refetch]); // Use stable userId instead of user?.id

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking the button itself
      const button = document.querySelector('[aria-label="Notifications"]');
      if (button && button.contains(target)) {
        return;
      }
      
      // Don't close if clicking inside dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Format timestamp utility
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
            const { conversations } = await getConversations(user.id);
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

  return {
    user,
    isOpen,
    setIsOpen,
    isMobile,
    dropdownRef,
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
    formatTime,
    handleNotificationClick,
    deleteNotification,
  };
};
