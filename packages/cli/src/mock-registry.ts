import { RegistryManifest } from '@vac/shared';
import { LocalRegistryStore, RegistryStore } from '@vac/registry';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

// Local storage directory in monorepo
const storageDir = path.resolve(currentDir, '../../registry/storage');
export const fileRegistryStore: RegistryStore = new LocalRegistryStore(storageDir);
