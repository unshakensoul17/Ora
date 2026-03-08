import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as XLSX from 'xlsx';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getSalesReport(shopId: string, startDate?: Date, endDate?: Date) {
        const where: any = {
            Booking: { shopId },
            status: 'SUCCESS'
        };

        if (startDate || endDate) {
            where.recordedAt = {};
            if (startDate) where.recordedAt.gte = startDate;
            if (endDate) where.recordedAt.lte = endDate;
        }

        const payments = await this.prisma.payment.findMany({
            where,
            include: {
                Booking: {
                    include: {
                        item: { select: { name: true, category: true } },
                        user: { select: { name: true, phone: true } },
                        customer: { select: { name: true, phone: true } }
                    }
                }
            },
            orderBy: { recordedAt: 'desc' }
        });

        const reportData = payments.map(p => ({
            'Date': p.recordedAt.toISOString().split('T')[0],
            'Booking ID': p.bookingId,
            'Customer': p.Booking.customer?.name || p.Booking.user?.name || 'Walk-in',
            'Phone': p.Booking.customer?.phone || p.Booking.user?.phone || 'N/A',
            'Item': p.Booking.item.name,
            'Category': p.Booking.item.category,
            'Amount': p.amount,
            'Method': p.method || 'N/A'
        }));

        return this.exportToBuffer(reportData, 'Sales_Report');
    }

    async getInventoryReport(shopId: string) {
        const items = await this.prisma.inventoryItem.findMany({
            where: { shopId },
            orderBy: { timesRented: 'desc' }
        });

        const reportData = items.map(item => ({
            'Item ID': item.id,
            'Name': item.name,
            'Category': item.category,
            'Rental Price': item.rentalPrice,
            'Security Deposit': item.securityDeposit,
            'Times Rented': item.timesRented,
            'Status': item.status,
            'Created At': item.createdAt.toISOString().split('T')[0]
        }));

        return this.exportToBuffer(reportData, 'Inventory_Report');
    }

    async getCustomerReport(shopId: string) {
        // Fetch bookings to identify unique customers
        const bookings = await this.prisma.booking.findMany({
            where: { item: { shopId } },
            include: {
                user: { select: { id: true, name: true, phone: true, email: true } },
                customer: { select: { id: true, name: true, phone: true } }
            }
        });

        // Map customers (either registered users or walk-in customers)
        const customerMap = new Map<string, any>();

        bookings.forEach(b => {
            const userId = b.userId || b.customerId;
            if (!userId) return;

            const name = b.customer?.name || b.user?.name || 'Unknown';
            const phone = b.customer?.phone || b.user?.phone || 'N/A';
            const email = b.user?.email || 'N/A';

            if (!customerMap.has(userId)) {
                customerMap.set(userId, {
                    'Name': name,
                    'Phone': phone,
                    'Email': email,
                    'Total Bookings': 0,
                    'Total Spent': 0,
                    'First Visit': b.createdAt,
                    'Last Visit': b.createdAt
                });
            }

            const stats = customerMap.get(userId);
            stats['Total Bookings'] += 1;
            stats['Total Spent'] += b.platformPrice || 0;
            if (b.createdAt < stats['First Visit']) stats['First Visit'] = b.createdAt;
            if (b.createdAt > stats['Last Visit']) stats['Last Visit'] = b.createdAt;
        });

        const reportData = Array.from(customerMap.values()).map(c => ({
            ...c,
            'First Visit': c['First Visit'].toISOString().split('T')[0],
            'Last Visit': c['Last Visit'].toISOString().split('T')[0]
        }));

        return this.exportToBuffer(reportData, 'Customer_Insights');
    }

    private exportToBuffer(data: any[], sheetName: string): Buffer {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Return buffer
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }
}
