
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Requirement } from "./entities/requirement.entity";
import { Contract } from "../contracts/entities/contract.entity";
import { RequirementsService } from "./requirements.service";
import { RequirementsController } from "./requirements.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Requirement, Contract])],
  controllers: [RequirementsController],
  providers: [RequirementsService],
})
export class RequirementsModule {}
