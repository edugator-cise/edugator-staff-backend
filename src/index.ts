import app from './config/express';

//eslint-disable-next-line
app.listen(8080, () => console.log(`server started on port 8080`));

module.exports = app;
