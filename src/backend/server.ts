import './azureConfig'; // setter miljøvariabler
import backend, { IApp } from '@navikt/yrkesskade-backend';
import loglevel from 'loglevel';
import { logInfo } from '@navikt/familie-logging';
import { sessionConfig } from './config';
import moment from 'moment';
import bodyParser from 'body-parser';
import setupRouter from './router'
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import express from 'express';
import path from 'path';

/* tslint:disable */
const config = require('../build_n_deploy/webpack.dev');
/* tslint:enable */

loglevel.setDefaultLevel(loglevel.levels.INFO);

const port = 4000;

backend(sessionConfig).then(({ app, azureAuthClient, router }: IApp) => {
    logInfo(`Initialiserer backend server på port ${port}`);
    
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

    // Sett opp bodyParser og router etter proxy. Spesielt viktig med tanke på større payloads som blir parset av bodyParser
    app.use(bodyParser.json({ limit: '200mb' }));
    app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
    app.use('/', setupRouter(azureAuthClient, router, middleware));
    
    app.listen(port, '0.0.0.0', () => {
        loglevel.info(
            `${moment().toISOString(true)}: server startet på port ${port}. Build version: ${
                process.env.APP_VERSION
            }.`
        );
    }).on('error', (err) => {
        loglevel.error(`${moment().toISOString(true)}: server startup failed - ${err}`);
    });
});