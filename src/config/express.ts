import * as express from 'express';
import { Request, Response } from 'express';
import routes from '../api/routes/v1';
import * as cors from 'cors';
import * as passport from 'passport';
import { jwtStrategy } from './passport';
import * as database from './database';

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
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

  private async connectDatabase(): Promise<void> {
    database.connect();
    await database.mySqlConnect();
    //eslint-disable-next-line no-console
    console.log('mySQL connected.');
  }
  public start(): void {
    this.connectDatabase().then(() => {
      // eslint-disable-next-line
      // const server = 
      this.app.listen(8080, () => {
        //eslint-disable-next-line
        console.log(`server started on port 8080`);
        // server.close(() => database.mySqlDisconnect());
        // //eslint-disable-next-line no-console
        // console.log('mySQL closed.');
      });
    });
  }
}

const server = new Server();
const expressApp = server.app;

// export server
export { server, expressApp };
