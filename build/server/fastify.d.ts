import { RouteOptions } from "fastify";
import { ServerProvider } from "./index";
export interface Routes {
    url: string;
    childs: RouteOptions[];
}
export default class FastifyProvider implements ServerProvider {
    private port;
    private routes;
    private logger?;
    private server;
    constructor(port: number, routes: Routes[], logger?: boolean | undefined);
    private setUrl;
    private setRoutes;
    private Cors;
    private setConfigurations;
    Start(): Promise<void>;
}
