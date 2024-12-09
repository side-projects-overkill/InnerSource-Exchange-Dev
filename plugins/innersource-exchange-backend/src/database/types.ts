export type ProjectsTableModal = {
  id: string;
  name: string;
  project_data: string; // JSON.stringify( Project type)
};

export type SkillsTableModal = {
  id?: string;
  name: string;
  type: string;
  color: string;
  users: string; // JSON.stringify( userRefs[] )
};
