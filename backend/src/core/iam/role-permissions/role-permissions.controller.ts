import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { RolePermissionsService } from "./role-permissions.service";
import { CreateRolePermissionDto } from "./dto/create-role-permission.dto";
import { UpdateRolePermissionDto } from "./dto/update-role-permission.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
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
  @RequirePermissions('iam:role-permissions:create')
  create(
    @Body() dto: CreateRolePermissionDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.rolePermissionsService.create({...dto, companyId });
  }

  @Get()
  @RequirePermissions('iam:role-permissions:read')
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query("roleId") roleId?: string,
  ) {
    return this.rolePermissionsService.findAll(companyId, roleId);
  }

  @Get(":id")
  @RequirePermissions('iam:role-permissions:read')
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.rolePermissionsService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions('iam:role-permissions:update')
  update(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
    @Body() dto: UpdateRolePermissionDto,
  ) {
    return this.rolePermissionsService.update(id, companyId, dto);
  }

  @Delete(":id")
  @RequirePermissions('iam:role-permissions:delete')
  remove(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.rolePermissionsService.remove(id, companyId);
  }
}