import { Exclude, Expose, Type } from 'class-transformer';
import { CommentResponseDto } from './comment-response.dto';

@Exclude()
export class CommentPaginationDto {
  @Expose()
  @Type(() => CommentResponseDto)
  data: CommentResponseDto[];

  @Expose()
  nextCursor: string | null;
}
