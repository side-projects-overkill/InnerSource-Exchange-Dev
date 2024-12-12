import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { InnersourceExchangeApi } from './InnersourceExchangeApi';
import {
  ProjectData,
  Skill,
} from 'backstage-plugin-innersource-exchange-common';

export class InnersourceExchangeClient implements InnersourceExchangeApi {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  async getBaseUrl() {
    return await this.discoveryApi.getBaseUrl('innersource-exchange');
  }

  async addSkill(data: Skill) {
    const baseURL = `${await this.getBaseUrl()}/skill`;
    const resp = await this.fetchApi.fetch(baseURL, {
      method: 'POST',
      body: JSON.stringify({ data }),
      headers: {
        'content-type': 'application/json',
      },
    });
    return await resp.json();
  }

  async addNewProject(data: ProjectData) {
    const baseURL = `${await this.getBaseUrl()}/project`;
    const resp = await this.fetchApi.fetch(baseURL.toString(), {
      method: 'POST',
      body: JSON.stringify({ data }),
      headers: {
        'content-type': 'application/json',
      },
    });
    return await resp.json();
  }
}
