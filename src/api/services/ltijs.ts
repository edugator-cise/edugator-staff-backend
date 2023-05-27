import { Provider as lti } from 'ltijs';
import { LtiCourseModel, LtiAssignmentModel } from '../models/lti.model';

import {
  LTI_KEY,
  LTI_DB_HOST,
  LTI_DB_NAME,
  LTI_DB_USER,
  LTI_DB_PASS,
  LTI_CLIENT_ID,
  CANVAS_HOST
} from '../../config/vars';

interface CourseMember {
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

interface Score {
  userId: string;
  scoreGiven: number;
  scoreMaximum: number;
  activityProgress: string;
  gradingProgress: string;
  timestamp?: string;
}

interface LineItem {
  id: string;
  scoreMaximum: number;
  label: string;
  resourceLinkId: string;
}

// simplified mapping of role URLs
enum LTIRoles {
  Student = 'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
  Instructor = 'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor'
}

lti.setup(
  LTI_KEY,
  {
    url: 'mongodb://' + LTI_DB_HOST + '/' + LTI_DB_NAME + '?authSource=admin',
    connection: { user: LTI_DB_USER, pass: LTI_DB_PASS }
  },
  {
    appRoute: '/launch',
    cookies: {
      secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
      tokenMaxAge: false,
      sameSite: '' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true // Set DevMode to true if the testing platform is in a different domain and https is not being used
  }
);

// called when the default app route (/launch) is requested
lti.onConnect(async (_token, _req, res) => {
  const lineItemId = res.locals.context.endpoint.lineitem;
  const lineItemsUrl = res.locals.context.endpoint.lineitems;
  const courseUrl = lineItemsUrl.substring(0, lineItemsUrl.lastIndexOf('/'));

  if (res.locals.context.roles.indexOf(LTIRoles.Instructor) != -1) {
    console.log('Request is being made from the instructor account');

    // redirect to course link page on edugator
    if (!lineItemId) console.log(`This is a course link for ${courseUrl}`);
    // redirect to assignment link page on edugator
    else console.log(`This is an assignment link for ${lineItemId}`);
  }

  // temporary fixed redirect to home page
  return lti.redirect(res, 'https://edugator.app');
});

lti.app.post('/linkAssignment', async (req, res) => {
  if (res.locals.context.roles.indexOf(LTIRoles.Instructor) == -1)
    return res.status(401);
  if (!req.body.problemId)
    return res.status(400).send('Missing Edugator problem id');

  const lineItemId = res.locals.context.endpoint.lineitem;
  if (!lineItemId) return res.status(400).send('Missing line item id');

  const lineItem = await getLineItem(lineItemId);

  const assignment = new LtiAssignmentModel({
    lineItem: lineItemId,
    problemId: req.body.problemId,
    assignmentName: lineItem.label,
    scoreMaximum: lineItem.scoreMaximum
  });

  assignment.save((err) => {
    if (err) {
      console.log(err);
    }
  });

  return res.status(200).send(`Linked assignment at ${lineItemId}`);
});

lti.app.post('/linkCourse', async (_req, res) => {
  if (res.locals.context.roles.indexOf(LTIRoles.Instructor) == -1)
    return res.status(401);

  const lineItemsUrl = res.locals.context.endpoint.lineitems;
  const courseUrl = lineItemsUrl.substring(0, lineItemsUrl.lastIndexOf('/'));

  const courseMembers: Array<CourseMember> = await getCourseMembers(courseUrl);
  const course = new LtiCourseModel({
    course_url: courseUrl,
    members: courseMembers
  });

  course.save((err) => {
    if (err) {
      console.log(err);
    }
  });

  return res.status(200).send(`Linked course at ${courseUrl}`);
});

const setup = async (): Promise<void> => {
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

const getCourseMembers = async (
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
    let result;
    if (!role) {
      result = await lti.NamesAndRoles.getCourseMembers(idToken);
    } else {
      result = await lti.NamesAndRoles.getCourseMembers(idToken, {
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

const postGrade = async (userId: string, score: number): Promise<boolean> => {
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

const getLineItem = async (lineItemId: string): Promise<LineItem> => {
  const idToken = {
    iss: 'https://canvas.instructure.com',
    clientId: LTI_CLIENT_ID
  };

  const lineItem = await lti.Grade.getLineItemById(idToken, lineItemId);
  return lineItem;
};

export { lti, setup, LTIRoles, getCourseMembers, postGrade };
