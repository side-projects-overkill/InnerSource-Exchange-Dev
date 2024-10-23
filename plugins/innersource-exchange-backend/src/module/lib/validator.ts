import ProjectEntitySchema from '../schemas/Project.v1alpha1.schema.json';
import SkillEntitySchema from '../schemas/Skill.v1alpha1.schema.json';
import { ajvCompiledJsonSchemaValidator } from './utils';

export const projectEntityValidator =
  ajvCompiledJsonSchemaValidator(ProjectEntitySchema);

export const skillEntityValidator =
  ajvCompiledJsonSchemaValidator(SkillEntitySchema);
