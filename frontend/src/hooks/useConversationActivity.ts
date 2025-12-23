import { useEffect, useRef } from 'react';
import { markConversationActive, markConversationInactive } from '../services/conversationActivityService';

/**
 * Hook to track when user is actively viewing a conversation.
 * Automatically sends heartbeat every 30 seconds and cleans up on unmount.
 * Pauses when browser tab is hidden.
 */
export const useConversationActivity = (
  userId: string | null,
  conversationId: number | null,
  isActive: boolean = true
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Don't track if no user/conversation or explicitly disabled
    if (!userId || !conversationId || !isActive) {
      return;
    }

    let isCleanedUp = false;

    // Check if tab is currently visible
    const isTabVisible = !document.hidden;
    
    // Only start tracking if tab is visible
    if (!isTabVisible) {
      return;
    }

    // Small delay to prevent rapid mount/unmount in React Strict Mode
    const activateTimeout = setTimeout(() => {
      if (isCleanedUp) return;
      
      markConversationActive(userId, conversationId);
      console.log(`Started tracking conversation ${conversationId} as active`);
    }, 100); // 100ms delay

    // Send heartbeat every 30 seconds
    intervalRef.current = setInterval(() => {
      if (isCleanedUp) return;
      
      // Only send heartbeat if tab is visible
      if (!document.hidden) {
        markConversationActive(userId, conversationId);
        console.log(`Heartbeat: conversation ${conversationId} still active`);
      }
    }, 30000); // 30 seconds

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden && intervalRef.current) {
        // Tab hidden - pause heartbeat but don't cleanup
        console.log(`Tab hidden, pausing heartbeat for conversation ${conversationId}`);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else if (!document.hidden && !intervalRef.current && !isCleanedUp) {
        // Tab visible again - resume heartbeat
        console.log(`Tab visible, resuming heartbeat for conversation ${conversationId}`);
        intervalRef.current = setInterval(() => {
          if (!isCleanedUp && !document.hidden) {
            markConversationActive(userId, conversationId);
            console.log(`Heartbeat: conversation ${conversationId} still active`);
          }
        }, 30000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup: Mark as inactive and stop heartbeat
    return () => {
      isCleanedUp = true;
      clearTimeout(activateTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      markConversationInactive(userId, conversationId);
      console.log(`Stopped tracking conversation ${conversationId}`);
    };
  }, [userId, conversationId, isActive]); // Removed isTabVisible from dependencies!
};
