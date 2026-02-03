import express from 'express';
import 'dotenv/config.js';
import { authDB, syncDB } from './configs/db';
import eventsRouter from './routes/events';
import userRouter from './routes/users';
import { readFileSync } from 'fs';
import { join } from 'path';
import cors from 'cors';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { apiKeyMiddleware } from './middlewares/apiKey';
import passport from 'passport';
import authRoutes from './routes/auth';
import configurePassport from './configs/passport';
import { valid } from './middlewares/validation';
import { parse } from 'yaml';

const port: number = parseInt(process.env.APP_PORT || '9000');
const app = express();

app.use(morgan('[:method] :url satus :status - :response-time ms'));
app.use(cors());
app.use(express.json());

configurePassport(passport);
app.use(passport.initialize());
app.use(valid);

// Если YAML файлы содержат только JSON-совместимые структуры
interface SwaggerComponents {
  components?: Record<string, unknown>;
}

interface SwaggerPaths {
  paths?: Record<string, unknown>;
}

type SwaggerYaml = SwaggerComponents & SwaggerPaths;

const loadYAML = (file: string): SwaggerYaml => {
  const content = readFileSync(
    join(process.cwd(), `swagger/${file}.yml`),
    'utf-8',
  );
  return parse(content) as SwaggerYaml;
};

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API документация',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:9000' }],
    components: loadYAML('schemas').components,
    paths: {
      ...loadYAML('auth').paths,
      ...loadYAML('events').paths,
      ...loadYAML('users').paths,
    },
  },
  apis: ['./swagger/*.yml'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/auth', authRoutes);
app.use('/events', apiKeyMiddleware, eventsRouter);
app.use('/users', apiKeyMiddleware, userRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('API работает!');
});

app.listen(port, (err?: Error) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  authDB();
  syncDB();
  console.log(`Сервер запущен на порту http://localhost:${port}`);
});

const test: any = 'hello';
const test: any = 'hello';
const test: any = 'hello';
