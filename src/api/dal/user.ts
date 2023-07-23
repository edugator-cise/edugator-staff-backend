import {
  UserAttributesInput,
  UserAttributes,
  User
} from "../models/v2/user.model";

import { Op } from "sequelize";
import { sequelize } from "../../config/database_v2";

export const create = async (
  payload: UserAttributesInput
): Promise<UserAttributes> => {
  const user = await User.create(payload);
  return user.get({ plain: true})
};

export const getById = async (id: string): Promise<UserAttributes> => {
  const user = await User.findOne({
    where: {
      id: {
        [Op.eq]: id
      }
    }
  });
  return user ? user.get({ plain: true }) : null;
}

export const getByEmail = async (email: string): Promise<UserAttributes> => {
  const user = await User.findByPk(email);
  return user ? user.get({ plain: true }) : null;
}

export const updatebyEmail = async (email: string, payload: UserAttributesInput): Promise<UserAttributes | undefined> => {
  const user = await User.findByPk(email);
  if (!user) {
    return undefined;
  }
  const updatedUser = await user.update(payload);
  return updatedUser.get({ plain: true });
}

export const updateById = async (id: string, payload: UserAttributesInput): Promise<UserAttributes | undefined> => {
  const user = await User.findOne({
    where: {
      id: {
        [Op.eq]: id
      }
    }
  });
  if (!user) {
    return undefined;
  }
  const updatedUser = await user.update(payload);
  return updatedUser.get({plain: true});
}

export const deleteById = async (id: string): Promise<boolean> => {
  const numberOfDeletions = await User.destroy({
    where: {id}
  });
  return !!numberOfDeletions;
};

export const deleteByEmail = async (id: string): Promise<boolean> => {
  const numberOfDeletions = await User.destroy({
    where: {id}
  });
  return !!numberOfDeletions;
};

