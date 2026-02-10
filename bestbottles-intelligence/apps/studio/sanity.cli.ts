import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'gv4os6ef',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  /**
   * Enable auto-updates for studios.
   */
  autoUpdates: true,
});


