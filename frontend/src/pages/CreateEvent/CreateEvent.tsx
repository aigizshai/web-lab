import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createEvent } from '../../features/events/eventSlice';
import EventForm from '../../components/EventForm/EventForm';
import styles from './CreateEvent.module.scss';

const CreateEvent = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector(state => state.events);
  const userId = useAppSelector(state => state.auth.user?.id);

  const handleSubmit = async (data: any) => {
    if (!userId) return;
    await dispatch(createEvent({ ...data, createdBy: userId })).unwrap();
    navigate('/events');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Создание мероприятия</h1>
      </header>
      <main className={styles.main}>
        <EventForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/events')}
          isLoading={isLoading}
        />
        {error && <div className={styles.error}>{error}</div>}
      </main>
    </div>
  );
};

export default CreateEvent;