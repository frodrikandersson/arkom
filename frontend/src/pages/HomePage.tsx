import { useAuth } from '../contexts/AuthContext';
import { useCounter } from '../hooks/useCounter';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { AuthButtons } from '../components/auth/AuthButtons';
import { CounterButton } from '../components/navigation/CounterButton';
import { Leaderboard } from '../components/navigation/Leaderboard';

export const HomePage = () => {
  const { user, isLoggedIn } = useAuth();
  const { count, loading, error, increment } = useCounter(user?.id || null);
  const { leaderboard, loading: leaderboardLoading, error: leaderboardError, refetch: refetchLeaderboard } = useLeaderboard();

  const handleIncrement = async () => {
    try {
      await increment();
      await refetchLeaderboard();
    } catch (err) {
      // Error already handled in hook
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
          error={error}
          onIncrement={handleIncrement}
        />
      )}

      <Leaderboard 
        leaderboard={leaderboard}
        currentUserId={user?.id}
        loading={leaderboardLoading}
        error={leaderboardError}
      />
    </div>
  );
};