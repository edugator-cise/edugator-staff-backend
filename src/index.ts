import app from './config/express';

app.listen(8080, () => console.log(`server started on port 8080`))

module.exports = app;
