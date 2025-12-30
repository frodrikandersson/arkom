import { TimezoneSettings } from '../components/settingss/TimezoneSettings';
import { BlockedUsersSettings } from '../components/settingss/BlockedUsersSettings';
import { ProfileSettings } from '../components/settingss/ProfileSettings';
import { NotificationSettings } from '../components/settingss/NotificationSettings';
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


