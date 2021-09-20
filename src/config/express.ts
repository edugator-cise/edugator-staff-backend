import * as express from 'express';
import * as mongoose from 'mongoose';
import { Request, Response } from 'express';
import routes from '../api/routes/v1';

mongoose.connect(process.env.DB_URI);

const app = express();

app.use(express.json());
// mount api v1 routes
app.use('/v1', routes);

app.get('/', (_req: Request, res: Response): void => {
  // use static 200 to prevent undefined message from http-status
  res.status(200).send('OK');
});
export default app;
