import { Sequelize } from "sequelize";
import { sequelize } from "../configs/db.js";

const RefreshToken = sequelize.define("RefreshToken", {
  token: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // Имя модели, к которой ссылается внешний ключ
      key: "id", // Поле, на которое ссылается внешний ключ
    },
  },
  expiresAt: {
    type: Sequelize.DATE,
    allowNull: false
  },
});

export default RefreshToken;