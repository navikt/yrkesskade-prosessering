import * as moment from 'moment';
import AlertStripe from 'nav-frontend-alertstriper';
import { Element } from 'nav-frontend-typografi';
import * as React from 'react';
import { ITaskDTO } from '../../typer/task';
import { useTaskContext } from '../TaskProvider';
import TaskPanel from './TaskPanel';

interface IProps {
    tasksDTO: ITaskDTO[];
}

const TaskListe: React.StatelessComponent<IProps> = ({ tasksDTO }) => {
    const statusFilter = useTaskContext().statusFilter;

    return tasksDTO.length > 0 ? (
        <React.Fragment>
            <Element children={`Viser ${tasksDTO.length} tasker`} />

            {tasksDTO
                .sort((a, b) => moment(b.task.opprettetTidspunkt).diff(a.task.opprettetTidspunkt))
                .map(taskDTO => {
                    return <TaskPanel key={taskDTO.task.id} taskDTO={taskDTO} />;
                })}
        </React.Fragment>
    ) : (
        <AlertStripe type={'info'} children={`Ingen tasker med status ${statusFilter}`} />
    );
};

export default TaskListe;
