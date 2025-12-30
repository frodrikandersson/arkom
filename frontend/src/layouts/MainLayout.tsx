import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { MobileNav } from '../components/layout/MobileNav';
import { ChatManager } from '../components/messaging/ChatManager';
import { OnOpenChatFunction, OpenChat } from '../models';
import styles from './MainLayout.module.css';

export const MainLayout = () => {
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);
  
  // You can manage global state here for basket/messages/alerts
  const basketCount = 0; // TODO: Connect to basket state
  const messageCount = 0; // TODO: Connect to messages state

  const handleOpenChat: OnOpenChatFunction = (conversationId, otherUserId, otherUserName, otherUserAvatar, otherUserUsername) => {
    // Check if chat is already open
    const existingChat = openChats.find(chat => chat.conversationId === conversationId);
    
    if (existingChat) {
      // If minimized, restore it
      if (existingChat.isMinimized) {
        setOpenChats(openChats.map(chat =>
          chat.conversationId === conversationId ? { ...chat, isMinimized: false } : chat
        ));
      }
    } else {
      // Open new chat
      setOpenChats([...openChats, {
        conversationId,
        otherUserId,
        otherUserName,
        otherUserUsername,
        otherUserAvatar,
        isMinimized: false,
      }]);
    }
  };

  const handleCloseChat = (conversationId: number) => {
    setOpenChats(openChats.filter(chat => chat.conversationId !== conversationId));
  };

  const handleMinimizeChat = (conversationId: number) => {
    setOpenChats(openChats.map(chat =>
      chat.conversationId === conversationId ? { ...chat, isMinimized: !chat.isMinimized } : chat
    ));
  };

  return (
    <div className={styles.layout}>
      <Header 
        basketCount={basketCount}
        messageCount={messageCount}
        onOpenChat={handleOpenChat}
      />
      <main className={styles.main}>
        <Outlet context={{ onOpenChat: handleOpenChat }} />
      </main>
      <MobileNav 
        basketCount={basketCount}
        messageCount={messageCount}
        onOpenChat={handleOpenChat}
      />
      <ChatManager
        openChats={openChats}
        onCloseChat={handleCloseChat}
        onMinimizeChat={handleMinimizeChat}
      />
    </div>
  );
};
