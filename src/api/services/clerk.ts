import { CLERK_SECRET_KEY } from '../../config/vars';

import Clerk, { User } from '@clerk/clerk-sdk-node/esm/instance';

export const clerk = Clerk({ secretKey: CLERK_SECRET_KEY });

export const getUser = async (userId: string): Promise<User> => {
  const user = await clerk.users.getUser(userId);
  return user;
};

export const getUsers = async (userIds: string[]): Promise<User[]> => {
  const users = await clerk.users.getUserList({ userId: userIds });
  return users;
};

export const getUserByEmail = async (email: string): Promise<User> => {
  const users = await clerk.users.getUserList({ emailAddress: [email] });
  return users[0];
};
