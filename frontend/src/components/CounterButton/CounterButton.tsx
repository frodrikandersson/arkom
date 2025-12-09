interface CounterButtonProps {
  count: number;
  loading: boolean;
  error: string | null;
  onIncrement: () => void;
}

export const CounterButton = ({ count, loading, error, onIncrement }: CounterButtonProps) => {
  return (
    <div>
      <button onClick={onIncrement} disabled={loading}>
        {loading ? 'Loading...' : `Count: ${count}`}
      </button>
      {error && <p style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>}
    </div>
  );
};