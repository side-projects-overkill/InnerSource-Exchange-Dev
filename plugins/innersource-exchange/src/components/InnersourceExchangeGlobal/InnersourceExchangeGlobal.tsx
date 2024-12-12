import {
  Content,
  PageWithHeader,
  TabbedLayout,
} from '@backstage/core-components';
import React from 'react';
import { ProjectsTabContent } from './Projects';
import { SkillsTabContent } from './Skills';
import { EntityListProvider } from '@backstage/plugin-catalog-react';

export const InnersourceExchangeGlobal = () => {
  return (
    <PageWithHeader themeId="home" title="InnerSource Exchange">
      <Content stretch noPadding>
        <EntityListProvider pagination={{ limit: 100 }}>
          <TabbedLayout>
            <TabbedLayout.Route path="projects" title="Projects">
              <ProjectsTabContent />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="skills" title="Skills">
              <SkillsTabContent />
            </TabbedLayout.Route>
          </TabbedLayout>
        </EntityListProvider>
      </Content>
    </PageWithHeader>
  );
};
