import { Knapp } from 'nav-frontend-knapper';
import Modal from 'nav-frontend-modal';
import { Select, Textarea } from 'nav-frontend-skjema';
import 'nav-frontend-tabell-style';
import { Element, Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { avvikstyper, ITask } from '../../../typer/task';
import { actions, useTaskDispatch } from '../../TaskProvider';

interface IProps {
    settÅpen: (åpen: boolean) => void;
    task: ITask;
    åpen: boolean;
}

const AvvikshåndteringModal: React.StatelessComponent<IProps> = ({ settÅpen, task, åpen }) => {
    const tasksDispatcher = useTaskDispatch();

    const [valgtAvvikType, settValgtAvvikType] = React.useState();
    const [årsak, settÅrsak] = React.useState('');

    return (
        <Modal
            contentClass={'avvikshåndtering'}
            isOpen={åpen}
            closeButton={true}
            onRequestClose={() => {
                settÅpen(!åpen);
            }}
            contentLabel="Avvikshåndter"
        >
            <Undertittel children={`Avvikshåndter`} />

            <br />
            <Element children={'Husk at avvikshåndterte tasks aldri vil bli saksbehandlet.'} />

            <form
                onSubmit={event => {
                    tasksDispatcher({
                        payload: {
                            avvikstype: valgtAvvikType,
                            taskId: task.id,
                            årsak,
                        },
                        type: actions.AVVIKSHÅNDTER_TASK,
                    });

                    event.preventDefault();
                }}
            >
                <Select
                    onChange={event => settValgtAvvikType(event.target.value)}
                    value={valgtAvvikType}
                    label={'Velg type avvik'}
                    required={true}
                >
                    <option value={''}>Velg avvikstype</option>
                    {Object.keys(avvikstyper).map(avvikType => {
                        return (
                            <option key={avvikType} value={avvikType}>
                                {avvikType}
                            </option>
                        );
                    })}
                </Select>

                <br />
                <Textarea
                    label={'Oppgi en årsak til avvik'}
                    maxLength={500}
                    onChange={event => settÅrsak(event.target.value)}
                    required={true}
                    textareaClass={'avvikshåndtering__textarea'}
                    value={årsak}
                />

                <br />
                <Knapp className={'taskpanel__vislogg'} mini={true}>
                    Avvikshåndter task
                </Knapp>
            </form>
        </Modal>
    );
};

export default AvvikshåndteringModal;
