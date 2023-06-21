import { Sequelize } from 'sequelize';
import {
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_HOST
} from './vars';

export const sequelize: Sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  {
    host: DATABASE_HOST,
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
