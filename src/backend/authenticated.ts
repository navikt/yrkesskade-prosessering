

import { NextFunction, Request, Response} from 'express';
import { hasValidAccessToken } from './tokenUtils';

export const ensureAuthenticated = (sendUnauthorized: boolean) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        if (req.originalUrl.includes('login')) {
            return next();
        }

        const validAccessToken = hasValidAccessToken(req);
        console.log('valid accessToken: ', validAccessToken);
        
        if (validAccessToken) {
            return next();            
        }

        const pathname = req.originalUrl;
        if (sendUnauthorized) {
            res.status(401).send('Unauthorized');
        } else {
            res.redirect(`/login?redirectUrl=${pathname}`);
        }
    };
}