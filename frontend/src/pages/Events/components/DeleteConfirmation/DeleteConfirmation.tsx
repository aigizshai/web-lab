// src/pages/Events/components/DeleteConfirmation/DeleteConfirmation.tsx
import styles from './DeleteConfirmation.module.scss';

interface DeleteConfirmationProps {
  eventTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteConfirmation = ({ eventTitle, onConfirm, onCancel, loading = false }: DeleteConfirmationProps) => {
  return (
    <div className={styles.deleteConfirmation}>
      <div className={styles.overlay} onClick={onCancel} />
      <div className={styles.modal}>
        <h3>Подтверждение удаления</h3>
        <p>Вы уверены, что хотите удалить мероприятие "<strong>{eventTitle}</strong>"?</p>
        <p className={styles.warning}>Это действие нельзя отменить.</p>
        
        <div className={styles.actions}>
          <button onClick={onConfirm} disabled={loading} className={styles.confirmButton}>
            {loading ? 'Удаление...' : 'Да, удалить'}
          </button>
          <button onClick={onCancel} disabled={loading} className={styles.cancelButton}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;