export interface CreateCarDto {
    vin: string;
    model_version_id: number;
    mileage: number;
    price: number;
    color: string;
    status: 'in_stock' | 'reserved' | 'sold' | 'ordered';
    arrival_date: Date;
}