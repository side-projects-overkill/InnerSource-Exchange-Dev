import {
  AuthService,
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { data as colorsMap } from '../constants/colours';

import {
  GithubUser,
  TransformerContext,
  defaultOrganizationTeamTransformer,
  defaultUserTransformer,
} from '@backstage/plugin-catalog-backend-module-github';
import { githubOrgEntityProviderTransformsExtensionPoint } from '@backstage/plugin-catalog-backend-module-github-org';
import axios, { AxiosError } from 'axios';
import { SkillEntity } from 'backstage-plugin-innersource-exchange-common';
import { stringifyEntityRef } from '@backstage/catalog-model';

// Helper function to fetch skills using GitHub username
async function fetchUserSkillsFromGitHub(
  baseUrl: string,
  username: string,
  authToken: string,
): Promise<string[]> {
  try {
    const repos = await axios.get(
      `${baseUrl}/users/${username}/repos?type=owner`,
      {
        ...(authToken.length > 0 && {
          headers: {
            Authorization: `token ${authToken}`,
          },
        }),
      },
    );
    const skills = new Set<string>();

    for (const repo of repos.data) {
      try {
        const languages = await axios.get(repo.languages_url, {
          ...(authToken.length > 0 && {
            headers: {
              Authorization: `token ${authToken}`,
            },
          }),
        });
        Object.keys(languages.data).forEach(lang => skills.add(lang));
      } catch (error) {
        console.error(`Error Fetching ${repo.languages_url}`);
      }
    }

    return Array.from(skills);
  } catch (error) {
    console.error(
      `Error fetching skills for ${username}:`,
      (error as AxiosError).response?.data,
    );
    return [];
  }
}

// This user transformer makes use of the built in logic, but also sets the description field
const myUserTransformer = async (options: {
  user: GithubUser;
  ctx: TransformerContext;
  config: Config;
  auth: AuthService;
  innersourceApiBaseUrl: string;
}) => {
  const { ctx, user, auth, innersourceApiBaseUrl, config } = options;
  const backstageUser = await defaultUserTransformer(user, ctx);
  if (backstageUser) {
    const apiBaseUrl =
      config
        .getOptionalConfigArray('integrations.github')
        ?.at(0)
        ?.getOptionalString('apiBaseUrl') ?? 'https://api.github.com';

    const ghAuthToken =
      config
        .getOptionalConfigArray('integrations.github')
        ?.at(0)
        ?.getOptionalString('token') ?? '';
    const skills = await fetchUserSkillsFromGitHub(
      apiBaseUrl,
      user.login,
      ghAuthToken,
    );
    backstageUser.metadata.description = 'Loaded from GitHub Org Data';

    const credentials = await auth.getPluginRequestToken({
      targetPluginId: 'innersource-exchange',
      onBehalfOf: await auth.getOwnServiceCredentials(),
    });

    for (const skill of skills) {
      const resp = await axios.get<SkillEntity>(
        `${innersourceApiBaseUrl}/skill/${skill}`,
        {
          headers: { Authorization: `bearer ${credentials.token}` },
          validateStatus: status => status < 500,
        },
      );
      if (resp.status === 404) {
        await axios.post(
          `${innersourceApiBaseUrl}/skill`,
          {
            data: {
              name: skill,
              color: colorsMap[skill].color ?? '#333',
              type: 'Language',
              users: [stringifyEntityRef(backstageUser)],
            },
          },
          {
            headers: { Authorization: `bearer ${credentials.token}` },
            validateStatus: status => status < 500,
          },
        );
      } else {
        const usersSet = new Set<string>(resp.data.spec.users).add(
          stringifyEntityRef(backstageUser),
        );
        await axios.put(
          `${innersourceApiBaseUrl}/skill/${resp.data.metadata.skillId}`,
          {
            data: {
              users: Array.from(usersSet),
            },
          },
          {
            headers: { Authorization: `bearer ${credentials.token}` },
            validateStatus: status => status < 500,
          },
        );
      }
    }
  }
  return backstageUser;
};

const githubOrgModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'github-org-extensions',
  register: reg => {
    reg.registerInit({
      deps: {
        githubOrg: githubOrgEntityProviderTransformsExtensionPoint,
        config: coreServices.rootConfig,
        auth: coreServices.auth,
        discovery: coreServices.discovery,
      },
      async init({ githubOrg, config, discovery, auth }) {
        const innersourceApiBaseUrl = `${await discovery.getBaseUrl(
          'innersource-exchange',
        )}`;
        githubOrg.setUserTransformer((item, ctx) =>
          myUserTransformer({
            user: item,
            ctx,
            config,
            auth,
            innersourceApiBaseUrl,
          }),
        );
        githubOrg.setTeamTransformer(defaultOrganizationTeamTransformer);
      },
    });
  },
});

export default githubOrgModule;
