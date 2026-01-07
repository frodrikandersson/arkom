import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getStripeConnectStatus,
  startStripeOnboarding,
  createAccountLink,
  getStripeDashboardLink,
  StripeConnectStatus,
} from '../../services/stripeService';
import styles from './PaymentSettings.module.css';

export const PaymentSettings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<StripeConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();

    // Check for return from Stripe onboarding
    const stripeParam = searchParams.get('stripe');
    if (stripeParam === 'success') {
      setSuccessMessage('Stripe account setup updated! Checking status...');
      searchParams.delete('stripe');
      setSearchParams(searchParams);
      // Reload status after a short delay
      setTimeout(() => loadStatus(), 1000);
    } else if (stripeParam === 'refresh') {
      setError('Stripe session expired. Please try again.');
      searchParams.delete('stripe');
      setSearchParams(searchParams);
    }
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStripeConnectStatus();
      setStatus(data);
      setSuccessMessage(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleStartOnboarding = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const response = await startStripeOnboarding();
      // Redirect to Stripe onboarding
      window.location.href = response.onboardingUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to start onboarding');
      setActionLoading(false);
    }
  };

  const handleContinueOnboarding = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const response = await createAccountLink();
      window.location.href = response.onboardingUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to create account link');
      setActionLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const response = await getStripeDashboardLink();
      window.open(response.dashboardUrl, '_blank');
    } catch (err: any) {
      setError(err.message || 'Failed to open dashboard');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;

    const badges: Record<string, { text: string; className: string }> = {
      not_connected: { text: 'Not Connected', className: styles.statusNotConnected },
      onboarding: { text: 'Onboarding', className: styles.statusOnboarding },
      active: { text: 'Active', className: styles.statusActive },
      restricted: { text: 'Restricted', className: styles.statusRestricted },
    };

    const badge = badges[status.status] || badges.not_connected;
    return <span className={`${styles.statusBadge} ${badge.className}`}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Payment Settings</h2>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Payment Settings</h2>
      <p className={styles.description}>
        Connect your Stripe account to receive payments for your services.
      </p>

      {error && <div className={styles.error}>{error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}

      <div className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <div className={styles.stripeIcon}>
            <svg viewBox="0 0 60 25" width="60" height="25" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.02 1.04-.06 1.48zm-6.16-5.8c-1.2 0-2.16 1.04-2.28 2.76h4.62c0-1.62-.9-2.76-2.34-2.76zM39.67 19.7c-3.7 0-6.04-2.65-6.04-7.43 0-4.73 2.4-7.47 6.08-7.47 1.96 0 3.36.82 4.18 1.9V.0h4.5v19.42h-4.5v-1.62c-.8 1.14-2.23 1.9-4.22 1.9zm1.35-10.9c-1.68 0-2.75 1.52-2.75 3.49 0 1.94 1.05 3.46 2.75 3.46 1.62 0 2.83-1.36 2.83-3.44 0-2.15-1.13-3.51-2.83-3.51zM19.6 5.08h4.5v14.34h-4.5V5.08zm0-5.08h4.5v3.82h-4.5V0zM14.69 5.08c0 .67.03 1.52.06 2.24h-4.26c0-.39-.02-.78-.02-1.22-.65 1-1.94 1.5-3.52 1.5-3.13 0-4.72-2.13-4.72-4.33 0-3.1 2.41-4.57 6.52-4.57h1.52v-.24c0-1.3-.66-2.08-2.3-2.08-1.16 0-2.5.37-3.58.88V1.63C5.51.66 7.16.3 8.95.3c4.03 0 5.74 1.66 5.74 4.78zm-4.66 2.84v-.93H8.93c-1.54 0-2.22.45-2.22 1.38 0 .78.53 1.36 1.56 1.36 1.28 0 2.04-.85 2.04-1.81zM0 5.08h4.5v14.34H0V5.08z"/>
            </svg>
          </div>
          <div className={styles.statusInfo}>
            <span className={styles.statusLabel}>Account Status</span>
            {getStatusBadge()}
          </div>
        </div>

        {status?.status === 'not_connected' && (
          <div className={styles.connectSection}>
            <p className={styles.connectText}>
              Connect with Stripe to start receiving payments for your services.
              You'll be able to set up your payout preferences and manage your earnings.
            </p>
            <button
              onClick={handleStartOnboarding}
              disabled={actionLoading}
              className={styles.connectBtn}
            >
              {actionLoading ? 'Connecting...' : 'Connect with Stripe'}
            </button>
          </div>
        )}

        {status?.status === 'onboarding' && (
          <div className={styles.connectSection}>
            <p className={styles.connectText}>
              Your Stripe account setup is incomplete. Please finish the onboarding process
              to start receiving payments.
            </p>
            <button
              onClick={handleContinueOnboarding}
              disabled={actionLoading}
              className={styles.connectBtn}
            >
              {actionLoading ? 'Loading...' : 'Continue Setup'}
            </button>
          </div>
        )}

        {status?.status === 'restricted' && (
          <div className={styles.connectSection}>
            <div className={styles.warningBox}>
              <span className={styles.warningIcon}>⚠️</span>
              <div>
                <strong>Account Restricted</strong>
                <p>Your Stripe account has restrictions. Please complete the required steps to enable payments.</p>
              </div>
            </div>
            <div className={styles.statusDetails}>
              <div className={styles.statusItem}>
                <span>Charges Enabled:</span>
                <span className={status.chargesEnabled ? styles.enabled : styles.disabled}>
                  {status.chargesEnabled ? 'Yes' : 'No'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span>Payouts Enabled:</span>
                <span className={status.payoutsEnabled ? styles.enabled : styles.disabled}>
                  {status.payoutsEnabled ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <button
              onClick={handleContinueOnboarding}
              disabled={actionLoading}
              className={styles.connectBtn}
            >
              {actionLoading ? 'Loading...' : 'Complete Setup'}
            </button>
          </div>
        )}

        {status?.status === 'active' && (
          <div className={styles.activeSection}>
            <div className={styles.successBox}>
              <span className={styles.successIcon}>✓</span>
              <div>
                <strong>Account Active</strong>
                <p>Your Stripe account is set up and ready to receive payments.</p>
              </div>
            </div>
            <div className={styles.statusDetails}>
              <div className={styles.statusItem}>
                <span>Charges Enabled:</span>
                <span className={styles.enabled}>Yes</span>
              </div>
              <div className={styles.statusItem}>
                <span>Payouts Enabled:</span>
                <span className={styles.enabled}>Yes</span>
              </div>
            </div>
            <button
              onClick={handleOpenDashboard}
              disabled={actionLoading}
              className={styles.dashboardBtn}
            >
              {actionLoading ? 'Opening...' : 'Open Stripe Dashboard'}
            </button>
          </div>
        )}
      </div>

      <div className={styles.infoBox}>
        <h4>How payments work</h4>
        <ul>
          <li>When a customer purchases your service, they pay through Stripe</li>
          <li>Arkom takes a 5% platform fee from each transaction</li>
          <li>The remaining 95% is transferred to your Stripe account</li>
          <li>You can manage your payouts and view earnings in the Stripe Dashboard</li>
        </ul>
      </div>
    </div>
  );
};
