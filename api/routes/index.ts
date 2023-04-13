import { Routes } from '../server/fastify'

import version from './Version';
import crunchyroll from './Crunchyroll';
// imports

const controllers: Routes[] = [
  version,
  crunchyroll,
  // routes
]

export default controllers;