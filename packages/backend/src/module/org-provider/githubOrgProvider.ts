import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import {
  GithubUser,
  TransformerContext,
  defaultOrganizationTeamTransformer,
  defaultUserTransformer,
} from '@backstage/plugin-catalog-backend-module-github';
import { githubOrgEntityProviderTransformsExtensionPoint } from '@backstage/plugin-catalog-backend-module-github-org';
import axios, { AxiosError } from 'axios';

// Helper function to fetch skills using GitHub username
async function fetchUserSkillsFromGitHub(
  baseUrl: string,
  username: string,
  authToken: string,
): Promise<string[]> {
  try {
    const repos = await axios.get(
      `${baseUrl}/users/${username}/repos?type=public`,
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
const myUserTransformer = async (
  user: GithubUser,
  ctx: TransformerContext,
  config: Config,
) => {
  const backstageUser = (await defaultUserTransformer(user, ctx)) as any;
  if (backstageUser) {
    const apiBaseUrl =
      config
        .getOptionalConfigArray('integrations.github')
        ?.at(0)
        ?.getOptionalString('apiBaseUrl') ?? 'https://api.github.com';

    const authToken =
      config
        .getOptionalConfigArray('integrations.github')
        ?.at(0)
        ?.getOptionalString('token') ?? '';
    const skills = await fetchUserSkillsFromGitHub(
      apiBaseUrl,
      user.login,
      authToken,
    );
    backstageUser.metadata.description = 'Loaded from GitHub Org Data';
    backstageUser.spec.skills = skills;
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
      },
      async init({ githubOrg, config }) {
        githubOrg.setUserTransformer((item, ctx) =>
          myUserTransformer(item, ctx, config),
        );
        githubOrg.setTeamTransformer(defaultOrganizationTeamTransformer);
      },
    });
  },
});

export default githubOrgModule;
