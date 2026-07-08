// Enforces string types that match our PostgreSQL ENUM values exactly

export type ProjectStatus = 'active' | 'on hold' | 'completed';

// Reflects the exact relational schema layout from our database

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  deadline: string; //YYYY-MM-DD
  assigned_member: string;
  budget: number;
  created_at: string;
}