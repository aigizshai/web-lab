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

// Тип для категорий
type EventCategory = 
  | 'встреча'
  | 'день рождения'
  | 'праздник'
  | 'концерт'
  | 'лекция'
  | 'выставка'
  | 'другое'
  | 'all';

const Events = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('all');

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
      setFilteredEvents(data); // Изначально показываем все
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

  // ---------- filter events by category ----------
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event => event.category === selectedCategory);
      setFilteredEvents(filtered);
    }
    setSelectedEventId(null); // Сбрасываем выбранное мероприятие при смене фильтра
  }, [selectedCategory, events]);

  // ---------- helpers ----------
  const eventsWithValidCoordinates = useMemo(() => {
    return filteredEvents.filter(e => parseCoordinates(e.location));
  }, [filteredEvents]);

  // Центрируем карту по отфильтрованным событиям
  useEffect(() => {
    if (eventsWithValidCoordinates.length === 0) {
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(10);
      return;
    }

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

  // Получаем уникальные категории из мероприятий
  const categories = useMemo(() => {
    const allCategories = events.map(event => event.category);
    const uniqueCategories = [...new Set(allCategories)];
    return uniqueCategories.filter(cat => cat !== 'all').sort();
  }, [events]);

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

  // ---------- category filter ----------
  const handleCategoryChange = useCallback((category: EventCategory) => {
    setSelectedCategory(category);
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
              <h2>Мероприятия ({filteredEvents.length})</h2>
              <p>
                На карте: {eventsWithValidCoordinates.length} из {filteredEvents.length}
              </p>
            </div>

            <div className={styles.pageActions}>
              <button onClick={() => setShowFilter(v => !v)}>
                {showFilter ? 'Скрыть фильтр' : 'Фильтр по категориям'}
              </button>
              <button onClick={() => setShowCreateForm(v => !v)}>
                {showCreateForm ? 'Скрыть форму' : '+ Создать мероприятие'}
              </button>
            </div>
          </div>

          {showCreateForm && (
            <CreateEventForm
              onSubmit={handleCreateEvent}
              onCancel={() => setShowCreateForm(false)}
              userId={userId}
            />
          )}

          {showFilter && (
            <div className={styles.filterContainer}>
              <div className={styles.filterHeader}>
                <h3>Фильтр по категориям</h3>
                {selectedCategory !== 'all' && (
                  <button 
                    onClick={() => handleCategoryChange('all')}
                    className={styles.clearButton}
                  >
                    Сбросить фильтр
                  </button>
                )}
              </div>
              
              <div className={styles.categories}>
                <button
                  key="all"
                  onClick={() => handleCategoryChange('all')}
                  className={`${styles.categoryButton} ${
                    selectedCategory === 'all' ? styles.active : ''
                  }`}
                >
                  Все категории
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`${styles.categoryButton} ${
                      selectedCategory === category ? styles.active : ''
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {selectedCategory !== 'all' && (
                <div className={styles.selectedInfo}>
                  <span>Выбрана категория: </span>
                  <strong>{selectedCategory}</strong>
                </div>
              )}
            </div>
          )}

          <div className={styles.layout}>
            {/* -------- list -------- */}
            <div className={styles.eventsList}>
              {loading ? (
                <div>Загрузка мероприятий...</div>
              ) : filteredEvents.length === 0 ? (
                <div className={styles.emptyState}>
                  {selectedCategory === 'all' ? (
                    <p>Мероприятий пока нет</p>
                  ) : (
                    <p>В категории "{selectedCategory}" мероприятий не найдено</p>
                  )}
                </div>
              ) : (
                <div className={styles.eventsGrid}>
                  {filteredEvents.map(event => (
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