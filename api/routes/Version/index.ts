import edder from './edder';
// imports
import { Routes } from '../../server/fastify'

const route: Routes = {
  url: '/version',
  childs: [
    {
      url: '',
      method: 'GET',
      handler: async (_, reply) => {
        const version = [
          // devs
          edder,
        ].join(' | ');
        return reply
          .code(200)
          .send(version);
      },
    },
  ],
};

export default route;
