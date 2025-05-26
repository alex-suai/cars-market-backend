import {
    Controller,
    Get,
    Param,
    Post,
    Put,
    Delete,
    Body,
    ParseIntPipe
} from '@nestjs/common';
import { DiscountDto } from '../dto/discount.dto';
import { Discount } from '../entities';
import { DiscountsService } from '../services';

@Controller('discounts')
export class DiscountsController {
    constructor(private readonly discountsService: DiscountsService) { }

    // Получить все скидки
    @Get()
    async findAll(): Promise<Discount[]> {
        return this.discountsService.findAll();
    }

    // Получить одну скидку по ID
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Discount> {
        return this.discountsService.findOne(id);
    }

    // Создать новую скидку
    @Post()
    async create(@Body() dto: DiscountDto): Promise<Discount> {
        return this.discountsService.create(dto);
    }

    // Обновить существующую скидку
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: DiscountDto
    ): Promise<Discount> {
        return this.discountsService.update(id, dto);
    }

    // Удалить скидку
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.discountsService.remove(id);
    }
}
