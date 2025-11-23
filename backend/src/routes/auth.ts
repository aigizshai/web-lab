import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/index';
import RefreshToken from '../models/RefreshToken';

dotenv.config();
const router = express.Router();

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshBody {
  refreshToken: string;
}

interface JwtPayload {
  id: number;
}

router.post(
  '/register',
  async (
    req: express.Request<object, object, RegisterBody>,
    res: express.Response,
  ): Promise<void> => {
    const { name, email, password } = req.body;
    try {
      // Проверка обязательных полей
      if (!name || !email || !password) {
        res
          .status(400)
          .json({ error: 'Обязательные поля: name, email, password' });
        return;
      }

      // Проверка уникальности email
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({ error: 'Email уже используется' });
        return;
      }

      const user = await User.create({ name, email, password });
      const { password: userWithoutPassword } = user.toJSON();
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

router.post(
  '/login',
  async (
    req: express.Request<object, object, LoginBody>,
    res: express.Response,
  ): Promise<void> => {
    const { email, password } = req.body;
    try {
      // Проверка обязательных полей
      if (!email || !password) {
        res.status(400).json({ error: 'Обязательные поля: email, password' });
        return;
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ error: 'Неверный email или пароль' });
        return;
      }

      const accessToken = jwt.sign(
        {
          id: user.id,
        },
        (process.env.JWT_SECRET as string) || '',
        {
          expiresIn: '1h',
        },
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '7d',
        },
      );

      // Сохранение refresh token в БД
      await RefreshToken.create({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
        userId: user.id,
      });

      res.json({ accessToken, refreshToken });
    } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

router.post(
  '/refresh',
  async (
    req: express.Request<object, object, RefreshBody>,
    res: express.Response,
  ): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: 'Токен отсутствует' });
      return;
    }

    try {
      // Проверка валидности токена
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;

      // Поиск токена в БД
      const tokenRecord = await RefreshToken.findOne({
        where: { token: refreshToken, userId: decoded.id },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        res.status(401).json({ error: 'Недействительный токен' });
        return;
      }

      // Генерация нового access token
      const newAccessToken = jwt.sign(
        {
          id: decoded.id,
        },
        (process.env.JWT_SECRET as string) || '',
        {
          expiresIn: '1h',
        },
      );

      res.json({ accessToken: newAccessToken });
    } catch {
      res.status(401).json({ error: 'Ошибка обновления токена' });
    }
  },
);

export default router;
