import { useState } from 'react';
import { sendTestEmail, sendTestPush, sendTestNotification } from '../services/notificationService';
import { sendTestNotification as sendBrowserNotification } from '../services/pushService';

export const useTestNotifications = (userId: string | null) => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testEmail = async () => {
    if (!userId) return;
    
    setLoading(true);
    setResult('Sending test email...');
    
    try {
      const data = await sendTestEmail(userId);
      setResult(data.success 
        ? '✅ Test email sent! Check your inbox.' 
        : `❌ Failed: ${data.error || 'Unknown error'}`
      );
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testPush = async () => {
    if (!userId) return;
    
    setLoading(true);
    setResult('Sending test push notification...');
    
    try {
      const data = await sendTestPush(userId);
      setResult(data.success 
        ? '✅ Test push sent! Check your browser.' 
        : `⚠️ ${data.message || 'No active subscriptions'}`
      );
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBoth = async () => {
    if (!userId) return;
    
    setLoading(true);
    setResult('Sending full test notification...');
    
    try {
      const data = await sendTestNotification(userId);
      setResult(data.success 
        ? '✅ Full notification sent! Check your email and browser.' 
        : `❌ Failed: ${data.error || 'Unknown error'}`
      );
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBrowserNotification = () => {
    sendBrowserNotification();
    setResult('✅ Browser notification triggered (if permission granted)');
  };

  return {
    result,
    loading,
    testEmail,
    testPush,
    testBoth,
    testBrowserNotification,
  };
};
