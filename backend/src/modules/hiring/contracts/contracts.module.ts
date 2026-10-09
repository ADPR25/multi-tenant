
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Contract } from "./entities/contract.entity";
import { ContractsService } from "./contracts.service";
import { ContractsController } from "./contracts.controller";
import { ThirdPartiesModule } from "@/modules/third-parties/third-parties.module";

@Module({
  imports: [TypeOrmModule.forFeature([Contract]), ThirdPartiesModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService, TypeOrmModule],
})
export class ContractsModule {}
