

import { NextFunction, Request, Response} from 'express';
import { Client } from 'openid-client';
import passport from 'passport';
import { setBrukerprofilPåSesjon } from './bruker';
import { hasValidAccessToken, hasValidAccessTokenInSession } from './tokenUtils';

export const ensureAuthenticated = (client: Client, sendUnauthorized: boolean) => {
    return async (req: Request, res: Response, next: NextFunction) => {
  
        const validAccessToken = await hasValidAccessToken(req); //  hasValidAccessTokenInSession(req);
    
        if (validAccessToken) {
            passport.authenticate('jwt', (req: Request, res: Response, next: NextFunction) => {
                console.log('authenticated');
                
                return setBrukerprofilPåSesjon(client, req, next);
            });  
        }

        const pathname = req.originalUrl;
        if (sendUnauthorized) {
            res.status(401).send('Unauthorized');
        } else {
            res.redirect(`/oauth2/login?redirectUrl=${pathname}`);
        }
    };
}