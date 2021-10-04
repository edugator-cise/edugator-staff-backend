import * as express from 'express';
import { Request, Response } from 'express';
import routes from '../api/routes/v1';
import * as cors from 'cors';
import * as passport from 'passport';
import { jwtStrategy } from './passport';
import { notFound, converter, handler } from '../api/errors/error';
import * as database from './database';
class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.connectDatabase();
    this.config();
    this.routes();
    this.errorMiddleWares();
  }
  public routes(): void {
    this.app.use('/v1', routes);
    this.app.get('/', (_req: Request, res: Response): void => {
      // use static 200 to prevent undefined message from http-status
      res.status(200).send('OK');
    });
  }
  public config(): void {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(passport.initialize());
    passport.use('jwt', jwtStrategy);
  }

  public errorMiddleWares(): void {
    this.app.use(converter);
    this.app.use(notFound);
    this.app.use(handler);
  }
  private connectDatabase(): void {
    database.connect();
  }
  public start(): void {
    //eslint-disable-next-line
    this.app.listen(8080, () => console.log(`server started on port 8080`));
  }
}

const server = new Server();
const expressApp = server.app;

// export server
export { server, expressApp };
