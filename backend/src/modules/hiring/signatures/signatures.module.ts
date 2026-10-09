
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SignatureCode } from "./entities/signature-code.entity";
import { Contract } from "../contracts/entities/contract.entity";
import { SignaturesService } from "./signatures.service";
import { SignaturesController } from "./signatures.controller";
import { ContractsModule } from "../contracts/contracts.module";

@Module({
  imports: [TypeOrmModule.forFeature([SignatureCode, Contract]), ContractsModule],
  controllers: [SignaturesController],
  providers: [SignaturesService],
  exports: [SignaturesService],
})
export class SignaturesModule {}
