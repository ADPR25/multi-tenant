import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  ForbiddenException,
  Body,
  Post,
  Query,
} from "@nestjs/common";
import { CompanyService } from "./company.service";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import {
  CurrentCompanyId,
  OptionalCompanyId,
  CurrentUser,
} from "@/common/decorators/current-company.decorator";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { PaginationDto } from "@/common/dto/pagination.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("company")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  private isSuper(user: any): boolean {
    return user?.roleCode === "SUPER_ADMIN" || user?.code === "SUPER_ADMIN";
  }

  @Post()
  @RequirePermissions("companies:create")
  create(@Body() createCompanyDto: CreateCompanyDto, @CurrentUser() user: any) {
    if (!this.isSuper(user)) {
      throw new ForbiddenException("Solo SUPER_ADMIN puede crear empresas");
    }
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @RequirePermissions("companies:read")
  findAll(
    @CurrentUser() user: any,
    @Query() pagination: PaginationDto,
    @OptionalCompanyId() companyId: string | null,
  ) {
    return this.companyService.findAll(pagination);
  }

  @Get("me")
  @RequirePermissions("companies:read")
  findMyCompany(@CurrentCompanyId() companyId: string | null) {
    if (!companyId) {
      throw new ForbiddenException("SUPER_ADMIN no tiene empresa asignada");
    }
    return this.companyService.findOne(companyId);
  }

  @Get(":id")
  @RequirePermissions("companies:read")
  findOne(
    @Param("id") id: string,
    @OptionalCompanyId() companyId: string | null,
    @CurrentUser() user: any,
  ) {
    if (!this.isSuper(user) && companyId && id !== companyId) {
      throw new ForbiddenException("No puedes ver otra empresa");
    }
    return this.companyService.findOne(id);
  }

  @Patch(":id")
  @RequirePermissions("companies:update")
  update(
    @Param("id") id: string,
    @OptionalCompanyId() companyId: string | null,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: any,
  ) {
    if (!this.isSuper(user) && companyId && id !== companyId) {
      throw new ForbiddenException("No puedes editar otra empresa");
    }
    return this.companyService.update(id, dto);
  }
}
