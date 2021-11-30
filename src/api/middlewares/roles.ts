import { NextFunction, Request, Response } from 'express';

const checkRolePrivileges = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const role = res.locals.role;
  if (role !== 'Professor' && role !== 'Master') {
    res
      .status(403)
      .type('json')
      .send({ message: 'You do not have permission to make this request' });
    return;
  } else {
    return next();
  }
};

export { checkRolePrivileges };
