import { Ressurs } from '../typer/ressurs';
import { IService } from '../typer/service';
import { axiosRequest } from './axios';

export const hentServices = (): Promise<Ressurs<IService[]>> => {
    return axiosRequest({
        method: 'GET',
        url: `/services`,
    });
};
