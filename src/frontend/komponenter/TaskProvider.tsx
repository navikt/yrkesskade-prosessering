import { Location, useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { avvikshåndterTask, hentTasks, rekjørTask } from '../api/task';
import { IAvvikshåndteringDTO, ITaskResponse, taskStatus } from '../typer/task';
import { byggTomRessurs, Ressurs, RessursStatus } from '@navikt/familie-typer';
import constate from 'constate';
import { useEffect, useState } from 'react';
import { useServiceContext } from './ServiceContext';

const getQueryParamStatusFilter = (location: Location): taskStatus => {
    const status = new URLSearchParams(location.search).get('statusFilter') as taskStatus;
    return status || taskStatus.FEILET;
};

const getQueryParamSide = (location: Location): number => {
    const queryParamSideAsString = new URLSearchParams(location.search).get('side');
    return queryParamSideAsString ? parseInt(queryParamSideAsString, 10) : 0;
};

const [TaskProvider, useTaskContext] = constate(() => {
    const { valgtService } = useServiceContext();
    const navigate = useNavigate();
    const location = useLocation();

    const [tasks, settTasks] = useState<Ressurs<ITaskResponse>>(byggTomRessurs());
    const [statusFilter, settStatusFilter] = useState<taskStatus>(
        getQueryParamStatusFilter(location)
    );
    const [side, settSide] = useState<number>(getQueryParamSide(location));

    const hentEllerOppdaterTasks = () => {
        if (valgtService) {
            hentTasks(valgtService, statusFilter, side).then((res) => settTasks(res));
        }
    };

    useEffect(() => {
        hentEllerOppdaterTasks();
    }, [valgtService, statusFilter, side]);

    useEffect(() => {
        if (
            getQueryParamStatusFilter(location) !== statusFilter ||
            getQueryParamSide(location) !== side
        ) {
            navigate(`${location.pathname}?statusFilter=${statusFilter}&side=${side}`);
        }
    }, [statusFilter, side, history]);

    const rekjørTasks = (id?: number) => {
        if (valgtService && statusFilter) {
            rekjørTask(valgtService, statusFilter, id).then((response) => {
                if (response.status === RessursStatus.SUKSESS) {
                    hentEllerOppdaterTasks();
                }
            });
        }
    };

    const avvikshåndter = (data: IAvvikshåndteringDTO) => {
        if (valgtService) {
            avvikshåndterTask(valgtService, data).then((response) => {
                if (response.status === RessursStatus.SUKSESS) {
                    hentEllerOppdaterTasks();
                }
            });
        }
    };

    return {
        tasks,
        side,
        settSide,
        statusFilter,
        settStatusFilter,
        rekjørTasks,
        avvikshåndter,
    };
});

export { TaskProvider, useTaskContext };
