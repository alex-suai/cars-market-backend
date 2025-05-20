import { Body, Controller, Get, Param, Query, Post, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { CarsService } from './services/cars.service';
import {CarsFiltersDto, CreateCarDto, UpdateCarDto} from './dto';
import { CarModelsService } from './services/car-models.service';


@Controller('cars')
export class CarsController {
    constructor(
        private carsService: CarsService, 
        private carModelsService: CarModelsService
    ){}

    @Get()
    async findAll(@Query() filters: CarsFiltersDto) {
        if (Object.keys(filters).length > 0) {
            return this.carsService.findWithFilters(filters);
        }
        return this.carsService.findAll();
    }

    @Get('manufactures')
    async findManufactures() {
        return this.carModelsService.findManufactures();
    }

    @Get('models')
    async findModels() {
        return this.carModelsService.findModels();
    }

    @Get('model-versions')
    async findModelVersions() {
        return this.carModelsService.findModelVersions();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.carsService.findOne(id);
    }

    @Post()
    async create(@Body() createCarDto: CreateCarDto) {
        return this.carsService.create(createCarDto);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCarDto: UpdateCarDto,
    ) {
        return this.carsService.update(id, updateCarDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.carsService.remove(id);
    }
}
