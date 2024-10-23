import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { ExchangeDatabaseClient } from './database';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

/**
 * innersourceExchangePlugin backend plugin
 *
 * @public
 */
export const innersourceExchangePlugin = createBackendPlugin({
  pluginId: 'innersource-exchange',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        databaseService: coreServices.database,
        auth: coreServices.auth,
        catalog: catalogServiceRef,
        discovery: coreServices.discovery,
      },
      async init({
        httpRouter,
        logger,
        discovery,
        config,
        auth,
        databaseService,
        catalog,
      }) {
        const database = await ExchangeDatabaseClient.create(
          await databaseService.getClient(),
          false,
        );

        httpRouter.use(
          await createRouter({
            logger,
            config,
            auth,
            database,
            catalog,
            discovery,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
