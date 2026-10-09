import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectPhase } from "./entities/project-phase.entity";
import { PhasesService } from "./phases.service";
import { PhasesController } from "./phases.controller";
@Module({
  imports: [TypeOrmModule.forFeature([ProjectPhase])],
  controllers: [PhasesController],
  providers: [PhasesService],
  exports: [PhasesService],
})
export class PhasesModule {}
