import { RegistryManifest } from '@vac/shared';

export interface RegistryStore {
  getManifest(componentSlug: string, version: string): Promise<RegistryManifest | null>;
  publishRelease(manifest: RegistryManifest): Promise<void>;
}

export const REGISTRY_SCHEMA_VERSION = '1.0.0';
