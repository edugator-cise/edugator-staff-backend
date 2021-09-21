import * as httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
// import passport from 'passport';
import {UserModel, IUser} from '../models/user.model';

const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userName: String, passWord } = req.query
    const user: IUser  = await UserModel.findOne({userName: userName})
    if 
    res.send(httpStatus.OK)
  } catch(err) {
    next(err)
  }
}

export {authenticateUser};