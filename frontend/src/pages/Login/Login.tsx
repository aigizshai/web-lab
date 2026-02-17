// src/pages/Login/Login.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.scss';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login } from '../../features/auth/authSlice';


const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth);
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/events');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Вход...' : 'Войти'}
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