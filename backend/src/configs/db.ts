import { Sequelize } from 'sequelize';
import 'dotenv/config';

const db_name = process.env.DB_NAME as string;
const db_user = process.env.DB_USER as string;
const db_password = process.env.DB_PASSWORD as string;
const db_host = process.env.DB_HOST as string;
const db_port = parseInt(process.env.DB_PORT as string);

const sequelize = new Sequelize(db_name, db_user, db_password, {
  host: db_host,
  port: db_port,
  dialect: 'postgres',
  logging: false,
});

const authDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.debug('Соединение с БД установлено!');
  } catch (error) {
    console.debug(`Соединение с БД не установлено. Ошибка: ${error}`);
  }
};

const syncDB = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    console.debug('Таблицы синхронизированы!');
  } catch (error) {
    console.debug(`Таблицы не синхронизированы. Ошибка: ${error}`);
  }
};

export { sequelize, authDB, syncDB };
