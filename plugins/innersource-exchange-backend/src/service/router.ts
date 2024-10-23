import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import {
  ProjectData,
  Skill,
} from 'backstage-plugin-innersource-exchange-common';
import { CatalogApi } from '@backstage/catalog-client';
import { ExchangeDatabaseClient } from '../database';
import {
  projectToProjectEntity,
  skillToSkillEntity,
} from '../module/lib/utils';
import shortUUID from 'short-uuid';
import { kebabCase } from 'lodash';

export type RouterOptions = {
  logger: LoggerService;
  config: RootConfigService;
  database: ExchangeDatabaseClient;
  auth: AuthService;
  catalog: CatalogApi;
  discovery: DiscoveryService;
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, auth, database, catalog, discovery } = options;

  const router = Router();
  router.use(express.json());

  const apiBaseUrl = await discovery.getBaseUrl('innersource-exchange');

  async function getCatalogPluginToken() {
    return await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });
  }

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  // Skill routes
  router.post('/skill', async (req, res) => {
    const skillData = req.body.data as Skill;
    if (!skillData.name) {
      res.status(400).json({ message: 'Forget to send name?' });
      return;
    }

    skillData.id = shortUUID().generate();

    if (await database.getSkillByName(skillData.name)) {
      res.json({ message: 'The skill already exists' });
      return;
    }

    const result = await database.insertSkill(skillData);

    await catalog.addLocation(
      { target: `${apiBaseUrl}/skill/${skillData.id}`, type: 'url' },
      await getCatalogPluginToken(),
    );
    res.json({
      data: result,
      message: 'Skill created successfully',
    });
  });

  router.get('/skill/:id', async (req, res) => {
    const result = await database.getSkillById(req.params.id);
    if (!result) {
      res.status(404).json({ message: 'Skill not found' });
      return;
    }
    res.json(skillToSkillEntity(result));
  });

  router.delete('/skill/:id', async (req, res) => {
    const data = await database.getSkillById(req.params.id);
    if (!data) {
      res.status(404).json({ message: 'Skill not found' });
      return;
    }
    // remove from catalog
    const token = await getCatalogPluginToken();
    const currLoc = await catalog.getLocationByEntity(
      `skill:default/${kebabCase(data.name)}`,
      token,
    );
    if (currLoc) await catalog.removeLocationById(currLoc.id, token);
    // delete from database
    await database.removeSkillById(data.id);
    res.status(200).json({ message: 'deleted successfully' });
  });

  // Project Routes
  router.post('/project', async (req, res) => {
    const projectData = req.body.data as ProjectData;
    if (!projectData.name) {
      res.status(400).json({ message: 'Request body incomplete' });
      return;
    }
    if (await database.getProjectByName(projectData.name)) {
      res.json({ message: 'The project already exists' });
      return;
    }

    projectData.id = shortUUID().generate();
    projectData.createdOn = new Date().toISOString();

    const result = await database.insertProject(projectData);
    await catalog.addLocation(
      { target: `${apiBaseUrl}/project/${projectData.id}`, type: 'url' },
      await getCatalogPluginToken(),
    );
    res.json({ data: result, message: 'Project created successfully' });
  });

  router.get('/project/:id', async (req, res) => {
    const result = await database.getProjectById(req.params.id);
    if (!result) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    res.json(projectToProjectEntity(result));
  });

  router.delete('/project/:id', async (req, res) => {
    const data = await database.getProjectById(req.params.id);
    if (!data) {
      res.status(404).json({ message: 'Skill not found' });
      return;
    }
    // remove from catalog
    const token = await getCatalogPluginToken();
    const currLoc = await catalog.getLocationByEntity(
      `project:default/${kebabCase(data.name)}`,
      token,
    );
    if (currLoc) await catalog.removeLocationById(currLoc.id, token);
    // delete from database
    await database.removeProjectById(data.id);
    res.status(200).json({ message: 'deleted successfully' });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
