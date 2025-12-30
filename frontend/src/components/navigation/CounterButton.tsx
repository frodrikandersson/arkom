import { useOptimistic } from '../../hooks/useOptimistic'; // Use our custom hook

interface CounterButtonProps {
  count: number;
  loading: boolean;
  error: string | null;
  onIncrement: () => Promise<void>;
}

export const CounterButton = ({ count, loading, error, onIncrement }: CounterButtonProps) => {
  const [optimisticCount, addOptimisticCount] = useOptimistic(
    count,
    (currentCount, increment: number) => currentCount + increment
  );

  const handleClick = async () => {
    addOptimisticCount(1);
    await onIncrement();
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : `Count: ${optimisticCount}`}
      </button>
      {error && <p style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>}
    </div>
  );
};
