import express from 'express';
import User from '@models/User';
import Event from '@models/Event';
import passport from 'passport';

const router = express.Router();

interface EventQuery {
  category?: string;
}

interface EventParams {
  id: string;
}

interface CreateEventBody {
  title: string;
  description?: string;
  category?: string;
  location: string;
  date: string;
  createdBy: number;
}

interface UpdateEventBody {
  title?: string;
  description?: string;
  location?: string;
  date?: string;
}

router.get(
  '/',
  async (
    req: express.Request<object, object, object, EventQuery>,
    res: express.Response,
  ): Promise<void> => {
    try {
      const { category } = req.query;
      const whereClause: Record<string, unknown> = {};

      if (category) {
        whereClause.category = category;
      }
      const events = await Event.findAll({ where: whereClause });
      res.status(200).json(events);
    } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

router.use(passport.authenticate('jwt', { session: false }));

// Получить мероприятие по ID
router.get(
  '/:id',
  async (
    req: express.Request<EventParams>,
    res: express.Response,
  ): Promise<void> => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        res.status(404).json({ error: 'Мероприятие не найдено' });
        return;
      }
      res.status(200).json(event);
    } catch {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

// Создать мероприятие
router.post(
  '/',
  async (
    req: express.Request<object, object, CreateEventBody>,
    res: express.Response,
  ): Promise<void> => {
    try {
      const { title, description, category, location, date, createdBy } =
        req.body;

      // Валидация
      if (!title || !location || !date || !createdBy) {
        res.status(400).json({
          error: 'Обязательные поля: title, location, date, createdBy',
        });
        return;
      }

      // Проверка существования пользователя
      const user = await User.findByPk(createdBy);
      if (!user) {
        res.status(400).json({ error: 'Пользователь не найден' });
        return;
      }

      const allowedCategories = [
        'встреча',
        'день рождения',
        'праздник',
        'концерт',
        'лекция',
        'выставка',
        'другое',
      ] as const;
      const isAllowedCategory = (
        value: string,
      ): value is (typeof allowedCategories)[number] => {
        return allowedCategories.includes(
          value as (typeof allowedCategories)[number],
        );
      };

      const validatedCategory: (typeof allowedCategories)[number] =
        category && isAllowedCategory(category) ? category : 'другое';
      const event = await Event.create({
        title,
        description,
        category: validatedCategory,
        location,
        date: new Date(date),
        createdBy,
      });
      res.status(201).json(event);
    } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

// Обновить мероприятие
router.put(
  '/:id',
  async (
    req: express.Request<EventParams, object, UpdateEventBody>,
    res: express.Response,
  ): Promise<void> => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        res.status(404).json({ error: 'Мероприятие не найдено' });
        return;
      }

      const { title, description, location, date } = req.body;
      if (title) event.title = title;
      if (description) event.description = description;
      if (location) event.location = location;
      if (date) event.date = new Date(date);

      await event.save();
      res.status(200).json(event);
    } catch {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

// Удалить мероприятие
router.delete(
  '/:id',
  async (
    req: express.Request<EventParams>,
    res: express.Response,
  ): Promise<void> => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        res.status(404).json({ error: 'Мероприятие не найдено' });
        return;
      }

      await event.destroy();
      res.status(204).send();
    } catch {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

export default router;
