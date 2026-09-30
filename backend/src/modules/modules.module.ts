import { Module } from "@nestjs/common";
import { InventoryModule } from "./inventory/inventory.module";
import { FrontendModule } from "./frontend/frontend.module";
import { DocumentsModule } from "./documents/document.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [FrontendModule, InventoryModule, DocumentsModule, UploadsModule],
  exports: [InventoryModule, FrontendModule, DocumentsModule, UploadsModule],
})
export class Modules {}
