import { createPortal } from 'react-dom';
import { useAlertButton } from '../../hooks/useAlertButton';
import { OnOpenChatFunction } from '../../models';
import styles from './AlertButton.module.css';

interface AlertButtonProps {
  onOpenChat?: OnOpenChatFunction;
}

export const AlertButton = ({ onOpenChat }: AlertButtonProps) => {
  const {
    user,
    isOpen,
    setIsOpen,
    isMobile,
    dropdownRef,
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
    formatTime,
    handleNotificationClick,
    deleteNotification,
  } = useAlertButton(onOpenChat);

  if (!user) return null;

  // Create dropdown content
  const dropdownContent = isOpen && (
    <div className={styles.dropdown} ref={dropdownRef}>
      <div className={styles.header}>
        <h3>Notifications</h3>
        {isMobile && (
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            ×
          </button>
        )}
      </div>

      <div className={styles.notificationList}>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>No notifications</div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className={styles.notificationContent}>
                <div className={styles.notificationTitle}>{notification.title}</div>
                <div className={styles.notificationMessage}>{notification.message}</div>
                <div className={styles.notificationTime}>{formatTime(notification.createdAt)}</div>
              </div>
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                aria-label="Delete notification"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {unreadCount > 0 && (
        <button
          className={styles.markAllReadBottom}
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Use portal on mobile to escape mobile nav container */}
      {isMobile && dropdownContent ? createPortal(dropdownContent, document.body) : dropdownContent}
    </div>
  );
};
