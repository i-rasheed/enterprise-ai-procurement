import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  listPublishedPosts() {
    return this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        authorName: true,
        publishedAt: true,
      },
    });
  }

  async getPublishedPost(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, published: true },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  createPost(dto: CreateBlogPostDto) {
    return this.prisma.blogPost.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        authorName: dto.authorName,
        published: dto.published ?? false,
        publishedAt: dto.published ? new Date() : null,
      },
    });
  }
}
