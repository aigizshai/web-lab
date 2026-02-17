import { sequelize } from '@configs/db';
import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: number;
  surname: string;
  name: string;
  patronymic: string;
  gender: 'male' | 'female';
  birthDate: string;
  email: string;
  password: string;
  createdAt: Date;
}

class User
  extends Model<UserAttributes, Optional<UserAttributes, 'id' | 'createdAt'>>
  implements UserAttributes
{
  public id!: number;
  public surname!: string;
  public name!: string;
  public patronymic!: string;
  public gender!: 'male' | 'female';
  public birthDate!: string;
  public email!: string;
  public password!: string;
  public createdAt!: Date;

  // Метод сравнения пароля
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    patronymic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString().split('T')[0], // не позже сегодня
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [8, 100] },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user: User) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  },
);

export default User;
