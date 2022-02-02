import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import passport from 'passport';
import loglevel from 'loglevel';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { attachToken, doProxy } from './proxy';
import setupRouter from './router';
import { IService, serviceConfig } from './serviceConfig';
import { sessionConfig } from './config';
import { ensureAuthenticated } from './auth/authenticate';
import konfigurerSesjon from './session';
import konfigurerPassport from './auth/passport';

import dotenv from 'dotenv';

/* tslint:disable */
const config = require('../build_n_deploy/webpack.dev');
/* tslint:enable */

loglevel.setDefaultLevel(loglevel.levels.INFO);

const port = 8000;
const app = express();


dotenv.config();

konfigurerSesjon(app, passport, sessionConfig);

konfigurerPassport(passport).then((azureClient) => {

    app.get('/isAlive', (_req: Request, res: Response) => res.status(200).end());
    app.get('/isReady', (_req: Request, res: Response) => res.status(200).end());

    let middleware;

    if (process.env.NODE_ENV === 'development') {
        const compiler = webpack(config);
        middleware = webpackDevMiddleware(compiler, {
            publicPath: config.output.publicPath,
        });

        app.use(middleware);
        app.use(webpackHotMiddleware(compiler));
    } else {
        app.use('/assets', express.static(path.join(__dirname, '..', 'frontend_production')));
    }

    serviceConfig.map((service: IService) => {
        app.use(
            service.proxyPath,
            ensureAuthenticated(true),
            attachToken(azureClient, service),
            doProxy(service)
        );
    });
    
    // Sett opp bodyParser og router etter proxy. Spesielt viktig med tanke på større payloads som blir parset av bodyParser
    app.use(bodyParser.json({ limit: '200mb' }));
    app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
    app.use('/', setupRouter(middleware));
    
    app.listen(port, '0.0.0.0', () => {
        loglevel.info(
            `${new Date()}: server startet på port ${port}. Build version: ${process.env.APP_VERSION}.`
        );
    }).on('error', (err) => {
        loglevel.error(`${new Date()}: server startup failed - ${err}`);
    });
})
