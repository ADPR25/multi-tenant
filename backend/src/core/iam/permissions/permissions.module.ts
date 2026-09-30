import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./entities/permission.entity";
import { PermissionsService } from "./permissions.service";
import { PermissionsController } from "./permissions.controller";
import { PermissionsSeeder } from "./permissions-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsSeeder],
  exports: [PermissionsService],
})
export class PermissionsModule {}
