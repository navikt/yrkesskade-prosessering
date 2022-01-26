import { Request } from 'express';
import { TokenSet } from 'openid-client';

export const tokenSetSelfId = 'self';
/*export const getOnBehalfOfAccessToken = (
    authClient: Client,
    req: Request,
    api: IApi,
): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (hasValidAccessToken(req, api.clientId)) {
            const tokenSets = getTokenSetsFromSession(req);
            resolve(tokenSets[api.clientId].access_token);
        } else {
            if (!req.session) {
                throw Error('Session på request mangler.');
            }

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
                    logError('Feil ved henting av obo token', err);
                    reject(err);
                });
        }
    });
};
*/
//export const appendDefaultScope = (scope: string) => `${scope}/.default`;

/*const formatClientIdScopeForV2Clients = (clientId: string) =>
    appendDefaultScope(`api://${clientId}`);
*/
/*const createOnBehalfOfScope = (api: IApi) => {
    if (api.scopes && api.scopes.length > 0) {
        return `${api.scopes.join(' ')}`;
    } else {
        return `${formatClientIdScopeForV2Clients(api.clientId)}`;
    }
};*/

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

export const hasValidAccessToken = (req: Request, key = tokenSetSelfId) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return false
    }

    const token = authHeader.split(' ')[1];
    console.log('har token: ', token);
    
    if (!token) {
        return false;
    }
    
    return true;
};

// kallkjedene kan ta litt tid, og tokenet kan i corner-case gå ut i løpet av kjeden. Så innfører et buffer
// på 2 minutter.
const erUtgått = (tokenSet: TokenSet): boolean =>
    tokenSet.expired() || (tokenSet.expires_in !== undefined && tokenSet.expires_in < 120);