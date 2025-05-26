export interface DiscountDto {
    description: string;
    start_date: Date;
    end_date: Date;
    amount: number;
    contract_ids: number[]
}