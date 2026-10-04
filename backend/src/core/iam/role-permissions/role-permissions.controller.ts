import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("role-permissions")
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateRolePermissionDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.rolePermissionsService.create({ ...dto, companyId });
  }

  @Get()
  findAll(
    @OptionalCompanyId() companyId: string | null,
    @Query("roleId") roleId?: string,
  ) {
    return this.rolePermissionsService.findAll(companyId, roleId);
  }

  @Get("role/:roleId")
  findByRole(
    @Param("roleId") roleId: string,
    @OptionalCompanyId() companyId: string | null,
  ) {
    return this.rolePermissionsService.findAll(companyId, roleId);
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @OptionalCompanyId() companyId: string | null,
  ) {
    return this.rolePermissionsService.findOneCompat(id, companyId);
  }

  @Post("sync")
  async sync(
    @Body() body: { roleId: string; permissionIds: string[] },
    @OptionalCompanyId() companyId: string | null,
  ) {
    return this.rolePermissionsService.syncRolePermissions(
      companyId,
      body.roleId,
      body.permissionIds,
    );
  }
}
