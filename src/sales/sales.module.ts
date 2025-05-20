import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { ContractsService, SalesService } from './services';
import { ContractsController } from './contracts.controller';

@Module({
  controllers: [SalesController, ContractsController],
  providers: [SalesService, ContractsService]
})
export class SalesModule {}
