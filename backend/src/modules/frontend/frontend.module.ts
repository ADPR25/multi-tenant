import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoleMenu } from "./entities/role-menu.entity";
import { Role } from "@/core/iam/roles/entities/role.entity";
import { Permission } from "@/core/iam/permissions/entities/permission.entity";
import { RolePermission } from "@/core/iam/role-permissions/entities/role-permission.entity";
import { FrontendService } from "./frontend.service";
import { FrontendController } from "./frontend.controller";

@Module({
  imports: [TypeOrmModule.forFeature([RoleMenu, Role, Permission, RolePermission])],
  controllers: [FrontendController],
  providers: [FrontendService],
  exports: [FrontendService],
})
export class FrontendModule {}