import { Module } from "@nestjs/common";
import { RolesModule } from "./roles/roles.module";
import { UsersModule } from "./users/users.module";
import { RolePermissionsModule } from "./role-permissions/role-permissions.module";
import { PermissionsModule } from "./permissions/permissions.module";

@Module({
  imports: [RolesModule, UsersModule, RolePermissionsModule, PermissionsModule],
  exports: [RolesModule, UsersModule, RolePermissionsModule, PermissionsModule],
})
export class IamModule {}
