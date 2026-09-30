import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { FoldersModule } from "./folders/folders.module";
import { DocsModule } from "./docs/docs.module";
import { TypesModule } from "./types/types.module";
import { CategoriesModule } from "./categories/categories.module";

@Module({
  imports: [
    CategoriesModule,
    TypesModule,
    DocsModule,
    FoldersModule,
    RouterModule.register([
      { path: "document_management", module: CategoriesModule },
      { path: "document_management", module: TypesModule },
      { path: "document_management", module: DocsModule },
      { path: "document_management", module: FoldersModule },
    ]),
  ],
  exports: [
    CategoriesModule,
    TypesModule,
    DocsModule,
    FoldersModule,
  ],
})
export class DocumentsModule {}
