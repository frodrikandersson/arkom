import { useAuth } from '../contexts/AuthContext';
import { useCounter } from '../hooks/useCounter';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { AuthButtons } from '../components/AuthButtons/AuthButtons';
import { CounterButton } from '../components/CounterButton/CounterButton';
import { Leaderboard } from '../components/Leaderboard/Leaderboard';

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
      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iure, est rerum placeat tenetur et eligendi iusto soluta modi minus libero minima. Inventore laudantium harum fugit nulla, aperiam recusandae autem quae? Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias ab similique beatae ducimus excepturi, sed quam cumque maxime repellat fuga impedit, fugit ipsa aliquid, iste corporis enim tempora quo commodi. Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio, numquam. Quos deserunt placeat saepe debitis voluptatum eveniet porro tenetur at assumenda. Quisquam et neque blanditiis, dolorum animi optio id ipsa! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic dolorem, dolore tempora eius aspernatur commodi magnam! Deleniti ut quidem dignissimos consequuntur, nam sit tenetur. Error quod accusamus labore quisquam accusantium. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ratione corporis maxime iusto ut praesentium dolore saepe vitae veritatis rerum unde iure libero ex non omnis impedit, rem quibusdam officia obcaecati.</p>
    </div>
  );
};