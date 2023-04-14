import './environments';
import Server from './server';
import Fastify from './server/fastify';
import routes from './routes';
import './db';

declare var process: {
  env: {
    PORT?: string,
    LOGGER?: string,
    DISCORD_WEBHOOK?: string,
    MINUTES?: string,
    LAST_MINUTES?: string,
    CRONOFF?: string,
  }
}

const serverProvider = new Fastify(
  Number(process.env.PORT),
  routes,
  process.env.LOGGER === 'true',
);

const server = new Server(serverProvider);

server.Start();
