import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'gv4os6ef',
    dataset: 'production'
  },
  deployment: {
    projectId: 'a0g3h467',
    appId: 'k5i64ecj9x8kcdx4o8025g12',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
  }
})
