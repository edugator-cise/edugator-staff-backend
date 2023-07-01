import {
  OrganizationAttributesInput,
  OrganizationAttributes,
  Organization
} from '../models/v2/organization.model';

export const create = async (
  payload: OrganizationAttributesInput
): Promise<OrganizationAttributes> => {
  const organization = await Organization.create(payload);
  return organization.get({ plain: true });
};

export const getById = async (
  id: string
): Promise<OrganizationAttributes | undefined> => {
  const organization = await Organization.findByPk(id);
  return organization ? organization.get({ plain: true }) : undefined;
};

export const getAll = async (): Promise<OrganizationAttributes[]> => {
  const org = await Organization.findAll();
  return org.map((value) => value.get({ plain: true }));
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
  return updatedOrganization.get({ plain: true });
};
