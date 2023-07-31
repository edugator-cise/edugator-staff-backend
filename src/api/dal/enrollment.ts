import {
  Enrollment,
  EnrollmentAttributes
} from '../models/v2/enrollment.model';

export const getAllCourseEnrollments = async (
  courseId: string
): Promise<EnrollmentAttributes[]> => {
  const enrollment = await Enrollment.findAll({
    where: {
      courseId
    },
    order: [['email', 'ASC']]
  });
  return enrollment.map((value) => value.get({ plain: true }));
};

export const create = async (
  payload: EnrollmentAttributes
): Promise<EnrollmentAttributes> => {
  const enrollment = await Enrollment.create(payload);
  return enrollment.get({ plain: true });
};

export const updateById = async (
  userId: string,
  courseId: string,
  payload: EnrollmentAttributes
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
