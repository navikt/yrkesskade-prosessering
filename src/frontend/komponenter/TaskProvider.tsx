import { AxiosError } from 'axios';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router';
import { avvikshåndterTask, hentTasks, hentTasks2, rekjørTask } from '../api/task';
import { byggTomRessurs, Ressurs, RessursStatus } from '../typer/ressurs';
import { IService } from '../typer/service';
import { IAvvikshåndteringDTO, ITask, ITaskResponse, taskStatus } from '../typer/task';
import { useServiceContext } from './ServiceProvider';

export enum actions {
    AVVIKSHÅNDTER_TASK = 'AVVIKSHÅNDTER_TASK',
    HENT_TASKS = 'HENT_TASKS',
    HENT_TASKS_FEILET = 'HENT_TASKS_FEILET',
    HENT_TASKS_SUKSESS = 'HENT_TASKS_SUKSESS',
    REKJØR_ALLE_TASKS = 'REKJØR_ALLE_TASKS',
    REKJØR_TASK = 'REKJØR_TASK',
    SETT_FILTER = 'SETT_FILTER',
    HENT_TASK_LOGG = 'HENT_TASK_LOGG',
    TOGGLE_LOGG = 'TOGGLE_LOGG',
}

interface IAction {
    payload?: any;
    type: actions;
}

type Dispatch = (action: IAction) => void;

interface IState {
    avvikshåndteringDTO: IAvvikshåndteringDTO | undefined;
    rekjørAlle: boolean;
    rekjørId: string;
    statusFilter: taskStatus;
    tasks: Ressurs<ITaskResponse>;
}

const TaskStateContext = React.createContext<IState | undefined>(undefined);
const TaskDispatchContext = React.createContext<Dispatch | undefined>(undefined);

const TaskReducer = (state: IState, action: IAction): IState => {
    switch (action.type) {
        case actions.AVVIKSHÅNDTER_TASK: {
            return {
                ...state,
                avvikshåndteringDTO: action.payload,
            };
        }
        case actions.HENT_TASKS: {
            return {
                ...state,
                tasks: {
                    status: RessursStatus.HENTER,
                },
            };
        }
        case actions.HENT_TASKS_SUKSESS: {
            return {
                ...state,
                tasks: action.payload,
            };
        }
        case actions.HENT_TASKS_FEILET: {
            return {
                ...state,
                tasks: action.payload,
            };
        }
        case actions.REKJØR_ALLE_TASKS: {
            return {
                ...state,
                rekjørAlle: action.payload,
            };
        }
        case actions.REKJØR_TASK: {
            return {
                ...state,
                rekjørId: action.payload,
            };
        }
        case actions.SETT_FILTER: {
            return {
                ...state,
                statusFilter: action.payload,
            };
        }
        case actions.TOGGLE_LOGG: {
            if (state.tasks.status === RessursStatus.SUKSESS) {
                return {
                    ...state,
                    tasks: {
                        ...state.tasks,
                        data: {
                            ...state.tasks.data,
                            tasks: state.tasks.data.tasks.map((task) => {
                                if (task.id === action.payload) {
                                    task.visLogg = !task.visLogg;
                                }
                                return task;
                            }),
                        },
                    },
                };
            } else {
                return state;
            }
        }
        case actions.HENT_TASK_LOGG: {
            if (state.tasks.status === RessursStatus.SUKSESS) {
                return {
                    ...state,
                    tasks: {
                        ...state.tasks,
                        data: {
                            ...state.tasks.data,
                            tasks: state.tasks.data.tasks.map((task) => {
                                if (task.id === action.payload.id) {
                                    task.logg = action.payload.data;
                                    task.visLogg = true;
                                }
                                return task;
                            }),
                        },
                    },
                };
            } else {
                return state;
            }
        }
        default: {
            throw new Error(`Uhåndtert action type: ${action.type}`);
        }
    }
};

const TaskProvider: React.StatelessComponent = ({ children }) => {
    const history = useHistory();
    const location = useLocation();
    const queryParamStatusFilter: taskStatus | null = new URLSearchParams(location.search).get(
        'statusFilter'
    ) as taskStatus;

    const valgtService: IService | undefined = useServiceContext().valgtService;
    const initiellStatusFilter: taskStatus = queryParamStatusFilter
        ? queryParamStatusFilter
        : taskStatus.FEILET;

    const [state, dispatch] = React.useReducer(TaskReducer, {
        avvikshåndteringDTO: undefined,
        rekjørAlle: false,
        rekjørId: '',
        statusFilter: initiellStatusFilter,
        tasks: byggTomRessurs<ITaskResponse>(),
    });

    React.useEffect(() => {
        history.replace({
            pathname: location.pathname,
            search: '?statusFilter=' + state.statusFilter,
        });
    }, [state.statusFilter, history]);

    const internHentTasks = () => {
        if (valgtService) {
            hentTasks2(valgtService, state.statusFilter).then(
                (response: Ressurs<ITaskResponse>) => {
                    if (response.status === RessursStatus.SUKSESS) {
                        dispatch({
                            payload: response,
                            type: actions.HENT_TASKS_SUKSESS,
                        });
                    } else {
                        hentTasks(valgtService, state.statusFilter).then(
                            (responseV1: Ressurs<ITask[]>) => {
                                const data =
                                    responseV1.status === RessursStatus.SUKSESS
                                        ? {
                                              ...responseV1,
                                              data: { tasks: responseV1.data },
                                          }
                                        : responseV1;
                                dispatch({
                                    payload: data,
                                    type: actions.HENT_TASKS_SUKSESS,
                                });
                            }
                        );
                    }
                }
            );
        }
    };

    React.useEffect(() => {
        dispatch({ type: actions.HENT_TASKS });
        internHentTasks();
    }, [state.statusFilter, valgtService]);

    React.useEffect(() => {
        if (valgtService && (state.rekjørAlle || state.rekjørId !== '')) {
            rekjørTask(valgtService, state.statusFilter, !state.rekjørAlle ? state.rekjørId : '')
                .then(() => {
                    internHentTasks();
                })
                .catch((error: AxiosError) => {
                    // tslint:disable-next-line: no-console
                    console.log('Rekjøring av task feilet');
                });

            dispatch({
                payload: '',
                type: actions.REKJØR_TASK,
            });

            dispatch({
                payload: false,
                type: actions.REKJØR_ALLE_TASKS,
            });
        }
    }, [state.rekjørId, state.rekjørAlle]);

    React.useEffect(() => {
        if (valgtService && state.avvikshåndteringDTO !== undefined) {
            avvikshåndterTask(valgtService, state.avvikshåndteringDTO)
                .then(() => {
                    internHentTasks();
                })
                .catch((error: AxiosError) => {
                    // tslint:disable-next-line: no-console
                    console.log('Avvikshåndtering av task feilet');
                });
        }
    }, [state.avvikshåndteringDTO]);

    return (
        <TaskStateContext.Provider value={state}>
            <TaskDispatchContext.Provider value={dispatch}>{children}</TaskDispatchContext.Provider>
        </TaskStateContext.Provider>
    );
};

const useTaskContext = () => {
    const context = React.useContext(TaskStateContext);
    if (context === undefined) {
        throw new Error('useTaskContext må brukes inne i en TaskContext');
    }
    return context;
};

const useTaskDispatch = () => {
    const context = React.useContext(TaskDispatchContext);
    if (context === undefined) {
        throw new Error('useTaskDispatch må brukes inne i en TaskContext');
    }
    return context;
};

export { TaskProvider, useTaskContext, useTaskDispatch };
