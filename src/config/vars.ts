// back end environment variables
const judgeURI =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_JUDGE_URI
    : process.env.BETA_JUDGE_URI;
const env = process.env.NODE_ENV;
const jwtExpirationInterval = 86400; // 1 day in seconds
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT == undefined ? 8080 : process.env.PORT;
const access_key_id = process.env.ACCESS_KEY;
const secret_access_key = process.env.SECRET_KEY;

//AWS batch variables
const jobDefinition = process.env.JOB_DEFINITION;
const jobQueue = process.env.JOB_QUEUE;

// AWS batch environment
const BUCKET_NAME = process.env.UPLOAD_SUBMISSIONS_BUCKET;
const EDUGATOR_API_USER = process.env.EDUGATOR_API_USER;
const EDUGATOR_API_PASS = process.env.EDUGATOR_API_PASS;
const EDUGATOR_API_URL = process.env.EDUGATOR_API_URL;
const REGION_AWS = process.env.REGION_AWS;

//Email user and pass
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;

//AUTH token for EDUGATOR
const EDUGATOR_AUTH_TOKEN = process.env.EDUGATOR_AUTH_TOKEN;

const LTI_DB_HOST = process.env.LTI_DB_HOST;
const LTI_DB_NAME = process.env.LTI_DB_NAME;
const LTI_DB_USER = process.env.LTI_DB_USER;
const LTI_DB_PASS = process.env.LTI_DB_PASS;
const LTI_KEY = process.env.LTI_KEY;
const CANVAS_HOST = process.env.CANVAS_HOST;
const LTI_CLIENT_ID = process.env.LTI_CLIENT_ID;

export {
  env,
  port,
  judgeURI,
  jwtExpirationInterval,
  jwtSecret,
  BUCKET_NAME,
  access_key_id,
  secret_access_key,
  EDUGATOR_API_USER,
  EDUGATOR_API_PASS,
  jobDefinition,
  jobQueue,
  EDUGATOR_API_URL,
  SENDER_EMAIL,
  APP_PASSWORD,
  REGION_AWS,
  EDUGATOR_AUTH_TOKEN,
  LTI_DB_HOST,
  LTI_DB_NAME,
  LTI_DB_USER,
  LTI_DB_PASS,
  LTI_KEY,
  CANVAS_HOST,
  LTI_CLIENT_ID
};
