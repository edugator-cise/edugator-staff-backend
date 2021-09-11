import * as express from 'express';
import routes from '../api/routes/v1';

const app = express();

app.use(express.json());

// mount api v1 routes
app.use('/v1', routes);

export default app;
