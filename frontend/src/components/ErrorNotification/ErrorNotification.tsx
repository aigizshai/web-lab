import styles from './ErrorNotification.module.scss';

interface ErrorNotificationProps {
  message: string;
  onClose?: () => void;
}

const ErrorNotification = ({ message, onClose }: ErrorNotificationProps) => {
  return (
    <div className={styles.error}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} className={styles.close}>×</button>}
    </div>
  );
};

export default ErrorNotification;