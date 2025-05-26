import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { SalesService } from '../services';

@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Get()
    async findAll(
        @Query('minProfit') minProfit?: string,
        @Query('maxProfit') maxProfit?: string,
        @Query('minTax') minTax?: string,
        @Query('maxTax') maxTax?: string,
        @Query('contractDateFrom') contractDateFrom?: string,
        @Query('contractDateTo') contractDateTo?: string,
    ) {
        // Преобразуем строковые параметры в числа/даты при наличии
        const filters = {
            minProfit: minProfit ? parseFloat(minProfit) : undefined,
            maxProfit: maxProfit ? parseFloat(maxProfit) : undefined,
            minTax: minTax ? parseFloat(minTax) : undefined,
            maxTax: maxTax ? parseFloat(maxTax) : undefined,
            contractDateFrom: contractDateFrom ? new Date(contractDateFrom) : undefined,
            contractDateTo: contractDateTo ? new Date(contractDateTo) : undefined,
        };

        // Если есть хотя бы один фильтр - используем findWithFilters
        if (Object.values(filters).some(val => val !== undefined)) {
            return this.salesService.findWithFilters(filters);
        }
        // Иначе - все записи
        return this.salesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.salesService.findOne(id);
    }
}