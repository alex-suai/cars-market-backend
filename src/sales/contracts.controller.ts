import { Controller, Get, Post, Body, Param, Query, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ContractsService } from './services';
import { CreateContractDto, UpdateContractDto } from './dto';

@Controller('contracts')
export class ContractsController {
    constructor(private readonly contractsService: ContractsService) { }

    @Get()
    async findAll(
        @Query('status') status?: 'signed' | 'canceled' | 'pending',
        @Query('payment_method') payment_method?: 'cash' | 'credit' | 'leasing',
        @Query('managerId') managerId?: number,
        @Query('clientId') clientId?: number,
    ) {
        return this.contractsService.findWithFilters({
            status,
            payment_method,
            managerId,
            clientId,
        });
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.contractsService.findOne(id);
    }

    @Post()
    async create(@Body() contractData: CreateContractDto) {
        return this.contractsService.create(contractData);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: UpdateContractDto,
    ) {
        return this.contractsService.update(id, updateData);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.contractsService.remove(id);
    }
}