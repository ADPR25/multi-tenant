import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { ProjectsModule } from "./projects/projects.module";
import { PhasesModule } from "./phases/phases.module";
import { ActivitiesModule } from "./activities/activities.module";
import { TasksModule } from "./tasks/tasks.module";
// import { SurveysModule } from "./surveys/surveys.module";

@Module({
  imports: [
    ProjectsModule,
    PhasesModule,
    ActivitiesModule,
    TasksModule,
    // SurveysModule,
    RouterModule.register([
      { path: "", module: ProjectsModule },
      { path: "projects", module: PhasesModule },
      { path: "projects", module: ActivitiesModule },
      { path: "projects", module: TasksModule },
      // { path: "projects", module: SurveysModule },
    ]),
  ],
  exports: [
    ProjectsModule,
    PhasesModule,
    ActivitiesModule,
    TasksModule,
    // SurveysModule
  ],
})
export class ProjectsParentModule {}
