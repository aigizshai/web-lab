// src/pages/Home/Home.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/storage';
import styles from './Home.module.scss';

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const authStatus = storage.isAuthenticated();
    setIsAuthenticated(authStatus);
    
    if (authStatus) {
      const user = storage.getUser();
      setUserName(user?.name || '');
    }
  }, []);

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <h1>Event Manager</h1>
        </div>
        <nav className={styles.nav}>
          {isAuthenticated ? (
            <div className={styles.authInfo}>
              <span>Привет, {userName}!</span>
              <button onClick={() => navigate('/events')}>Мероприятия</button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <button onClick={() => navigate('/login')}>Войти</button>
              <button onClick={() => navigate('/register')}>Регистрация</button>
            </div>
          )}
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h2>Добро пожаловать в Event Manager</h2>
          <p>Платформа для управления мероприятиями</p>
          
          <div className={styles.buttons}>
            {!isAuthenticated && (
              <>
                <button onClick={() => navigate('/login')}>Войти в систему</button>
                <button onClick={() => navigate('/register')}>Зарегистрироваться</button>
              </>
            )}
            <button onClick={() => navigate('/events')}>Посмотреть мероприятия</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;