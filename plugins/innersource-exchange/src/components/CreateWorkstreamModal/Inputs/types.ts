import { SystemEntity, UserEntity } from '@backstage/catalog-model';

interface TJiraProject {
  key: string;
  name: string;
}

export type Form2 = {
  kind: { label: string; value: string } | null;
  searchQuery: UserEntity | null;
  selectedMembers: TableRowDataType[];
};

export type Form1 = {
  workstreamName: string | undefined;
  description?: string;
  lead?: UserEntity;
  pillar?: string;
  jiraProject?: TJiraProject;
  email?: string;
  slackChannelUrl?: string;
  portfolio: SystemEntity[];
};

export interface TableRowDataType {
  user: UserEntity;
  role?: string;
}
