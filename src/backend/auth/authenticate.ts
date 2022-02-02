

import { NextFunction, Request, Response} from 'express';
import passport from 'passport';
import { hasValidAccessToken, hasValidAccessTokenInSession } from './tokenUtils';

export const ensureAuthenticated = (sendUnauthorized: boolean) => {
    return async (req: Request, res: Response, next: NextFunction) => {
  
        const validAccessToken = hasValidAccessTokenInSession(req);
        
        if (req.isAuthenticated()) {

        }
        if (validAccessToken) {
            const result = passport.authenticate('jwt')(req, res, next);   
            console.log('result', result);
            
            return next();    
        }

        const pathname = req.originalUrl;
        if (sendUnauthorized) {
            res.status(401).send('Unauthorized');
        } else {
            res.redirect(`/oauth2/login?redirectUrl=${pathname}`);
        }
    };
}