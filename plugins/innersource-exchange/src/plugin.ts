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
      import('./components/MarketPlace').then(m => m.MarketPlacePage),
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
