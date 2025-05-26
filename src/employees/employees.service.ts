import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';

@Injectable()
export class EmployeesService {
    constructor(
            private readonly dataSource: DataSource,
        ) { }
    
        private getBaseQuery() {
            return `
                SELECT 
                    e.id,
                    e.name,
                    e.surname,
                    e.profession
                FROM employees e
            `;
        }
    
        async findAll(): Promise<Employee[]> {
            return this.dataSource.query(this.getBaseQuery()) as Promise<Employee[]>
        }
    
        async findOne(id: number): Promise<Employee> {
            const query = this.getBaseQuery() + ` WHERE e.id = $1 `;
    
            const [result] = await this.dataSource.query(query, [id]);
    
            if (!result) {
                throw new NotFoundException(`Сотрудник с id ${id} не найден`);
            }
    
            return result as Employee;
        }
    
        async findWithFilters(filters?: {
            profession?: string
        }): Promise<Employee[]> {
            let query = this.getBaseQuery();
            const params = [];
            const conditions = [];
            let paramIndex = 1;
            
            if (filters?.profession) {
                conditions.push(`e.profession LIKE $${paramIndex}`);
                params.push(filters.profession);
                paramIndex++;
            }
            
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            
            return this.dataSource.query(query, params) as Promise<Employee[]>;
        }
    
        async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
            const query = `
                INSERT INTO Employees (
                    name, surname, profession
                ) VALUES (
                    $1, $2, $3
                ) RETURNING id
            `;
    
            const params = [
                createEmployeeDto.name,
                createEmployeeDto.surname,
                createEmployeeDto.profession
            ];
    
            const result = await this.dataSource.query(query, params);
            return this.findOne(result) as Promise<Employee>;
        }
    
        async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
            // Проверяем существование контракта
            await this.findOne(id);
    
            const fields = [];
            const params = [];
            let paramIndex = 1;
    
            // Динамически строим запрос на основе переданных полей
            for (const [key, value] of Object.entries(updateEmployeeDto)) {
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
                UPDATE Employees
                SET ${fields.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING id
            `;
    
            const result = await this.dataSource.query(query, params);
            return this.findOne(result[0][0]) as Promise<Employee>;
        }
    
        async remove(id: number): Promise<void> {
            const query = 'DELETE FROM employees WHERE id = $1';
            const result = await this.dataSource.query(query, [id]);
    
            if (result.rowCount === 0) {
                throw new NotFoundException(`Сотрудник с id ${id} не найден`);
            }
        }
}
