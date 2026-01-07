import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styles from './CheckoutForm.module.css';

interface CheckoutFormProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
}

export const CheckoutForm = ({
  orderId,
  amount,
  currency,
  onSuccess,
  onCancel,
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/${orderId}/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An error occurred during payment.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(orderId);
    } else {
      // Payment requires additional action or is processing
      setErrorMessage('Payment is being processed. Please wait...');
      setIsProcessing(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.amountSection}>
        <span className={styles.amountLabel}>Total Amount</span>
        <span className={styles.amountValue}>{formatCurrency(amount)}</span>
      </div>

      <div className={styles.paymentSection}>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className={styles.error}>
          {errorMessage}
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelBtn}
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={styles.payBtn}
        >
          {isProcessing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
        </button>
      </div>

      <p className={styles.securityNote}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Payments are securely processed by Stripe
      </p>
    </form>
  );
};
