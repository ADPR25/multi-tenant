import { Module } from "@nestjs/common";
import { DocsService } from "./docs.service";
import { DocsController } from "./docs.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Doc } from "./entities/doc.entity";
import { Folder } from "../folders/entities/folder.entity";
import { Category } from "../categories/entities/category.entity";
import { Type } from "../types/entities/type.entity";
import { UploadsModule } from "@/modules/uploads/uploads.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Doc, Folder, Category, Type]),
    UploadsModule,
  ],
  controllers: [DocsController],
  providers: [DocsService],
  exports: [DocsService],
})
export class DocsModule {}
