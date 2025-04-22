import { sequelize } from '../configs/db.js';
import { Sequelize } from 'sequelize';
import bcrypt  from 'bcryptjs';

    const User = sequelize.define("User", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [8, 100],
        },
      },

      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
    User.beforeCreate(async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    });
    

export default User;