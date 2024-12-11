import { UserEntity } from '@backstage/catalog-model';
import { CustomUserEntity, TableRowDataType } from '../../../types';

export type Form2 = {
  kind: { label: string; value: string } | null;
  searchQuery: UserEntity | null;
  selectedMembers: TableRowDataType[];
};

export type Form1 = {
  name: string | undefined;
  description?: string;
  owner: CustomUserEntity;
  skills: CustomUserEntity;
  startDate?: string;
  endDate?: string;
  type?: string;
};

export interface TableRowDataType {
  user: UserEntity;
  role?: string;
}
