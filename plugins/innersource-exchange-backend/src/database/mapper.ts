import {
  ProjectData,
  Skill,
} from 'backstage-plugin-innersource-exchange-common';
import { ProjectsTableModal, SkillsTableModal } from './types';

export function mapProjectModelToProject(
  projectModel: ProjectsTableModal,
): ProjectData {
  return JSON.parse(projectModel.project_data);
}

export function mapProjectToProjectModel(
  project: ProjectData,
): ProjectsTableModal {
  return {
    id: project.id,
    name: project.name,
    project_data: JSON.stringify(project),
  };
}

export function mapSkillModelToSkill(skillModel: SkillsTableModal): Skill {
  return {
    ...skillModel,
    users: JSON.parse(skillModel.users),
  };
}

export function mapSkillToSkillModel(skill: Skill): SkillsTableModal {
  return {
    ...skill,
    users: JSON.stringify(skill.users),
  };
}
