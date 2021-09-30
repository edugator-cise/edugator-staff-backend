import { mongoDatabase } from '../db';
//eslint-disable-next-line
const stopDB = async () => {
  await mongoDatabase.stop();
};
export default stopDB;
