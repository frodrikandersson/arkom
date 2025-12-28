import { TimezoneSettings } from '../components/Settings/TimezoneSettings';
import { BlockedUsersSettings } from '../components/Settings/BlockedUsersSettings';
import { ProfileSettings } from '../components/Settings/ProfileSettings';
import { NotificationSettings } from '../components/Settings/NotificationSettings';
import styles from './SettingsPage.module.css';

export const SettingsPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Settings</h1>
        <ProfileSettings />
        <TimezoneSettings />
        <NotificationSettings />
        <BlockedUsersSettings />
      </div>
    </div>
  );
};


