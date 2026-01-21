import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupportCategory, TicketPriority } from '@prisma/client';

@Injectable()
export class SupportService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create a new support ticket
     */
    async createTicket(shopId: string, data: {
        category: SupportCategory;
        subject: string;
        message: string;
    }) {
        const ticket = await this.prisma.supportTicket.create({
            data: {
                shopId,
                category: data.category,
                subject: data.subject,
                message: data.message,
                priority: this.determinePriority(data.category, data.subject),
            },
        });

        // TODO: Send email notification to support team
        // TODO: Create notification for shop

        return ticket;
    }

    /**
     * Get all tickets for a shop
     */
    async getShopTickets(shopId: string) {
        return this.prisma.supportTicket.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get a specific ticket
     */
    async getTicket(ticketId: string, shopId: string) {
        const ticket = await this.prisma.supportTicket.findFirst({
            where: {
                id: ticketId,
                shopId: shopId,
            },
        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        return ticket;
    }

    /**
     * Update ticket status (admin function)
     */
    async updateTicketStatus(ticketId: string, status: string) {
        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                status: status as any,
                resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : null,
            },
        });
    }

    /**
     * Auto-determine ticket priority based on category and subject
     */
    private determinePriority(category: SupportCategory, subject: string): TicketPriority {
        const urgentKeywords = ['urgent', 'emergency', 'critical', 'down', 'not working', 'payment failed'];
        const subjectLower = subject.toLowerCase();

        if (urgentKeywords.some(keyword => subjectLower.includes(keyword))) {
            return 'HIGH';
        }

        if (category === 'BILLING') {
            return 'HIGH';
        }

        if (category === 'TECHNICAL') {
            return 'NORMAL';
        }

        return 'NORMAL';
    }

    /**
     * Get ticket statistics for a shop
     */
    async getTicketStats(shopId: string) {
        const tickets = await this.prisma.supportTicket.findMany({
            where: { shopId },
        });

        return {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'OPEN').length,
            inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
            resolved: tickets.filter(t => t.status === 'RESOLVED').length,
            closed: tickets.filter(t => t.status === 'CLOSED').length,
        };
    }
}
