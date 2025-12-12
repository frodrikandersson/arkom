import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header/Header';
import styles from './MainLayout.module.css';

export const MainLayout = () => {
  // You can manage global state here for basket/messages/alerts
  const basketCount = 0; // TODO: Connect to basket state
  const messageCount = 0; // TODO: Connect to messages state
  const alertCount = 0; // TODO: Connect to alerts state

  return (
    <div className={styles.layout}>
      <Header 
        basketCount={basketCount}
        messageCount={messageCount}
        alertCount={alertCount}
      />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};