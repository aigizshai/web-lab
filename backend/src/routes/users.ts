import express from 'express';
import User from '@models/User';
import passport from 'passport';
import Event from '@models/Event';

const router = express.Router();

interface CreateUserBody {
  name: string;
  email: string;
  password?: string; // опционально, так как в текущей логике не используется
}

router.use(passport.authenticate('jwt', { session: false }));

// Создать пользователя
router.post(
  '/',
  async (
    req: express.Request<object, object, CreateUserBody>,
    res: express.Response,
  ): Promise<void> => {
    try {
      const { name, email } = req.body;

      // Проверка обязательных полей
      if (!name || !email) {
        res.status(400).json({ error: 'Обязательные поля: name, email' });
        return;
      }

      // Проверка уникальности email
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({ error: 'Email уже используется' });
        return;
      }

      const user = await User.create({
        name,
        email,
        password: 'defaultPassword',
      });
      res.status(201).json(user);
    } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

// Получить всех пользователей
router.get(
  '/',
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
      });
      res.status(200).json(users);
    } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

router.get(
  '/:id/events',
  async (
    req: express.Request<{ id: string }>,
    res: express.Response,
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Некорректный ID пользователя' });
        return;
      }

      // Проверяем, существует ли пользователь
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }

      // Получаем все мероприятия, созданные этим пользователем
      const events = await Event.findAll({
        where: { createdBy: userId },
        order: [['date', 'DESC']], // опционально: сортируем по дате (новые сверху)
      });

      res.status(200).json(events);
    } catch (error) {
      console.error('Ошибка получения мероприятий пользователя:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

export default router;
