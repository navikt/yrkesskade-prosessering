import AlertStripe from 'nav-frontend-alertstriper';
import * as React from 'react';
import { RessursStatus } from '../../typer/ressurs';
import { useTaskContext } from '../TaskProvider';
import TaskListe from './TaskListe';
import TopBar from '../Felleskomponenter/TopBar/TopBar';

const Tasks: React.FunctionComponent = () => {
    const tasks = useTaskContext().tasks;

    switch (tasks.status) {
        case RessursStatus.SUKSESS:
            // @ts-ignore
            return (
                <div className={'tasks'}>
                    <TopBar />

                    <br />
                    <TaskListe tasks={tasks.data.tasks} />
                </div>
            );
        case RessursStatus.HENTER:
            return <AlertStripe children={`Laster tasker`} type={'info'} />;
        case RessursStatus.FEILET:
            return (
                <AlertStripe
                    children={`Innhenting av tasker feilet. Feilmelding: ${tasks.melding}`}
                    type={'feil'}
                />
            );
        default:
            return <div />;
    }
};

export default Tasks;
