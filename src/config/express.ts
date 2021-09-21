import * as express from 'express';
import * as mongoose from 'mongoose';
import { Request, Response } from 'express';
import routes from '../api/routes/v1';
import * as cors from 'cors';
import { notFound, converter, handler} from '../api/middlewares/error';

mongoose.connect(process.env.DB_URI);

const app = express();

app.use(express.json());
app.use(cors());

// mount api v1 routes
app.use('/v1', routes);

app.get('/', (_req: Request, res: Response): void => {
  // use static 200 to prevent undefined message from http-status
  res.status(200).send('OK');
});

//Error middlewares
app.use(converter);
app.use(notFound);
app.use(handler);

export default app;
