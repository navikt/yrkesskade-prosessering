import { Request } from 'express';
import jwt from 'jsonwebtoken';

const loggOgReturnerOmTokenErGyldig = (req: Request, key: string, validAccessToken: boolean) => {
    console.log(
        req,
        `Har ${validAccessToken ? 'gyldig' : 'ikke gyldig'} token for key '${key}'`
    );
    return validAccessToken;
};

export const hasValidAccessToken = (req: Request) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return false
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return false;
    }

    const jwks = process.env.AZURE_APP_JWKS;
    const clientId = process.env.AZURE_APP_CLIENT_ID;

    jwt.verify(token, jwks, { "audience": clientId }, function(err, decoded) {
        console.log('decoded:' ,decoded)
    });

    
    return true;
};