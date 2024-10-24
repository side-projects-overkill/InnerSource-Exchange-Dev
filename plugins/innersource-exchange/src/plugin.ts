import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const innersourceExchangePlugin = createPlugin({
  id: 'innersource-exchange',
  routes: {
    root: rootRouteRef,
  },
});

export const InnersourceExchangePage = innersourceExchangePlugin.provide(
  createRoutableExtension({
    name: 'InnersourceExchangePage',
    component: () =>
      import('./components/InnersourceExchangeGlobal').then(m => m.InnersourceExchangeGlobal),
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
