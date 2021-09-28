import app from './config/express';
import * as mongoose from 'mongoose';
mongoose.connect(process.env.DB_URI);
//eslint-disable-next-line
app.listen(8080, () => console.log(`server started on port 8080`));

export default app;
