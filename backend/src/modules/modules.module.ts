import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { InventoryModule } from "./inventory/inventory.module";
import { FrontendModule } from "./frontend/frontend.module";
import { DocumentsModule } from "./documents/document.module";
import { UploadsModule } from "./uploads/uploads.module";
import { ContractingModule } from "./contracting/contracting.module";

@Module({
  imports: [
    FrontendModule,
    InventoryModule,
    DocumentsModule,
    UploadsModule,
    ContractingModule,
    RouterModule.register([
      { path: "contracting", module: ContractingModule },
    ]),
  ],
  exports: [InventoryModule, FrontendModule, DocumentsModule, UploadsModule, ContractingModule],
})
export class Modules {}
