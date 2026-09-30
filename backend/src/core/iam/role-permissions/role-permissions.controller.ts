import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { RolePermissionsService } from "./role-permissions.service";
import { CreateRolePermissionDto } from "./dto/create-role-permission.dto";
import {
  CurrentCompanyId,
  OptionalCompanyId,
} from "@/common/decorators/current-company.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("role-permissions")
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @Post()
  @RequirePermissions("iam:role-permissions:create")
  create(
    @Body() dto: CreateRolePermissionDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.rolePermissionsService.create({ ...dto, companyId });
  }

  @Get()
  @RequirePermissions("iam:role-permissions:read")
  findAll(
    @OptionalCompanyId() companyId: string | null,
    @Query("roleId") roleId?: string,
  ) {
    return this.rolePermissionsService.findAll(companyId as any, roleId);
  }

  @Get("role/:roleId")
  @RequirePermissions("iam:role-permissions:read")
  findByRole(
    @Param("roleId") roleId: string,
    @OptionalCompanyId() companyId: string | null,
  ) {
    return this.rolePermissionsService.findAll(companyId as any, roleId);
  }

  @Get(":id")
  @RequirePermissions("iam:role-permissions:read")
  findOne(
    @Param("id") id: string,
    @OptionalCompanyId() companyId: string | null,
  ) {
    return this.rolePermissionsService.findOneCompat(id, companyId as any);
  }

  @Delete(":id")
  @RequirePermissions("iam:role-permissions:delete")
  remove(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.rolePermissionsService.remove(id, companyId);
  }

  @Post("sync")
  @RequirePermissions("iam:role-permissions:update")
  async sync(
    @Body() body: { roleId: string; permissionIds: string[] },
    @OptionalCompanyId() companyId: string | null,
  ) {
    return this.rolePermissionsService.syncRolePermissions(
      companyId as any,
      body.roleId,
      body.permissionIds,
    );
  }
}
