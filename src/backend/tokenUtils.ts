import { Request } from 'express';
import { jwtVerify } from 'jose/jwt/verify'
import { createRemoteJWKSet } from 'jose/jwks/remote';
import {
    FlattenedJWSInput,
    GetKeyFunction,
    JWSHeaderParameters,
    JWTVerifyResult,
} from 'jose/types';

const loggOgReturnerOmTokenErGyldig = (req: Request, key: string, validAccessToken: boolean) => {
    console.log(req, `Har ${validAccessToken ? 'gyldig' : 'ikke gyldig'} token for key '${key}'`);
    return validAccessToken;
};

let remoteJWKSet: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;

export const hasValidAccessToken = async (req: Request) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return false;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return false;
    }

    console.log(token);

    const resultat = await validerToken(token);
    console.log(resultat);

    return true;
};

const validerToken = async (token: string) => {
    return await jwtVerify(token, await jwks(), {
        algorithms: ['RS256'],
        audience: process.env.AZURE_APP_CLIENT_ID,
        issuer: process.env.AZURE_OPENID_CONFIG_ISSUER
    });
}

const jwks = async () => {
    if (typeof remoteJWKSet === 'undefined') {
        remoteJWKSet = createRemoteJWKSet(new URL(process.env.AZURE_OPENID_CONFIG_JWKS_URI));
    }

    return remoteJWKSet;
};
