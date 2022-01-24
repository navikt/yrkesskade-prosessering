import { useEffect, useState } from 'react';
import { hentServices } from '../api/service';
import { IService } from '../typer/service';
import { byggTomRessurs, Ressurs, RessursStatus } from '@navikt/familie-typer';
import constate from 'constate';
import { useLocation} from 'react-router';

const getServiceId = (pathname: string) => {
    return pathname.split('/')[2];
};

const [ServiceProvider, useServiceContext] = constate(() => {
    const { pathname } = useLocation();
    const [services, settServices] = useState<Ressurs<IService[]>>(byggTomRessurs());
    const [valgtService, settValgtService] = useState<IService>();

    const oppdaterValgtService = (response: Ressurs<IService[]>, pathname: string) => {
        if (response.status === RessursStatus.SUKSESS) {
            const serviceId = getServiceId(pathname);
            settValgtService(response.data.find((service) => service.id === serviceId));
        }
    };

    useEffect(() => {
        hentServices().then((response: Ressurs<IService[]>) => {
            settServices(response);
            oppdaterValgtService(response, pathname);
        });
    }, []);

    useEffect(() => {
        oppdaterValgtService(services, pathname);
    }, [pathname]);

    return {
        services,
        valgtService,
        settValgtService
    };
});

export { ServiceProvider, useServiceContext };
