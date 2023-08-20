import {
  Enrollment,
  EnrollmentAttributes
} from '../models/v2/enrollment.model';
import { Course } from '../models/v2/course.model';

import * as clerk from '../services/clerk';

import { sequelize } from '../../config/database_v2';

export const getByUser = async (
  userId: string
): Promise<EnrollmentAttributes[]> => {
  const result = await Enrollment.findAll({
    include: [
      {
        model: Course,
        as: 'course',
        attributes: []
      }
    ],
    attributes: {
      include: [
        [sequelize.col('course.courseName'), 'courseName'],
        [sequelize.col('course.logo'), 'courseLogo'],
        [sequelize.col('course.description'), 'courseDescription'],
        [
          sequelize.literal(
            `(SELECT GROUP_CONCAT(userId) FROM Enrollment WHERE courseId=course.id AND role='instructor')`
          ),
          'instructors'
        ]
      ]
    },
    where: {
      userId
    },
    order: [['courseName', 'ASC']]
  });

  const enrollments: any = result.map((value) => value.get({ plain: true }));
  await Promise.all(
    enrollments.map(async (enrollment: any) => {
      const ids = enrollment.instructors.split(',');
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
      enrollment.instructors = instructors;
      return enrollment;
    })
  );

  return enrollments;
};

export const getAllCourseEnrollments = async (
  courseId: string
): Promise<EnrollmentAttributes[]> => {
  const result = await Enrollment.findAll({
    where: {
      courseId
    },
    order: [['email', 'ASC']]
  });
  let enrollments: any = result.map((value) => value.get({ plain: true }));

  const userIds = enrollments.map((value) => value.userId);
  const users = await clerk.getUsers(userIds);

  const info = new Map<string, [name: string, avatar: string]>();

  users.forEach((user) => {
    info.set(user.id, [
      !user.firstName || !user.lastName
        ? ''
        : user.firstName + ' ' + user.lastName,
      user.imageUrl
    ]);
  });

  enrollments = enrollments.map((value) => {
    value['name'] = info.get(value.userId)[0];
    value['avatar'] = info.get(value.userId)[1];
    return value;
  });

  return enrollments;
};

export const create = async (
  payload: EnrollmentAttributes
): Promise<EnrollmentAttributes> => {
  const enrollment = await Enrollment.create(payload);
  return enrollment.get({ plain: true });
};

export const findByUserAndCourse = async (
  userId: string,
  courseId: string
): Promise<EnrollmentAttributes | undefined> => {
  const enrollment = await Enrollment.findOne({
    where: {
      userId,
      courseId
    }
  });
  if (!enrollment) {
    return undefined;
  }
  return enrollment.get({ plain: true });
};

export const updateById = async (
  userId: string,
  courseId: string,
  payload: Partial<EnrollmentAttributes>
): Promise<EnrollmentAttributes | undefined> => {
  const enrollment = await Enrollment.findOne({
    where: {
      userId,
      courseId
    }
  });
  if (!enrollment) {
    return undefined;
  }
  await enrollment.update(payload);
  return enrollment.get({ plain: true });
};

export const deleteById = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  const numberOfDeletions = await Enrollment.destroy({
    where: {
      userId,
      courseId
    }
  });
  return !!numberOfDeletions;
};
