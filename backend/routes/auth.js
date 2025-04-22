import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/index.js';

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

        const user = await User.create({ name, email, password });
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

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;