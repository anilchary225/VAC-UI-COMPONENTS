import { ComponentModel } from '../../models/Component';
import { ComponentVersionModel } from '../../models/ComponentVersion';
import { INITIAL_OFFICIAL_COMPONENTS } from './components.seed';

export async function ensureInitialComponentsSeeded(): Promise<void> {
  try {
    const count = await ComponentModel.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial 9 official components to database...');
      for (const comp of INITIAL_OFFICIAL_COMPONENTS) {
        await ComponentModel.create({
          slug: comp.slug,
          name: comp.name,
          description: comp.description,
          category: comp.category,
          tags: comp.tags,
          status: comp.status,
          currentVersion: comp.currentVersion,
          previewComponent: comp.previewComponent,
          isOfficial: comp.isOfficial,
          downloadsCount: comp.downloadsCount,
          favoritesCount: comp.favoritesCount,
          documentation: comp.documentation,
          license: comp.license,
          author: comp.author,
          draftFiles: comp.latestRelease?.files || [],
          draftDependencies: comp.latestRelease?.dependencies || {},
          draftPeerDependencies: comp.latestRelease?.peerDependencies || {},
          draftProps: comp.latestRelease?.props || [],
          draftChangelog: comp.latestRelease?.changelog || '',
        });

        if (comp.latestRelease) {
          await ComponentVersionModel.create({
            componentSlug: comp.slug,
            version: comp.latestRelease.version,
            changelog: comp.latestRelease.changelog,
            dependencies: comp.latestRelease.dependencies,
            peerDependencies: comp.latestRelease.peerDependencies,
            files: comp.latestRelease.files,
            props: comp.latestRelease.props,
            publishedAt: new Date(comp.createdAt || Date.now()),
          });
        }
      }
      console.log('✅ Initial components seeded successfully.');
    }
  } catch (err) {
    console.warn('Could not seed initial components:', err);
  }
}
