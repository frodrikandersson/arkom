import { TimezoneSettings } from '../components/Settings/TimezoneSettings';
import { BlockedUsersSettings } from '../components/Settings/BlockedUsersSettings';
import { ProfileSettings } from '../components/Settings/ProfileSettings';
import { ArtworkUpload } from '../components/Settings/ArtworkUpload';
import styles from './SettingsPage.module.css';

export const SettingsPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Settings</h1>
        <ProfileSettings />
        <ArtworkUpload />
        <TimezoneSettings />
        <BlockedUsersSettings />
      </div>
    </div>
  );
};

