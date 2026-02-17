import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '@models/User';
import RefreshToken from '@models/RefreshToken';
import { validateRequest } from '@middlewares/validation'; // путь к validation.ts

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

// Регистрация
router.post(
  '/register',
  validateRequest(['name', 'email', 'password']),
  async (
    req: express.Request<object, object, RegisterBody>,
    res: express.Response,
  ): Promise<void> => {
    const { name, email, password } = req.body;
    try {
      // Проверка уникальности email
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({ error: 'Email уже используется' });
        return;
      }

      const user = await User.create({ name, email, password });
      const { password: _, ...userWithoutPassword } = user.toJSON();
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

// Вход
router.post(
  '/login',
  validateRequest(['email', 'password']),
  async (
    req: express.Request<object, object, LoginBody>,
    res: express.Response,
  ): Promise<void> => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ error: 'Неверный email или пароль' });
        return;
      }

      // Сравнение паролей (если в модели User есть метод comparePassword)
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        res.status(401).json({ error: 'Неверный email или пароль' });
        return;
      }

      const accessToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' },
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' },
      );

      await RefreshToken.create({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: user.id,
      });

      res.json({ accessToken, refreshToken, id: user.id, name: user.name });
    } catch (error) {
      console.error('Ошибка входа:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

// Обновление токена
router.post(
  '/refresh',
  validateRequest(['refreshToken']),
  async (
    req: express.Request<object, object, RefreshBody>,
    res: express.Response,
  ): Promise<void> => {
    const { refreshToken } = req.body;

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;

      const tokenRecord = await RefreshToken.findOne({
        where: { token: refreshToken, userId: decoded.id },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        res.status(401).json({ error: 'Недействительный токен' });
        return;
      }

      const newAccessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' },
      );

      res.json({ accessToken: newAccessToken, id: decoded.id });
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      res.status(401).json({ error: 'Ошибка обновления токена' });
    }
  },
);

// Получение профиля
router.get(
  '/profile',
  async (req: express.Request, res: express.Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Токен не предоставлен' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;

      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Ошибка получения профиля:', error);
      res.status(401).json({ error: 'Недействительный токен' });
    }
  },
);

export default router;
