import { taskSelect } from './task.select';

export const taskDetailSelect = {
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
  },

  comments: {
    orderBy: {
      createdAt: 'asc' as const
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  }
};
