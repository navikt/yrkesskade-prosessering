export interface IService {
    scope?: string;
    cluster: 'gcp' | 'fss';
    displayName: string;
    proxyPath: string;
    id: string;
    proxyUrl: string;
}

let proxyUrls: { [key: string]: string } = {};
if (process.env.ENV === 'local') {
    proxyUrls = {
        yrkesskade_mottak: 'http://localhost:9080',
    };
} else {
    const env = process.env.ENV == 'prod' ? '' : `.${process.env.ENV}`;
    proxyUrls = {
        yrkesskade_mottak: `https://yrkesskade-melding-mottak${env}.intern.nav.no`,
    };
}

export const utledScope = (appId: string, cluster: 'gcp' | 'fss') => {
    if (process.env.ENV === 'local' && process.env.OVERRIDE_SCOPE) {
        return process.env.OVERRIDE_SCOPE;
    }
    const env = process.env.ENV === 'local' ? 'dev' : process.env.ENV;
    return `api://${env}-${cluster}.yrkesskade.${appId}/.default`;
};

export const serviceConfig: IService[] = [
    {
        cluster: 'gcp',
        displayName: 'Yrkesskade mottak',
        id: 'yrkesskade-melding-mottak',
        proxyPath: '/yrkesskade-melding-mottak/api',
        proxyUrl: proxyUrls.yrkesskade_mottak,
    },
];
