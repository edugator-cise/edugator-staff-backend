import { Sequelize } from 'sequelize';

export const sequelize: Sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true
      }
    },
    //eslint-disable-next-line
    logging: console.log
  }
);

export const authenticate = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
};
export const disconnect = () => {
  sequelize.close();
};

export const truncate = () => {
  sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
  sequelize.truncate({ cascade: true });
};
