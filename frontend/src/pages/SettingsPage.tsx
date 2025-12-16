import { TimezoneSettings } from '../components/Settings/TimezoneSettings';
import styles from './SettingsPage.module.css';

export const SettingsPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Settings</h1>
        <TimezoneSettings />
      </div>
    </div>
  );
};