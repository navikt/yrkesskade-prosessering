
import { IService, utledScope } from './serviceConfig';
import dotenv from 'dotenv';
import { ISessionKonfigurasjon } from '@navikt/yrkesskade-backend/dist/typer';

// Miljøvariabler
const Environment = () => {
    if (process.env.ENV === 'local') {
        return {
            buildPath: '../frontend_development',
            namespace: 'local',
        };
    } else if (process.env.ENV === 'preprod') {
        return {
            buildPath: '../frontend_production',
            namespace: 'preprod',
        };
    }

    return {
        buildPath: '../frontend_production',
        namespace: 'production',
    };
};

const env = Environment();

dotenv.config();

export const oboConfig = (service: IService) => {
    return {
        clientId: service.id,
        scopes: service.scope ? [service.scope] : [utledScope(service.id, service.cluster)],
    };
};

export const sessionConfig: ISessionKonfigurasjon = {
    cookieSecret: process.env.SESSION_SECRET,
    navn: 'yrkesskade-prosessering',
    secureCookie: process.env.ENV === 'local' ? false : true,
};

export const buildPath = env.buildPath;
