import * as express from 'express';
import { Request, Response } from 'express';
import routes from '../api/routes/v1';
import * as cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

// mount api v1 routes
app.use('/v1', routes);

app.get('/', (_req: Request, res: Response): void => {
  // use static 200 to prevent undefined message from http-status
  res.status(200).send('OK');
});
export default app;
