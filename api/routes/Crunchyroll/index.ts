import { Routes } from '../../server/fastify';
import { getRSSItemsCrunchyroll } from '../../services';

const route: Routes = {
  url: '/crunchyroll',
  childs: [
    {
      url: 'news',
      method: 'GET',
      handler: async (_, reply) => {
        try {
          const items = await getRSSItemsCrunchyroll();
          return reply
            .code(200)
            .send(items);
        } catch(err) {
          let message = 'Unknown Error'
          if (err instanceof Error) message = err.message
          return reply
            .code(400)
            .send(message)
        }
      },
    },
  ],
};

export default route;
