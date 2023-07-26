import {
  LessonAttributesInput,
  LessonAttributes,
  Lesson
} from '../models/v2/lesson.model';
import { Module } from '../models/v2/module.model';

import { Op } from 'sequelize';
import { sequelize } from '../../config/database_v2';

export const create = async (payload: LessonAttributesInput): Promise<any> => {
  const lesson = await Lesson.create(payload);
  const cleanedLesson = lesson.get({ plain: true });
  const module_ = await Module.findByPk(cleanedLesson.moduleId);
  return {
    ...cleanedLesson,
    moduleName: module_.get({ plain: true }).moduleName
  };
};

export const getById = async (id: string): Promise<LessonAttributes> => {
  const lesson = await Lesson.findByPk(id, {
    include: [
      {
        model: Module,
        as: 'module',
        attributes: []
      }
    ],
    attributes: {
      include: [[sequelize.col('module.moduleName'), 'moduleName']]
    }
  });
  return lesson ? lesson.get({ plain: true }) : undefined;
};

export const deleteById = async (id: string): Promise<boolean> => {
  const numberOfDeletions = await Lesson.destroy({
    where: { id }
  });
  return !!numberOfDeletions;
};

export const deleteByModule = async (moduleId: string): Promise<boolean> => {
  const numberOfDeletions = await Lesson.destroy({
    where: { moduleId: moduleId }
  });
  return !!numberOfDeletions;
};

export const updateById = async (
  id: string,
  payload: LessonAttributesInput
): Promise<LessonAttributes | undefined> => {
  const lesson = await Lesson.findByPk(id);
  if (!lesson) return undefined;

  const updatedLesson = await lesson.update(payload);
  return updatedLesson ? updatedLesson.get({ plain: true }) : undefined;
};

export const getAll = async (): Promise<LessonAttributes[]> => {
  const lessons = await Lesson.findAll();
  return lessons.map((value) => value.get({ plain: true }));
};

export const shiftLessons = async (
  moduleId: string,
  orderNumber: number,
  newOrderNumber?: number
): Promise<boolean> => {
  let result: [affectedCount: number];
  if (!newOrderNumber) {
    result = await Lesson.update(
      { orderNumber: sequelize.literal('orderNumber - 1') },
      {
        where: {
          moduleId: moduleId,
          orderNumber: { [Op.gt]: orderNumber }
        }
      }
    );
  } else {
    result = await Lesson.update(
      {
        orderNumber: sequelize.literal(
          orderNumber < newOrderNumber ? 'orderNumber - 1' : 'orderNumber + 1'
        )
      },
      {
        where: {
          moduleId: moduleId,
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
  return !!result;
};
