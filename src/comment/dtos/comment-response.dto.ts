import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CommentResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;

  @Expose()
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}
