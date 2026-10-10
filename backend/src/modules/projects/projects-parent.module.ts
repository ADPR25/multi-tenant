import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { ProjectsModule } from "./projects/projects.module";
import { PhasesModule } from "./phases/phases.module";
import { ActivitiesModule } from "./activities/activities.module";
import { TasksModule } from "./tasks/tasks.module";
import { SurveyModule } from "./survey/survey.module";

@Module({
  imports: [
    SurveyModule,
    ProjectsModule,
    PhasesModule,
    ActivitiesModule,
    TasksModule,
    RouterModule.register([
      { path: "projects", module: SurveyModule },
      { path: "projects", module: PhasesModule },
      { path: "projects", module: ActivitiesModule },
      { path: "projects", module: TasksModule },
      { path: "", module: ProjectsModule },
    ]),
  ],
  exports: [
    ProjectsModule,
    PhasesModule,
    ActivitiesModule,
    TasksModule,
    SurveyModule,
  ],
})
export class ProjectsParentModule {}