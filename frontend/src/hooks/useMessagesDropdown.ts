import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Conversation, Message } from '../models';
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
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileChat, setActiveMobileChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [imageModal, setImageModal] = useState<{ url: string; name: string } | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingUser, setReportingUser] = useState<{userId: string; userName: string; conversationId: number} | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
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
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Don't close if clicking inside the dropdown
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }

      // Don't close if clicking inside the mobile chat view (it's portaled to body)
      const mobileChatElement = target instanceof Element && target.closest('[class*="mobileChat"]');
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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      loadMessages(autoOpenData.conversationId);
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

  const loadMessages = async (conversationId: number) => {
    if (!userId) return;

    try {
      const messages = await messageService.getMessages(conversationId);
      setMessages(messages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      
      // Mark messages as read
      await messageService.markAsRead(conversationId, userId);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const sendMessageHandler = async (conversationId: number, otherUserId: string) => {
    if (!newMessage.trim() || !userId) return;

    try {
      await messageService.sendMessage(userId, otherUserId, newMessage.trim());
      setNewMessage('');
      await loadMessages(conversationId);
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
    if (!userId) return;
    
    if (!confirm(`Hide conversation with ${otherUserName || 'this user'}? You can still find it by searching for them.`)) {
      return;
    }

    try {
      await messageService.hideConversation(conversationId, userId);
      setShowOptions(false);
      setActiveMobileChat(null);
      await loadConversations();
    } catch (err) {
      console.error('Failed to hide conversation:', err);
      alert('Failed to hide conversation. Please try again.');
    }
  };

  const handleBlock = async (conversationId: number, otherUserId: string, otherUserName?: string) => {
    if (!userId) return;
    
    if (!confirm(`Block @${otherUserName || 'this user'}? They won't be able to message you.`)) {
      return;
    }

    try {
      // Block the user
      const blockRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          blockedUserId: otherUserId,
        }),
      });

      if (!blockRes.ok) {
        throw new Error('Failed to block user');
      }

      // Also hide the conversation
      await messageService.hideConversation(conversationId, userId);

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

    const getLocalTime = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };


  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.otherUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    newMessage,
    messages,
    showEmojis,
    imageModal,
    showOptions,
    showReportModal,
    reportingUser,
    
    // Refs
    messagesEndRef,
    optionsRef,
    dropdownRef,
    
    // State setters
    setSearchTerm,
    setFilter,
    setActiveMobileChat,
    setNewMessage,
    setShowEmojis,
    setImageModal,
    setShowOptions,
    setShowReportModal,
    setReportingUser,
    
    // Functions
    loadConversations,
    loadMessages,
    sendMessageHandler,
    handleViewProfile,
    handleRemoveChat,
    handleBlock,
    handleReport,
    getTimeAgo,
    getLocalTime,
  };
};
