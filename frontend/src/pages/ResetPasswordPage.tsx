import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword, validateResetToken } from '../services/authService';
import styles from './AuthPages.module.css';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError('No reset token provided');
        setValidatingToken(false);
        return;
      }

      try {
        const response = await validateResetToken(token);
        setTokenValid(response.valid);
        if (!response.valid) {
          setError(response.error || 'Invalid or expired reset link');
        }
      } catch (err) {
        setError('Failed to validate reset link');
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(token!, password);
      setSuccess(response.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.description}>Validating your reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid && !success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Invalid Link</h1>

          <div className={styles.error}>{error}</div>

          <p className={styles.description}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>

          <p className={styles.footer}>
            <Link to="/forgot-password" className={styles.link}>Request New Reset Link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Password</h1>

        <p className={styles.description}>
          Enter your new password below.
        </p>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                placeholder="Enter new password"
                minLength={8}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={styles.input}
                placeholder="Confirm new password"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {success && (
          <p className={styles.footer}>
            Redirecting to <Link to="/login" className={styles.link}>Sign In</Link>...
          </p>
        )}
      </div>
    </div>
  );
};
