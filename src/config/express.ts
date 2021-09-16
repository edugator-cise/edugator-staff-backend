import * as express from 'express';
import * as mongoose from 'mongoose';
import routes from '../api/routes/v1';

mongoose.connect(process.env.DB_URI);

const app = express();

app.use(express.json());

// mount api v1 routes
app.use('/v1', routes);

export default app;
