import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'tei1nhk0',
    dataset: 'production'
  },
  deployment: {
    appId: 'k5i64ecj9x8kcdx4o8025g12',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
  }
})
