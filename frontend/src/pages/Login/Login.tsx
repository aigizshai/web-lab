// src/pages/Login/Login.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import { storage } from '../../utils/storage';
import styles from './Login.module.scss';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Если пользователь уже авторизован, перенаправляем на мероприятия
    if (storage.isAuthenticated()) {
      navigate('/events');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData);
      storage.setToken(response.accessToken);
      // В реальном приложении здесь нужно декодировать токен или получить пользователя с сервера
      storage.setUser({ email: formData.email});
      navigate('/events');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.container}>
        <h2>Вход в систему</h2>
        
        {error && (
          <div className={styles.error}>
            Ошибка: {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-control"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className={styles.links}>
          <p>Нет аккаунта? <button onClick={() => navigate('/register')}>Зарегистрироваться</button></p>
          <button onClick={() => navigate('/')}>На главную</button>
        </div>
      </div>
    </div>
  );
};

export default Login;