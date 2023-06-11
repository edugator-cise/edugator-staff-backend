import * as express from 'express';
import { Request, Response } from 'express';
import routes from '../api/routes/v1';
import routesV2 from '../api/routes/v2';
import * as cors from 'cors';
import * as passport from 'passport';
import { jwtStrategy } from './passport';
import * as database from './database';
import * as databasev2 from './databasev2';
import { Course } from '../api/models/v2/course.model';
import { Organization } from '../api/models/v2/organization.model';
import { Module } from '../api/models/v2/module.model';
import { Problem, TestCase } from '../api/models/v2/problem.model';
import { Lesson } from '../api/models/v2/lesson.model';

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.connectDatabase();
    if (process.env.NODE_ENV !== 'test') {
      this.connectDatabaseV2();
    }
    this.config();
    this.routes();
  }
  public routes(): void {
    this.app.use('/v1', routes);
    this.app.use('/v2', routesV2);
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

  private async connectDatabaseV2(): Promise<void> {
    await databasev2.authenticate();
    await this.syncModels();
  }

  private async syncModels(): Promise<void> {
    await Course.sync();
    await Organization.sync();
    await Module.sync();
    await Problem.sync();
    await TestCase.sync();
    await Lesson.sync();
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
