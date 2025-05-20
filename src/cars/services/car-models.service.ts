import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CarsManufacturer, CarsModel, CarsModelVersion } from '../entities/car.entity';

@Injectable()
export class CarModelsService {
    constructor(
        private readonly dataSource: DataSource
    ) { }

    async findManufactures(): Promise<CarsManufacturer[]> {
        const query = `
            SELECT * FROM manufactures
        `
        return await this.dataSource.query(query) as CarsManufacturer[]
    }

    async findModels(): Promise<CarsModel[]> {
        const query = `
            SELECT m.*, mf.name as manufacturer 
            FROM models m
            LEFT JOIN manufactures mf ON mf.id = m.manufacturer_id
        `
        return await this.dataSource.query(query) as CarsModel[]
    }

    async findModelVersions(): Promise<CarsModelVersion[]> {
        const query = `
            SELECT mv.*, m.name as model
            FROM model_versions mv
            LEFT JOIN models m ON m.id = mv.model_id
        `
        return await this.dataSource.query(query) as CarsModelVersion[]
    }
}
