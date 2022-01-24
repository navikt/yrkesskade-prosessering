import AlertStripe from 'nav-frontend-alertstriper';
import { Systemtittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { NavigateFunction } from "react-router";
import { useNavigate } from "react-router-dom";
import { IService } from '../../typer/service';
import ServiceIkon from './ServiceIkon';
import { Knapp } from 'nav-frontend-knapper';
import { RessursStatus } from '@navikt/familie-typer';
import { useServiceContext } from '../ServiceContext';

const Services: React.FunctionComponent = () => {
    const { services } = useServiceContext();
    const navigate = useNavigate();

    switch (services.status) {
        case RessursStatus.SUKSESS:
            return (
                <div className={'services'}>
                    {services.data.map((service: IService) =>
                        Service(service, navigate)
                    )}
                </div>
            );
        case RessursStatus.HENTER:
            return <AlertStripe children={`Laster tasker`} type={'info'} />;
        case RessursStatus.FEILET:
            return (
                <AlertStripe
                    children={`Innhenting av services feilet: ${services.frontendFeilmelding}`}
                    type={'feil'}
                />
            );
        default:
            return <div />;
    }
};

const Service = (
    service: IService,
    navigate: NavigateFunction
) => {
    return (
        <div key={service.id} className={'services__service'}>
            <ServiceIkon heigth={150} width={150} />
            <Systemtittel children={service.displayName} />

            <div className={'services__service--actions'}>
                <Knapp
                    onClick={() => {
                        navigate(`/service/${service.id}`);
                    }}
                    mini={true}
                >
                    Alle tasker
                </Knapp>
                <Knapp
                    onClick={() => {
                        navigate(`/service/${service.id}/gruppert`);
                    }}
                    mini={true}
                >
                    Gruppert
                </Knapp>
            </div>
        </div>
    );
};

export default Services;
