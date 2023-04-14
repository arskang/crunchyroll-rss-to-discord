import { Routes } from '../server/fastify'

import version from './Version';
import crunchyroll from './Crunchyroll';
import general from './General';
// imports

const controllers: Routes[] = [
  version,
  crunchyroll,
  general,
  // routes
]

export default controllers;