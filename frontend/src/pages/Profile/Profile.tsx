import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProfile } from '../../features/auth/authSlice';
import { fetchUserEvents } from '../../features/user/userSlice';
import { logout } from '../../features/auth/authSlice';
import EventCard from '../Events/components/EventCard/EventCard';
import Loader from '../../components/Loader/Loader';
import ErrorNotification from '../../components/ErrorNotification/ErrorNotification';
import styles from './Profile.module.scss';

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const { events, isLoading, error } = useAppSelector(state => state.user);

  useEffect(() => {
    dispatch(fetchProfile())
      .unwrap()
      .then((userData) => {
        if (userData?.id) {
          dispatch(fetchUserEvents(userData.id));
        }
      })
      .catch((err) => {
        console.error('Ошибка загрузки профиля', err);
      });
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleDeleteEvent = (id: number) => {
    // Можно добавить удаление, но пока заглушка
    console.log('Удалить мероприятие', id);
  };

  const handleShowOnMap = (event: any) => {
    console.log('Показать на карте', event);
  };

  if (!user) return <Loader />;

  return (
    <div className={styles.profile}>
      <header className={styles.header}>
        <div className="container">
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <button onClick={() => navigate('/')} className="btn btn-ghost">
                ← На главную
              </button>
              <h1>Профиль пользователя</h1>
              
            </div>
            <div className={styles.headerRight}>
            <button onClick={() => navigate('/events')} className="btn btn-outline">
                Мероприятия
              </button>
              <button onClick={handleLogout} className="btn btn-outline">
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className="container">
          <section className={styles.userInfo}>
            <h2>Информация</h2>
            <p><strong>Имя:</strong> {user.name || 'Не указано'}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </section>

          <section className={styles.userEvents}>
            <h2>Мои мероприятия</h2>
            {error && <ErrorNotification message={error} onClose={() => {}} />}
            {isLoading ? (
              <Loader />
            ) : events.length === 0 ? (
              <p className={styles.empty}>У вас пока нет созданных мероприятий</p>
            ) : (
              <div className={styles.eventsGrid}>
                {events.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDelete={handleDeleteEvent}
                    onShowOnMap={handleShowOnMap}
                    canDelete={true}
                    isSelected={false}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;