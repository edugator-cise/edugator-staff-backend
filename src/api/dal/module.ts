import {
  ModuleAttributesInput,
  ModuleAttributes,
  Module
} from '../models/v2/module.model';

import * as ProblemDataLayer from './problem';
import * as LessonDataLayer from './lesson';

import { Op } from 'sequelize';
import { sequelize } from '../../config/database_v2';

export const create = async (
  payload: ModuleAttributesInput
): Promise<ModuleAttributes> => {
  const module_ = await Module.create(payload);
  return module_.get({ plain: true });
};

export const getById = async (id: string): Promise<ModuleAttributes> => {
  const module_ = await Module.findByPk(id, {
    include: ['problems', 'lessons'],
    order: [
      ['problems', 'orderNumber', 'ASC'],
      ['lessons', 'orderNumber', 'ASC']
    ]
  });
  return module_ ? module_.get({ plain: true }) : null;
};

export const deleteById = async (id: string): Promise<boolean> => {
  const numberOfDeletions = await Module.destroy({
    where: { id }
  });
  return !!numberOfDeletions;
};

export const deleteByCourse = async (courseId: string): Promise<boolean> => {
  const moduleRows = await Module.findAll({
    where: { courseId: courseId },
    attributes: ['id']
  });
  const modules = moduleRows.map((module_) => module_.get({ plain: true }));

  const numberOfDeletions = await Module.destroy({
    where: { courseId: courseId }
  });
  modules.forEach((module_) => {
    ProblemDataLayer.deleteByModule(module_.id);
    LessonDataLayer.deleteByModule(module_.id);
  });

  return !!numberOfDeletions;
};

export const updateById = async (
  id: string,
  payload: ModuleAttributesInput
): Promise<ModuleAttributes | undefined> => {
  const module_ = await Module.findByPk(id);
  if (!module_) return undefined;
  const updatedModule = await module_.update(payload);
  return updatedModule.get({ plain: true });
};

export const getAll = async (): Promise<ModuleAttributes[]> => {
  const module_ = await Module.findAll({
    include: ['problems', 'lessons'],
    order: [
      ['problems', 'orderNumber', 'ASC'],
      ['lessons', 'orderNumber', 'ASC']
    ]
  });
  return module_.map((value) => value.get({ plain: true }));
};

export const getNextOrder = async (id: string): Promise<number> => {
  const module_ = await getById(id);
  const prevMax = module_['problems'].length + module_['lessons'].length;
  return prevMax + 1;
};

export const shiftModules = async (
  courseId: string,
  orderNumber: number,
  newOrderNumber?: number
): Promise<void> => {
  if (!newOrderNumber) {
    await Module.update(
      { orderNumber: sequelize.literal('orderNumber - 1') },
      {
        where: {
          courseId: courseId,
          orderNumber: { [Op.gt]: orderNumber }
        }
      }
    );
  } else {
    await Module.update(
      {
        orderNumber: sequelize.literal(
          orderNumber < newOrderNumber ? 'orderNumber - 1' : 'orderNumber + 1'
        )
      },
      {
        where: {
          courseId: courseId,
          orderNumber: {
            [Op.gte]:
              orderNumber < newOrderNumber ? orderNumber : newOrderNumber,
            [Op.lte]:
              orderNumber < newOrderNumber ? newOrderNumber : orderNumber
          }
        }
      }
    );
  }
};
