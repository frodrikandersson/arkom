import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { incrementUserCounter } from '../services/counterService';
import { AuthButtons } from '../components/AuthButtons/AuthButtons';
import { CounterButton } from '../components/CounterButton/CounterButton';
import { Leaderboard } from '../components/Leaderboard/Leaderboard';
import { useState } from 'react';

export const HomePage = () => {
  const { user, isLoggedIn } = useAuth();
  const { count, leaderboard, loading, error, refetch } = useDashboard(user?.id || null);
  const [incrementError, setIncrementError] = useState<string | null>(null);

  const handleIncrement = async () => {
    if (!user) return;

    try {
      setIncrementError(null);
      await incrementUserCounter(user.id);
      await refetch(); // Refresh dashboard after increment
    } catch (err: any) {
      setIncrementError(err.message || 'Failed to increment counter');
      console.error('Failed to increment:', err);
    }
  };

  return (
    <div className="app">
      <h1>Arkom</h1>
      <p>Art showcase platform</p>
      
      <AuthButtons 
        isLoggedIn={isLoggedIn} 
        userName={user?.displayName || user?.primaryEmail} 
      />

      {isLoggedIn && user && (
        <CounterButton 
          count={count}
          loading={loading}
          error={incrementError || error}
          onIncrement={handleIncrement}
        />
      )}

      <Leaderboard 
        leaderboard={leaderboard}
        currentUserId={user?.id}
        loading={loading}
        error={error}
      />
    </div>
  );
};