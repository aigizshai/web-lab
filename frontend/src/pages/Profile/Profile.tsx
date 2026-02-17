import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchUserEvents } from '../../features/user/userSlice';
import { updateProfile, logout } from '../../features/auth/authSlice';
import EventCard from '../Events/components/EventCard/EventCard';
import Loader from '../../components/Loader/Loader';
import ErrorNotification from '../../components/ErrorNotification/ErrorNotification';
import ProfileEditForm from './components/ProfileEditForm/ProfileEditForm';
import styles from './Profile.module.scss';

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const { events, isLoading: eventsLoading, error: eventsError } = useAppSelector(state => state.user);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserEvents(user.id));
    }
  }, [dispatch, user?.id]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleEditClick = () => setIsEditing(true);
  const handleEditCancel = () => setIsEditing(false);

  const handleEditSubmit = async (data: any) => {
    if (!user?.id) return;
    await dispatch(updateProfile({ userId: user.id, data })).unwrap();
    setIsEditing(false);
  };

  if (!user) return <Loader />;

  return (
    <div className={styles.profile}>
      {/* Шапка аналогичная Events.tsx */}
      <header className={`${styles.header} container`}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate('/')} className="btn btn-ghost">
              ← На главную
            </button>
            <h1>Профиль</h1>
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
      </header>

      <main className={styles.main}>
        <div className="container">
          <section className={styles.userInfo}>
            <div className={styles.userInfoHeader}>
              <h2>Информация</h2>
              <button onClick={handleEditClick} className="btn btn-sm btn-primary">
                Редактировать
              </button>
            </div>
            <div className={styles.infoGrid}>
              <p><strong>Фамилия:</strong> {user.surname}</p>
              <p><strong>Имя:</strong> {user.name}</p>
              <p><strong>Отчество:</strong> {user.patronymic}</p>
              <p><strong>Пол:</strong> {user.gender === 'male' ? 'Мужской' : user.gender === 'female' ? 'Женский' : 'Другой'}</p>
              <p><strong>Дата рождения:</strong> {new Date(user.birthDate).toLocaleDateString('ru-RU')}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          </section>

          <section className={styles.userEvents}>
            <h2>Мои мероприятия</h2>
            {eventsError && <ErrorNotification message={eventsError} onClose={() => {}} />}
            {eventsLoading ? (
              <Loader />
            ) : events.length === 0 ? (
              <p className={styles.empty}>У вас пока нет созданных мероприятий</p>
            ) : (
              <div className={styles.eventsGrid}>
                {events.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDelete={(id) => console.log('Удалить', id)}
                    onShowOnMap={(event) => console.log('Показать на карте', event)}
                    canDelete={true}
                    isSelected={false}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {isEditing && (
        <ProfileEditForm
          initialData={{
            surname: user.surname,
            name: user.name,
            patronymic: user.patronymic,
            gender: user.gender,
            birthDate: user.birthDate,
          }}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
          isLoading={false}
        />
      )}
    </div>
  );
};

export default Profile;