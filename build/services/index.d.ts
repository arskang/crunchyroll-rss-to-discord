import { Item } from '../models/crunchyroll';
import 'moment/locale/es-mx';
export declare const sleep: () => Promise<boolean>;
export declare function getRSSItemsCrunchyroll(): Promise<Item[]>;
