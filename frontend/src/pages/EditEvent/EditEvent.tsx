import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { updateEvent, fetchEvents } from '../../features/events/eventSlice';
import EventForm from '../../components/EventForm/EventForm';
import Loader from '../../components/Loader/Loader';
import styles from './EditEvent.module.scss';
import ErrorNotification from '../../components/ErrorNotification/ErrorNotification';

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector(state => state.events);
  const userId = useAppSelector(state => state.auth.user?.id);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchEvents());
    }
  }, [dispatch, items.length]);

  useEffect(() => {
    if (id && items.length > 0) {
      const eventId = Number(id);
      const event = items.find(e => e.id === eventId);
      if (event) {
        // Проверяем, является ли пользователь создателем
        if (event.createdBy !== userId) {
          navigate('/events'); // или показать ошибку доступа
          return;
        }
        setInitialData({
          title: event.title,
          description: event.description,
          date: event.date.split('T')[0], // если дата в ISO
          category: event.category,
          location: event.location,
        });
      } else {
        navigate('/events');
      }
    }
  }, [id, items, navigate, userId]);

  const handleSubmit = async (data: any) => {
    if (!id) return;
    try {
      await dispatch(updateEvent({ id: Number(id), data })).unwrap();
      navigate('/events');
    } catch (err) {
      // ошибка уже в сторе, отобразится через ErrorNotification
    }
  };

  if (isLoading || !initialData) return <Loader />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Редактирование мероприятия</h1>
      </header>
      <main className={styles.main}>
        <EventForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/events')}
          isLoading={isLoading}
        />
        {error && <ErrorNotification message={error} onClose={() => {}} />}
      </main>
    </div>
  );
};

export default EditEvent;