// Plugins
import vuetify from './vuetify';

// Types
import type { App } from 'vue';

export function registerPlugins(app: App): void {
  app.use(vuetify);
}
