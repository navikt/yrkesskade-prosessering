import classNames from 'classnames';
import * as moment from 'moment';
import { Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import PanelBase from 'nav-frontend-paneler';
import { Element, Normaltekst, Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { FC, useState } from 'react';
import { ITask, taskStatusTekster, taskTypeTekster } from '../../typer/task';
import AvvikshåndteringModal from './AvvikshåndteringModal/AvvikshåndteringModal';
import TaskElement from './TaskElement';
import { useTaskContext } from '../TaskProvider';
import TaskLogg from './TaskLogg';
import * as kub from '@clickandmortar/kibana-url-builder';
import {
    KibanaQueryFilter,
    KibanaQueryPeriod,
} from '@clickandmortar/kibana-url-builder/dist/types';

interface IProps {
    task: ITask;
}

// Kan bruke sistKjørt når man gått over helt til v2 av tasks
const getSistKjørt = (task: ITask) =>
    task.sistKjørt ? moment(task.sistKjørt).format('DD.MM.YYYY HH:mm') : 'Venter på første kjøring';

const TaskPanel: FC<IProps> = ({ task }) => {
    const { rekjørTasks } = useTaskContext();
    const [visAvvikshåndteringModal, settVisAvvikshåndteringModal] = useState(false);
    const [visLogg, settVisLogg] = useState(false);

    const kibanaHost = 'https://logs.adeo.no/';
    const columns = ['message', 'envclass', 'environment', 'level', 'application', 'host'];
    const period: KibanaQueryPeriod = {
        from: `${task.opprettetTidspunkt}`,
        to: 'now',
        mode: 'relative',
    };
    const index = 'logstash-apps-*';
    const filters: KibanaQueryFilter[] = [
        {
            type: 'query',
            field: 'team',
            value: 'yrkesskade',
            negate: false,
            disabled: false,
        },
    ];
    const query = task.metadata.callId;

    const kibanaErrorLenke = kub.buildDiscoverUrl({
        host: kibanaHost,
        columns,
        period,
        index,
        filters: [...filters],
        query,
        refreshInterval: { pause: true, value: 0 as unknown as bigint },
    });
    //     `https://logs.adeo.no/app/kibana#/discover/c95c83c0-8982-11ec-be50-97987d1e7a2e?_g=(refreshInterval:(pause:!t,value:0),time:(from:'${task.opprettetTidspunkt}',mode:relative,to:now))&_a=(columns:!(message,envclass,environment,level,application,host),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'logstash-apps-*',key:team,negate:!f,params:(query:yrkesskade,type:phrase),type:phrase,value:yrkesskade),query:(match:(team:(query:yrkesskade,type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'c95c83c0-8982-11ec-be50-97987d1e7a2e',key:level,negate:!f,params:(query:Error,type:phrase),type:phrase,value:Error),query:(match:(level:(query:Error,type:phrase))))),index:'c95c83c0-8982-11ec-be50-97987d1e7a2e',interval:auto,query:(language:lucene,query:${task.metadata.callId}),sort:!('@timestamp',desc))`;
    const kibanaInfoLenke = `https://logs.adeo.no/app/kibana#/discover/c95c83c0-8982-11ec-be50-97987d1e7a2e?_g=(refreshInterval:(pause:!t,value:0),time:(from:'${task.opprettetTidspunkt}',mode:relative,to:now))&_a=(columns:!(message,envclass,environment,level,application,host),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'logstash-apps-*',key:team,negate:!f,params:(query:yrkesskade,type:phrase),type:phrase,value:yrkesskade),query:(match:(team:(query:yrkesskade,type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'c95c83c0-8982-11ec-be50-97987d1e7a2e',key:level,negate:!f,params:(query:Info,type:phrase),type:phrase,value:Info),query:(match:(level:(query:Info,type:phrase))))),index:'c95c83c0-8982-11ec-be50-97987d1e7a2e',interval:auto,query:(language:lucene,query:${task.metadata.callId}),sort:!('@timestamp',desc))`;

    const sistKjørt = getSistKjørt(task);

    return (
        <PanelBase className={'taskpanel'} border={true}>
            <AvvikshåndteringModal
                settÅpen={settVisAvvikshåndteringModal}
                task={task}
                åpen={visAvvikshåndteringModal}
            />
            <div className={classNames('taskpanel__status', task.status)}>
                <Element children={taskStatusTekster[task.status]} />
            </div>
            <Knapp mini={true} onClick={() => rekjørTasks(task.id)} className={'taskpanel__rekjør'}>
                Rekjør
            </Knapp>

            <div className={'taskpanel__innhold'}>
                <Undertittel
                    children={`#${task.id}: ${
                        taskTypeTekster[task.taskStepType]
                            ? taskTypeTekster[task.taskStepType]
                            : `${task.taskStepType}`
                    }`}
                />
                <div className={'taskpanel__innhold--elementer'}>
                    {Object.keys(task.metadata).map((key: string) => {
                        return <TaskElement key={key} label={key} innhold={task.metadata[key]} />;
                    })}
                    <TaskElement label={'Sist kjørt'} innhold={sistKjørt} />
                    <TaskElement
                        label={'Triggertid'}
                        innhold={moment(task.triggerTid).format('DD.MM.YYYY HH:mm')}
                    />
                </div>
            </div>

            <div className={'taskpanel__lenker'}>
                <Lenke href={kibanaErrorLenke} children={'Kibana error'} />
                <Lenke href={kibanaInfoLenke} children={'Kibana info'} />
                <Lenke
                    href={''}
                    onClick={(event) => {
                        settVisAvvikshåndteringModal(!visAvvikshåndteringModal);
                        event.preventDefault();
                    }}
                    children={'Avvikshåndter'}
                />
            </div>

            <div className={'taskpanel__metadata'}>
                <Normaltekst
                    children={moment(task.opprettetTidspunkt).format('DD.MM.YYYY HH:mm')}
                />
            </div>

            <Knapp
                className={'taskpanel__vislogg'}
                mini={true}
                onClick={(event) => {
                    settVisLogg(!visLogg);
                    event.preventDefault();
                }}
            >
                {`${visLogg ? 'Skjul' : 'Vis'} logg (${task.antallLogger})`}
            </Knapp>

            <div className={classNames('taskpanel__logg', visLogg ? '' : 'skjul')}>
                <TaskLogg taskId={task.id} visLogg={visLogg} />
            </div>
        </PanelBase>
    );
};

export default TaskPanel;
