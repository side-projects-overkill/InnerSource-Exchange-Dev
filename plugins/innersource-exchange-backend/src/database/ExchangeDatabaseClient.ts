import { resolvePackagePath } from '@backstage/backend-plugin-api';
import { Knex } from 'knex';
import { ProjectsTableModal, SkillsTableModal } from './types';
import {
  ProjectData,
  Skill,
} from 'backstage-plugin-innersource-exchange-common';
import {
  mapProjectModelToProject,
  mapProjectToProjectModel,
  mapSkillModelToSkill,
  mapSkillToSkillModel,
} from './mapper';

const migrationsDir = resolvePackagePath(
  'backstage-plugin-innersource-exchange-backend',
  'migrations',
);

export class ExchangeDatabaseClient {
  private readonly PROJECTS_TABLE = 'projects';
  private readonly SKILLS = 'skills';

  static async create(knex: Knex, skipMigrations: boolean) {
    if (!skipMigrations) {
      await knex.migrate.latest({ directory: migrationsDir });
    }
    return new ExchangeDatabaseClient(knex);
  }

  constructor(private readonly databsase: Knex) {}

  async insertProject(projectData: ProjectData) {
    const [dbResult] = await this.databsase
      .table<ProjectsTableModal>(this.PROJECTS_TABLE)
      .insert(mapProjectToProjectModel(projectData), '*');
    return mapProjectModelToProject(dbResult);
  }

  async getProjectById(id: string) {
    const [dbResult] = await this.databsase
      .table<ProjectsTableModal>(this.PROJECTS_TABLE)
      .select('*')
      .where('id', id);
    return dbResult ? mapProjectModelToProject(dbResult) : 0;
  }

  async getProjectByName(name: string) {
    const [dbResult] = await this.databsase
      .table<ProjectsTableModal>(this.PROJECTS_TABLE)
      .select('*')
      .where('name', name);
    return dbResult ? mapProjectModelToProject(dbResult) : 0;
  }

  async removeProjectById(id: string) {
    const result = await this.databsase
      .table<ProjectsTableModal>(this.PROJECTS_TABLE)
      .delete()
      .where('id', id);
    return result;
  }

  async insertSkill(skillData: Skill) {
    const [dbResult] = await this.databsase
      .table<SkillsTableModal>(this.SKILLS)
      .insert(mapSkillToSkillModel(skillData), '*');
    return mapSkillModelToSkill(dbResult);
  }

  async getSkillByName(name: string) {
    const [dbResult] = await this.databsase
      .table<SkillsTableModal>(this.SKILLS)
      .select('*')
      .where('name', name);
    return dbResult ? mapSkillModelToSkill(dbResult) : 0;
  }

  async getSkillById(id: string) {
    const [dbResult] = await this.databsase
      .table<SkillsTableModal>(this.SKILLS)
      .select('*')
      .where('id', id);
    return dbResult ? mapSkillModelToSkill(dbResult) : 0;
  }

  async removeSkillById(id: string) {
    const result = await this.databsase
      .table<SkillsTableModal>(this.SKILLS)
      .delete()
      .where('id', id);
    return result;
  }
}
