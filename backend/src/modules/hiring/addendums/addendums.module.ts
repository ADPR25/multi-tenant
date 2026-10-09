
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Addendum } from "./entities/addendum.entity";
import { Contract } from "../contracts/entities/contract.entity";
import { AddendumsService } from "./addendums.service";
import { AddendumsController } from "./addendums.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Addendum, Contract])],
  controllers: [AddendumsController],
  providers: [AddendumsService],
})
export class AddendumsModule {}
