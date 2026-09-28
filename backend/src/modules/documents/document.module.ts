import { FoldersModule } from "./folders/folders.module";
import { DocsModule } from "./docs/docs.module";
import { TypesModule } from "./types/types.module";
import { CategoriesModule } from "./categories/categories.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [CategoriesModule, TypesModule, DocsModule, FoldersModule],
  exports: [CategoriesModule, TypesModule, DocsModule, FoldersModule],
})
export class DocumensModule {}
