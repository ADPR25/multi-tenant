import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  ConflictException,
} from "@nestjs/common";
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import {
  CurrentCompanyId,
  CurrentUser,
  CurrentUserPayload,
} from "@/common/decorators/current-company.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  private isSuper(user: CurrentUserPayload): boolean {
    return user?.roleCode === "SUPER_ADMIN" || user?.code === "SUPER_ADMIN";
  }

  @Post()
  @RequirePermissions("iam:roles:create")
  create(
    @Body() dto: CreateRoleDto & { companyId?: string },
    @CurrentCompanyId() companyId: string | null,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const effectiveCompanyId = this.isSuper(user) ? dto.companyId : companyId;

    console.log(
      dto,
      "tokenCompany:",
      companyId,
      "effective:",
      effectiveCompanyId,
    );

    if (!effectiveCompanyId) {
      throw new ConflictException("companyId es requerido");
    }

    return this.rolesService.create({ ...dto, companyId: effectiveCompanyId });
  }

  @Get()
  @RequirePermissions("iam:roles:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.rolesService.findAll(companyId, pagination);
  }

  @Get(":id")
  @RequirePermissions("iam:roles:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.rolesService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("iam:roles:update")
  update(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string | null,
    @Body() dto: UpdateRoleDto & { companyId?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const effectiveCompanyId = this.isSuper(user)
      ? dto.companyId || companyId
      : companyId;
    return this.rolesService.update(id, effectiveCompanyId, dto);
  }

  @Patch("active/:id")
  @RequirePermissions("iam:roles:state")
  isActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.rolesService.toggleActive(id, companyId);
  }
}
