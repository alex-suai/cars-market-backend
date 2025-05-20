import { Module } from '@nestjs/common';
import { CarsController } from './cars.controller';
import { CarsService } from './services/cars.service';
import { CarModelsService } from './services/car-models.service';

@Module({
  controllers: [CarsController],
  providers: [CarsService, CarModelsService]
})
export class CarsModule {}
