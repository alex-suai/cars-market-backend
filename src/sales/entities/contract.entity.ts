export interface Contract {
    id: number;
    clientName: string;
    carVin: string;
    carModelVersion: string;
    manager: string;
    contract_number: string;
    signing_date: Date;
    cancellation_date: Date | null;
    total_amount: number;
    payment_method: 'cash' | 'credit' | 'leasing';
    status: 'signed' | 'canceled' | 'pending';
}