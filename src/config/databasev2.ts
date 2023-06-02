import { Sequelize } from "sequelize";

let sequelize: Sequelize = undefined;

const connect = async () => {
  sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
      host: process.env.DATABASE_HOST,
      dialect: 'mysql',
      dialectOptions: {
        ssl: {
          rejectUnauthorized: true,
        },
      },
      logging: console.log,
    }
  )
  await sequelize.authenticate();
}

const disconnect = () => {
  sequelize.close();
}

const truncate = async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
  await sequelize.truncate({ cascade: true });
};


export { connect, disconnect, truncate}