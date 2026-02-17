import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchEvents,
  createEvent,
  deleteEvent,
  setFilters,
  setSelectedEvent,
} from '../../features/events/eventSlice';
import { logout } from '../../features/auth/authSlice';
import type { Event, EventCategory } from '../../types/event';
import { parseCoordinates } from '../../utils/coordinates';
import EventForm from '../../components/EventForm/EventForm'; // Импортируем общий компонент
import EventCard from './components/EventCard/EventCard';
import YandexMap from './components/YandexMap/YandexMap';
import Loader from '../../components/Loader/Loader';
import ErrorNotification from '../../components/ErrorNotification/ErrorNotification';
import styles from './Events.module.scss';

const DEFAULT_CENTER: [number, number] = [55.7558, 37.6173]; // Москва

const Events = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Данные из Redux
  const { items, filters, isLoading, error, selectedEventId } = useAppSelector(
    (state) => state.events
  );
  const userId = useAppSelector((state) => state.auth.user?.id);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Локальные UI-состояния
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showSearchFilter, setShowSearchFilter] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Состояния карты
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(10);

  // Debounce для поиска
  const searchTimeoutRef = useRef<number | null>(null);

  // Загрузка событий при монтировании
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchEvents());
  }, [dispatch, isAuthenticated, navigate]);

  // Фильтрация событий на основе фильтров из Redux
  const filteredEvents = useMemo(() => {
    let filtered = items;

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter((event) => event.category === filters.category);
    }

    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);

        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          return eventDate >= start && eventDate <= end;
        }
        if (filters.startDate) {
          const start = new Date(filters.startDate);
          return eventDate >= start;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          return eventDate <= end;
        }
        return true;
      });
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [items, filters]);

  // События с валидными координатами
  const eventsWithValidCoordinates = useMemo(
    () => filteredEvents.filter((e) => parseCoordinates(e.location)),
    [filteredEvents]
  );

  // Центрирование карты при изменении списка отфильтрованных событий
  useEffect(() => {
    if (eventsWithValidCoordinates.length === 0) {
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(10);
      return;
    }

    const coords = eventsWithValidCoordinates.map((e) => parseCoordinates(e.location)!);
    const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
    const avgLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;

    setMapCenter([avgLat, avgLng]);
    setMapZoom(10);
  }, [eventsWithValidCoordinates]);

  // Уникальные категории из всех событий
  const categories = useMemo(() => {
    const allCategories = items.map((event) => event.category);
    const uniqueCategories = [...new Set(allCategories)];
    return uniqueCategories.filter((cat) => cat !== 'all').sort();
  }, [items]);

  // Минимальная и максимальная даты для ограничения input type="date"
  const dateRangeInfo = useMemo(() => {
    if (items.length === 0) return { minDate: '', maxDate: '' };

    const dates = items.map((event) => new Date(event.date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    return {
      minDate: minDate.toISOString().split('T')[0],
      maxDate: maxDate.toISOString().split('T')[0],
    };
  }, [items]);

  // ---------- Обработчики действий ----------
  const handleCreateEvent = async (data: any) => {
    try {
      const coords = parseCoordinates(data.location);
      if (!coords) {
        throw new Error('Некорректный формат координат. Используйте "55.684758, 37.738521"');
      }
      if (!userId) {
        throw new Error('Пользователь не авторизован');
      }
      const eventData = {
        ...data,
        createdBy: userId,
      };
      await dispatch(createEvent(eventData)).unwrap();
      setShowCreateForm(false);
    } catch (err: any) {
      console.error('Ошибка создания мероприятия:', err);
    }
  };
  const handleDeleteEvent = async (id: number) => {
    try {
      setDeletingId(id);
      await dispatch(deleteEvent(id)).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Фильтры
  const handleCategoryChange = (category: EventCategory | 'all') => {
    dispatch(setFilters({ category }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleClearDateFilter = () => {
    dispatch(setFilters({ startDate: '', endDate: '' }));
  };

  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = window.setTimeout(() => {
      dispatch(setFilters({ search: value }));
    }, 750);
  };

  const handleClearSearchFilter = () => {
    dispatch(setFilters({ search: '' }));
  };

  // Карта
  const handleShowOnMap = useCallback(
    (event: Event) => {
      const coords = parseCoordinates(event.location);
      if (!coords) return;

      dispatch(setSelectedEvent(event.id));
      setMapCenter([coords.lat, coords.lng]);
      setMapZoom(15);

      const element = document.getElementById(`event-${event.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    [dispatch]
  );

  const handleEventClickOnMap = useCallback(
    (event: Event) => {
      dispatch(setSelectedEvent(event.id));
      const element = document.getElementById(`event-${event.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    [dispatch]
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const emptyInitialData = useMemo(() => ({}), []);


  return (
    <div className={styles.events}>
      <header className={`${styles.header} container`}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate('/')} className="btn btn-ghost">
              ← На главную
            </button>
            <h1>Мероприятия</h1>
          </div>
          <div className={styles.headerRight}>
            <button onClick={() => navigate('/profile')} className="btn btn-outline">
              Профиль
            </button>
            <button onClick={handleLogout} className="btn btn-outline">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className={`${styles.main} container`}>
        {error && <ErrorNotification message={error} onClose={() => {}} />}

        <div className={styles.pageHeader}>
          <div>
            <h2>Мероприятия</h2>
            <p className={styles.eventsCount}>
              Всего: {filteredEvents.length} | На карте: {eventsWithValidCoordinates.length}
            </p>
          </div>

          <div className={styles.pageActions}>
            <button
              onClick={() => setShowCategoryFilter((v) => !v)}
              className={`btn ${showCategoryFilter ? 'btn-primary' : 'btn-outline'}`}
            >
              {showCategoryFilter ? '▼ Категории' : '▲ Категории'}
            </button>
            <button
              onClick={() => setShowDateFilter((v) => !v)}
              className={`btn ${showDateFilter ? 'btn-primary' : 'btn-outline'}`}
            >
              {showDateFilter ? '▼ Даты' : '▲ Даты'}
            </button>
            <button
              onClick={() => setShowSearchFilter((v) => !v)}
              className={`btn ${showSearchFilter ? 'btn-primary' : 'btn-outline'}`}
            >
              {showSearchFilter ? '▼ Поиск' : '▲ Поиск'}
            </button>
            <button
              onClick={() => setShowCreateForm((v) => !v)}
              className={`btn ${showCreateForm ? 'btn-secondary' : 'btn-primary'}`}
            >
              {showCreateForm ? '✕ Отмена' : '+ Создать'}
            </button>
          </div>
        </div>

        {showCreateForm && (
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowCreateForm(false)}
            initialData={emptyInitialData}
            isLoading={isLoading}
          />
        )}

        {showCategoryFilter && (
          <div className={styles.filterContainer}>
            <div className={styles.filterHeader}>
              <h3>Фильтр по категориям</h3>
              {filters.category && filters.category !== 'all' && (
                <button onClick={() => handleCategoryChange('all')} className="btn btn-sm btn-ghost">
                  Сбросить фильтр
                </button>
              )}
            </div>
            <div className={styles.categories}>
              <button
                onClick={() => handleCategoryChange('all')}
                className={`btn btn-sm ${!filters.category || filters.category === 'all' ? 'btn-primary' : 'btn-outline'}`}
              >
                Все категории
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`btn btn-sm ${filters.category === category ? 'btn-primary' : 'btn-outline'}`}
                >
                  {category}
                </button>
              ))}
            </div>
            {filters.category && filters.category !== 'all' && (
              <div className={styles.selectedInfo}>
                <span>Выбрана категория: </span>
                <strong>{filters.category}</strong>
              </div>
            )}
          </div>
        )}

        {showDateFilter && (
          <div className={styles.filterContainer}>
            <div className={styles.filterHeader}>
              <h3>Фильтр по дате</h3>
              {(filters.startDate || filters.endDate) && (
                <button onClick={handleClearDateFilter} className="btn btn-sm btn-ghost">
                  Сбросить фильтр
                </button>
              )}
            </div>
            <div className={styles.dateRange}>
              <div className={styles.dateInput}>
                <label htmlFor="startDate">Дата начала:</label>
                <input
                  type="date"
                  id="startDate"
                  value={filters.startDate || ''}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  min={dateRangeInfo.minDate}
                  max={filters.endDate || dateRangeInfo.maxDate}
                />
              </div>
              <div className={styles.dateSeparator}>—</div>
              <div className={styles.dateInput}>
                <label htmlFor="endDate">Дата окончания:</label>
                <input
                  type="date"
                  id="endDate"
                  value={filters.endDate || ''}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  min={filters.startDate || dateRangeInfo.minDate}
                  max={dateRangeInfo.maxDate}
                />
              </div>
            </div>
            {(filters.startDate || filters.endDate) && (
              <div className={styles.selectedInfo}>
                <span>Выбран период: </span>
                <strong>
                  {filters.startDate || '...'} – {filters.endDate || '...'}
                </strong>
              </div>
            )}
          </div>
        )}

        {showSearchFilter && (
          <div className={styles.filterContainer}>
            <div className={styles.filterHeader}>
              <h3>Поиск мероприятий</h3>
              {filters.search && (
                <button onClick={handleClearSearchFilter} className="btn btn-sm btn-ghost">
                  Сбросить поиск
                </button>
              )}
            </div>
            <div className={styles.searchInput}>
              <label htmlFor="search">Поиск по названию и описанию:</label>
              <input
                type="text"
                id="search"
                defaultValue={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Введите текст для поиска..."
              />
              <div className={styles.searchInfo}>
                {filters.search ? (
                  <span className={styles.searching}>Идёт поиск...</span>
                ) : (
                  <span className={styles.searchHint}>
                    Поиск по названию и описанию мероприятий
                  </span>
                )}
              </div>
            </div>
            {filters.search && (
              <div className={styles.selectedInfo}>
                <span>Поисковый запрос: </span>
                <strong>"{filters.search}"</strong>
              </div>
            )}
          </div>
        )}

        <div className={styles.layout}>
          {/* Список мероприятий */}
          <div className={styles.eventsList}>
            {isLoading && items.length === 0 ? (
              <Loader />
            ) : filteredEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <p>
                  {items.length === 0
                    ? 'Мероприятий пока нет'
                    : 'Мероприятий по выбранным фильтрам не найдено'}
                </p>
              </div>
            ) : (
              <div className={styles.eventsGrid}>
                {filteredEvents.map((event) => (
                  <div key={event.id} id={`event-${event.id}`} className={styles.eventCardWrapper}>
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

          {/* Карта */}
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
      </main>
    </div>
  );
};

export default Events;