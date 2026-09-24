import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CurrentCompanyId, CurrentUser } from "@/common/decorators/current-company.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('iam:users:create')
  create(@Body() dto: CreateUserDto, @CurrentCompanyId() companyId: string) {
    return this.usersService.create({...dto, companyId });
  }

  @Get()
  @RequirePermissions('iam:users:read')
  findAll(@CurrentCompanyId() companyId: string, @Query() pagination: PaginationDto) {
    return this.usersService.findAll(companyId, pagination);
  }

  @Get(":id")
  @RequirePermissions('iam:users:read')
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.usersService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions('iam:users:update')
  update(@Param("id") id: string, @CurrentCompanyId() companyId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, companyId, dto);
  }

  @Delete(":id")
  @RequirePermissions('iam:users:delete')
  remove(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.usersService.remove(id, companyId);
  }
}