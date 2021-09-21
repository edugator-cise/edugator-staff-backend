import passport from 'passport';
import passportJWT from 'passport-jwt';
import UserModel from '../api/models/user.model';
import { jwtSecret } from './vars'
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

passport.use(new JWTStrategy(
  {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret
  }, (jwtToken, done) => {
      UserModel.findOne({ username: jwtToken.username }, (err, user) => {
        if (err) {return done(err, false);}
        if (user) {
          return done(undefined, user, jwtToken);
        } else {
          return done(undefined, false);
        }
      })
  }
  
))