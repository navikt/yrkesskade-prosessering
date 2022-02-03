import { IApi, ISessionKonfigurasjon } from '@navikt/familie-backend';
import { logError } from '@navikt/familie-logging';
import { IService, utledScope } from './serviceConfig';

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

export const oboConfig = (service: IService): IApi => {
    return {
        clientId: service.id,
        scopes: service.scope ? [service.scope] : [utledScope(service.id, service.cluster)],
    };
};

const cookieSecret = process.env.SESSION_SECRET;
if (!cookieSecret) {
    logError(`Mangler påkrevd miljøvariabel 'SESSION_SECRET'`);
    process.exit(1);
}
export const sessionConfig: ISessionKonfigurasjon = {
    cookieSecret: cookieSecret,
    navn: 'yrkesskade-proessering',
    secureCookie: process.env.ENV === 'local' ? false : true,
};

export const buildPath = env.buildPath;
