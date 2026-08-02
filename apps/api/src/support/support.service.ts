import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupportPriority, SupportTicketStatus } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { ReplySupportTicketDto } from './dto/reply-support-ticket.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async listTickets(organisationId: string, userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { organisationId, userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: 1 },
      },
    });
  }

  async createTicket(
    organisationId: string,
    userId: string,
    dto: CreateSupportTicketDto,
  ) {
    return this.prisma.supportTicket.create({
      data: {
        organisationId,
        userId,
        subject: dto.subject,
        priority: dto.priority ?? SupportPriority.NORMAL,
        messages: {
          create: {
            userId,
            body: dto.message,
          },
        },
      },
      include: { messages: true },
    });
  }

  async getTicket(organisationId: string, userId: string, ticketId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, organisationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return ticket;
  }

  async reply(
    organisationId: string,
    userId: string,
    ticketId: string,
    dto: ReplySupportTicketDto,
  ) {
    await this.getTicket(organisationId, userId, ticketId);

    return this.prisma.supportMessage.create({
      data: {
        ticketId,
        userId,
        body: dto.message,
      },
    });
  }

  async listAllTickets() {
    return this.prisma.supportTicket.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        organisation: { select: { id: true, name: true, slug: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  async updateTicketStatus(ticketId: string, status: SupportTicketStatus) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });
  }
}
