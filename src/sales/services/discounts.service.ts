import { Injectable, NotFoundException } from '@nestjs/common';
import { Discount } from '../entities';
import { DiscountDto } from '../dto/discount.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class DiscountsService {
    constructor(
            private readonly dataSource: DataSource,
        ) { }
    
        private getBaseQuery() {
            return `
                SELECT 
                    d.*,
                    array_agg(c.contract_number) as contract_numbers
                FROM discounts d
                LEFT JOIN discount_sales ds ON ds.discount_id = d.id
                LEFT JOIN contracts c ON c.id = ds.contract_id
                GROUP BY d.id
            `;
        }
    
    async findAll(): Promise<Discount[]> {
            return this.dataSource.query(this.getBaseQuery()) as Promise<Discount[]>
        }
    
    async findOne(id: number): Promise<Discount> {
            const query = this.getBaseQuery() + ` WHERE d.id = $1 `;
    
            const [result] = await this.dataSource.query(query, [id]);
    
            if (!result) {
                throw new NotFoundException(`Скидка с id ${id} не найден`);
            }
    
        return result as Discount;
        }
    
    async create(creatediscountDto: DiscountDto): Promise<Discount> {
        const query1 = `
            INSERT INTO discounts (
                description, start_date, end_date, amount
            ) VALUES (
                $1, $2, $3, $4
            ) RETURNING id
        `;

        const params1 = [
            creatediscountDto.description,
            creatediscountDto.start_date,
            creatediscountDto.end_date,
            creatediscountDto.amount
        ];

        const result1 = await this.dataSource.query(query1, params1);
        const discountId = result1[0].id;

        const contractIds = creatediscountDto.contract_ids; // массив айди

        // Формируем плоский массив параметров и массив подстановок
        const values: string[] = [];
        const params2: any[] = [];

        contractIds.forEach((contractId, index) => {
            const i = index * 2;
            values.push(`($${i + 1}, $${i + 2})`);
            params2.push(contractId, discountId);
        });

        const query2 = `
            INSERT INTO discount_sales (
                contract_id, discount_id
            ) VALUES
            ${values.join(', ')}
        `;

        await this.dataSource.query(query2, params2);

        return this.findOne(discountId) as Promise<Discount>;
    }
    
    async update(id: number, updatediscountDto: DiscountDto): Promise<Discount> {
        // 1. Обновляем discount
        const query1 = `
            UPDATE discounts SET
                description = $1,
                start_date = $2,
                end_date = $3,
                amount = $4
            WHERE id = $5
        `;

        const params1 = [
            updatediscountDto.description,
            updatediscountDto.start_date,
            updatediscountDto.end_date,
            updatediscountDto.amount,
            id
        ];

        await this.dataSource.query(query1, params1);

        // 2. Получаем текущие contract_id, связанные с discount
        const currentIdsQuery = `
            SELECT contract_id FROM discount_sales WHERE discount_id = $1
        `;
        const currentRows = await this.dataSource.query(currentIdsQuery, [id]);
        const currentContractIds = currentRows.map(row => row.contract_id);

        const newContractIds = updatediscountDto.contract_ids;

        // 3. Вычисляем, кого удалить и кого вставить
        const toDelete = currentContractIds.filter(x => !newContractIds.includes(x));
        const toInsert = newContractIds.filter(x => !currentContractIds.includes(x));

        // 4. Удаляем лишние связи
        if (toDelete.length > 0) {
            const deleteQuery = `
                DELETE FROM discount_sales
                WHERE discount_id = $1 AND contract_id = ANY($2)
            `;
            await this.dataSource.query(deleteQuery, [id, toDelete]);
        }

        // 5. Вставляем новые связи
        if (toInsert.length > 0) {
            const values: string[] = [];
            const params2: any[] = [];
            toInsert.forEach((contractId, index) => {
                const i = index * 2;
                values.push(`($${i + 1}, $${i + 2})`);
                params2.push(contractId, id);
            });

            const insertQuery = `
                INSERT INTO discount_sales (contract_id, discount_id)
                VALUES ${values.join(', ')}
            `;

            await this.dataSource.query(insertQuery, params2);
        }

        // 6. Возвращаем полную запись
        return this.findOne(id) as Promise<Discount>;
    }
    
    async remove(id: number): Promise<void> {
        const query = 'DELETE FROM discounts WHERE id = $1';
        const result = await this.dataSource.query(query, [id]);

        if (result.rowCount === 0) {
            throw new NotFoundException(`Скидка с id ${id} не найден`);
        }
    }
}
