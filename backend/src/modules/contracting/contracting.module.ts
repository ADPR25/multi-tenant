import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@/core/iam/users/entities/user.entity";
import { ContractingController } from "./contracting.controller";
import { ContractingService } from "./contracting.service";
import {
  Contract,
  ContractThirdParty,
  ContractType,
} from "./entities/contract.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, ContractThirdParty, ContractType, User]),
  ],
  controllers: [ContractingController],
  providers: [ContractingService],
  exports: [ContractingService],
})
export class ContractingModule {}