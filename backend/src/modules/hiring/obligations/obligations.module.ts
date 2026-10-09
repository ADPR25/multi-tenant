
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContractObligation } from "./entities/contract-obligation.entity";
import { Contract } from "../contracts/entities/contract.entity";
import { ObligationsService } from "./obligations.service";
import { ObligationsController } from "./obligations.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ContractObligation, Contract])],
  controllers: [ObligationsController],
  providers: [ObligationsService],
  exports: [ObligationsService],
})
export class ObligationsModule {}
