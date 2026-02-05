// src/pages/Events/components/EventCard/EventCard.tsx
import { useState } from 'react';
import type { Event } from '../../../../types/event';
import { parseCoordinates } from '../../../../utils/coordinates';
import styles from './EventCard.module.scss';

interface EventCardProps {
  event: Event;
  onDelete: (id: number) => void;
  onShowOnMap: (event: Event) => void;
  canDelete: boolean;
  isSelected?: boolean;
}

const EventCard = ({ event, onDelete, onShowOnMap, canDelete, isSelected }: EventCardProps) => {
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
        </div>

        <div className={styles.locationSection}>
          <div className={styles.locationHeader}>
            <strong>Локация:</strong>
            {coords ? (
              <span className={styles.coordinatesValid}>
                ✓ Координаты валидны
              </span>
            ) : (
              <span className={styles.coordinatesInvalid}>
                ⚠ Некорректный формат
              </span>
            )}
          </div>
          <div className={styles.locationDetails}>
            <code className={styles.coordinates}>{event.location}</code>
            {coords && (
              <div className={styles.coordinatesParsed}>
                <span>Широта: {coords.lat.toFixed(6)}</span>
                <span>Долгота: {coords.lng.toFixed(6)}</span>
              </div>
            )}
          </div>
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