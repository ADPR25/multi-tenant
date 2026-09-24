import { Module } from "@nestjs/common";
import { BrandsModule } from "./brands/brands.module";
import { CategoriesModule } from "./categories/categories.module";

@Module({
    imports: [BrandsModule, CategoriesModule],
    exports: [BrandsModule, CategoriesModule]
})

export class InventoryModule {}