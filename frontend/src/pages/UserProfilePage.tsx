import { useParams } from 'react-router-dom';
import { UserProfile } from '../components/UserProfile/UserProfile';
import styles from './UserProfilePage.module.css';

export const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();

  if (!userId) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Invalid user ID</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <UserProfile userId={userId} />
    </div>
  );
};