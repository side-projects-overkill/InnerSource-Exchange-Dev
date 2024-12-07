/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createSpecializedBackend } from '@backstage/backend-app-api';
import { authServiceFactory } from '@backstage/backend-defaults/auth';
import { cacheServiceFactory } from '@backstage/backend-defaults/cache';
import { databaseServiceFactory } from '@backstage/backend-defaults/database';
import { discoveryServiceFactory } from '@backstage/backend-defaults/discovery';
import { httpAuthServiceFactory } from '@backstage/backend-defaults/httpAuth';
import { httpRouterServiceFactory } from '@backstage/backend-defaults/httpRouter';
import { lifecycleServiceFactory } from '@backstage/backend-defaults/lifecycle';
import { loggerServiceFactory } from '@backstage/backend-defaults/logger';
import { permissionsServiceFactory } from '@backstage/backend-defaults/permissions';
import { schedulerServiceFactory } from '@backstage/backend-defaults/scheduler';
import { userInfoServiceFactory } from '@backstage/backend-defaults/userInfo';
import { rootLoggerServiceFactory } from '@backstage/backend-defaults/rootLogger';
import { rootLifecycleServiceFactory } from '@backstage/backend-defaults/rootLifecycle';
import { rootHttpRouterServiceFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { rootHealthServiceFactory } from '@backstage/backend-defaults/rootHealth';
import { rootConfigServiceFactory } from '@backstage/backend-defaults/rootConfig';
import { eventsServiceFactory } from '@backstage/plugin-events-node';

import { urlReaderServiceFactory } from './module/urlReader';

const defaultServiceFactories = [
  authServiceFactory,
  cacheServiceFactory,
  databaseServiceFactory,
  discoveryServiceFactory,
  httpAuthServiceFactory,
  httpRouterServiceFactory,
  lifecycleServiceFactory,
  loggerServiceFactory,
  permissionsServiceFactory,
  schedulerServiceFactory,
  userInfoServiceFactory,
  rootLoggerServiceFactory,
  rootLifecycleServiceFactory,
  rootHttpRouterServiceFactory,
  rootHealthServiceFactory,
  rootConfigServiceFactory,
  eventsServiceFactory,
  urlReaderServiceFactory,
];

const backend = createSpecializedBackend({
  defaultServiceFactories,
});

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
// See https://backstage.io/docs/auth/guest/provider
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

// exchange plugin
backend.add(import('backstage-plugin-innersource-exchange-backend'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('backstage-plugin-innersource-exchange-backend/module'));
backend.add(import('./module/githubOrgProvider'));
backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);
backend.add(import('@backstage/plugin-catalog-backend-module-unprocessed'));

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
// See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

backend.start();
