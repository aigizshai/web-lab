import express from 'express';
import passport from 'passport';

const router = express.Router();


router.get("events/", async (req, res) => {
    try {
      const {category} = req.query;
      const whereClause = {};

      if (category) {
        //console.log(category)
        whereClause.category = category;
      }
      const events = await Event.findAll({ where: whereClause });
      res.status(200).json(events);
    } catch (error) {
        console.error("Ошибка:", error);  
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });

export default router;