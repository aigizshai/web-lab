import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { register as registerUser } from '../../features/auth/authSlice';
import styles from './Register.module.scss';

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
  email: yup.string().email('Неверный email').required('Email обязателен'),
  password: yup.string().min(8, 'Минимум 8 символов').required('Пароль обязателен'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
});

type RegisterFormData = yup.InferType<typeof schema>;

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Убираем confirmPassword перед отправкой
    const { confirmPassword, ...registerData } = data;
    try {
      await dispatch(registerUser(registerData)).unwrap();
      navigate('/login', { state: { message: 'Регистрация успешна, войдите в систему' } });
    } catch (err) {
      // ошибка уже в сторе
    }
  };

  return (
    <div className={styles.register}>
      <div className={styles.container}>
        <h2>Регистрация</h2>
        {error && <div className={styles.error}>{error}</div>}
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
              <option value="">Выберите пол</option>
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

          <div className={styles.formGroup}>
            <label>Email *</label>
            <input type="email" {...register('email')} disabled={isLoading} />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Пароль *</label>
            <input type="password" {...register('password')} disabled={isLoading} />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Подтверждение пароля *</label>
            <input type="password" {...register('confirmPassword')} disabled={isLoading} />
            {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary">
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
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