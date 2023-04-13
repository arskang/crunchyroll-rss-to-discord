import fastifyCors from "@fastify/cors";
import fastify, { FastifyInstance, RouteOptions } from "fastify";
import { ServerProvider } from "./index";

export interface Routes {
  url: string;
  childs: RouteOptions[];
}

export default class FastifyProvider implements ServerProvider {

  private server: FastifyInstance;

  constructor(
    private port: number,
    private routes: Routes[],
    private logger?: boolean,
  ) {
    this.server = fastify({ logger: this.logger });
  }

  private setUrl(url: string, childUrl?: string) {
    return `${url}${childUrl && childUrl !== '' ? `/${childUrl}` : ''}`;
  }

  private setRoutes() {
    if (this.routes.length > 0) {
      this.routes.forEach((route) => {
        const { childs, url } = route;
        if (childs.length > 0) {
          childs.forEach((child) => {
            this.server.route({
              ...child,
              url: this.setUrl(url, child.url),
            });
          });
        }
      });
    }
  }

  private Cors() {
    this.server.register(fastifyCors, {
      origin: "*",
    });
  }

  private async setConfigurations() {
    this.Cors();
    this.setRoutes();
  }

  async Start() {
    await this.setConfigurations();
    this.server.listen({
      port: this.port,
      host: "0.0.0.0",
    }, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(0)
     }
     console.log(`Server listening on ${address}`);
    });
  }
}