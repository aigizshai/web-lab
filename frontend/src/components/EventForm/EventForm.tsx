import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect } from 'react';
import styles from './EventForm.module.scss';

const schema = yup.object({
  title: yup.string().required('Название обязательно').min(3, 'Минимум 3 символа').max(100, 'Максимум 100 символов'),
  description: yup.string().required('Описание обязательно').min(10, 'Минимум 10 символов').max(500, 'Максимум 500 символов'),
  date: yup.string()
    .required('Дата обязательна')
    .test('future-date', 'Дата не может быть в прошлом', (value) => {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
  category: yup.string().required('Категория обязательна'),
  location: yup.string().required('Локация обязательна'),
});

type EventFormData = yup.InferType<typeof schema>;

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const categories = [
  'встреча',
  'день рождения',
  'праздник',
  'концерт',
  'лекция',
  'выставка',
  'другое'
];

const EventForm = ({ initialData = {}, onSubmit, onCancel, isLoading = false }: EventFormProps) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      category: 'встреча',
      location: '',
      ...initialData
    }
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="title">Название *</label>
        <input id="title" {...register('title')} disabled={isLoading} />
        {errors.title && <span className={styles.error}>{errors.title.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Описание *</label>
        <textarea id="description" {...register('description')} rows={4} disabled={isLoading} />
        {errors.description && <span className={styles.error}>{errors.description.message}</span>}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="date">Дата *</label>
          <input type="date" id="date" {...register('date')} disabled={isLoading} />
          {errors.date && <span className={styles.error}>{errors.date.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">Категория *</label>
          <select id="category" {...register('category')} disabled={isLoading}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <span className={styles.error}>{errors.category.message}</span>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="location">Локация (координаты) *</label>
        <input id="location" {...register('location')} placeholder="55.684758, 37.738521" disabled={isLoading} />
        {errors.location && <span className={styles.error}>{errors.location.message}</span>}
      </div>

      <div className={styles.formActions}>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button type="button" onClick={onCancel} disabled={isLoading} className="btn btn-outline">
          Отмена
        </button>
      </div>
    </form>
  );
};

export default EventForm;