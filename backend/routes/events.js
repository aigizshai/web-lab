import express from "express";
const router = express.Router();
import { User,Event} from "../models/index.js";


router.get("/", async (req, res) => {
    try {
      const {category} = req.query;
      const whereClause = {};

      if (category) {
        console.log(category)
        whereClause.category = category;
      }
      const events = await Event.findAll({ where: whereClause });
      res.status(200).json(events);
    } catch (error) {
        console.error("Ошибка:", error);  
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  // Получить мероприятие по ID
  router.get("/:id", async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Мероприятие не найдено" });
      }
      res.status(200).json(event);
    } catch (error) {
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  // Создать мероприятие
  router.post("/", async (req, res) => {
    try {
      const { title, description, date, createdBy } = req.body;
  
      // Валидация
      if (!title || !date || !createdBy) {
        return res.status(400).json({ error: "Обязательные поля: title, date, createdBy" });
      }
  
      // Проверка существования пользователя
      const user = await User.findByPk(createdBy);
      if (!user) {
        return res.status(400).json({ error: "Пользователь не найден" });
      }
  
      const event = await Event.create({ title, description, date, createdBy });
      res.status(201).json(event);
    } catch (error) {
       console.error("Ошибка:", error); 
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  // Обновить мероприятие
  router.put("/:id", async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Мероприятие не найдено" });
      }
  
      const { title, description, date } = req.body;
      if (title) event.title = title;
      if (description) event.description = description;
      if (date) event.date = date;
  
      await event.save();
      res.status(200).json(event);
    } catch (error) {
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  // Удалить мероприятие
  router.delete("/:id", async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Мероприятие не найдено" });
      }
  
      await event.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  export default router;
  