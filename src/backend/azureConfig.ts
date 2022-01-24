import dotenv from 'dotenv';
dotenv.config();

const settAzureAdPropsFraEnv = () => {
    process.env.AAD_DISCOVERY_URL = process.env.AZURE_APP_WELL_KNOWN_URL;
    process.env.CLIENT_ID = process.env.AZURE_APP_CLIENT_ID;
    process.env.CLIENT_SECRET = process.env.AZURE_APP_CLIENT_SECRET;
};

const konfigurerAzure = () => {
    const host = 'yrkesskade-prosessering';
    switch (process.env.ENV) {
        case 'local':
            process.env.AAD_LOGOUT_REDIRECT_URL = `/oauth2/logout?post_logout_redirect_uri=http:\\\\localhost:8000`;
            process.env.AAD_REDIRECT_URL = 'http://localhost:8000/auth/openid/callback';
            process.env.GRAPH_API = 'https://graph.microsoft.com/v1.0/me';
            break;
        case 'dev':
            process.env.AAD_LOGOUT_REDIRECT_URL = `https://${host}.dev.intern.nav.no/oauth2/logout?post_logout_redirect_uri=https:\\\\${host}.dev.intern.nav.no`;
            process.env.AAD_REDIRECT_URL = `https://${host}.dev.intern.nav.no/auth/openid/callback`;
            process.env.GRAPH_API = 'https://graph.microsoft.com/v1.0/me';
            settAzureAdPropsFraEnv();
            break;
        case 'prod':
            process.env.AAD_LOGOUT_REDIRECT_URL = `https://${host}..intern.nav.no/oauth2/logout?post_logout_redirect_uri=https:\\\\${host}.intern.nav.no`;
            process.env.AAD_REDIRECT_URL = `https://${host}.intern.nav.no/auth/openid/callback`;
            process.env.GRAPH_API = 'https://graph.microsoft.com/v1.0/me';
            settAzureAdPropsFraEnv();
            break;
        default:
            console.log(
                'Environment variabler må være satt i secrets, .env eller env i docker/nais'
            );
            break;
    }
};

konfigurerAzure();
