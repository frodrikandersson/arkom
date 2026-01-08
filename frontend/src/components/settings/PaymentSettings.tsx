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
            <span className={styles.stripeBrand}>Stripe</span>
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
