import { sequelize } from "../configs/db.js";
import { Sequelize } from "sequelize"

  const Event = sequelize.define("Event", {



    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: Sequelize.TEXT,
    },
    //Доп задание 
    category: {
      type: Sequelize.ENUM("встреча","день рождения","праздник","концерт", "лекция", "выставка", "другое"),
      allowNull: false,
      defaultValue: "другое",
      validate: {
        notEmpty: true,
        isIn: [["встреча","день рождения","праздник","концерт", "лекция", "выставка", "другое"]],
      },
    },
    
    //Доп задание
    location: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Поле 'location' не может быть пустым",
        },
      },
    },

    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });

export default Event;