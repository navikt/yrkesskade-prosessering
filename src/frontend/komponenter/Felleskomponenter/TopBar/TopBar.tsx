import { Systemtittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { useTaskContext, useTaskDispatch, actions as taskActions } from '../../TaskProvider';
import { IService } from '../../../typer/service';
import {
    useServiceContext,
    useServiceDispatch,
    actions as serviceActions,
} from '../../ServiceProvider';
import { taskStatus, taskStatusTekster } from '../../../typer/task';
import { Knapp } from 'nav-frontend-knapper';
import { Select } from 'nav-frontend-skjema';
import { RessursStatus } from '../../../typer/ressurs';

const TopBar: React.FC = () => {
    const statusFilter = useTaskContext().statusFilter;
    const tasksDispatcher = useTaskDispatch();
    const valgtService: IService | undefined = useServiceContext().valgtService;
    const serviceDispatch = useServiceDispatch();
    const services = useServiceContext().services;

    return (
        <div className={'topbar'}>
            <Systemtittel children={`Tasks for ${valgtService.displayName}`} />

            {statusFilter === taskStatus.FEILET && (
                <Knapp
                    mini={true}
                    onClick={() =>
                        tasksDispatcher({
                            payload: true,
                            type: taskActions.REKJØR_ALLE_TASKS,
                        })
                    }
                >
                    Rekjør alle tasks
                </Knapp>
            )}

            <Select
                onChange={(event) =>
                    tasksDispatcher({
                        payload: event.target.value,
                        type: taskActions.SETT_FILTER,
                    })
                }
                value={statusFilter}
                label={'Vis saker med status'}
            >
                {Object.values(taskStatus).map((status: taskStatus) => {
                    return (
                        <option key={status} value={status}>
                            {taskStatusTekster[status]}
                        </option>
                    );
                })}
            </Select>
        </div>
    );
};

export default TopBar;
