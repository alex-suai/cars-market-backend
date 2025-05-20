import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from './dto';

@Injectable()
export class ClientsService {
    constructor(
        private readonly dataSource: DataSource
    ) { }

    private getBaseQuery() {
        return `
            SELECT 
                c.*,
                COALESCE(
                    array_agg(ct.contract_number ORDER BY ct.contract_number) 
                    FILTER (WHERE ct.contract_number IS NOT NULL),
                    '{}'
                ) AS "contractNumbers"
            FROM clients c
            LEFT JOIN contracts ct ON c.id = ct.client_id
            GROUP BY c.id
        `;
    }

    // Получить всех клиентов с их контрактами и менеджерами
    async findAll(): Promise<Client[]> {
        return this.dataSource.query(this.getBaseQuery()) as Promise<Client[]>;
    }

    // Получить одного клиента по ID
    async findOne(id: number): Promise<Client> {
        const query = this.getBaseQuery() + ` WHERE c.id = $1 `;

        const [client] = await this.dataSource.query(query, [id]);

        if (!client) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }

        return client as Client;
    }

    // Создать нового клиента
    async create(createClientDto: CreateClientDto): Promise<Client> {
        const query = `
            INSERT INTO clients
                (name, surname, phone_number, email, sales_amount, total_expenses)
            VALUES 
                ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;

        const params = [
            createClientDto.name,
            createClientDto.surname || null,
            createClientDto.phone_number || null,
            createClientDto.email,
            createClientDto.sales_amount || 0,
            createClientDto.total_expenses || 0
        ];

        const result = await this.dataSource.query(query, params);
        return this.findOne(result) as Promise<Client>;
    }

    // Обновить данные клиента
    async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
        // Проверяем существование клиента
        await this.findOne(id);

        const fields = [];
        const params = [];
        let paramIndex = 1;

        // Динамически строим запрос на основе переданных полей
        for (const [key, value] of Object.entries(updateClientDto)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            }
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        params.push(id);

        const query = `
            UPDATE clients
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING id
        `;

        const result = await this.dataSource.query(query, params);
        return this.findOne(result) as Promise<Client>;
    }

    // Удалить клиента
    async remove(id: number): Promise<void> {
        const query = 'DELETE FROM clients WHERE id = $1';
        const result = await this.dataSource.query(query, [id]);

        if (result.rowCount === 0) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }
    }
}