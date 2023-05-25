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

interface CourseMember {
  status: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  email: string;
  user_id: string;
  lti11_legacy_user_id: string;
  roles: string[];
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

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
  token;
  req;
  // let lineItemId = res.locals.context.endpoint.lineitem;
  return res.redirect('https://edugator.app?ltik=' + res.locals.ltik);
  //return res.sendFile(path.join(__dirname, './public/index.html'));
});

// Setup function
const setup = async (): Promise<void> => {
  await lti.deploy({ serverless: true });

  /**
   * Register platform
   */
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

const listStudents = async (): Promise<CourseMember[]> => {
  const idToken = {
    iss: 'https://canvas.instructure.com',
    clientId: LTI_CLIENT_ID
  };
  idToken['platformContext'] = {
    namesRoles: {
      context_memberships_url: `${CANVAS_HOST}/api/lti/courses/2/names_and_roles`
    }
  };

  let members: CourseMember[];
  try {
    members = await lti.NamesAndRoles.getMembers(idToken, { role: 'Learner' })
      .members;
  } catch (err) {
    // return err.message;
  }
  return members;
};

const postGrade = async (userId: string, score: number): Promise<any> => {
  const lineItem = `${CANVAS_HOST}/api/lti/courses/2/line_items/1`;
  const idToken = {
    iss: 'https://canvas.instructure.com',
    clientId: LTI_CLIENT_ID
  };

  idToken['user'] = userId;
  // Creating Grade object
  const gradeObj = {
    userId: userId,
    scoreGiven: score,
    scoreMaximum: 10,
    activityProgress: 'Completed',
    gradingProgress: 'FullyGraded'
  };
  try {
    const responseGrade = await lti.Grade.submitScore(
      idToken,
      lineItem,
      gradeObj
    );
    return responseGrade;
  } catch (err) {
    return err.message;
  }
};

export { lti, setup, listStudents, postGrade };
