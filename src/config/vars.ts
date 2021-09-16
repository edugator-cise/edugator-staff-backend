const env = process.env.NODE_ENV;
const port = process.env.PORT;
const judgeURI =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_JUDGE_URI
    : process.env.BETA_JUDGE_URI;

export { env, port, judgeURI };
