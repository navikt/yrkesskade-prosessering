import { Knapp } from 'nav-frontend-knapper';
import { UndertekstBold } from 'nav-frontend-typografi';
import * as React from 'react';
import { actions as taskActions, useTaskContext, useTaskDispatch } from '../../TaskProvider';

const Paginering: React.FunctionComponent = () => {
    const side = useTaskContext().side;
    const tasksDispatcher = useTaskDispatch();
    return (
        <div>
            <Knapp
                onClick={() =>
                    tasksDispatcher({
                        payload: side - 1,
                        type: taskActions.SETT_SIDE,
                    })
                }
                mini={true}
                disabled={side <= 0}
            >
                Forrige
            </Knapp>
            <Knapp
                onClick={() =>
                    tasksDispatcher({
                        payload: side + 1,
                        type: taskActions.SETT_SIDE,
                    })
                }
                mini={true}
            >
                Neste
            </Knapp>
            <UndertekstBold>Side: {side}</UndertekstBold>
        </div>
    );
};

export default Paginering;
