import { Provider as lti } from 'ltijs';

import {
  LTI_KEY,
  LTI_DB_HOST,
  LTI_DB_NAME,
  LTI_DB_USER,
  LTI_DB_PASS,
  LTI_CLIENT_ID,
  CANVAS_HOST
} from '../../config/vars';

interface Student {
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

  if (!lineItemId) console.log('This is a course link!');
  else console.log(`This is an assignment link for ${lineItemId}`);
  // lineItemId would be the assignment context from which the app is launched
  return lti.redirect(res, 'https://edugator.app');
});

const setup = async (): Promise<void> => {
  await lti.deploy({ serverless: true });

  await lti.registerPlatform({
    url: 'https://canvas.instructure.com',
    name: 'Prayuj Canvas',
    clientId: LTI_CLIENT_ID,
    authenticationEndpoint: `${CANVAS_HOST}/api/lti/authorize_redirect`,
    accesstokenEndpoint: `${CANVAS_HOST}/login/oauth2/token`,
    authConfig: {
      method: 'JWK_SET',
      key: `${CANVAS_HOST}/api/lti/security/jwks`
    }
  });
};

const listMembers = async (role: LTIRoles): Promise<Array<Student>> => {
  const idToken = {
    iss: 'https://canvas.instructure.com',
    clientId: LTI_CLIENT_ID
  };
  idToken['platformContext'] = {
    namesRoles: {
      context_memberships_url: `${CANVAS_HOST}/api/lti/courses/2/names_and_roles`
    }
  };

  let members: Array<Student>;
  try {
    const result = await lti.NamesAndRoles.getMembers(idToken, {
      role: role
    });
    members = result.members;
  } catch (err) {
    // will return empty array of members
  }
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
    scoreMaximum: 10,
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

export { lti, setup, LTIRoles, listMembers, postGrade };
