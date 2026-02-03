import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async findAll(shopId: string, search?: string) {
        return this.prisma.customer.findMany({
            where: {
                shopId,
                OR: search ? [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                ] : undefined,
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string, shopId: string) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, shopId },
        });
        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }

    async create(shopId: string, dto: CreateCustomerDto) {
        const existing = await this.prisma.customer.findUnique({
            where: { phone: dto.phone },
        });
        if (existing) throw new ConflictException('Customer with this phone already exists');

        return this.prisma.customer.create({
            data: {
                ...dto,
                shopId,
            },
        });
    }

    async update(id: string, shopId: string, dto: UpdateCustomerDto) {
        await this.findOne(id, shopId);
        return this.prisma.customer.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string, shopId: string) {
        await this.findOne(id, shopId);
        return this.prisma.customer.delete({
            where: { id },
        });
    }
}
