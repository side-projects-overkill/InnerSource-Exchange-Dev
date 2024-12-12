import { UserEntity } from '@backstage/catalog-model';
import { SkillEntity } from 'backstage-plugin-innersource-exchange-common';

export type Form2 = {
  searchQuery: UserEntity | null;
  selectedMembers: TableRowDataType[];
};

export type Form1 = {
  name: string | undefined;
  description?: string;
  owner?: UserEntity;
  skills: SkillEntity[];
  startDate?: string;
  endDate?: string;
  type?: string;
};

export interface TableRowDataType {
  user: UserEntity;
  role?: string;
}
