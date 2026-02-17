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
// Регистрация с новыми полями
router.post(
  '/register',
  validateRequest([
    'surname',
    'name',
    'patronymic',
    'gender',
    'birthDate',
    'email',
    'password',
  ]),
  async (req, res) => {
    try {
      const { surname, name, patronymic, gender, birthDate, email, password } =
        req.body;

      // Проверка уникальности email
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email уже используется' });
      }

      // Дополнительная проверка даты (хотя в модели есть валидация)
      if (new Date(birthDate) > new Date()) {
        return res
          .status(400)
          .json({ error: 'Дата рождения не может быть в будущем' });
      }

      const user = await User.create({
        surname,
        name,
        patronymic,
        gender,
        birthDate,
        email,
        password,
      });

      // Не возвращаем пароль
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

router.put(
  '/profile',
  validateRequest(['surname', 'name', 'patronymic', 'gender', 'birthDate']), // все поля обязательны
  async (req, res) => {
    try {
      const user = req.user as User;
      const { surname, name, patronymic, gender, birthDate } = req.body;

      // Проверка даты
      if (new Date(birthDate) > new Date()) {
        return res
          .status(400)
          .json({ error: 'Дата рождения не может быть в будущем' });
      }

      await user.update({ surname, name, patronymic, gender, birthDate });
      const updatedUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] },
      });
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка обновления профиля' });
    }
  },
);

export default router;
