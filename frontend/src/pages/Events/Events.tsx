// src/pages/Events/Events.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../api/eventService';
import { storage } from '../../utils/storage';
import type { Event } from '../../types/event';
import CreateEventForm from './components/CreateEventForm/CreateEventForm';
import EventCard from './components/EventCard/EventCard';
import styles from './Events.module.scss';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number>(1); // В реальном приложении получать из токена

  useEffect(() => {
    // Проверка авторизации
    if (!storage.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Загрузка мероприятий
    loadEvents();
  }, [navigate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);
      setError('');
    } catch (err: any) {
      setError(`Ошибка ${err.response?.status}: ${err.response?.data?.message || 'Не удалось загрузить мероприятия'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (data: any) => {
    try {
      await eventService.createEvent(data);
      await loadEvents(); // Обновляем список
      setShowCreateForm(false);
      setError('');
    } catch (err: any) {
      throw err; // Пробрасываем ошибку в форму
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      setDeletingId(id);
      await eventService.deleteEvent(id);
      await loadEvents(); // Обновляем список
      setError('');
    } catch (err: any) {
      setError(`Ошибка ${err.response?.status}: ${err.response?.data?.message || 'Не удалось удалить мероприятие'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    storage.clear();
    navigate('/');
  };

  return (
    <div className={styles.events}>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <h1>Мероприятия</h1>
          </div>
          <nav className={styles.nav}>
            <div className={styles.authInfo}>
              <span>ID пользователя: {userId}</span>
              <button onClick={() => navigate('/')} className={styles.navButton}>
                Главная
              </button>
              <button onClick={handleLogout} className={styles.navButton}>
                Выйти
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.pageHeader}>
            <h2>Список мероприятий ({events.length})</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={styles.createButton}
            >
              {showCreateForm ? 'Скрыть форму' : '+ Создать мероприятие'}
            </button>
          </div>

          {showCreateForm && (
            <CreateEventForm
              onSubmit={handleCreateEvent}
              onCancel={() => setShowCreateForm(false)}
              userId={userId}
            />
          )}

          {loading ? (
            <div className={styles.loading}>Загрузка мероприятий...</div>
          ) : events.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Мероприятий пока нет</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className={styles.createFirstButton}
              >
                Создать первое мероприятие
              </button>
            </div>
          ) : (
            <div className={styles.eventsGrid}>
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onDelete={handleDeleteEvent}
                  canDelete={event.createdBy === userId} // Можно удалять только свои мероприятия
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Events;