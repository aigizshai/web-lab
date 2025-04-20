import { Sequelize } from 'sequelize'
import 'dotenv/config'

const db_name = process.env.DB_NAME
const db_user = process.env.DB_USER
const db_password = process.env.DB_PASSWORD
const db_host = process.env.DB_HOST
const db_port = process.env.DB_PORT

const sequelize = new Sequelize(db_name, db_user, db_password, {
	host: db_host,
	port: db_port,
	dialect: 'postgres',
})

const authDB = async () => {
	try {
		await sequelize.authenticate()
		console.debug('Соединение с БД установлено!')
	} catch (error) {
		console.debug(`Соединение с БД не установлено. Ошибка: ${error}`)
	}
}

const syncDB = async () => {
	try {
		await sequelize.sync()
		console.debug('Таблицы синхронизированы!')
	} catch (error) {
		console.debug(`Таблицы не синхронизированы. Ошибка: ${error}`)
	}
}

export { sequelize, authDB, syncDB }
