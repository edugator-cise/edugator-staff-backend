import {
  ModuleAttributesInput,
  ModuleAttributes,
  Module
} from '../models/v2/module.model';
import { Problem } from '../models/v2/problem.model';
import { Lesson } from '../models/v2/lesson.model';

export const create = async (
  payload: ModuleAttributesInput
): Promise<ModuleAttributes> => {
  const module_ = await Module.create(payload);
  return module_.dataValues;
};

export const getById = async (id: string): Promise<ModuleAttributes> => {
  const module_ = await Module.findByPk(id, {
    include: 'problems',
    order: [['problems', 'orderNumber', 'ASC']]
  });
  return module_ ? module_.dataValues : null;
};

export const deleteById = async (id: string): Promise<boolean> => {
  const numberOfDeletions = await Module.destroy({
    where: { id }
  });
  return !!numberOfDeletions;
};

export const updateById = async (
  id: string,
  payload: ModuleAttributesInput
): Promise<ModuleAttributes | undefined> => {
  const module_ = await Module.findByPk(id);
  if (!module_) {
    return undefined;
  }
  const updatedModule = await module_.update(payload);
  return updatedModule.dataValues;
};

export const getAll = async (): Promise<ModuleAttributes[]> => {
  const module_ = await Module.findAll({
    include: ['problems', 'lessons'],
    order: [
      ['problems', 'orderNumber', 'ASC'],
      ['lessons', 'orderNumber', 'ASC']
    ]
  });
  return module_.map((value) => value.dataValues);
};

export const getAllNonHidden = async (): Promise<ModuleAttributes[]> => {
  const module_ = await Module.findAll({
    include: [
      {
        model: Problem,
        as: 'problems',
        where: {
          hidden: false
        },
        attributes: ['id', 'title']
      },
      {
        model: Lesson,
        as: 'lessons',
        attributes: ['id', 'title']
      }
    ],
    order: [
      ['problems', 'orderNumber', 'ASC'],
      ['lessons', 'orderNumber', 'ASC']
    ]
  });
  return module_.map((value) => value.dataValues);
};
