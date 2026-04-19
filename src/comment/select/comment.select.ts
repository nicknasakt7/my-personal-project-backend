export const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    }
  }
};
