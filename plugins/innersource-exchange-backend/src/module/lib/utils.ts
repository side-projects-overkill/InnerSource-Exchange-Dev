import {
  KindValidator,
  entityKindSchemaValidator,
} from '@backstage/catalog-model';
import {
  ProjectData,
  ProjectEntity,
  Skill,
  SkillEntity,
} from 'backstage-plugin-innersource-exchange-common';
import { kebabCase } from 'lodash';

export function ajvCompiledJsonSchemaValidator(schema: unknown): KindValidator {
  let validator: undefined | ((data: unknown) => any);
  return {
    async check(data) {
      if (!validator) {
        validator = entityKindSchemaValidator(schema);
      }
      return validator(data) === data;
    },
  };
}

export function skillToSkillEntity(skill: Skill): SkillEntity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Skill',
    metadata: {
      name: kebabCase(skill.name),
      title: skill.name.trim(),
      skillId: skill.id,
    },
    spec: {
      type: skill.type,
      color: skill.color,
      users: skill.users,
    },
  };
}

export function projectToProjectEntity(project: ProjectData): ProjectEntity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Project',
    metadata: {
      name: kebabCase(project.name),
      title: project.name,
      projectId: project.id,
      description: project.description,
      createdOn: project.createdOn,
      startDate: project.startDate,
      endDate: project.endDate,
    },
    spec: {
      type: project.type,
      owner: project.owner,
      collaborators: project.collaborators,
      skills: project.skills,
      extras: project.extras,
    },
  };
}
