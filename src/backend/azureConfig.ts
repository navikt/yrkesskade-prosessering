import dotenv from 'dotenv';
import {logInfo} from '@navikt/familie-logging';

dotenv.config();

const settAzureAdPropsFraEnv = () => {
    process.env.AAD_DISCOVERY_URL = process.env.AZURE_APP_WELL_KNOWN_URL;
    process.env.CLIENT_ID = process.env.AZURE_APP_CLIENT_ID;
    process.env.CLIENT_SECRET = process.env.AZURE_APP_CLIENT_SECRET;
};

const konfigurerAzure = () => {
    logInfo(`Setter miljøvariabler`);
    settAzureAdPropsFraEnv();
};

konfigurerAzure();
