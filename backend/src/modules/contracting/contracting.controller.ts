import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentCompanyId, CurrentUser, CurrentUserPayload } from "@/common/decorators/current-company.decorator";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import {
  CreateContractDto,
  CreateContractTypeDto,
  CreateThirdPartyDto,
  UpdateContractDto,
  UpdateContractTypeDto,
  UpdateThirdPartyDto,
} from "./dto/contracting.dto";
import { ContractingService } from "./contracting.service";

type SearchPagination = PaginationDto & { search?: string };

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class ContractingController {
  constructor(private readonly service: ContractingService) {}

  @Post("third-parties")
  @RequirePermissions("contracting:write")
  createThirdParty(
    @Body() dto: CreateThirdPartyDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.createThirdParty(dto, companyId);
  }

  @Get("third-parties")
  @RequirePermissions("contracting:read")
  listThirdParties(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: SearchPagination,
  ) {
    return this.service.listThirdParties(companyId, pagination);
  }

  @Patch("third-parties/:id")
  @RequirePermissions("contracting:write")
  updateThirdParty(
    @Param("id") id: string,
    @Body() dto: UpdateThirdPartyDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.updateThirdParty(id, dto, companyId);
  }

  @Get("types")
  @RequirePermissions("contracting:read")
  listTypes(@CurrentCompanyId() companyId: string) {
    return this.service.listTypes(companyId);
  }

  @Post("types")
  @RequirePermissions("contracting:admin")
  createType(
    @Body() dto: CreateContractTypeDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.createType(dto, companyId);
  }

  @Patch("types/:id")
  @RequirePermissions("contracting:admin")
  updateType(
    @Param("id") id: string,
    @Body() dto: UpdateContractTypeDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.updateType(id, dto, companyId);
  }

  @Post("contracts")
  @RequirePermissions("contracting:write")
  createContract(
    @Body() dto: CreateContractDto,
    @CurrentCompanyId() companyId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const userId = user.id || user.sub;
    return this.service.createContract(dto, companyId, userId);
  }

  @Get("contracts")
  @RequirePermissions("contracting:read")
  listContracts(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: SearchPagination,
  ) {
    return this.service.listContracts(companyId, pagination);
  }

  @Get("contracts/:id")
  @RequirePermissions("contracting:read")
  getContract(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.service.getContract(id, companyId);
  }

  @Patch("contracts/:id")
  @RequirePermissions("contracting:write")
  updateContract(
    @Param("id") id: string,
    @Body() dto: UpdateContractDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.updateContract(id, dto, companyId);
  }
}