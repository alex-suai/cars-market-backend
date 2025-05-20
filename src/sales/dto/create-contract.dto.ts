
export class CreateContractDto {
    clientId: number;

    carId: number;

    managerId: number;

    contract_number: string;

    signing_date: Date;

    cancellation_date?: Date;

    total_amount: number;

    payment_method: 'cash' | 'credit' | 'leasing';

    status: 'signed' | 'canceled' | 'pending';

}