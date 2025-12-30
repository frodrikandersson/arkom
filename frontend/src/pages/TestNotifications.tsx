import { useAuth } from '../contexts/AuthContext';
import { useTestNotifications } from '../hooks/useTestNotifications';

export const TestNotifications = () => {
  const { user } = useAuth();
  const {
    result,
    loading,
    testEmail,
    testPush,
    testBoth,
    testBrowserNotification,
  } = useTestNotifications(user?.id || null);

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
