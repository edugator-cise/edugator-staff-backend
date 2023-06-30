// back end environment variables
const judgeURI =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_JUDGE_URI
    : process.env.BETA_JUDGE_URI;
const env = process.env.NODE_ENV;
const jwtExpirationInterval = 86400; // 1 day in seconds
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT;
const access_key_id = process.env.ACCESS_KEY;
const secret_access_key = process.env.SECRET_KEY;

const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_USERNAME = process.env.DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_HOST = process.env.DATABASE_HOST;

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

// LTI information
const LTI_SECRET_KEY = process.env.LTI_SECRET_KEY;
const LTI_CLIENT_ID = process.env.LTI_CLIENT_ID;
const CANVAS_HOST = process.env.CANVAS_HOST;

export {
  env,
  port,
  judgeURI,
  jwtExpirationInterval,
  jwtSecret,
  BUCKET_NAME,
  access_key_id,
  secret_access_key,
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_HOST,
  EDUGATOR_API_USER,
  EDUGATOR_API_PASS,
  jobDefinition,
  jobQueue,
  EDUGATOR_API_URL,
  SENDER_EMAIL,
  APP_PASSWORD,
  REGION_AWS,
  EDUGATOR_AUTH_TOKEN,
  LTI_SECRET_KEY,
  LTI_CLIENT_ID,
  CANVAS_HOST
};
