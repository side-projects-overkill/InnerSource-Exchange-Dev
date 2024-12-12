import { createApiRef } from '@backstage/core-plugin-api';
import {
  ProjectData,
  Skill,
} from 'backstage-plugin-innersource-exchange-common';

export const innersourceExchangeApiRef = createApiRef<InnersourceExchangeApi>({
  id: 'innersource-exchange',
});

export interface InnersourceExchangeApi {
  addSkill(data: Skill): Promise<any>;
  addNewProject(data: ProjectData): Promise<any>;
}
