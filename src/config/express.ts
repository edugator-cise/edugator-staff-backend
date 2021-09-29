import * as express from 'express';
import { Request, Response } from 'express';
import routes from '../api/routes/v1';
import * as cors from 'cors';
import * as passport from 'passport';
import { jwtStrategy } from './passport';
import { notFound, converter, handler } from '../api/errors/error';

const app = express();

app.use(express.json());
app.use(cors());

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

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
