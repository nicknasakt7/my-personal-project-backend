import { Controller, Delete, Patch, Post } from '@nestjs/common';

@Controller('comments')
export class CommentController {
  @Post()
  async createComment() {}

  @Patch(':id')
  async updateComment() {}

  @Delete(':id')
  async deleteComment() {}
}
