import { EnrollmentAttributes } from '../models/v2/enrollment.model';
import {
  Invitation,
  InvitationAttributes,
  InvitationAttributesInput
} from '../models/v2/invitation.model';
import { Enrollment } from '../models/v2/enrollment.model';
import { Course } from '../models/v2/course.model';

import { sequelize } from '../../config/database_v2';

import * as clerk from '../services/clerk';

export const create = async (
  payload: InvitationAttributesInput
): Promise<InvitationAttributes> => {
  const invitation = await Invitation.create(payload);
  return invitation ? invitation.get({ plain: true }) : undefined;
};

export const getById = async (id: string): Promise<InvitationAttributes> => {
  const invitation = await Invitation.findByPk(id);
  return invitation ? invitation.get({ plain: true }) : undefined;
};

export const updateById = async (
  id: string,
  payload: InvitationAttributesInput
): Promise<InvitationAttributes | undefined> => {
  const invitation = await Invitation.findByPk(id);

  if (!invitation) return undefined;
  const updatedInvitation = await invitation.update(payload);
  return updatedInvitation ? updatedInvitation.get({ plain: true }) : undefined;
};

export const findByEmailAndCourseId = async (
  email: string,
  courseId: string
): Promise<InvitationAttributes | undefined> => {
  const invitation = await Invitation.findOne({
    where: {
      email,
      courseId
    }
  });
  return invitation ? invitation.get({ plain: true }) : undefined;
};

export const getByEmails = async (
  emails: string[]
): Promise<InvitationAttributes[]> => {
  const result = await Invitation.findAll({
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
      email: emails
    }
  });
  const invitations: any = result.map((value) => value.get({ plain: true }));
  await Promise.all(
    invitations.map(async (invitation: any) => {
      const ids = invitation.instructors.split(',');
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
      invitation.instructors = instructors;
      return invitation;
    })
  );

  return invitations;
};

export const getByCourse = async (
  courseId: string
): Promise<InvitationAttributes[]> => {
  const invitations = await Invitation.findAll({
    where: {
      courseId
    }
  });
  return invitations
    ? invitations.map((invitation) => invitation.get({ plain: true }))
    : undefined;
};

export const acceptInvitation = async (
  invitation: InvitationAttributes,
  userId: string,
  removed: boolean
): Promise<EnrollmentAttributes> => {
  const result = await sequelize.transaction(async (transaction) => {
    try {
      const numberOfDeletions = await Invitation.destroy({
        where: { id: invitation.id },
        transaction: transaction
      });
      if (numberOfDeletions === 0) throw new Error('Invitation not found');

      let enrollment: any;
      if (removed) {
        const result = await Enrollment.findOne({
          where: {
            userId,
            courseId: invitation.courseId
          }
        });

        enrollment = await result.update(
          {
            status: 'active',
            role: invitation.role
          },
          {
            transaction: transaction
          }
        );
      } else {
        enrollment = await Enrollment.create(
          {
            userId: userId,
            courseId: invitation.courseId,
            email: invitation.email,
            role: invitation.role,
            status: 'active'
          },
          { transaction: transaction }
        );
      }

      if (!enrollment) throw new Error('Enrollment not created');
      return enrollment.get({ plain: true });
    } catch (e) {
      await transaction.rollback();
      throw new Error(e.message);
    }
  });

  return result;
};

export const deleteInvitation = async (id: string): Promise<boolean> => {
  const numberOfDeletions = await Invitation.destroy({
    where: { id }
  });
  return !!numberOfDeletions;
};
