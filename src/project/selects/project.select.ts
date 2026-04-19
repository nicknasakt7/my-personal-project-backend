export const projectSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  dueDate: true,
  projectMembers: {
    select: {
      userId: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          position: true,
          profileImageUrl: true,
        },
      },
    },
  },
  _count: {
    select: {
      tasks: true
    }
  },
  createdById: true,
  createdBy: {
    select: {
      firstName: true,
      lastName: true,
      position: true,
      profileImageUrl: true,
    },
  },
  createdAt: true,
  updatedAt: true
};
