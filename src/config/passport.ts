import * as passportJWT from 'passport-jwt';
import { jwtSecret } from './vars';
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

interface IJWTTOKEN {
  userName: string;
  iat: number;
  exp: number;
}

const verifyJWT = async (
  jwtToken: IJWTTOKEN,
  done: passportJWT.VerifiedCallback
) => {
  //TODO LOGGER
  try {
    //TODO LOGGER
    return done(null, jwtToken);
  } catch (error) {
    //TODO LOGGER
    return done(error, false);
  }
};

const jwtStrategy = new JWTStrategy(
  {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret
  },
  verifyJWT
);

export { jwtStrategy };
