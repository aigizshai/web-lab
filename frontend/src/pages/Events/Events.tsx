// src/pages/Events/Events.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../api/eventService';
import { storage } from '../../utils/storage';
import type { Event } from '../../types/event';
import styles from './Events.module.scss';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Проверка авторизации
    if (!storage.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const user = storage.getUser();
    setUserName(user?.name || '');

    // Загрузка мероприятий
    const loadEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEvents();
        setEvents(data);
      } catch (err: any) {
        setError(`Ошибка ${err.response?.status}: ${err.response?.data?.message || 'Не удалось загрузить мероприятия'}`);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [navigate]);

  const handleLogout = () => {
    storage.clear();
    navigate('/');
  };

  return (
    <div className={styles.events}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <h1>Мероприятия</h1>
        </div>
        <nav className={styles.nav}>
          <div className={styles.authInfo}>
            <span>Привет, {userName}!</span>
            <button onClick={() => navigate('/')}>Главная</button>
            <button onClick={handleLogout}>Выйти</button>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Загрузка мероприятий...</div>
        ) : (
          <>
            <h2>Список мероприятий ({events.length})</h2>
            
            {events.length === 0 ? (
              <p>Нет доступных мероприятий</p>
            ) : (
              <div className={styles.eventsGrid}>
                {events.map((event) => (
                  <div key={event.id} className={styles.eventCard}>
                    <h3>{event.title}</h3>
                    <p className={styles.description}>{event.description}</p>
                    <div className={styles.details}>
                      <span className={styles.category}>{event.category}</span>
                      <span className={styles.date}>
                        {new Date(event.date).toLocaleDateString('ru-RU')}
                      </span>
                      <span className={styles.location}>{event.location}</span>
                    </div>
                    <div className={styles.creator}>
                      Создатель ID: {event.createdBy}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Events;