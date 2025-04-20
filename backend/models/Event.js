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