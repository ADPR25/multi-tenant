import { Module } from "@nestjs/common";
import { FoldersService } from "./folders.service";
import { FoldersController } from "./folders.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Folder } from "./entities/folder.entity";
import { UsersModule } from "@/core/iam/users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Folder]), UsersModule],
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}
