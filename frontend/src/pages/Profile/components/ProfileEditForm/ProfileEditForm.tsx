import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect } from 'react';
import styles from './ProfileEditForm.module.scss';

const schema = yup.object({
  surname: yup.string().required('Фамилия обязательна'),
  name: yup.string().required('Имя обязательно'),
  patronymic: yup.string().required('Отчество обязательно'),
  gender: yup.string().oneOf(['male', 'female'], 'Выберите пол').required('Пол обязателен'),
  birthDate: yup.string()
    .required('Дата рождения обязательна')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Формат: ГГГГ-ММ-ДД')
    .test('birthDate', 'Дата рождения не может быть в будущем', (value) => {
      if (!value) return false;
      return new Date(value) <= new Date();
    }),
});

type ProfileEditFormData = yup.InferType<typeof schema>;

interface ProfileEditFormProps {
  initialData: ProfileEditFormData;
  onSubmit: (data: ProfileEditFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
const handleEditSubmit = async (data: any) => {
    if (!user?.id) return;
    await dispatch(updateProfile({ userId: user.id, data })).unwrap();
    setIsEditing(false);
  };

const ProfileEditForm = ({ initialData, onSubmit, onCancel, isLoading = false }: ProfileEditFormProps) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileEditFormData>({
    resolver: yupResolver(schema),
    defaultValues: initialData,
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Редактирование профиля</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label>Фамилия *</label>
            <input {...register('surname')} disabled={isLoading} />
            {errors.surname && <span className={styles.error}>{errors.surname.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Имя *</label>
            <input {...register('name')} disabled={isLoading} />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Отчество *</label>
            <input {...register('patronymic')} disabled={isLoading} />
            {errors.patronymic && <span className={styles.error}>{errors.patronymic.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Пол *</label>
            <select {...register('gender')} disabled={isLoading}>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
            {errors.gender && <span className={styles.error}>{errors.gender.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Дата рождения *</label>
            <input type="date" {...register('birthDate')} disabled={isLoading} />
            {errors.birthDate && <span className={styles.error}>{errors.birthDate.message}</span>}
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
      </div>
    </div>
  );
};

export default ProfileEditForm;