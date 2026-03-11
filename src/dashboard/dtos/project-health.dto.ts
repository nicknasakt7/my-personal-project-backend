export class ProjectHealthDto {
  projectId: string;
  projectTitle: string;
  dueDate: Date | null;
  completedTask: number;
  totalTask: number;
  progressPercent: number;
  status: 'ON_TRACK' | 'DELAYED' | 'OVERDUE';
}
