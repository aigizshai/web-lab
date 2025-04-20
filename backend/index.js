import express from 'express'
import 'dotenv/config.js'
import { authDB, syncDB } from './configs/db.js'
import eventsRouter from './routes/events.js'
import userRouter from './routes/users.js'
import cors from 'cors'

const port = process.env.APP_PORT

const app = express()
app.use(cors())
app.use(express.json())

app.use("/events",eventsRouter)
app.use("/users",userRouter)
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

