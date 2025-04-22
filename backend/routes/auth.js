import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/index.js';
import RefreshToken from '../models/RefreshToken.js';

dotenv.config();
const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Проверка обязательных полей
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Обязательные поля: name, email, password' });
        }

        // Проверка уникальности email
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Email уже используется' });
        }

        const user = await User.create(
            { name, email, password },
            { attributes: { exclude: ['password'] } } // Исключаем поле password
          );
        res.status(201).json(user);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Проверка обязательных полей
        if (!email || !password) {
            return res.status(400).json({ error: 'Обязательные поля: email, password' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRES, // "15m"
          });
        
          const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES, // "7d"
            
          });
        
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
});

router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Токен отсутствует" });
    }
  
    try {
      // Проверка валидности токена
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Поиск токена в БД
      const tokenRecord = await RefreshToken.findOne({
        where: { token: refreshToken, userId: decoded.id },
      });
  
      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        return res.status(401).json({ error: "Недействительный токен" });
      }
  
      // Генерация нового access token
      const newAccessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES }
      );
  
      res.json({ accessToken: newAccessToken });
    } catch (error) {
      res.status(401).json({ error: "Ошибка обновления токена" });
    }
  });

export default router;