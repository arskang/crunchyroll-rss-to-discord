export interface ServerProvider {
    Start(): Promise<void>;
}
export default class Server {
    private provider;
    constructor(provider: ServerProvider);
    private StartCron;
    Start(): Promise<void>;
}
