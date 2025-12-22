import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config/env';
import { sendTestNotification } from '../services/pushService';

export const TestNotifications = () => {
  const { user } = useAuth();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testEmail = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setResult('Sending test email...');
    
    try {
      const res = await fetch(`${config.apiUrl}/api/test/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      const data = await res.json();
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
    if (!user?.id) return;
    
    setLoading(true);
    setResult('Sending test push notification...');
    
    try {
      const res = await fetch(`${config.apiUrl}/api/test/test-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      const data = await res.json();
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
    if (!user?.id) return;
    
    setLoading(true);
    setResult('Sending full test notification...');
    
    try {
      const res = await fetch(`${config.apiUrl}/api/test/test-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      const data = await res.json();
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
    sendTestNotification();
    setResult('✅ Browser notification triggered (if permission granted)');
  };

  if (!user) {
    return <div style={{ padding: '20px' }}>Please log in to test notifications</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Notification Testing</h1>
      <p>User ID: {user.id}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        <button 
          onClick={testEmail} 
          disabled={loading}
          style={{ padding: '12px', fontSize: '16px' }}
        >
          Test Email Notification
        </button>
        
        <button 
          onClick={testPush} 
          disabled={loading}
          style={{ padding: '12px', fontSize: '16px' }}
        >
          Test Push Notification
        </button>
        
        <button 
          onClick={testBoth} 
          disabled={loading}
          style={{ padding: '12px', fontSize: '16px' }}
        >
          Test Both (Full Notification)
        </button>
        
        <button 
          onClick={testBrowserNotification} 
          disabled={loading}
          style={{ padding: '12px', fontSize: '16px', background: '#6366f1' }}
        >
          Test Browser Notification (Direct)
        </button>
      </div>

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#f3f4f6',
          borderRadius: '8px',
          whiteSpace: 'pre-wrap'
        }}>
          {result}
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#fff3cd', borderRadius: '8px' }}>
        <h3>Before Testing:</h3>
        <ol>
          <li>Make sure you've enabled notifications in Settings</li>
          <li>For push notifications, grant browser permission when prompted</li>
          <li>Check your email inbox for email notifications</li>
          <li>Check browser notifications for push notifications</li>
        </ol>
      </div>
    </div>
  );
};
