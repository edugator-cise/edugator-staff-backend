import * as express from 'express';
import { Request, Response } from 'express';
import routes from '../api/routes/v1';
import * as cors from 'cors';
import * as passport from 'passport';
import { jwtStrategy } from './passport';
import * as database from './database';
import { setup } from '../api/services/ltijs';

import { port } from './vars';

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.connectDatabase();
    this.config();
    this.routes();
    setup();
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

  private connectDatabase(): void {
    database.connect();
  }
  public start(): void {
    //eslint-disable-next-line
    this.app.listen(port, () => console.log(`server started on port ${port}`));
  }
}

const server = new Server();
const expressApp = server.app;

// export server
export { server, expressApp };
