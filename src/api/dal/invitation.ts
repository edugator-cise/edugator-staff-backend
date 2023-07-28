import { EnrollmentAttributes } from '../models/v2/enrollment.model';
import {
  Invitation,
  InvitationAttributes,
  InvitationAttributesInput
} from '../models/v2/invitation.model';
import { Enrollment } from '../models/v2/enrollment.model';

import { sequelize } from '../../config/database_v2';

export const create = async (
  payload: InvitationAttributesInput
): Promise<InvitationAttributes> => {
  const invitation = await Invitation.create(payload);
  return invitation ? invitation.get({ plain: true }) : undefined;
};

export const getById = async (id: string): Promise<InvitationAttributes> => {
  const invitation = await Invitation.findByPk(id);
  return invitation.get({ plain: true });
};

export const getByUser = async (
  _userId: string
): Promise<InvitationAttributes[]> => {
  const invitations = await Invitation.findAll({
    // where in list of emails matching with userId
  });

  return invitations.map((invitation) => invitation.get({ plain: true }));
};

export const acceptInvitation = async (
  invitation: InvitationAttributes,
  userId: string
): Promise<EnrollmentAttributes> => {
  const result = await sequelize.transaction(async (transaction) => {
    try {
      const numberOfDeletions = await Invitation.destroy({
        where: { id: invitation.id }
      });
      if (numberOfDeletions === 0) throw new Error('Invitation not found');

      const enrollment = await Enrollment.create({
        userId: userId,
        courseId: invitation.courseId,
        email: invitation.email,
        role: invitation.role,
        status: 'active'
      });

      if (!enrollment) throw new Error('Enrollment not created');

      transaction.commit();
      return enrollment.get({ plain: true });
    } catch (e) {
      await transaction.rollback();
      return undefined;
    }
  });

  return result;
};
