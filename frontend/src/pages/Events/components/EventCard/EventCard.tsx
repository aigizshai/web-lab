// src/pages/Events/components/EventCard/EventCard.tsx
import { useState } from 'react';
import type { Event } from '../../../../types/event';
import styles from './EventCard.module.scss';

interface EventCardProps {
  event: Event;
  onDelete: (id: number) => void;
  canDelete: boolean;
}

const EventCard = ({ event, onDelete, canDelete }: EventCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(event.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className={styles.eventCard}>
        <div className={styles.header}>
          <h3>{event.title}</h3>
          {canDelete && (
            <button
              onClick={handleDelete}
              className={styles.deleteButton}
              title="Удалить мероприятие"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          )}
        </div>
        
        <p className={styles.description}>{event.description}</p>
        
        <div className={styles.details}>
          <span className={styles.category}>{event.category}</span>
          <span className={styles.date}>
            {new Date(event.date).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
          <span className={styles.location}>{event.location}</span>
        </div>
        
        <div className={styles.footer}>
          <span className={styles.creator}>ID создателя: {event.createdBy}</span>
          <span className={styles.id}>ID: {event.id}</span>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className={styles.deleteModal}>
          <div className={styles.modalOverlay} onClick={cancelDelete} />
          <div className={styles.modalContent}>
            <h4>Подтвердите удаление</h4>
            <p>Удалить мероприятие "{event.title}"?</p>
            <div className={styles.modalActions}>
              <button onClick={confirmDelete} className={styles.confirmDelete}>
                Удалить
              </button>
              <button onClick={cancelDelete} className={styles.cancelDelete}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCard;