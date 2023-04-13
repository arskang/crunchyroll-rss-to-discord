import * as dotenv from 'dotenv';
import * as path from 'path';

const pathEnv = path.join(__dirname, '../../.env');
dotenv.config({ path: pathEnv });