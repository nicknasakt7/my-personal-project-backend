export const projectSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  dueDate: true,
  projectMembers: {
    select: {
      userId: true
    }
  },
  createdById: true,
  createdAt: true,
  updatedAt: true
};
