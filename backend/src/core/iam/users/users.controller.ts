import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
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
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private isSuper(user: CurrentUserPayload): boolean {
    return user?.roleCode === "SUPER_ADMIN" || user?.code === "SUPER_ADMIN";
  }

  @Post()
  @RequirePermissions("iam:users:create")
  create(
    @Body() dto: CreateUserDto & { companyId?: string },
    @CurrentCompanyId() companyId: string | null,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const effectiveCompanyId = this.isSuper(user)
      ? dto.companyId || companyId
      : companyId;

    return this.usersService.create({
      ...dto,
      companyId: effectiveCompanyId,
    });
  }

  @Get()
  @RequirePermissions("iam:users:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.findAll(companyId, pagination);
  }

  @Get(":id")
  @RequirePermissions("iam:users:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.usersService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("iam:users:update")
  update(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string | null,
    @Body() dto: UpdateUserDto & { companyId?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const effectiveCompanyId = this.isSuper(user)
      ? dto.companyId || companyId
      : companyId;
    return this.usersService.update(id, effectiveCompanyId, dto);
  }

  @Patch("active/:id")
  @RequirePermissions("iam:users:state")
  isActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.usersService.toggleActive(id, companyId);
  }
}
