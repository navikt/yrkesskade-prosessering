export interface ISessionKonfigurasjon {
    redisUrl?: string;
    redisPassord?: string;
    navn: string;
    secureCookie: boolean;
    sessionMaxAgeSekunder?: number;
    cookieSecret: string | string[];
}