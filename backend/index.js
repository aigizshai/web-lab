import express from 'express'
import 'dotenv/config.js'
import { authDB, syncDB } from './configs/db.js'
import eventsRouter from './routes/events.js'
import userRouter from './routes/users.js'
import cors from 'cors'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { readFileSync } from 'fs'
import path, { join } from 'path'
import morgan from 'morgan'
import { apiKeyMiddleware } from './middlewares/apiKey.js'


const port = process.env.APP_PORT 
const app = express()
app.use(morgan('[:method] :url satus :status - :response-time ms'))
app.use(cors())
app.use(express.json())

const loadYAML = (file) => {
    return readFileSync(join(process.cwd(), `swagger/${file}.yml`), 'utf-8')
}

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API документация',
            version: '1.0.0',
        },
        servers: [{url: 'http://localhost:9000',},],
        components: loadYAML("schemas").components,
        paths: {
            ...loadYAML("events").paths,
            ...loadYAML("users").paths,
        }
    },
    apis: ["./swagger/*.yml"],
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)




app.use("/events",apiKeyMiddleware,eventsRouter)
app.use("/users",apiKeyMiddleware,userRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/', (req, res) => {
    res.send('API работает!')
})  



app.listen(port, (err) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    authDB()
    syncDB()
    console.log(`Сервер запущен на порту http://localhost:${port}`)
});

