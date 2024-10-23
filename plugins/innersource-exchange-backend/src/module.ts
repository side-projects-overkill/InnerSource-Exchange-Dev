import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { ProjectEntityProcessor } from './module/ProjectEntityProcessor';
import { SkillEntityProcessor } from './module/SkillEntityProcessor';

const exchangeCatalogModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'innersource-exchange',
  register(reg) {
    reg.registerInit({
      deps: {
        auth: coreServices.auth,
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ auth, catalog, logger }) {
        logger.info('Loaded catalog modules');
        catalog.addProcessor(new ProjectEntityProcessor(auth, logger));
        catalog.addProcessor(new SkillEntityProcessor(auth, logger));
      },
    });
  },
});

export default exchangeCatalogModule;
