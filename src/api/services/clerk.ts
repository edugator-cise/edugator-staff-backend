import { CLERK_SECRET_KEY } from '../../config/vars';

import Clerk, { User } from '@clerk/clerk-sdk-node/esm/instance';

export const clerk = Clerk({ secretKey: CLERK_SECRET_KEY });

export const getUser = async (userId: string): Promise<User> => {
  const user = await clerk.users.getUser(userId);
  return user;
};
