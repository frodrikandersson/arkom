import { useState, useEffect, useRef } from 'react';
import { Conversation } from '../models';
import * as messageService from '../services/messageService';

interface UseMessagesDropdownParams {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  autoOpenData?: {
    conversationId: number;
    otherUserId: string;
    otherUserName?: string;
    otherUserAvatar?: string;
  };
}

type FilterType = 'all' | 'active' | 'requests';

export const useMessagesDropdown = ({ userId, isOpen, onClose, autoOpenData }: UseMessagesDropdownParams) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileChat, setActiveMobileChat] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingUser, setReportingUser] = useState<{userId: string; userName: string; conversationId: number} | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    // Delay adding the listener to ensure the dropdown ref is set
    const timeoutId = setTimeout(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;

        // Don't close if clicking inside the dropdown
        if (dropdownRef.current && dropdownRef.current.contains(target)) {
          return;
        }

        // Don't close if clicking inside the mobile chat view (ChatWindow component)
        const mobileChatElement = target instanceof Element && (
          target.closest('[class*="chatWindow"]') || 
          target.closest('[class*="emojiPicker"]') ||
          target.closest('[class*="imageModal"]') ||
          target.closest('[class*="reportModal"]')
        );
        if (mobileChatElement) {
          return;
        }

        // Don't close if clicking on UserMenu or its dropdown (mobile conflict fix)
        const userMenuElement = document.querySelector('[class*="userMenu"]');
        if (userMenuElement && userMenuElement.contains(target)) {
          return;
        }

        // Don't close if clicking on the message button itself
        const messageButtonElement = target instanceof Element && target.closest('[aria-label="Messages"]');
        if (messageButtonElement) {
          return;
        }

        // Otherwise, close the dropdown
        onClose();
      };

      document.addEventListener('mousedown', handleClickOutside);

      // Return cleanup function for this timeout
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, 100); // 100ms delay to ensure ref is set

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOpen, onClose]);

  // Load conversations when opened
  useEffect(() => {
    if (isOpen && userId) {
      loadConversations();
    }
  }, [isOpen, userId]);

  // Auto-open specific chat when navigating from profile
  useEffect(() => {
    if (isOpen && autoOpenData && isMobile) {
      setActiveMobileChat(autoOpenData.conversationId);
    }
  }, [isOpen, autoOpenData, isMobile]);

  const loadConversations = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const conversations = await messageService.getConversations(userId);
      setConversations(conversations);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = (conversationId: number, otherUserId: string, otherUserName?: string) => {
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

    const getLocalTime = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };


  const filteredConversations = conversations.filter((conv) => {
    // Safety check: ensure required fields exist
    if (!conv.otherUserName || conv.lastMessage === null || conv.lastMessage === undefined) {
      return false;
    }
    
    const matchesSearch = conv.otherUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (conv.lastMessage || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // TODO: Implement filter logic for active clients and requests
    return matchesSearch;
  });


  return {
    // State
    conversations: filteredConversations,
    searchTerm,
    filter,
    loading,
    isMobile,
    activeMobileChat,
    showReportModal,
    reportingUser,
    
    // Refs
    dropdownRef,
    
    // State setters
    setSearchTerm,
    setFilter,
    setActiveMobileChat,
    setShowReportModal,
    setReportingUser,
    
    // Functions
    loadConversations,
    handleReport,
    getTimeAgo,
    getLocalTime,
  };
};
