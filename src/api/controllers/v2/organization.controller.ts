import { Request, Response } from 'express';
import { OrganizationAttributesInput } from '../../models/v2/organization.model';
import * as OrganizationDataLayer from '../../dal/organization';
import { v4 as uuidv4 } from 'uuid';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload: OrganizationAttributesInput = { ...req.body, id: uuidv4() };
    const result = await OrganizationDataLayer.create(payload);
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const getOrganizations = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const results = await OrganizationDataLayer.getAll();
    if (!results) {
      res.status(404).send();
    }
    res.status(200).send(results);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const getOrganizationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params['organizationId'];
    if (id === undefined) {
      res.status(400).send('error course is undefined');
    }
    const result = await OrganizationDataLayer.getById(id);

    if (!result) {
      res.status(404).send();
    }
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const updateOrganization = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params['organizationId'];
    if (id === undefined) {
      res.status(400).send('error organization is undefined');
    }
    const result = await OrganizationDataLayer.updateById(id, req.body);
    if (!result) {
      res.status(404).send();
    }
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const deleteOrganization = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload = req.params['organizationId'];
    if (payload === undefined) {
      res.status(400).send('error course is undefined');
    }
    const result = await OrganizationDataLayer.deleteById(payload);
    if (!result) {
      res.status(404).send();
      return;
    }
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};
