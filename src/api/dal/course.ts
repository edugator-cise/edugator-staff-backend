import {
  CourseAttributesInput,
  CourseAttributes
} from '../models/v2/course.model';
import { Course } from '../models/v2/course.model';
import { Module } from '../models/v2/module.model';
import { Problem } from '../models/v2/problem.model';
import { Lesson } from '../models/v2/lesson.model';
import { Sequelize } from 'sequelize';

export const create = async (
  payload: CourseAttributesInput
): Promise<CourseAttributes> => {
  const course = await Course.create(payload);
  return course.get({ plain: true });
};

export const getById = async (
  id: string
): Promise<CourseAttributes | undefined> => {
  const course = await Course.findByPk(id);
  return course ? course.get({ plain: true }) : undefined;
};

export const deleteById = async (id: string): Promise<boolean> => {
  const numberOfDeletions = await Course.destroy({
    where: { id }
  });
  return !!numberOfDeletions;
};

export const updateById = async (
  id: string,
  payload: CourseAttributesInput
): Promise<CourseAttributes | undefined> => {
  const course = await Course.findByPk(id);
  if (!course) {
    return undefined;
  }
  const updatedCourse = await course.update(payload);
  return updatedCourse.get({ plain: true });
};

export const getAll = async (
  organizationId: string
): Promise<CourseAttributes[]> => {
  const courses = await Course.findAll({
    where: {
      organizationId
    }
  });
  return courses.map((value) => value.get({ plain: true }));
};

export const getStructure = async (
  courseId: string,
  hidden: boolean
): Promise<CourseAttributes> => {
  const course = await Course.findByPk(courseId, {
    attributes: ['id', 'courseName'],
    include: [
      {
        model: Module,
        as: 'modules',
        attributes: ['id', 'moduleName', 'orderNumber'],
        separate: true,
        order: [['orderNumber', 'ASC']],
        include: [
          {
            model: Problem,
            as: 'problems',
            required: false,
            where: {
              hidden: hidden
            },
            separate: true,
            attributes: ['id', 'title', 'orderNumber'],
            order: [['orderNumber', 'ASC']]
          },
          {
            model: Lesson,
            as: 'lessons',
            required: false,
            where: {
              hidden: hidden
            },
            separate: true,
            attributes: ['id', 'title', 'orderNumber'],
            order: [['orderNumber', 'ASC']]
          }
        ]
      }
    ]
  });

  return course ? course.get({ plain: true }) : null;
};

export const getNextOrder = async (id: string): Promise<number> => {
  const course = await Course.findAll({
    attributes: [
      [Sequelize.fn('COUNT', Sequelize.col('modules.id')), 'moduleCount']
    ],
    include: [
      {
        model: Module,
        as: 'modules',
        required: false,
        attributes: []
      }
    ],
    group: ['Course.id'],
    where: {
      id: id
    }
  });
  const prevMax = course[0].get({ plain: true })['moduleCount'];
  return prevMax + 1;
};
