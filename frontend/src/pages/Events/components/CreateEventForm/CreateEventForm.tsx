// src/pages/Events/components/CreateEventForm/CreateEventForm.tsx
import { useState, useEffect } from 'react';
import styles from './CreateEventForm.module.scss';

interface CreateEventFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  userId: number;
}

const CreateEventForm = ({ onSubmit, onCancel, userId }: CreateEventFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: 'встреча',
    location: '',
    createdBy: userId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'встреча',
    'день рождения',
    'праздник',
    'концерт',
    'лекция',
    'выставка',
    'другое'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания мероприятия');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createEventForm}>
      <h3>Создать новое мероприятие</h3>
      
      {error && (
        <div className={styles.error}>
          Ошибка: {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Название:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Введите название мероприятия"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Описание:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            disabled={loading}
            rows={3}
            placeholder="Опишите мероприятие"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="date">Дата:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category">Категория:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={loading}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Локация (координаты):</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Например: 55.684758, 37.738521"
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Создание...' : 'Создать мероприятие'}
          </button>
          <button type="button" onClick={onCancel} disabled={loading} className={styles.cancelButton}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;