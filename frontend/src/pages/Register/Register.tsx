// src/pages/Register/Register.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import { storage } from '../../utils/storage';
import styles from './Register.module.scss';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.register}>
      <div className={styles.container}>
        <h2>Регистрация</h2>
        
        {error && (
          <div className={styles.error}>
            Ошибка: {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Имя:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

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

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Подтвердите пароль:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
             {loading ? 'Вход...' : 'Войти'}
</        button>
        </form>

        <div className={styles.links}>
          <p>Уже есть аккаунт? <button onClick={() => navigate('/login')}>Войти</button></p>
          <button onClick={() => navigate('/')}>На главную</button>
        </div>
      </div>
    </div>
  );
};

export default Register;