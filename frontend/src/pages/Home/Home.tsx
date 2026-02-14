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
      setUserName(user?.name || 'Пользователь');
    }
  }, []);

  const handleLogout = () => {
    storage.clear();
    setIsAuthenticated(false);
    setUserName('');
  };

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <div className="container">
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <h1>Event Manager</h1>
            </div>
            <nav className={styles.nav}>
              {isAuthenticated ? (
                <div className={styles.authInfo}>
                  <span>Привет, {userName}!</span>
                  <div className={styles.authActions}>
                    <button 
                      onClick={() => navigate('/events')}
                      className="btn btn-primary"
                    >
                      Мероприятия
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="btn btn-outline"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.authButtons}>
                  <button 
                    onClick={() => navigate('/login')}
                    className="btn btn-outline"
                  >
                    Войти
                  </button>
                  <button 
                    onClick={() => navigate('/register')}
                    className="btn btn-primary"
                  >
                    Регистрация
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className="container">
          <section className={styles.hero}>
            <h2>Добро пожаловать в Event Manager</h2>
            <p>Платформа для управления мероприятиями</p>
            
            <div className={styles.buttons}>
              {!isAuthenticated ? (
                <>
                  <button 
                    onClick={() => navigate('/login')}
                    className="btn btn-primary btn-lg"
                  >
                    Войти в систему
                  </button>
                  <button 
                    onClick={() => navigate('/register')}
                    className="btn btn-outline btn-lg"
                  >
                    Зарегистрироваться
                  </button>
                </>
              ) : (
                <div className={styles.authHeroButtons}>
                  <button 
                    onClick={() => navigate('/events')}
                    className="btn btn-primary btn-lg"
                  >
                    Посмотреть мероприятия
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="btn btn-ghost btn-lg"
                  >
                    Выйти из системы
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;