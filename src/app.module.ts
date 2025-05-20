import { Module } from '@nestjs/common';
import { CarsModule } from './cars/cars.module';
import { ClientsModule } from './clients/clients.module';
import { SalesModule } from './sales/sales.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    CarsModule, 
    ClientsModule, 
    SalesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Shurikgat2704',
      database: 'postgres',
      schema: 'car_market',
      synchronize: false,
      autoLoadEntities: true,
      extra: {
        options: '-c search_path=car_market'
      }
    }),
  ],
})
export class AppModule {}
