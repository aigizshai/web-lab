import { sequelize } from '@configs/db';
import { DataTypes, Model, Optional } from 'sequelize';

interface EventAttributes {
  id: number;
  title: string;
  description?: string;
  category:
    | 'встреча'
    | 'день рождения'
    | 'праздник'
    | 'концерт'
    | 'лекция'
    | 'выставка'
    | 'другое';
  location: string;
  date: Date;
  createdBy: number;
}

class Event
  extends Model<EventAttributes, Optional<EventAttributes, 'id'>>
  implements EventAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public category!:
    | 'встреча'
    | 'день рождения'
    | 'праздник'
    | 'концерт'
    | 'лекция'
    | 'выставка'
    | 'другое';
  public location!: string;
  public date!: Date;
  public createdBy!: number;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    category: {
      type: DataTypes.ENUM(
        'встреча',
        'день рождения',
        'праздник',
        'концерт',
        'лекция',
        'выставка',
        'другое',
      ),
      allowNull: false,
      defaultValue: 'другое',
      validate: {
        notEmpty: true,
        isIn: [
          [
            'встреча',
            'день рождения',
            'праздник',
            'концерт',
            'лекция',
            'выставка',
            'другое',
          ],
        ],
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Поле 'location' не может быть пустым",
        },
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Event',
  },
);

export default Event;
