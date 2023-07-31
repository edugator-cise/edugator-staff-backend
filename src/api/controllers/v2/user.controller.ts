import { Request, Response } from 'express';
import { UserAttributesInput } from '../../models/v2/enrollment.model';
import * as UserDataLayer from '../../dal/user';
import { v4 as uuidv4 } from 'uuid';