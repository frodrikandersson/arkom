import { TimezoneSettings } from '../components/settings/TimezoneSettings';
import { BlockedUsersSettings } from '../components/settings/BlockedUsersSettings';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { PaymentSettings } from '../components/settings/PaymentSettings';
import styles from './SettingsPage.module.css';

export const SettingsPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Settings</h1>
        <ProfileSettings />
        <PaymentSettings />
        <TimezoneSettings />
        <NotificationSettings />
        <BlockedUsersSettings />
      </div>
    </div>
  );
};


