import { createContext, useContext, ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { config } from '../config/env';

// Initialize Stripe outside of component to avoid recreating on re-renders
const stripePromise = config.stripePublishableKey
  ? loadStripe(config.stripePublishableKey)
  : null;

interface StripeContextValue {
  stripe: Promise<Stripe | null> | null;
  isConfigured: boolean;
}

const StripeContext = createContext<StripeContextValue>({
  stripe: null,
  isConfigured: false,
});

export const useStripeContext = () => useContext(StripeContext);

interface StripeProviderProps {
  children: ReactNode;
}

export const StripeProvider = ({ children }: StripeProviderProps) => {
  const value: StripeContextValue = {
    stripe: stripePromise,
    isConfigured: !!config.stripePublishableKey,
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};

// Wrapper for Elements that handles the client secret
interface StripeElementsWrapperProps {
  clientSecret: string;
  children: ReactNode;
}

export const StripeElementsWrapper = ({ clientSecret, children }: StripeElementsWrapperProps) => {
  if (!stripePromise) {
    return <div>Stripe is not configured</div>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#635bff',
            colorBackground: '#1a1a2e',
            colorText: '#ffffff',
            colorTextSecondary: '#a0a0a0',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
};
