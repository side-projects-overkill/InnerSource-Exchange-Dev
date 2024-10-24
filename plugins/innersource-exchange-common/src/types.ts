import { Entity } from '@backstage/catalog-model';

export type Skill = {
  id: string;
  name: string;
  color: string;
  type: string;
  users: string[];
};

export type ProjectData = {
  id: string;
  name: string;
  description: string;
  owner: string;
  startDate?: string;
  endDate?: string;
  skills: string[];
  collaborators: string[];
  type?: string;
  createdOn: string;
  extras?: object;
};

export type ProjectEntity = Entity & {
  apiVersion: 'backstage.io/v1alpha1';
  kind: 'Project';
  metadata: {
    name: string;
    title?: string;
    description?: string;
    createdOn?: string;
    startDate?: string;
    endDate?: string;
    projectId: string;
  };
  spec: {
    type?: string;
    owner: string;
    skills: string[];
    collaborators: string[];
    extras?: object;
  };
};

export type SkillEntity = Entity & {
  apiVersion: 'backstage.io/v1alpha1';
  kind: 'Skill';
  metadata: {
    name: string;
    title?: string;
    skillId: string;
  };
  spec: {
    color?: string;
    type?: string;
    users: string[];
  };
};
