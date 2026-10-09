import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectTask } from "./entities/project-task.entity";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
@Module({ imports: [TypeOrmModule.forFeature([ProjectTask])], controllers: [TasksController], providers: [TasksService], exports: [TasksService] })
export class TasksModule {}
