import { InvitationAttributes } from '../../models/v2/invitation.model';
import * as InvitationDataLayer from '../../dal/invitation';
import * as EnrollmentDataLayer from '../../dal/enrollment';
import * as clerk from '../../services/clerk';

import { Request, Response } from 'express';
import { WithAuthProp } from '@clerk/clerk-sdk-node';
import { v4 as uuidv4 } from 'uuid';

export const getUserInvitations = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const user = await clerk.getUser(req.auth.userId);
    const emails = user.emailAddresses.map((email) => email.emailAddress);

    const invitations = await InvitationDataLayer.getByEmails(emails);
    if (!invitations) return res.status(404).send();
    else return res.status(200).send(invitations);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const acceptInvitation = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const user = await clerk.getUser(req.auth.userId);
    const emails = user.emailAddresses.map((email) => email.emailAddress);

    const result = await InvitationDataLayer.getById(req.params.invitationId);
    if (!result) return res.sendStatus(404);
    if (!emails.includes(result.email)) return res.sendStatus(403);

    const enrollment = await EnrollmentDataLayer.findByUserAndCourse(
      req.auth.userId,
      result.courseId
    );
    if (enrollment && enrollment.status === 'active') {
      return res.status(400).send('You are already enrolled in this course');
    }

    const accepted = await InvitationDataLayer.acceptInvitation(
      result,
      req.auth.userId,
      enrollment && enrollment.status === 'removed'
    );
    return res.status(200).send(accepted);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const rejectInvitation = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const user = await clerk.getUser(req.auth.userId);
    const emails = user.emailAddresses.map((email) => email.emailAddress);

    const result = await InvitationDataLayer.getById(req.params.invitationId);
    if (!result) return res.sendStatus(404);
    if (!emails.includes(result.email)) return res.sendStatus(403);

    const deleted = await InvitationDataLayer.deleteInvitation(
      req.params.invitationId
    );
    if (!deleted) return res.sendStatus(500);
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const getInvitations = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const invitations = await InvitationDataLayer.getByCourse(
      req.params.courseId
    );
    if (!invitations) return res.sendStatus(404);
    return res.status(200).send(invitations);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const createInvitations = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const user = await clerk.getUserByEmail(req.body.email);
    if (user) {
      const enrollment = await EnrollmentDataLayer.findByUserAndCourse(
        user.id,
        req.params.courseId
      );
      if (enrollment && enrollment.status === 'active')
        return res.status(400).send('Trying to invite an enrolled user');
    }

    const invitation = await InvitationDataLayer.findByEmailAndCourseId(
      req.body.email,
      req.params.courseId
    );
    if (invitation)
      return res.status(400).send('Invitation already exists for this user');

    const payload: InvitationAttributes = {
      ...req.body,
      courseId: req.params.courseId,
      id: uuidv4()
    };
    const result = await InvitationDataLayer.create(payload);
    if (!result) return res.sendStatus(500);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const updateInvitation = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const result = await InvitationDataLayer.updateById(
      req.params.invitationId,
      req.body
    );
    if (!result) {
      return res.sendStatus(400);
    }
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const deleteInvitations = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const deleted = await InvitationDataLayer.deleteInvitation(
      req.params.invitationId
    );
    if (!deleted) return res.sendStatus(500);
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};
