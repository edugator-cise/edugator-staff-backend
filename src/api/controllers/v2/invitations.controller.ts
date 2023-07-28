import { Request, Response } from 'express';
import * as InvitationDataLayer from '../../dal/invitation';

export const getUserInvitations = async (
  _req: Request,
  res: Response
): Promise<Record<string, any>> => {
  try {
    // match authorization header with userId
    const userId = '1234567890';

    const invitations = await InvitationDataLayer.getByUser(userId);
    if (!invitations) return res.status(404).send();
    else return res.status(200).send(invitations);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const acceptInvitation = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  // first get acc info (userId and emails) from Clerk and ensure invitation is associated with this account
  const userId = '1234567890';

  const result = await InvitationDataLayer.getById(req.params.invitationId);
  if (!result) return res.sendStatus(404);

  const accepted = await InvitationDataLayer.acceptInvitation(result, userId);
  return res.status(200).send(accepted);
};

export const rejectInvitation = async (
  _req: Request,
  res: Response
): Promise<Record<string, any>> => {
  return res.status(200).send('ok');
};
