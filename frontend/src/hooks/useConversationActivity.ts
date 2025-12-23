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
  const intervalRef = useRef<number | null>(null);

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
    const activateTimeout = window.setTimeout(() => {
      if (isCleanedUp) return;
      
      markConversationActive(userId, conversationId);
    }, 100); // 100ms delay

    // Send heartbeat every 30 seconds
    intervalRef.current = window.setInterval(() => {
      if (isCleanedUp) return;
      
      // Only send heartbeat if tab is visible
      if (!document.hidden) {
        markConversationActive(userId, conversationId);
      }
    }, 30000); // 30 seconds

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden && intervalRef.current !== null) {
        // Tab hidden - pause heartbeat but don't cleanup
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else if (!document.hidden && intervalRef.current === null && !isCleanedUp) {
        // Tab visible again - resume heartbeat
        intervalRef.current = window.setInterval(() => {
          if (!isCleanedUp && !document.hidden) {
            markConversationActive(userId, conversationId);
          }
        }, 30000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup: Mark as inactive and stop heartbeat
    return () => {
      isCleanedUp = true;
      window.clearTimeout(activateTimeout);
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      markConversationInactive(userId, conversationId);
    };
  }, [userId, conversationId, isActive]);
};
