export interface CarsFiltersDto {
    manufacturerId?: number;
    modelId?: number;
    modelVersionId?: number;
    status?: 'in_stock' | 'reserved' | 'sold' | 'ordered';
    color?: string;
}