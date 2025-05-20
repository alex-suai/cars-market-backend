import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Sale } from '../entities/sale.entity';

@Injectable()
export class SalesService {
    constructor(
        private readonly dataSource: DataSource,
    ) { }

    private getBaseQuery() {
        return `
            SELECT
                s.id,
                s.profit,
                s.tax_sum,
                s.discount_amount,
                ct.contract_number,
                car.vin as car_vin
            FROM sales s
            LEFT JOIN contracts ct ON s.contract_id = ct.id
            LEFT JOIN cars car ON ct.car_id = car.id
        `;
    }

    async findAll(): Promise<Sale[]> {
        const query = this.getBaseQuery();
        return this.dataSource.query(query) as Promise<Sale[]>;
    }

    async findOne(id: number): Promise<Sale> {
        const query = this.getBaseQuery() + ` WHERE s.id = $1`;
        const [result] = await this.dataSource.query(query, [id]);

        if (!result) {
            throw new NotFoundException(`Продажа с id ${id} не найдена`);
        }

        return result as Sale;
    }

    async findWithFilters(filters: {
        minProfit?: number;
        maxProfit?: number;
        minTax?: number;
        maxTax?: number;
    }): Promise<Sale[]> {
        let query = this.getBaseQuery();
        const params = [];
        const conditions = [];
        let paramIndex = 1;

        if (filters.minProfit !== undefined) {
            conditions.push(`s.profit >= $${paramIndex}`);
            params.push(filters.minProfit);
            paramIndex++;
        }
        if (filters.maxProfit !== undefined) {
            conditions.push(`s.profit <= $${paramIndex}`);
            params.push(filters.maxProfit);
            paramIndex++;
        }
        if (filters.minTax !== undefined) {
            conditions.push(`s.tax_sum >= $${paramIndex}`);
            params.push(filters.minTax);
            paramIndex++;
        }
        if (filters.maxTax !== undefined) {
            conditions.push(`s.tax_sum <= $${paramIndex}`);
            params.push(filters.maxTax);
            paramIndex++;
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        return this.dataSource.query(query, params) as Promise<Sale[]>;
    }

}
