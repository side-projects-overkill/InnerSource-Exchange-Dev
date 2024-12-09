import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { innersourceExchangeApiRef, InnersourceExchangeClient } from './api';

export const innersourceExchangePlugin = createPlugin({
  id: 'innersource-exchange',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: innersourceExchangeApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new InnersourceExchangeClient(discoveryApi, fetchApi),
    }),
  ],
});

export const InnersourceExchangePage = innersourceExchangePlugin.provide(
  createRoutableExtension({
    name: 'InnersourceExchangePage',
    component: () =>
      import('./components/InnersourceExchangeGlobal').then(
        m => m.InnersourceExchangeGlobal,
      ),
    mountPoint: rootRouteRef,
  }),
);

export const UserEntitySkillsCard = innersourceExchangePlugin.provide(
  createComponentExtension({
    name: 'UserEntitySkillsCard',
    component: {
      lazy: () => import('./components/SkillsCard').then(m => m.SkillsCard),
    },
  }),
);
