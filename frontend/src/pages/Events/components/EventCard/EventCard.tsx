// src/pages/Events/components/EventCard/EventCard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../../../../types/event';
import styles from './EventCard.module.scss';
import { parseCoordinates } from '../../../../utils/coordinates';


interface EventCardProps {
  event: Event;
  onDelete: (id: number) => void;
  onShowOnMap: (event: Event) => void;
  canDelete: boolean;
  isSelected?: boolean;
  deleting?: boolean; // добавим для индикации удаления
}

const EventCard = ({ event, onDelete, onShowOnMap, canDelete, isSelected, deleting }: EventCardProps) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const coords = parseCoordinates(event.location);

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

  const handleShowOnMap = () => {
    onShowOnMap(event);
  };

  const handleEdit = () => {
    navigate(`/events/edit/${event.id}`);
  };

  return (
    <>
      <div className={`${styles.eventCard} ${isSelected ? styles.selected : ''}`}>
        <div className={styles.header}>
          <h3>{event.title}</h3>
          <div className={styles.actions}>
            <button
              onClick={handleShowOnMap}
              className={styles.mapButton}
              title="Показать на карте"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </button>
            {canDelete && (
              <>
                <button
                  onClick={handleEdit}
                  className={styles.editButton}
                  title="Редактировать"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className={styles.deleteButton}
                  title="Удалить мероприятие"
                  disabled={deleting}
                >
                  {deleting ? (
                    <span>...</span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        
        <p className={styles.description}>{event.description}</p>
        
        <div className={styles.locationSection}>
          <div className={styles.locationHeader}>
            <strong>Локация:</strong>
          </div>
          <code className={styles.coordinates}>{event.location}</code>
        </div>

        <div className={styles.details}>
          <span className={styles.category}>{event.category}</span>
          <span className={styles.date}>
            {new Date(event.date).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
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
            <p>Удалить мероприятие "<strong>{event.title}</strong>"?</p>
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