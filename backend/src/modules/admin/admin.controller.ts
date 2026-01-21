import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
    constructor(private prisma: PrismaService) { }

    @Get('audit-logs')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get audit logs' })
    async getAuditLogs(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            this.prisma.auditLog.count(),
        ]);

        return {
            logs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        };
    }
}
