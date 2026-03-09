import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  // async createComment(
  //   currentUserId: string,
  //   role: RoleType
  // ): Promise<CommentResponseDto> {}

  async updateComment() {}

  async deleteComment() {}
}
