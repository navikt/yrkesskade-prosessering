import express, { Request, Response } from 'express';
import path from 'path';
import { buildPath } from './config';
import { IService, serviceConfig } from './serviceConfig';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import { ensureAuthenticated } from './auth/authenticated';
import { hentBrukerprofil } from './auth/bruker';
import { Counter } from '@navikt/familie-backend';

export default (
    middleware?: WebpackDevMiddleware.WebpackDevMiddleware
) => {

    const router = konfigurerRouter();

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
        router.get('*', ensureAuthenticated(false), (req: Request, res: Response) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(
                middleware.fileSystem.readFileSync(path.join(__dirname, `${buildPath}/index.html`))
            );
            res.end();
        });
    } else {
        router.get('*', ensureAuthenticated(false), (req: Request, res: Response) => {
            res.sendFile('index.html', { root: path.join(__dirname, buildPath) });
        });
    }

    return router;
};

const konfigurerRouter = (prometheusTellere?: { [key: string]: Counter<string> }) => {
   
    const router = express.Router();

    // Bruker
    router.get('/user/profile', ensureAuthenticated(true), hentBrukerprofil());

    return router;
};