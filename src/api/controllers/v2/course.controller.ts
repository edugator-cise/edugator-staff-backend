import { CourseAttributesInput } from '../../models/v2/course.model';
import { InvitationAttributes } from '../../models/v2/invitation.model';
import * as CourseDataLayer from '../../dal/course';
import * as ModuleDataLayer from '../../dal/module';
import * as InvitationDataLayer from '../../dal/invitation';
import { v4 as uuidv4 } from 'uuid';
import { ModuleAttributes } from '../../models/v2/module.model';
// import * as clerk from '../../services/clerk';

import { Request, Response } from 'express';
import { WithAuthProp } from '@clerk/clerk-sdk-node';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload: CourseAttributesInput = { ...req.body, id: uuidv4() };
    const result = await CourseDataLayer.create(payload);
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const payload = req.params['courseId'];
    if (!payload) return res.status(400).send('error course is undefined');

    const result = await CourseDataLayer.deleteById(payload);
    if (!result) return res.status(404).send();

    await ModuleDataLayer.deleteByCourse(req.params['courseId']);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const updateCourse = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const id = req.params['courseId'];
    if (id === undefined) {
      res.status(400).send('error course is undefined');
    }
    const result = await CourseDataLayer.updateById(id, req.body);
    if (!result) return res.status(404).send();
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const getCourseById = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const id = req.params['courseId'];
    if (!id) return res.status(400).send('error course is undefined');

    const result = await CourseDataLayer.getById(id);
    if (!result) return res.status(404).send();
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const getCourses = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  try {
    if (!req.params.organizationId)
      return res.status(400).send('bad request organizationId not found');
    const results = await CourseDataLayer.getAll(req.params.organizationId);
    if (!results) return res.status(404).send();
    return res.status(200).send(results);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const getCourseStructure = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  const hidden = req.query.hidden ? req.query.hidden === 'true' : true;
  try {
    const results = await CourseDataLayer.getStructure(
      req.params.courseId,
      hidden
    );
    if (!results) return res.sendStatus(404);

    for (let i = 0; i < results['modules'].length; i++) {
      const content: any[] = [];
      const module_ = results['modules'][i];
      let j = 0,
        k = 0;

      while (j < module_['problems'].length && k < module_['lessons'].length) {
        if (
          module_['problems'][j].orderNumber <=
          module_['lessons'][k].orderNumber
        ) {
          content.push({ contentType: 'problem', ...module_['problems'][j] });
          j++;
        } else {
          content.push({ contentType: 'lesson', ...module_['lessons'][k] });
          k++;
        }
      }

      while (j < module_['problems'].length) {
        content.push({ contentType: 'problem', ...module_['problems'][j] });
        j++;
      }

      while (k < module_['lessons'].length) {
        content.push({ contentType: 'lesson', ...module_['lessons'][k] });
        k++;
      }

      results['modules'][i]['content'] = content;
      delete results['modules'][i]['problems'];
      delete results['modules'][i]['lessons'];
    }

    return res.status(200).send(results);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const changeModuleOrder = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  let updatedModule: ModuleAttributes;
  try {
    const payload: any = {
      orderNumber: req.body.newOrderNumber
    };

    // store the original order number and courseId
    const module_ = await ModuleDataLayer.getById(req.body.id);
    const orderNumber = module_.orderNumber;

    const maxOrderNum = await CourseDataLayer.getNextOrder(req.params.courseId);
    if (
      req.body.newOrderNumber < 1 ||
      req.body.newOrderNumber >= maxOrderNum ||
      req.body.newOrderNumber === orderNumber
    )
      return res.status(400).send('Invalid order number');

    // shift the problems and lessons within the range
    await ModuleDataLayer.shiftModules(
      req.params.courseId,
      orderNumber,
      req.body.newOrderNumber
    );

    updatedModule = await ModuleDataLayer.updateById(req.body.id, payload);
  } catch (e) {
    return res.status(500).send(e);
  }
  return res.status(200).send(updatedModule);
};

export const getInvitations = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Record<string, any>> => {
  try {
    // TODO: add enrollment check to see if user has admin permissions in course
    const invitations = await InvitationDataLayer.getByCourse(
      req.params.courseId
    );
    if (!invitations) return res.sendStatus(404);
    return res.status(200).send(invitations);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const inviteMembers = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Record<string, any>> => {
  try {
    // TODO: add enrollment check to see if user has admin permissions in course
    const payload: InvitationAttributes = { ...req.body, id: uuidv4() };
    const result = await InvitationDataLayer.create(payload);
    if (!result) return res.sendStatus(404);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const cancelInvitations = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Record<string, any>> => {
  try {
    // TODO: add enrollment check to see if user has admin permissions in course
    const deleted = await InvitationDataLayer.deleteInvitation(
      req.params.invitationId
    );
    if (!deleted) return res.sendStatus(500);
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};
