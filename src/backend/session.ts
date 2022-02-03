import { Express } from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { PassportStatic } from 'passport';
import { ISessionKonfigurasjon } from '@navikt/yrkesskade-backend/dist/typer';

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