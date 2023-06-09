import {
  OrganizationAttributesInput,
  OrganizationAttributes,
  Organization
} from '../models/organization.model';

export const create = async (
  payload: OrganizationAttributesInput
): Promise<OrganizationAttributes> => {
  const organization = await Organization.create(payload);
  return organization.dataValues;
};

export const getById = async (
  id: string
): Promise<OrganizationAttributes | undefined> => {
  const organization = await Organization.findByPk(id);
  return organization ? organization.dataValues : undefined;
};

export const getAll = async (): Promise<OrganizationAttributes[]> => {
  const org = await Organization.findAll();
  return org.map((value) => value.dataValues);
};

export const deleteById = async (id: string): Promise<boolean> => {
  const numberOfDeletions = await Organization.destroy({
    where: { id }
  });
  return !!numberOfDeletions;
};

export const updateById = async (
  id: string,
  payload: OrganizationAttributes
): Promise<OrganizationAttributes | undefined> => {
  const organization = await Organization.findByPk(id);
  if (!organization) {
    return undefined;
  }

  const updatedOrganization = await organization.update(payload);
  return updatedOrganization.dataValues;
};
