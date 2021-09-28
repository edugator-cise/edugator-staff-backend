import { mongoDatabase } from '../db';
//eslint-disable-next-line
const startDB = async () => {
  await mongoDatabase.start();
};
export default startDB;
