import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Contract } from '../entities/contract.entity';
import { CreateContractDto, UpdateContractDto } from '../dto';

@Injectable()
export class ContractsService {
    constructor(
        private readonly dataSource: DataSource,
    ) { }

    private getBaseQuery() {
        return `
            SELECT 
                ct.*,
                car.vin as carVin,
                c.name as clientName,
                mv.name as carModelVersion,
                m.name as manager
            FROM contracts ct
            LEFT JOIN clients c ON ct.client_id = c.id
            LEFT JOIN employees m ON ct.manager_id = m.id
            LEFT JOIN cars car ON ct.car_id = car.id
            LEFT JOIN model_versions mv ON car.model_version_id = mv.id
        `;
    }

    async findAll(): Promise<Contract[]> {
        return this.dataSource.query(this.getBaseQuery()) as Promise<Contract[]>
    }

    async findOne(id: number): Promise<Contract> {
        const query = this.getBaseQuery() + ` WHERE ct.id = $1 `;

        const [result] = await this.dataSource.query(query, [id]);

        if (!result) {
            throw new NotFoundException(`Контракт с id ${id} не найден`);
        }

        return result as Contract;
    }

    async findWithFilters(filters?: {
        status?: 'signed' | 'canceled' | 'pending';
        payment_method?: 'cash' | 'credit' | 'leasing';
        managerId?: number;
        clientId?: number;
    }): Promise<Contract[]> {
        let query = this.getBaseQuery();
        const params = [];
        const conditions = [];
        let paramIndex = 1;
        
        if (filters?.status) {
            conditions.push(`ct.status = $${paramIndex}`);
            params.push(filters.status);
            paramIndex++;
        }
        
        if (filters?.payment_method) {
            conditions.push(`ct.payment_method = $${paramIndex}`);
            params.push(filters.payment_method);
            paramIndex++;
        }
        
        if (filters?.managerId) {
            conditions.push(`m.id = $${paramIndex}`);
            params.push(filters.managerId);
            paramIndex++;
        }
        
        if (filters?.clientId) {
            conditions.push(`c.id = $${paramIndex}`);
            params.push(filters.clientId);
            paramIndex++;
        }
        
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        return this.dataSource.query(query, params) as Promise<Contract[]>;
    }

    async create(createContractDto: CreateContractDto): Promise<Contract> {
        const query = `
            INSERT INTO contracts (
                client_id, car_id, manager_id, 
                contract_number, signing_date, cancellation_date,
                total_amount, payment_method, status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
            ) RETURNING id
        `;

        const params = [
            createContractDto.clientId,
            createContractDto.carId,
            createContractDto.managerId,
            createContractDto.contract_number,
            createContractDto.signing_date,
            createContractDto.cancellation_date || null,
            createContractDto.total_amount,
            createContractDto.payment_method,
            createContractDto.status
        ];

        const result = await this.dataSource.query(query, params);
        return this.findOne(result) as Promise<Contract>;
    }

    async update(id: number, updateContractDto: UpdateContractDto): Promise<Contract> {
        // Проверяем существование контракта
        await this.findOne(id);

        const fields = [];
        const params = [];
        let paramIndex = 1;

        // Динамически строим запрос на основе переданных полей
        for (const [key, value] of Object.entries(updateContractDto)) {
            if (value !== undefined) {
                const dbKey = key === 'clientId' ? 'client_id' :
                    key === 'carId' ? 'car_id' :
                        key === 'managerId' ? 'manager_id' :
                            key;
                fields.push(`${dbKey} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            }
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        params.push(id);

        const query = `
            UPDATE contracts
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING id
        `;

        const result = await this.dataSource.query(query, params);
        return this.findOne(result) as Promise<Contract>;
    }

    async remove(id: number): Promise<void> {
        const query = 'DELETE FROM contracts WHERE id = $1';
        const result = await this.dataSource.query(query, [id]);

        if (result.rowCount === 0) {
            throw new NotFoundException(`Контракт с id ${id} не найден`);
        }
    }
}