import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../configs/db';

interface RefreshTokenAttributes {
  id?: number;
  token: string;
  userId: number;
  expiresAt: Date;
}

class RefreshToken
  extends Model<RefreshTokenAttributes, Optional<RefreshTokenAttributes, 'id'>>
  implements RefreshTokenAttributes
{
  public id!: number;
  public token!: string;
  public userId!: number;
  public expiresAt!: Date;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'RefreshToken',
  },
);

export default RefreshToken;
