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
import passport from 'passport'
import authRoutes from './routes/auth.js'
import configurePassport from './configs/passport.js'


const port = process.env.APP_PORT 
const app = express()
app.use(morgan('[:method] :url satus :status - :response-time ms'))
app.use(cors())
app.use(express.json())

console.log("JWT_ACCESS_EXPIRES:" , process.env.JWT_ACCESS_EXPIRES);
console.log("JWT_REFRESH_EXPIRES", process.env.JWT_REFRESH_EXPIRES);



configurePassport(passport)
app.use(passport.initialize())

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



app.use("/auth", authRoutes)
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

