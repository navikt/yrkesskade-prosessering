import { Express } from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { ISessionKonfigurasjon } from './typer';
import { PassportStatic } from 'passport';
import { TokenSet } from 'openid-client';

export const tokenSetsByClientId: { [key: string]: TokenSet } = {};

export default (
    app: Express,
    passport: PassportStatic,
    sessionKonfigurasjon: ISessionKonfigurasjon,
) => {
    app.use(cookieParser(sessionKonfigurasjon.cookieSecret));
    app.set('trust proxy', 1);

    console.log('Setter opp in-memory db for session');

    app.use(
        session({
            cookie: { sameSite: 'lax', secure: sessionKonfigurasjon.secureCookie },
            name: sessionKonfigurasjon.navn,
            resave: false,
            saveUninitialized: false,
            secret: sessionKonfigurasjon.cookieSecret,
        }),
    );


    app.use(passport.initialize());
    app.use(passport.session());
};