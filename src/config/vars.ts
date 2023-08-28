// back end environment variables
export const judgeURI = process.env.PROD_JUDGE_URI;
export const env = process.env.NODE_ENV;
export const jwtExpirationInterval = 86400; // 1 day in seconds
export const jwtSecret = process.env.JWT_SECRET;
export const port = process.env.PORT;
export const access_key_id = process.env.ACCESS_KEY;
export const secret_access_key = process.env.SECRET_KEY;

export const DATABASE_NAME = process.env.DATABASE_NAME;
export const DATABASE_USERNAME = process.env.DATABASE_USERNAME;
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
export const DATABASE_HOST = process.env.DATABASE_HOST;

// AWS batch environment
export const EDUGATOR_API_PASS = process.env.EDUGATOR_API_PASS;
export const REGION_AWS = process.env.REGION_AWS;

//Email user and pass

//AUTH token for EDUGATOR
export const EDUGATOR_AUTH_TOKEN = process.env.EDUGATOR_AUTH_TOKEN;

export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
