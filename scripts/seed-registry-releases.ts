import path from 'path';
import { fileRegistryStore } from '../backend/src/modules/registry/registry.service';
import { INITIAL_OFFICIAL_COMPONENTS } from '../backend/src/modules/components/components.seed';
import { createReleaseManifest } from '../packages/registry/src';

export async function seedOfficialReleases() {
  console.log('Seeding official component releases into registry storage...');
  for (const comp of INITIAL_OFFICIAL_COMPONENTS) {
    if (!comp.latestRelease) continue;
    const existing = await fileRegistryStore.getManifest(comp.slug, comp.latestRelease.version);
    if (!existing) {
      const manifest = createReleaseManifest({
        name: comp.name,
        slug: comp.slug,
        version: comp.latestRelease.version,
        description: comp.description,
        category: comp.category,
        files: comp.latestRelease.files,
        dependencies: comp.latestRelease.dependencies,
        peerDependencies: comp.latestRelease.peerDependencies,
        props: comp.latestRelease.props,
        license: comp.license,
        author: comp.author,
        changelog: comp.latestRelease.changelog,
        publishedAt: comp.createdAt,
      });
      await fileRegistryStore.publishRelease(manifest);
      console.log(`  ✔ Seeded ${comp.slug}@${comp.latestRelease.version}`);
    } else {
      console.log(`  • ${comp.slug}@${comp.latestRelease.version} already exists in storage`);
    }
  }
  console.log('Finished seeding official component releases.\n');
}

if (process.argv[1]?.includes('seed-registry-releases')) {
  seedOfficialReleases().catch(console.error);
}
