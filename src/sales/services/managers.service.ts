// import { Injectable, NotFoundException } from '@nestjs/common';
// import { DataSource } from 'typeorm';

// @Injectable()
// export class ManagersService {
//     constructor(
//         private readonly dataSource: DataSource,
//     ) { }

//     async findAll(): Promise<Manager[]> {
//         const query = `
//             SELECT 
//                 employees.*,
//                 (
//                     SELECT json_agg(
//                         json_build_object(
//                             'id', contracts.id,
//                             'signing_date', contracts.signing_date,
//                             'total_amount', contracts.total_amount
//                         )
//                     )
//                     FROM contracts 
//                     WHERE contracts.manager_id = manager.id
//                 ) as contracts
//             FROM employees
//         `;
//         return this.dataSource.query(query);
//     }

//     async findOne(id: number): Promise<Manager> {
//         const query = `
//             SELECT 
//                 manager.*,
//                 (
//                     SELECT json_agg(
//                         json_build_object(
//                             'id', contracts.id,
//                             'signing_date', contracts.signing_date,
//                             'total_amount', contracts.total_amount
//                         )
//                     )
//                     FROM contracts contracts
//                     WHERE contracts.manager_id = manager.id
//                 ) as contracts
//             FROM employees manager
//             WHERE manager.id = $1
//             LIMIT 1
//         `;

//         const result = await this.dataSource.query(query, [id]);

//         if (result.length === 0) {
//             throw new NotFoundException(`Сотрудник с id ${id} не найден`);
//         }

//         return result[0];
//     }

//     async findWithFilters(filters?: {
//         name?: string;
//         surname?: string;
//         profession?: string;
//     }): Promise<Manager[]> {
//         let query = `
//             SELECT 
//                 manager.*,
//                 (
//                     SELECT json_agg(
//                         json_build_object(
//                             'id', contracts.id,
//                             'signing_date', contracts.signing_date,
//                             'total_amount', contracts.total_amount
//                         )
//                     )
//                     FROM contracts contracts
//                     WHERE contracts.manager_id = manager.id
//                 ) as contracts
//             FROM employees manager
//             WHERE 1=1
//         `;

//         const params: any[] = [];
//         let paramIndex = 1;

//         if (filters?.name) {
//             query += ` AND LOWER(manager.name) LIKE LOWER($${paramIndex})`;
//             params.push(`%${filters.name}%`);
//             paramIndex++;
//         }

//         if (filters?.surname) {
//             query += ` AND LOWER(manager.surname) LIKE LOWER($${paramIndex})`;
//             params.push(`%${filters.surname}%`);
//             paramIndex++;
//         }

//         if (filters?.profession) {
//             query += ` AND LOWER(manager.profession) = LOWER($${paramIndex})`;
//             params.push(filters.profession);
//         }

//         return this.dataSource.query(query, params);
//     }
// }
