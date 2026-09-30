import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { CurrentCompanyId, OptionalCompanyId, CurrentUser } from "@/common/decorators/current-company.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("permissions")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions("iam:permissions:create")
  create(
    @Body() dto: CreatePermissionDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.permissionsService.create({...dto, companyId });
  }

  @Get()
  @RequirePermissions("iam:permissions:read")
  findAll(@CurrentCompanyId() companyId: string) {
    return this.permissionsService.findAll(companyId);
  }

  @Get(":id")
  @RequirePermissions("iam:permissions:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.permissionsService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("iam:permissions:update")
  update(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, companyId, dto);
  }

  @Delete(":id")
  @RequirePermissions("iam:permissions:delete")
  remove(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.permissionsService.remove(id, companyId);
  }

  @Post("sync")
  @RequirePermissions("iam:permissions:create")
  sync(
    @OptionalCompanyId() companyId: string | null,
    @Body() body?: { companyId?: string }
  ) {
    const effectiveId = body?.companyId || companyId;
    if (!effectiveId) {
      throw new ForbiddenException('companyId requerido. SUPER_ADMIN debe enviar { companyId } en body');
    }
    return this.permissionsService.syncForCompany(effectiveId);
  }

  @Get("sync-all")
  @RequirePermissions("iam:permissions:create")
  async syncAll(@CurrentUser() user: any) {
    const isSuper = user?.roleCode === "SUPER_ADMIN" || user?.code === "SUPER_ADMIN";
    if (!isSuper) throw new ForbiddenException('Solo SUPER_ADMIN puede sincronizar todas');
    return this.permissionsService.syncAllCompanies();
  }
}