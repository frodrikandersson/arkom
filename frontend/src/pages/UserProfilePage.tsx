import { useParams, useOutletContext } from 'react-router-dom';
import { UserProfile } from '../components/UserProfile/UserProfile';
import styles from './UserProfilePage.module.css';

export const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { onOpenChat } = useOutletContext<{ 
    onOpenChat: (conversationId: number, otherUserId: string, otherUserName?: string, otherUserAvatar?: string) => void 
  }>();

  if (!userId) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Invalid user ID</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <UserProfile userId={userId} onOpenChat={onOpenChat} />
    </div>
  );
};
