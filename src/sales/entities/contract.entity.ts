export interface Contract {
    id: number;
    client_name: string;
    car_vin: string;
    car_model_version: string;
    manager: string;
    contract_number: string;
    signing_date: Date;
    cancellation_date: Date | null;
    total_amount: number;
    payment_method: 'cash' | 'credit' | 'leasing';
    status: 'signed' | 'canceled' | 'pending';
}