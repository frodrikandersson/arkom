import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMessages, markAsRead, sendMessage, hideConversation } from '../services/messageService';
import { blockUser } from '../services/userService';
import { Message } from '../models';
import { validateFile } from '../../../backend/src/config/fileConstraints';

export const useChatWindow = (
  conversationId: number,
  otherUserId: string,
  otherUserName: string,
  userId: string | null,
  onClose: () => void
) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [imageModal, setImageModal] = useState<{ url: string; name: string } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!conversationId || !userId) return;

    const pollInterval = setInterval(() => {
      loadMessages();
    }, 3000); // 3 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [conversationId, userId]);

  const loadMessages = async () => {
    try {
      const { messages: msgs } = await getMessages(conversationId);
      setMessages(msgs);
      
      if (userId) {
        await markAsRead(conversationId, userId);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachedFile) || !userId) return;

    // Generate temporary ID for optimistic message
    const tempId = crypto.randomUUID();
    const messageContent = newMessage;
    const messageFile = attachedFile;

    // Create optimistic message
    const optimisticMessage: Message = {
      id: -1, // Temporary negative ID
      tempId,
      conversationId,
      senderId: userId,
      content: messageContent || null,
      fileUrl: messageFile ? URL.createObjectURL(messageFile) : null,
      fileName: messageFile?.name || null,
      fileType: messageFile?.type || null,
      fileSize: messageFile?.size || null,
      isRead: true,
      createdAt: new Date(),
      status: 'pending',
    };

    // Immediately add to UI
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Clear input immediately
    setNewMessage('');
    setAttachedFile(null);

    // Send in background
    try {
      const { message: sentMessage } = await sendMessage(userId, otherUserId, messageContent, messageFile || undefined);

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg =>
        msg.tempId === tempId
          ? { ...sentMessage, status: 'sent' as const }
          : msg
      ));
    } catch (err) {
      console.error('Failed to send message:', err);
      
      // Mark as failed
      setMessages(prev => prev.map(msg => 
        msg.tempId === tempId 
          ? { ...msg, status: 'failed' as const, error: 'Failed to send' }
          : msg
      ));
    }
  };

const retryMessage = async (tempId: string) => {
  const failedMsg = messages.find(m => m.tempId === tempId);
  if (!failedMsg || !userId) return;

  // Mark as pending again
  setMessages(prev => prev.map(msg => 
    msg.tempId === tempId 
      ? { ...msg, status: 'pending' as const }
      : msg
  ));

  try {
    const { message: sentMessage } = await sendMessage(
      userId,
      otherUserId,
      failedMsg.content || '',
      undefined // Can't retry file uploads easily
    );

    setMessages(prev => prev.map(msg =>
      msg.tempId === tempId
        ? { ...sentMessage, status: 'sent' as const }
        : msg
    ));
  } catch (err) {
    setMessages(prev => prev.map(msg => 
      msg.tempId === tempId 
        ? { ...msg, status: 'failed' as const }
        : msg
    ));
  }
};


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'MESSAGE_ATTACHMENT');
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      setAttachedFile(file);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewProfile = () => {
    setShowOptions(false);
    onClose();
    navigate(`/profile/${otherUserId}`);
  };

  const handleRemoveChat = async () => {
    if (!userId) return;
    
    if (!confirm(`Hide conversation with ${otherUserName}? You can still find it by searching for them.`)) {
      return;
    }

    try {
      await hideConversation(conversationId, userId);
      setShowOptions(false);
      onClose();
    } catch (err) {
      console.error('Failed to hide conversation:', err);
      alert('Failed to hide conversation. Please try again.');
    }
  };

  const handleBlock = async () => {
    if (!userId) return;
    
    if (!confirm(`Block @${otherUserName}? They won't be able to message you, and you won't see their messages.`)) {
      return;
    }

    try {
      await blockUser(userId, otherUserId, 'blocked_from_chat');
      await hideConversation(conversationId, userId);
      setShowOptions(false);
      onClose();
      alert(`@${otherUserName} has been blocked.`);
    } catch (err) {
      console.error('Failed to block user:', err);
      alert('Failed to block user. Please try again.');
    }
  };

  const handleReport = () => {
    setShowOptions(false);
    setShowReportModal(true);
  };

  const formatMessageTime = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const isToday = messageDate.toDateString() === today.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return messageDate.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getLocalTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return {
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
    sendMessage: handleSendMessage,
    retryMessage,
    handleFileSelect,
    removeAttachment,
    handleViewProfile,
    handleRemoveChat,
    handleBlock,
    handleReport,
    formatMessageTime,
    getLocalTime,
  };
};
