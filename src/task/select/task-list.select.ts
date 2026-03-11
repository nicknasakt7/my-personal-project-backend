import { taskSelect } from './task.select';

export const taskListSelect = {
  ...taskSelect,

  project: {
    select: {
      id: true,
      title: true
    }
  },

  assignTo: {
    select: {
      id: true,
      firstName: true,
      lastName: true
    }
  },

  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true
    }
  }
};
