import { Provider as lti } from 'ltijs';
import * as Database from 'ltijs-sequelize';
import { Request, Response } from 'express';

import { LTI_SECRET_KEY, LTI_CLIENT_ID, CANVAS_HOST } from '../../config/vars';

import * as ProblemDataLayer from '../dal/problem';

export interface CourseMember {
  status: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  email: string;
  user_id: string;
  lti11_legacy_user_id: string;
  roles: Array<string>;
}

export interface Score {
  userId: string;
  scoreGiven: number;
  scoreMaximum?: number;
  activityProgress: string;
  gradingProgress: string;
  timestamp?: string;
}

export interface LineItem {
  id: string;
  scoreMaximum: number;
  label: string;
  resourceLinkId: string;
}

// simplified mapping of role URLs
export enum LTIRoles {
  Student = 'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
  Instructor = 'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor'
}

const db = new Database(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true
      }
    },
    logging: false
  }
);

lti.setup(
  LTI_SECRET_KEY,
  {
    plugin: db
  },
  {
    appRoute: '/launch',
    cookies: {
      secure: false,
      tokenMaxAge: false,
      sameSite: ''
    },
    devMode: true
  }
);

// called when the default app route (/launch) is requested
lti.onConnect(async (_token: any, _req: Request, res: Response) => {
  const lineItemId = res.locals.context.endpoint.lineitem;
  const lineItemsUrl = res.locals.context.endpoint.lineitems;
  const courseUrl = lineItemsUrl.substring(0, lineItemsUrl.lastIndexOf('/'));

  // checks if request is being made from the instructor account
  if (res.locals.context.roles.indexOf(LTIRoles.Instructor) != -1) {
    // redirect to course or assignment link page on edugator
    if (!lineItemId) return res.send(`Course link page for ${courseUrl}`);
    else return res.send(`Assignment link page for ${lineItemId}`);
  } else {
    if (!lineItemId)
      return res.status(403).send('Unauthorized to access this page');

    const assignment = await ProblemDataLayer.getByLineItem(lineItemId);
    if (!assignment)
      return res.status(404).send('This assignment is not linked yet');
    else
      return lti.redirect(
        res,
        'https://edugator.prayujt.com/code/' + assignment.id
      );
  }
});

export const setup = async (): Promise<void> => {
  await lti.deploy({ serverless: true });

  await lti.registerPlatform({
    url: 'https://canvas.instructure.com',
    name: CANVAS_HOST,
    clientId: LTI_CLIENT_ID,
    authenticationEndpoint: `${CANVAS_HOST}/api/lti/authorize_redirect`,
    accesstokenEndpoint: `${CANVAS_HOST}/login/oauth2/token`,
    authConfig: {
      method: 'JWK_SET',
      key: `${CANVAS_HOST}/api/lti/security/jwks`
    }
  });
};

export const getCourseMembers = async (
  course_url: string,
  role?: LTIRoles
): Promise<Array<CourseMember>> => {
  const idToken = {
    iss: 'https://canvas.instructure.com',
    clientId: LTI_CLIENT_ID
  };
  idToken['platformContext'] = {
    namesRoles: {
      context_memberships_url: `${course_url}/names_and_roles`
    }
  };

  let members: Array<CourseMember>;
  try {
    let result: any;
    if (!role) {
      result = await lti.NamesAndRoles.getMembers(idToken);
    } else {
      result = await lti.NamesAndRoles.getMembers(idToken, {
        role: role
      });
    }
    members = result.members;
  } catch (err) {
    // will return empty array of members
  }

  const indexOfTestStudent = members.findIndex((member) => {
    return member.name === 'Test Student';
  });
  members.splice(indexOfTestStudent, 1);

  return members;
};

export const postGrade = async (
  userId: string,
  score: number
): Promise<boolean> => {
  const lineItem = `${CANVAS_HOST}/api/lti/courses/2/line_items/1`;
  const idToken = {
    iss: 'https://canvas.instructure.com',
    clientId: LTI_CLIENT_ID
  };

  idToken['user'] = userId;
  const gradeObj: Score = {
    userId: userId,
    scoreGiven: score,
    activityProgress: 'Completed',
    gradingProgress: 'FullyGraded'
  };

  try {
    const responseGrade: Score = await lti.Grade.submitScore(
      idToken,
      lineItem,
      gradeObj
    );

    if (responseGrade.scoreGiven == gradeObj.scoreGiven) return true;
  } catch (err) {
    // will return false
  }
  return false;
};

export const getLineItem = async (lineItemId: string): Promise<LineItem> => {
  const idToken = {
    iss: 'https://canvas.instructure.com',
    clientId: LTI_CLIENT_ID
  };

  const lineItem = await lti.Grade.getLineItemById(idToken, lineItemId);
  return lineItem;
};

export { lti };
