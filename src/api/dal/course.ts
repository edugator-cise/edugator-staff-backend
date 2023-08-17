import {
  CourseAttributesInput,
  CourseAttributes
} from '../models/v2/course.model';
import { Course } from '../models/v2/course.model';
import { Module } from '../models/v2/module.model';
import { Problem } from '../models/v2/problem.model';
import { Lesson } from '../models/v2/lesson.model';

import { sequelize } from '../../config/database_v2';

import * as clerk from '../services/clerk';

import { Op, Sequelize } from 'sequelize';

export const create = async (
  payload: CourseAttributesInput
): Promise<CourseAttributes> => {
  const course = await Course.create(payload);
  return course ? course.get({ plain: true }) : undefined;
};

export const getById = async (
  id: string
): Promise<CourseAttributes | undefined> => {
  const result: any = await Course.findByPk(id, {
    attributes: {
      include: [
        [
          sequelize.literal(
            `(SELECT GROUP_CONCAT(userId) FROM Enrollment WHERE courseId=id AND role='instructor')`
          ),
          'instructors'
        ]
      ]
    }
  });

  const course = result.get({ plain: true });
  const ids = course.instructors.split(',');
  const instructors = await clerk.getUsers(ids).then((users) => {
    return users.map((user) => {
      return {
        name:
          !user.firstName || !user.lastName
            ? ''
            : user.firstName + ' ' + user.lastName,
        image: user.imageUrl
      };
    });
  });
  course.instructors = instructors;

  return course;
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
  if (!course) return undefined;

  const updatedCourse = await course.update(payload);
  return updatedCourse ? updatedCourse.get({ plain: true }) : undefined;
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
              hidden: !hidden ? false : { [Op.or]: [false, true] }
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
              hidden: !hidden ? false : { [Op.or]: [false, true] }
            },
            separate: true,
            attributes: ['id', 'title', 'orderNumber'],
            order: [['orderNumber', 'ASC']]
          }
        ]
      }
    ]
  });

  return course ? course.get({ plain: true }) : undefined;
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
  const prevMax = course[0] ? course[0].get({ plain: true })['moduleCount'] : 0;
  return prevMax + 1;
};
