import express  from "express";
const router = express.Router();
import {User,Event} from "../models/index.js";
import passport from "passport";
router.use(passport.authenticate("jwt", { session: false }));
// Создать пользователя
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    // Проверка обязательных полей
    if (!name || !email) {
      return res.status(400).json({ error: "Обязательные поля: name, email" });
    }

    
    if (!email) {
      return res.status(400).json({ error: "Некорректный email" });
    }

    // Проверка уникальности email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email уже используется" });
    }

    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (error) {
    console.error("Ошибка:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получить всех пользователей
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;