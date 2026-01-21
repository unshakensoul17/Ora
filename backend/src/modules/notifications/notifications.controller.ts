import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    @Get('preferences/:shopId')
    @ApiOperation({ summary: 'Get notification preferences for a shop' })
    async getPreferences(@Param('shopId') shopId: string) {
        return this.notificationsService.getPreferences(shopId);
    }

    @Put('preferences/:shopId')
    @ApiOperation({ summary: 'Update notification preferences' })
    async updatePreferences(
        @Param('shopId') shopId: string,
        @Body() body: {
            pushEnabled?: boolean;
            emailEnabled?: boolean;
            smsEnabled?: boolean;
            newHolds?: boolean;
            pickups?: boolean;
            returns?: boolean;
            marketing?: boolean;
        }
    ) {
        return this.notificationsService.updatePreferences(shopId, body);
    }

    @Get(':shopId')
    @ApiOperation({ summary: 'Get notifications for a shop' })
    async getNotifications(
        @Param('shopId') shopId: string,
        @Query('limit') limit?: string,
    ) {
        return this.notificationsService.getNotifications(
            shopId,
            limit ? parseInt(limit) : 50,
        );
    }

    @Get(':shopId/unread-count')
    @ApiOperation({ summary: 'Get unread notifications count' })
    async getUnreadCount(@Param('shopId') shopId: string) {
        const count = await this.notificationsService.getUnreadCount(shopId);
        return { count };
    }

    @Post(':notificationId/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    async markAsRead(
        @Param('notificationId') notificationId: string,
        @Body('shopId') shopId: string,
    ) {
        return this.notificationsService.markAsRead(notificationId, shopId);
    }

    @Post('shop/:shopId/read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllAsRead(@Param('shopId') shopId: string) {
        return this.notificationsService.markAllAsRead(shopId);
    }
}
