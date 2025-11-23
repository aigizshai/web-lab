import express from 'express';
import { Event } from '../models/index';

const router = express.Router();

interface EventsQuery {
  category?: string;
}

router.get(
  '/events',
  async (
    req: express.Request<object, object, object, EventsQuery>,
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

export default router;
