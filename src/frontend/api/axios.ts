import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { byggFeiletRessurs, Ressurs, RessursStatus } from '../typer/ressurs';

axios.defaults.baseURL = window.location.origin;
export const preferredAxios = axios;

export const axiosRequest = async <T>(config: AxiosRequestConfig): Promise<Ressurs<T>> => {
    return preferredAxios
        .request(config)
        .then((response: AxiosResponse<Ressurs<T>>) => {
            const responsRessurs: Ressurs<T> = response.data;

            let typetRessurs: Ressurs<T> = {
                status: RessursStatus.IKKE_HENTET,
            };

            switch (responsRessurs.status) {
                case RessursStatus.SUKSESS:
                    typetRessurs = {
                        data: responsRessurs.data,
                        status: RessursStatus.SUKSESS,
                    };
                    break;
                case RessursStatus.IKKE_TILGANG:
                    typetRessurs = {
                        melding: responsRessurs.melding,
                        status: RessursStatus.IKKE_TILGANG,
                    };
                    break;
                case RessursStatus.FEILET:
                    typetRessurs = {
                        errorMelding: responsRessurs.errorMelding,
                        melding: responsRessurs.melding,
                        status: RessursStatus.FEILET,
                    };
                    break;
                default:
                    typetRessurs = {
                        melding: 'Ukjent api feil',
                        status: RessursStatus.FEILET,
                    };
                    break;
            }

            return typetRessurs;
        })
        .catch((error: AxiosError) => {
            return byggFeiletRessurs<T>('Ukjent api feil', error);
        });
};
