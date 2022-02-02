import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { buildPath } from './config';
import { IService, serviceConfig } from './serviceConfig';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import { authenticateAzure, ensureAuthenticated } from './auth/authenticate';
import { hentBrukerprofil } from './auth/bruker';
import { Counter } from 'prom-client';
import { Client } from 'openid-client';

export default (
    client: Client,
    middleware?: WebpackDevMiddleware.WebpackDevMiddleware
) => {

    const router = konfigurerRouter(client);

    router.get('/version', (req, res) => {
        res.status(200).send({ version: process.env.APP_VERSION }).end();
    });

    // SERVICES
    router.get('/services', (req, res) => {
        res.status(200)
            .send({
                data: serviceConfig.map((service: IService) => {
                    return {
                        displayName: service.displayName,
                        id: service.id,
                        proxyPath: service.proxyPath,
                    };
                }),
                status: 'SUKSESS',
            })
            .end();
    });

    // APP
    if (process.env.NODE_ENV === 'development') {
        router.get('*', ensureAuthenticated(client, false), (req: Request, res: Response) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(
                middleware.fileSystem.readFileSync(path.join(__dirname, `${buildPath}/index.html`))
            );
            res.end();
        });
    } else {
        router.get('*', ensureAuthenticated(client, false), (req: Request, res: Response) => {
            res.sendFile('index.html', { root: path.join(__dirname, buildPath) });
        });
    }

    return router;
};

const konfigurerRouter = (client: Client, prometheusTellere?: { [key: string]: Counter<string> }) => {
   
    const router = express.Router();

    // Authentication
    router.get('/login', (req: Request, res: Response, next: NextFunction) => {
        if (prometheusTellere && prometheusTellere.login_route) {
            prometheusTellere.login_route.inc();
        }

        authenticateAzure(req, res, next);
    });

    // Bruker
    router.get('/user/profile', ensureAuthenticated(client, true), hentBrukerprofil());

    return router;
};