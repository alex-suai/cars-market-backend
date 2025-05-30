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
            SELECT c.*
            FROM clients c
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
                (name, surname, phone_number, email)
            VALUES 
                ($1, $2, $3, $4)
            RETURNING id
        `;

        const params = [
            createClientDto.name,
            createClientDto.surname || null,
            createClientDto.phone_number || null,
            createClientDto.email
        ];

        const result = await this.dataSource.query(query, params);
        return this.findOne(result[0].id) as Promise<Client>;
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
        return this.findOne(result[0][0].id) as Promise<Client>;
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