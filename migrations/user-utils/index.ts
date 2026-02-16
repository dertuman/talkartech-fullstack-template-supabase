import { User } from '../../models/UserModel';

export const createRandomUser = (): Partial<User> => {
  const user: Partial<User> = {
    name: `Alex ${new Date().getTime()}`,
  };
  return user;
};
