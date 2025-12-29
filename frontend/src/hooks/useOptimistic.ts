import { useState, useCallback } from 'react';

// Used for simple optimistic UI updates where full state management libraries would be overkill.
// Counter (single number)
// Like button (boolean)
// Simple form submissions
// Toggle states

export function useOptimistic<State, Action>(
  state: State,
  updateFn: (currentState: State, action: Action) => State
): [State, (action: Action) => void] {
  const [optimisticState, setOptimisticState] = useState<State>(state);
  const [isPending, setIsPending] = useState(false);

  // Sync optimistic state with actual state when it changes
  if (!isPending && optimisticState !== state) {
    setOptimisticState(state);
  }

  const addOptimistic = useCallback(
    (action: Action) => {
      setIsPending(true);
      setOptimisticState((current) => updateFn(current, action));
      
      // Reset pending state after a tick (when parent state updates)
      Promise.resolve().then(() => setIsPending(false));
    },
    [updateFn]
  );

  return [optimisticState, addOptimistic];
}
