export interface CarsManufacturer {
    id: number;
    name: string;
    country: string;
}

export interface CarsModel {
    id: number;
    name: string;
    vehicle_type: 'sedan' | 'hatchback' | 'coupe' | 'suv' | 'other';
    production_start_year: number;
    production_end_year: number | null;
    manufacturer: string;
}

export interface CarsModelVersion {
    id: number;
    name: string;
    year_from: number;
    year_to: number;
    model: string;
}

export interface Car {
    id: number;
    vin: string;
    model: string;
    model_version: string;
    manufacturer: string;
    mileage: number;
    price: number;
    color: string;
    status: 'in_stock' | 'reserved' | 'sold' | 'ordered';
    arrival_date: Date;
}