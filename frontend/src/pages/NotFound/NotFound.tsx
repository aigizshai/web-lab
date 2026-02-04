// src/pages/NotFound/NotFound.tsx
import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.scss';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.notFound}>
      <div className={styles.container}>
        <h1>404</h1>
        <h2>Страница не найдена</h2>
        <p>Запрашиваемая страница не существует или была перемещена</p>
        <button onClick={() => navigate('/')}>Вернуться на главную</button>
      </div>
    </div>
  );
};

export default NotFound;