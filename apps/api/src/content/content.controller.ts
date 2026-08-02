import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { PlatformAdminGuard } from '../platform/guards/platform-admin.guard';
import { ContentService } from './content.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('blog')
  @ApiOperation({ summary: 'List published blog posts' })
  listBlogPosts() {
    return this.contentService.listPublishedPosts();
  }

  @Get('blog/:slug')
  @ApiOperation({ summary: 'Get published blog post by slug' })
  getBlogPost(@Param('slug') slug: string) {
    return this.contentService.getPublishedPost(slug);
  }

  @Post('blog')
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create blog post (platform admin)' })
  createBlogPost(@Body() dto: CreateBlogPostDto) {
    return this.contentService.createPost(dto);
  }
}
