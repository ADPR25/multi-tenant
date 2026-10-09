import { Module } from "@nestjs/common";
import { InventoryModule } from "./inventory/inventory.module";
import { FrontendModule } from "./frontend/frontend.module";
import { DocumentsModule } from "./documents/document.module";
import { UploadsModule } from "./uploads/uploads.module";
import { HiringModule } from "./hiring/hiring.module";
import { ThirdPartiesModule } from "./third-parties/third-parties.module";
import { ProjectsParentModule } from "./projects/projects-parent.module";

@Module({
  imports: [
    FrontendModule,
    InventoryModule,
    DocumentsModule,
    UploadsModule,
    HiringModule,
    ThirdPartiesModule,
    ProjectsParentModule
  ],
  exports: [
    InventoryModule,
    FrontendModule,
    DocumentsModule,
    UploadsModule,
    HiringModule,
    ThirdPartiesModule,
    ProjectsParentModule
  ],
})
export class Modules {}
