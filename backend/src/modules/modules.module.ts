import { Module } from "@nestjs/common";
import { InventoryModule } from "./inventory/inventory.module";
import { FrontendModule } from "./frontend/frontend.module";

@Module({
  imports: [InventoryModule, FrontendModule],
  exports: [InventoryModule, FrontendModule],
})
export class Modules {}
