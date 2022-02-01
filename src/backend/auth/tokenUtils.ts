import { Request } from 'express';
import * as jose from 'jose'
import { GetKeyFunction } from 'jose/dist/types/types';
import { Client, TokenSet } from 'openid-client';
import { IApi } from '../typer';

let remoteJWKSet: GetKeyFunction<jose.JWSHeaderParameters, jose.FlattenedJWSInput>;

export const tokenSetSelfId = 'self';
export const hasValidAccessToken = async (req: Request) => {
    const authHeader = req.headers.authorization;
    
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

export const _getOnBehalfOfAccessToken = (
    req: Request
): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (hasValidAccessToken(req)) {

            const authHeader = req.headers.authorization;
    
            const token = authHeader.split(' ')[1];

            resolve(token);
        }
        reject(new Error('Har ikke gyldig token'))
    });
};

export const appendDefaultScope = (scope: string) => `${scope}/.default`;

const formatClientIdScopeForV2Clients = (clientId: string) =>
    appendDefaultScope(`api://${clientId}`);

const createOnBehalfOfScope = (api: IApi) => {
    if (api.scopes && api.scopes.length > 0) {
        return `${api.scopes.join(' ')}`;
    } else {
        return `${formatClientIdScopeForV2Clients(api.clientId)}`;
    }
};

export const getOnBehalfOfAccessToken = (
    authClient: Client,
    req: Request,
    api: IApi,
): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (hasValidAccessTokenInSession(req, api.clientId)) {
            const tokenSets = getTokenSetsFromSession(req);
            resolve(tokenSets[api.clientId].access_token);
        } else {
            if (!req.session) {
                throw Error('Session på request mangler.');
            }

            console.log('Passport: ', req.session.passport);
            
            authClient
                .grant({
                    assertion: req.session.passport.user.tokenSets[tokenSetSelfId].access_token,
                    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    requested_token_use: 'on_behalf_of',
                    scope: createOnBehalfOfScope(api),
                })
                .then((tokenSet: TokenSet) => {
                    if (!req.session) {
                        throw Error('Mangler session på request.');
                    }

                    req.session.passport.user.tokenSets[api.clientId] = tokenSet;

                    if (tokenSet.access_token) {
                        resolve(tokenSet.access_token);
                    } else {
                        reject('Token ikke tilgjengelig');
                    }
                })
                .catch((err: Error) => {
                    console.error('Feil ved henting av obo token', err);
                    reject(err);
                });
        }
    });
};

export const getTokenSetsFromSession = (req: Request) => {
    if (req && req.session && req.session.passport) {
        return req.session.passport.user.tokenSets;
    }

    return undefined;
};

const loggOgReturnerOmTokenErGyldig = (req: Request, key: string, validAccessToken: boolean) => {
    console.log(
        req,
        `Har ${validAccessToken ? 'gyldig' : 'ikke gyldig'} token for key '${key}'`
    );
    return validAccessToken;
};

export const hasValidAccessTokenInSession = (req: Request, key = tokenSetSelfId) => {
    const tokenSets = getTokenSetsFromSession(req);
    console.log('Tokensets: ', tokenSets);
    
    if (!tokenSets) {
        return loggOgReturnerOmTokenErGyldig(req, key, false);
    }
    const tokenSet = tokenSets[key];
    if (!tokenSet) {
        return loggOgReturnerOmTokenErGyldig(req, key, false);
    }
    return loggOgReturnerOmTokenErGyldig(req, key, erUtgått(new TokenSet(tokenSet)) === false);
};

// kallkjedene kan ta litt tid, og tokenet kan i corner-case gå ut i løpet av kjeden. Så innfører et buffer
// på 2 minutter.
const erUtgått = (tokenSet: TokenSet): boolean =>
    tokenSet.expired() || (tokenSet.expires_in !== undefined && tokenSet.expires_in < 120);
