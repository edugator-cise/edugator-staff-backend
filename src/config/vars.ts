const BUCKET_NAME = process.env.UPLOAD_SUBMISSIONS_BUCKET;
const jwtExpirationInterval = 86400; // 1 day in seconds
const jwtSecret = process.env.JWT_SECRET;
const env = process.env.NODE_ENV;
const port = process.env.PORT;
const access_key_id = process.env.ACCESS_KEY;
const secret_access_key = process.env.SECRET_KEY;
const judgeURI =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_JUDGE_URI
    : process.env.BETA_JUDGE_URI;
const EDUGATOR_API_USER = process.env.EDUGATOR_API_USER
const EDUGATOR_API_PASS = process.env.EDUGATOR_API_PASS
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
  EDUGATOR_API_PASS
};
