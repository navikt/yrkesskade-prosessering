

import { NextFunction, Request, Response} from 'express';
import { hasValidAccessToken } from './tokenUtils';

export const ensureAuthenticated = (sendUnauthorized: boolean) => {
    return async (req: Request, res: Response, next: NextFunction) => {
  
        const validAccessToken = await hasValidAccessToken(req);
        
        if (validAccessToken) {
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