import * as classNames from 'classnames';
import * as moment from 'moment';
import { Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import PanelBase from 'nav-frontend-paneler';
import { Element, Normaltekst, Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { ITask, ITaskLogg, loggType, taskStatusTekster, taskTypeTekster } from '../../typer/task';
import { actions, useTaskDispatch } from '../TaskProvider';
import AvvikshåndteringModal from './AvvikshåndteringModal/AvvikshåndteringModal';
import TaskElement from './TaskElement';
import { hentTaskLogg } from '../../api/task';
import { Ressurs, RessursStatus } from '../../typer/ressurs';
import { IService } from '../../typer/service';
import { useServiceContext } from '../ServiceProvider';

interface IProps {
    task: ITask;
}

// Kan bruke sistKjørt når man gått over helt til v2 av tasks
const getSistKjørt = (task: ITask) => {
    const sortertTaskLogg =
        (task.logg || []).sort((a, b) =>
            moment(b.opprettetTidspunkt).diff(moment(a.opprettetTidspunkt))
        ) || [];
    const behandlerLoggMeldinger = sortertTaskLogg.filter(
        (taskLogg: ITaskLogg) => taskLogg.type === loggType.BEHANDLER
    );
    let sistKjørt: string;
    if (task.sistKjørt) {
        sistKjørt = moment(task.sistKjørt).format('DD.MM.YYYY HH:mm');
    } else if (behandlerLoggMeldinger.length > 0) {
        sistKjørt = moment(behandlerLoggMeldinger[0].opprettetTidspunkt).format('DD.MM.YYYY HH:mm');
    } else {
        sistKjørt = 'Venter på første kjøring';
    }
    return { sortertTaskLogg, sistKjørt };
};

const TaskPanel: React.StatelessComponent<IProps> = ({ task }) => {
    const valgtService: IService = useServiceContext().valgtService!!;
    const [visAvvikshåndteringModal, settVisAvvikshåndteringModal] = React.useState(false);

    const tasksDispatcher = useTaskDispatch();

    const kibanaErrorLenke = `https://logs.adeo.no/app/kibana#/discover/48543ce0-877e-11e9-b511-6967c3e45603?_g=(refreshInterval:(pause:!t,value:0),time:(from:'${task.opprettetTidspunkt}',mode:relative,to:now))&_a=(columns:!(message,envclass,environment,level,application,host),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'logstash-apps-*',key:team,negate:!f,params:(query:teamfamilie,type:phrase),type:phrase,value:teamfamilie),query:(match:(team:(query:teamfamilie,type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'96e648c0-980a-11e9-830a-e17bbd64b4db',key:level,negate:!f,params:(query:Error,type:phrase),type:phrase,value:Error),query:(match:(level:(query:Error,type:phrase))))),index:'96e648c0-980a-11e9-830a-e17bbd64b4db',interval:auto,query:(language:lucene,query:${task.metadata.callId}),sort:!('@timestamp',desc))`;
    const kibanaInfoLenke = `https://logs.adeo.no/app/kibana#/discover/48543ce0-877e-11e9-b511-6967c3e45603?_g=(refreshInterval:(pause:!t,value:0),time:(from:'${task.opprettetTidspunkt}',mode:relative,to:now))&_a=(columns:!(message,envclass,environment,level,application,host),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'logstash-apps-*',key:team,negate:!f,params:(query:teamfamilie,type:phrase),type:phrase,value:teamfamilie),query:(match:(team:(query:teamfamilie,type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'96e648c0-980a-11e9-830a-e17bbd64b4db',key:level,negate:!f,params:(query:Info,type:phrase),type:phrase,value:Info),query:(match:(level:(query:Info,type:phrase))))),index:'96e648c0-980a-11e9-830a-e17bbd64b4db',interval:auto,query:(language:lucene,query:${task.metadata.callId}),sort:!('@timestamp',desc))`;

    const { sortertTaskLogg, sistKjørt } = getSistKjørt(task);

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
            <Knapp
                mini={true}
                onClick={() => tasksDispatcher({ payload: task.id, type: actions.REKJØR_TASK })}
                className={'taskpanel__rekjør'}
            >
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
                onClick={() => {
                    if (!task.visLogg && !task.logg) {
                        hentTaskLogg(valgtService, task.id).then(
                            (response: Ressurs<ITaskLogg[]>) => {
                                if (response.status === RessursStatus.SUKSESS) {
                                    tasksDispatcher({
                                        payload: {
                                            id: task.id,
                                            data: response.data,
                                        },
                                        type: actions.HENT_TASK_LOGG,
                                    });
                                }
                            }
                        );
                    } else {
                        tasksDispatcher({
                            payload: task.id,
                            type: actions.TOGGLE_LOGG,
                        });
                    }
                }}
            >
                {`${task.visLogg ? 'Skjul' : 'Vis'} logg (${
                    task.antallLogger || task.logg?.length
                })`}
            </Knapp>

            <div className={classNames('taskpanel__logg', task.visLogg ? '' : 'skjul')}>
                {sortertTaskLogg.map((logg: ITaskLogg, index: number) => {
                    const stackTrace = hentStackTrace(logg.melding);

                    return (
                        <div key={index} className={'taskpanel__logg--item'}>
                            <div className={'taskpanel__logg--item-metadata'}>
                                <Element children={logg.type} />
                                <Normaltekst children={`Endret av: ${logg.endretAv}`} />
                                <Normaltekst
                                    children={moment(logg.opprettetTidspunkt).format(
                                        'DD.MM.YYYY HH:mm'
                                    )}
                                />
                                <Normaltekst children={logg.node} />
                            </div>

                            {stackTrace && (
                                <pre
                                    className={'taskpanel__logg--item-melding'}
                                    children={stackTrace}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </PanelBase>
    );
};

const hentStackTrace = (melding?: string) => {
    if (!melding) {
        return 'Ingen melding';
    }

    try {
        const json = JSON.parse(melding);
        return json.stackTrace ? json.stackTrace : 'Ingen stack trace';
    } catch (error) {
        return melding ? melding : undefined;
    }
};

export default TaskPanel;
