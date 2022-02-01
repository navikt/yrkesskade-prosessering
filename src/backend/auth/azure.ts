import {
    Client,
    ClientMetadata,
    custom,
    Issuer,
    Strategy,
    StrategyOptions,
    TokenSet,
} from 'openid-client';
import { appendDefaultScope, tokenSetSelfId } from './tokenUtils';
import dotenv from 'dotenv';

dotenv.config();

const metadata: ClientMetadata = {
    client_id: process.env.AZURE_APP_CLIENT_ID,
    client_secret: process.env.AZURE_APP_CLIENT_SECRET,
    token_endpoint_auth_method: 'client_secret_post',
};

const hentClient = (): Promise<Client> => {
    console.log(metadata);
    
    return Issuer.discover(process.env.AZURE_APP_WELL_KNOWN_URL).then((issuer: Issuer<Client>) => {
        console.log(`Discovered issuer ${issuer.issuer}`);
        return new issuer.Client(metadata);
    });
};

const strategy = (client: Client) => {
    const verify = (tokenSet: TokenSet, done: (err: any, _: any) => void) => {
        console.log(`verify. expired=${tokenSet.expired()}`);
        if (tokenSet.expired()) {
            return done(undefined, undefined);
        }

        done(undefined, {
            claims: tokenSet.claims,
            tokenSets: {
                [tokenSetSelfId]: tokenSet,
            },
        });
    };

    const options: StrategyOptions<Client> = {
        client,
        params: {
            response_mode: 'query',
            response_types: ['code'],
            scope: `openid offline_access ${appendDefaultScope(process.env.AZURE_APP_CLIENT_ID)}`,
        },
        passReqToCallback: false,
        usePKCE: 'S256',
    };
    return new Strategy(options, verify);
};

export default { hentClient, strategy };