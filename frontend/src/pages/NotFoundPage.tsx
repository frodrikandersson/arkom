import { useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className={styles.actions}>
          <button
            onClick={() => navigate('/')}
            className={styles.primaryButton}
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className={styles.secondaryButton}
          >
            Go Back
          </button>
        </div>

        <div className={styles.suggestions}>
          <p className={styles.suggestionsTitle}>You might be interested in:</p>
          <div className={styles.links}>
            <a href="/commissions" className={styles.link}>Browse Commissions</a>
            <a href="/store" className={styles.link}>Explore Store</a>
            <a href="/help" className={styles.link}>Get Help</a>
          </div>
        </div>
      </div>
    </div>
  );
};
