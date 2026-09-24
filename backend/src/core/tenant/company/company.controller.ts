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
import { CurrentCompanyId, CurrentUser } from "@/common/decorators/current-company.decorator";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { PaginationDto } from "@/common/dto/pagination.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("company")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @RequirePermissions("companies:create")
  create(@Body() createCompanyDto: CreateCompanyDto, @CurrentUser() user: any) {
    if (user.roleCode!== 'SUPER_ADMIN' && user.code!== 'SUPER_ADMIN') {
      throw new ForbiddenException("Solo SUPER_ADMIN puede crear empresas");
    }
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @RequirePermissions("companies:read")
  findAll(@CurrentUser() user: any, @Query() pagination: PaginationDto) {
    if (user.roleCode!== 'SUPER_ADMIN' && user.code!== 'SUPER_ADMIN') {
      throw new ForbiddenException("Solo SUPER_ADMIN puede listar todas las empresas");
    }
    return this.companyService.findAll(pagination);
  }

  @Get("me")
  @RequirePermissions("companies:read")
  findMyCompany(@CurrentCompanyId() companyId: string) {
    return this.companyService.findOne(companyId);
  }

  @Get(":id")
  @RequirePermissions("companies:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string, @CurrentUser() user: any) {
    if (user.roleCode!== 'SUPER_ADMIN' && id!== companyId)
      throw new ForbiddenException("No puedes ver otra empresa");
    return this.companyService.findOne(id);
  }

  @Patch(":id")
  @RequirePermissions("companies:update")
  update(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: any,
  ) {
    if (user.roleCode!== 'SUPER_ADMIN' && id!== companyId)
      throw new ForbiddenException("No puedes editar otra empresa");
    return this.companyService.update(id, dto);
  }
}