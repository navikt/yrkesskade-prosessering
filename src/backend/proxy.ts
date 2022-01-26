
import { NextFunction, Request, Response } from 'express';
import { ClientRequest } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { v4 as uuidv4 } from 'uuid';
import { oboConfig } from './config';
import { IService } from './serviceConfig';

const restream = (proxyReq: ClientRequest, req: Request, res: Response) => {
    if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
    }
};

export const doProxy = (service: IService) => {
    return createProxyMiddleware(service.proxyPath, {
        changeOrigin: true,
        logLevel: 'info',
        onProxyReq: restream,
        pathRewrite: (path: string, _req: Request) => {
            const newPath = path.replace(service.proxyPath, '');
            return `/api${newPath}`;
        },
        secure: true,
        target: `${service.proxyUrl}`,
    });
};

/*export const attachToken = (authClient: Client, service: IService) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        getOnBehalfOfAccessToken(authClient, req, oboConfig(service))
            .then((accessToken: string) => {
                req.headers['Nav-Call-Id'] = uuidv4();
                req.headers.Authorization = `Bearer ${accessToken}`;
                return next();
            })
            .catch((e) => {
                if (e.error === 'invalid_grant') {
                    console.log(`invalid_grant`);
                    _res.status(500).json({
                        status: 'IKKE_TILGANG',
                        frontendFeilmelding:
                            'Uventet feil. Det er mulig at du ikke har tilgang til applikasjonen.',
                    });
                } else {
                    console.error(`Uventet feil - getOnBehalfOfAccessToken  ${e}`);
                    _res.status(500).json({
                        status: 'FEILET',
                        frontendFeilmelding: 'Uventet feil. Vennligst prøv på nytt.',
                    });
                }
            });
    };
};
*/