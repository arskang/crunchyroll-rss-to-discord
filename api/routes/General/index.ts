// imports
import { Routes } from '../../server/fastify'

const route: Routes = {
  url: '*',
  childs: [
    {
      url: '',
      method: 'GET',
      handler: async (_, reply) => {
        return reply
          .code(404)
          .send({ message: 'not found' });
      },
    },
  ],
};

export default route;
