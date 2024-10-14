import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { innersourceExchangePlugin, InnersourceExchangePage } from '../src/plugin';

createDevApp()
  .registerPlugin(innersourceExchangePlugin)
  .addPage({
    element: <InnersourceExchangePage />,
    title: 'Root Page',
    path: '/innersource-exchange',
  })
  .render();
