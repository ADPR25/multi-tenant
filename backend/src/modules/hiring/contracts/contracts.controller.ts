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
import { ContractsService } from "./contracts.service";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import {
  PaginatedResponseDto,
  PaginationDto,
} from "@/common/dto/pagination.dto";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { ContractStatus } from "./enums/contract-status.enum";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Contract } from "./entities/contract.entity";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("contracts")
export class ContractsController {
  constructor(private readonly service: ContractsService) {}

  @Post()
  @RequirePermissions("hiring:contract:create")
  create(
    @Body() dto: CreateContractDto,
    @CurrentCompanyId() companyId: string,
  ): Promise<Contract> {
    return this.service.create(dto, companyId);
  }

  @Get()
  @RequirePermissions("hiring:contract:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto,
    @Query("state") state?: string,
    @Query("search") search?: string,
  ): Promise<PaginatedResponseDto<Contract>> {
    const isActive = state !== undefined ? state === "true" : undefined;
    return this.service.findAll(companyId, pagination, isActive, search);
  }

  @Get(":id")
  @RequirePermissions("hiring:contract:read")
  findOne(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
  ): Promise<Contract> {
    return this.service.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("hiring:contract:update")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateContractDto,
    @CurrentCompanyId() companyId: string,
  ): Promise<Contract> {
    return this.service.update(id, dto, companyId);
  }

  @Patch(":id/status/:status")
  @RequirePermissions("hiring:contract:update")
  changeStatus(
    @Param("id") id: string,
    @Param("status") status: ContractStatus,
    @CurrentCompanyId() companyId: string,
  ): Promise<Contract> {
    return this.service.changeStatus(id, status, companyId);
  }

  @Patch("active/:id")
  @RequirePermissions("hiring:contract:state")
  toggle(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
  ): Promise<Contract> {
    return this.service.toggleActive(id, companyId);
  }

  @Delete(":id")
  @RequirePermissions("hiring:contract:delete")
  remove(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
  ): Promise<{ message: string }> {
    return this.service.remove(id, companyId);
  }
}
