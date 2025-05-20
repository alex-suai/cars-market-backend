import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Car } from '../entities/car.entity';
import { CarsFiltersDto } from '../dto/filters.dto';
import { CreateCarDto } from '../dto/create-car.dto';
import { UpdateCarDto } from '../dto/update-car.dto';

@Injectable()
export class CarsService {
    constructor(
        private readonly dataSource: DataSource
    ) { }

    private getBaseQuery() {
        return `
            SELECT 
                car.id,
                car.vin,
                m.name as model,
                mv.name as model_version,
                car.mileage,
                car.price,
                car.color,
                car.status,
                car.arrival_date
            FROM cars car
            LEFT JOIN model_versions mv ON car.model_version_id = mv.id
            LEFT JOIN models m ON mv.model_id = m.id
            LEFT JOIN manufactures man ON m.manufacture_id = man.id
        `;
    }

    async findAll(): Promise<Car[]> {
        const query = this.getBaseQuery();
        return this.dataSource.query(query) as Promise<Car[]>;
    }

    async findWithFilters(filters: CarsFiltersDto): Promise<Car[]> {
        let query = this.getBaseQuery();
        const params = [];
        const conditions = [];
        let paramIndex = 1;

        if (filters?.modelVersionId) {
            conditions.push(`mv.id = $${paramIndex}`);
            params.push(filters.modelVersionId);
            paramIndex++;
        }

        if (filters?.modelId) {
            conditions.push(`m.id = $${paramIndex}`);
            params.push(filters.modelId);
            paramIndex++;
        }

        if (filters?.manufacturerId) {
            conditions.push(`man.id = $${paramIndex}`);
            params.push(filters.manufacturerId);
            paramIndex++;
        }

        if (filters?.status) {
            conditions.push(`car.status = $${paramIndex}`);
            params.push(filters.status);
            paramIndex++;
        }

        if (filters?.color) {
            conditions.push(`car.color = $${paramIndex}`);
            params.push(filters.color);
            paramIndex++;
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        return this.dataSource.query(query, params) as Promise<Car[]>;
    }

    async findOne(id: number): Promise<Car> {
        const query = `${this.getBaseQuery()} WHERE car.id = $1`;
        const [result] = await this.dataSource.query(query, [id]);

        if (!result) {
            throw new NotFoundException(`Автомобиль с id ${id} не найден`);
        }

        return result as Car;
    }

    async create(createCarDto: CreateCarDto): Promise<Car> {
        const query = `
            INSERT INTO cars (
                vin, model_version_id, mileage, 
                price, color, status, 
                arrival_date
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7
            ) RETURNING id
        `;

        const params = [
            createCarDto.vin,
            createCarDto.model_version_id,
            createCarDto.mileage,
            createCarDto.price,
            createCarDto.color,
            createCarDto.status || 'in_stock',
            createCarDto.arrival_date
        ];

        const result = await this.dataSource.query(query, params);

        return this.findOne(result);
    }

    async update(id: number, updateCarDto: UpdateCarDto): Promise<Car> {
        // Проверяем существование автомобиля
        await this.findOne(id);

        const fields = [];
        const params = [];
        let paramIndex = 1;

        // Динамически строим запрос на основе переданных полей
        for (const [key, value] of Object.entries(updateCarDto)) {
            if (value !== undefined) {
                const dbKey = key === 'modelVersionId' ? 'model_version_id' : key;
                fields.push(`${dbKey} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            }
        }

        if (fields.length === 0) {
            throw new Error('Нет полей для обновления');
        }

        params.push(id);

        const query = `
            UPDATE cars
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING id
        `;

        const result = await this.dataSource.query(query, params);
        return this.findOne(result);
    }

    async remove(id: number): Promise<void> {
        const query = 'DELETE FROM cars WHERE id = $1';
        const result = await this.dataSource.query(query, [id]);

        if (result.rowCount === 0) {
            throw new NotFoundException(`Автомобиль с id ${id} не найден`);
        }
    }
}