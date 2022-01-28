import { Request } from 'express';
import * as jose from 'jose'
import { GetKeyFunction } from 'jose/dist/types/types';

let remoteJWKSet: GetKeyFunction<jose.JWSHeaderParameters, jose.FlattenedJWSInput>;

export const hasValidAccessToken = async (req: Request) => {
    const authHeader = req.headers.authorization;
    console.log('resultat: ', authHeader);
    
    if (!authHeader) {
        // ugyldig
        return false;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        // ugyldig
        return false;
    }

    // valider token mot JWKS
    const resultat = await validerToken(token);
    console.log('resultat: ', resultat);
    
    return resultat.payload && resultat.protectedHeader;
};

/**
 * Validerer token mot algoritme, clientId og issuer
 * 
 * @param token 
 * @returns 
 */
const validerToken = async (token: string): Promise<jose.JWTVerifyResult> => {
    return await jose.jwtVerify(token, await jwks(), {
        algorithms: ['RS256'],
        audience: process.env.AZURE_APP_CLIENT_ID,
        issuer: process.env.AZURE_OPENID_CONFIG_ISSUER
    });
}

const jwks = async () => {
    if (typeof remoteJWKSet === 'undefined') {
        remoteJWKSet = jose.createRemoteJWKSet(new URL(process.env.AZURE_OPENID_CONFIG_JWKS_URI));
    }

    return remoteJWKSet;
};
