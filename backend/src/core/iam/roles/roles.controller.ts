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
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions("iam:roles:create")
  create(@Body() dto: CreateRoleDto, @CurrentCompanyId() companyId: string) {
    return this.rolesService.create({ ...dto, companyId });
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
    @CurrentCompanyId() companyId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, companyId, dto);
  }

  @Delete(":id")
  @RequirePermissions("iam:roles:delete")
  remove(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.rolesService.remove(id, companyId);
  }
}
