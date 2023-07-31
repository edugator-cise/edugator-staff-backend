import { CLERK_SECRET_KEY } from '../../config/vars';

import Clerk from '@clerk/clerk-sdk-node/esm/instance';

export const clerk = Clerk({ secretKey: CLERK_SECRET_KEY });

export const getUser = async (userId: string) => {
  const user = await clerk.users.getUser(userId);
  return user;
};
