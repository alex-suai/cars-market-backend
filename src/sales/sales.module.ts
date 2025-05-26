import { Module } from '@nestjs/common';
import { ContractsService, DiscountsService, SalesService } from './services';
import { ContractsController, DiscountsController, SalesController } from './controllers';

@Module({
  controllers: [SalesController, ContractsController, DiscountsController],
  providers: [SalesService, ContractsService, DiscountsService]
})
export class SalesModule {}
