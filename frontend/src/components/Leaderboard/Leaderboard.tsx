import type { LeaderboardEntry } from '../../models/Counter';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentUserId?: string;
  loading?: boolean;
  error?: string | null;
}

export const Leaderboard = ({ leaderboard, currentUserId, loading, error }: LeaderboardProps) => {
  if (loading) {
    // return (
    //   <div style={{ marginTop: '2rem' }}>
    //     <h2>Leaderboard</h2>
    //     <p>Loading...</p>
    //   </div>
    // );
  }

  if (error) {
    return (
      <div style={{ marginTop: '2rem' }}>
        <h2>Leaderboard</h2>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Leaderboard</h2>
      {leaderboard.length > 0 ? (
        <ol>
          {leaderboard.map((entry) => (
            <li key={entry.user_id}>
              {entry.display_name || entry.primary_email || `User ${entry.user_id.slice(0, 8)}...`} - {entry.count} clicks
              {currentUserId && entry.user_id === currentUserId && ' (You!)'}
            </li>
          ))}
        </ol>
      ) : (
        <p>No scores yet!</p>
      )}
    </div>
  );
};