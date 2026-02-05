// src/pages/Events/Events.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../api/eventService';
import { storage } from '../../utils/storage';
import type { Event } from '../../types/event';
import CreateEventForm from './components/CreateEventForm/CreateEventForm';
import EventCard from './components/EventCard/EventCard';
import YandexMap from './components/YandexMap/YandexMap';
import { parseCoordinates } from '../../utils/coordinates';
import styles from './Events.module.scss';

const DEFAULT_CENTER: [number, number] = [55.7558, 37.6173]; // Москва

const Events = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // controlled map state
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(10);

  const [userId] = useState<number>(1);

  // ---------- auth + load ----------
  useEffect(() => {
    if (!storage.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadEvents();
  }, [navigate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);
      setError('');
    } catch (err: any) {
      setError(
        `Ошибка ${err.response?.status}: ${
          err.response?.data?.message || 'Не удалось загрузить мероприятия'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- helpers ----------
  const eventsWithValidCoordinates = useMemo(() => {
    return events.filter(e => parseCoordinates(e.location));
  }, [events]);

  // Центрируем карту по всем событиям при загрузке
  useEffect(() => {
    if (eventsWithValidCoordinates.length === 0) return;

    const coords = eventsWithValidCoordinates.map(
      e => parseCoordinates(e.location)!
    );

    const avgLat =
      coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
    const avgLng =
      coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;

    setMapCenter([avgLat, avgLng]);
    setMapZoom(10);
  }, [eventsWithValidCoordinates]);

  // ---------- actions ----------
  const handleCreateEvent = async (data: any) => {
    try {
      const coords = parseCoordinates(data.location);
      if (!coords) {
        throw new Error(
          'Некорректный формат координат. Используйте "55.684758, 37.738521"'
        );
      }

      await eventService.createEvent(data);
      await loadEvents();
      setShowCreateForm(false);
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      setDeletingId(id);
      await eventService.deleteEvent(id);
      await loadEvents();
    } catch (err: any) {
      setError(
        `Ошибка ${err.response?.status}: ${
          err.response?.data?.message || 'Не удалось удалить мероприятие'
        }`
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ---------- map interactions ----------
  const handleShowOnMap = useCallback((event: Event) => {
    const coords = parseCoordinates(event.location);
    if (!coords) return;

    setSelectedEventId(event.id);
    setMapCenter([coords.lat, coords.lng]);
    setMapZoom(15);

    const element = document.getElementById(`event-${event.id}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleEventClickOnMap = useCallback((event: Event) => {
    setSelectedEventId(event.id);

    const element = document.getElementById(`event-${event.id}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleLogout = () => {
    storage.clear();
    navigate('/');
  };

  // ---------- render ----------
  return (
    <div className={styles.events}>
      <header className={styles.header}>
        <div className={styles.container}>
          <h1>Мероприятия</h1>

          <div className={styles.authInfo}>
            <span>ID пользователя: {userId}</span>
            <button onClick={() => navigate('/')}>Главная</button>
            <button onClick={handleLogout}>Выйти</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.pageHeader}>
            <div>
              <h2>Мероприятия ({events.length})</h2>
              <p>
                На карте: {eventsWithValidCoordinates.length} из {events.length}
              </p>
            </div>

            <button onClick={() => setShowCreateForm(v => !v)}>
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

          <div className={styles.layout}>
            {/* -------- list -------- */}
            <div className={styles.eventsList}>
              {loading ? (
                <div>Загрузка мероприятий...</div>
              ) : events.length === 0 ? (
                <div>Мероприятий пока нет</div>
              ) : (
                <div className={styles.eventsGrid}>
                  {events.map(event => (
                    <div
                      key={event.id}
                      id={`event-${event.id}`}
                      className={styles.eventCardWrapper}
                    >
                      <EventCard
                        event={event}
                        onDelete={handleDeleteEvent}
                        onShowOnMap={handleShowOnMap}
                        canDelete={event.createdBy === userId}
                        isSelected={selectedEventId === event.id}
                        deleting={deletingId === event.id}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* -------- map -------- */}
            <div className={styles.mapSection}>
              <h3>Карта мероприятий</h3>

              <YandexMap
                events={eventsWithValidCoordinates}
                center={mapCenter}
                zoom={mapZoom}
                selectedEventId={selectedEventId}
                onPlacemarkClick={handleEventClickOnMap}
                height="600px"
              />

              {eventsWithValidCoordinates.length === 0 && (
                <div className={styles.mapHelp}>
                  Укажите координаты в формате:
                  <br />
                  <code>55.684758, 37.738521</code>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Events;
