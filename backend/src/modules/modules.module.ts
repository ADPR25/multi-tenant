import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { InventoryModule } from "./inventory/inventory.module";
import { FrontendModule } from "./frontend/frontend.module";
import { DocumentsModule } from "./documents/document.module";

@Module({
  imports: [
    InventoryModule,
    FrontendModule,
    RouterModule.register([
      { path: "inventory", module: InventoryModule },
      { path: "document_management", module: DocumentsModule }, 
    ]),
  ],
  exports: [InventoryModule, FrontendModule, DocumentsModule],
})
export class Modules {}
