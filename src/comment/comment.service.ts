import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { RoleType } from 'src/database/generate/database/prisma/enums';

import { PrismaService } from 'src/database/prisma.service';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { CommentResponseDto } from './dtos/comment-response.dto';

import { commentSelect } from './select/comment.select';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async updateComment(
    currentUserId: string,
    id: string,
    updateCommentDto: UpdateCommentDto
  ): Promise<CommentResponseDto> {
    const comment = await this.prisma.comment.findFirst({
      where: { id, deletedAt: null }
    });
    if (!comment) {
      throw new NotFoundException({
        message: 'Comment not found',
        code: 'COMMENT_NOT_FOUND'
      });
    }
    if (comment.userId !== currentUserId) {
      throw new ForbiddenException({
        message: 'You cannot update this comment',
        code: 'COMMENT_FORBIDDEN'
      });
    }
    const updatedComment = await this.prisma.comment.update({
      where: { id },
      data: { content: updateCommentDto.content },
      select: commentSelect
    });
    return updatedComment;
  }

  async deleteComment(
    currentUserId: string,
    role: RoleType,
    commentId: string
  ): Promise<void> {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        deletedAt: null
      },
      include: {
        task: {
          select: {
            assignToId: true,
            createdById: true
          }
        }
      }
    });

    if (!comment) {
      throw new NotFoundException({
        message: 'Comment not found',
        code: 'COMMENT_NOT_FOUND'
      });
    }

    const isEmployee =
      role === RoleType.EMPLOYEE && comment.task.assignToId === currentUserId;

    const isAdmin =
      role === RoleType.ADMIN && comment.task.createdById === currentUserId;

    const isSuperAdmin = role === RoleType.SUPER_ADMIN;

    if (!isEmployee && !isAdmin && !isSuperAdmin) {
      throw new ForbiddenException({
        message: 'You cannot delete this comment',
        code: 'COMMENT_FORBIDDEN'
      });
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        deletedAt: new Date()
      }
    });
  }
}
