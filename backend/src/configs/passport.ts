import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
  VerifyCallback,
} from 'passport-jwt';
import { PassportStatic } from 'passport';
import { User } from '../models/index';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  id: number;
  // добавьте другие поля из payload если нужно
}

export default function configurePassport(passport: PassportStatic): void {
  const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET as string,
  };

  const verifyCallback: VerifyCallback = async (payload: JwtPayload, done) => {
    try {
      const user = await User.findByPk(payload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  };

  passport.use(new JwtStrategy(options, verifyCallback));
}
