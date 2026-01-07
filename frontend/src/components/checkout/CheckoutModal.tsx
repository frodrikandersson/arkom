import { useState, useEffect } from 'react';
import { StripeElementsWrapper } from '../../contexts/StripeContext';
import { CheckoutForm } from './CheckoutForm';
import { createPaymentIntent, PaymentIntentResponse } from '../../services/stripeService';
import styles from './CheckoutModal.module.css';

interface CheckoutModalProps {
  serviceId: number;
  serviceTitle: string;
  orderType: 'custom_proposal' | 'instant_order';
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export const CheckoutModal = ({
  serviceId,
  serviceTitle,
  orderType,
  onClose,
  onSuccess,
}: CheckoutModalProps) => {
  const [paymentData, setPaymentData] = useState<PaymentIntentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializePayment();
  }, [serviceId, orderType]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await createPaymentIntent(serviceId, orderType);
      setPaymentData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (orderId: string) => {
    onSuccess(orderId);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>Complete Payment</h2>
          <p className={styles.subtitle}>{serviceTitle}</p>
        </div>

        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Setting up payment...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>!</div>
              <p className={styles.errorText}>{error}</p>
              <button onClick={initializePayment} className={styles.retryBtn}>
                Try Again
              </button>
            </div>
          )}

          {paymentData && paymentData.clientSecret && (
            <StripeElementsWrapper clientSecret={paymentData.clientSecret}>
              <CheckoutForm
                orderId={paymentData.orderId}
                amount={paymentData.amount}
                currency={paymentData.currency}
                onSuccess={handleSuccess}
                onCancel={onClose}
              />
            </StripeElementsWrapper>
          )}

          {paymentData && (
            <div className={styles.breakdown}>
              <div className={styles.breakdownRow}>
                <span>Service Price</span>
                <span>€{(paymentData.amount / 100).toFixed(2)}</span>
              </div>
              <div className={styles.breakdownRow}>
                <span>Platform Fee (5%)</span>
                <span>€{(paymentData.platformFee / 100).toFixed(2)}</span>
              </div>
              <div className={styles.breakdownDivider} />
              <div className={styles.breakdownRow}>
                <span>Artist Receives</span>
                <span className={styles.artistPayout}>€{(paymentData.sellerPayout / 100).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
