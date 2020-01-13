// Enum
export enum avvikstyper {
    ANNET = 'ANNET',
    DUPLIKAT = 'DUPLIKAT',
}

export enum taskStatus {
    AVVIKS_HÅNDTERT = 'AVVIKS_HÅNDTERT',
    BEHANDLER = 'BEHANDLER',
    FEILET = 'FEILET',
    FERDIG = 'FERDIG',
    KLAR_TIL_PLUKK = 'KLAR_TIL_PLUKK',
    PLUKKET = 'PLUKKET',
    UBEHANDLET = 'UBEHANDLET',
}

export enum loggType {
    BEHANDLER = 'BEHANDLER',
    FEILET = 'FEILET',
    FERDIG = 'FERDIG',
    KLAR_TIL_PLUKK = 'KLAR_TIL_PLUKK',
    PLUKKET = 'PLUKKET',
    UBEHANDLET = 'UBEHANDLET',
}

export enum taskTyper {
    hentJournalpostIdFraJoarkTask = 'hentJournalpostIdFraJoarkTask',
    hentSaksnummerFraJoark = 'hentSaksnummerFraJoark',
    journalførSøknad = 'journalførSøknad',
    sendMeldingTilDittNav = 'sendMeldingTilDittNav',
    sendSøknadTilSak = 'sendSøknadTilSak',
}

// Tekster
type ITaskTypeTekster = {
    [key in taskTyper]: string;
};

export const taskTypeTekster: ITaskTypeTekster = {
    hentJournalpostIdFraJoarkTask: 'Hent journalpost id fra joark',
    hentSaksnummerFraJoark: 'Hent saksnummer fra joark',
    journalførSøknad: 'Journalfør søknad',
    sendMeldingTilDittNav: 'Send melding til ditt NAV',
    sendSøknadTilSak: 'Send søknad til sak',
};

type ITaskStatusTekster = {
    [key in taskStatus]: string;
};

export const taskStatusTekster: ITaskStatusTekster = {
    AVVIKS_HÅNDTERT: 'Avvikshåndtert',
    BEHANDLER: 'Behandler',
    FEILET: 'Feilet',
    FERDIG: 'Ferdig',
    KLAR_TIL_PLUKK: 'Klar til plukk',
    PLUKKET: 'Plukket',
    UBEHANDLET: 'Ubehandlet',
};

// Interface
export interface ITaskDTO {
    task: ITask;
    journalpostID?: string;
    saksnummer?: string;
    søkerFødselsnummer: string;
}

export interface ITask {
    avvikstype: avvikstyper;
    callId: string;
    id: number;
    logg: ITaskLogg[];
    metadata: any;
    opprettetTidspunkt: string;
    payload: string;
    status: taskStatus;
    triggerTid: string;
    type: taskTyper;
}

export interface ITaskLogg {
    endretAv: string;
    melding?: string;
    node: string;
    opprettetTidspunkt: string;
    type: loggType;
}

export interface IAvvikshåndteringDTO {
    taskId: string;
    årsak: string;
    avvikstype: avvikstyper;
}
