import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  SerializeOptions,
  UseInterceptors
} from '@nestjs/common';

import { CommentService } from './comment.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { CurrentUserRole } from 'src/auth/decorators/current-user-role.decorator';
import { RoleType } from 'src/database/generate/database/prisma/enums';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { CommentResponseDto } from './dtos/comment-response.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @SerializeOptions({ type: CommentResponseDto })
  @Patch(':id')
  async updateComment(
    @CurrentUser() user: JwtPayload,

    @Param('id', ParseUUIDPipe) commentId: string,
    @Body() updateCommentDto: UpdateCommentDto
  ): Promise<CommentResponseDto> {
    return this.commentService.updateComment(
      user.sub,

      commentId,
      updateCommentDto
    );
  }

  @SerializeOptions({ type: CommentResponseDto })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteComment(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    return this.commentService.deleteComment(user.sub, role, id);
  }
}
