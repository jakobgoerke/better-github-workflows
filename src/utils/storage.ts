import { Storage } from '@plasmohq/storage';

const storage = new Storage();

const cacheStorage = new Storage({ area: 'local' });

export { cacheStorage, storage };
