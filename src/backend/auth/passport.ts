import { Client, UserinfoResponse } from "openid-client";
import azure from "./azure";

export default async (passport: any): Promise<Client> => {
    console.log('Konfigurerer passport');
    const azureAuthClient: Client = await azure.hentClient();
    const azureOidcStrategy = azure.strategy(azureAuthClient);
    const jwtStrategy = azure.jwtStrategy();

    passport.serializeUser(
        (user: UserinfoResponse, done: (err: any, user?: UserinfoResponse) => void) =>
            done(undefined, user),
    );
    passport.deserializeUser(
        (user: UserinfoResponse, done: (err: any, user?: UserinfoResponse) => void) =>
            done(undefined, user),
    );
    passport.use('azureOidc', azureOidcStrategy);
    passport.use('jwt', jwtStrategy);

    return azureAuthClient;
};