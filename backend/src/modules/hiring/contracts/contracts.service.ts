import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Contract } from "./entities/contract.entity";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import { ContractStatus } from "./enums/contract-status.enum";
import { ThirdPartiesService } from "@/modules/third-parties/third-parties.service";
import {
  PaginatedResponseDto,
  PaginationDto,
} from "@/common/dto/pagination.dto";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

interface SignData {
  firma: string;
  firmaHash: string;
  firmaIp: string;
  firmaMetodo: string;
  firmaMetadata: Record<string, unknown>;
}

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly repo: Repository<Contract>,
    private readonly thirdPartiesService: ThirdPartiesService,
  ) {}

  async create(dto: CreateContractDto, companyId: string): Promise<Contract> {
    await this.thirdPartiesService.findOne(dto.thirdPartyId, companyId);
    const exists = await this.repo.findOne({
      where: { companyId, codigo: dto.codigo },
    });
    if (exists) throw new ConflictException(`Contrato ${dto.codigo} ya existe`);
    const data = this.repo.create({ ...dto, companyId });
    return this.repo.save(data);
  }

  async findAll(
    companyId: string,
    pagination: PaginationDto,
    state?: boolean,
    search?: string,
  ): Promise<PaginatedResponseDto<Contract>> {
    const baseWhere = {
      companyId,
      ...(state !== undefined ? { isActive: state } : {}),
    };

    if (!search) {
      const [data, total] = await this.repo.findAndCount({
        where: baseWhere,
        relations: ["thirdParty", "supervisor"],
        order: { createdAt: "DESC" },
        ...paginate(pagination),
      });
      return paginatedResponse(data, total, pagination);
    }

    const limit = pagination.limit === "all" ? undefined : pagination.limit;
    const skip = pagination.skip;

    const [data, total] = await this.repo
      .createQueryBuilder("contract")
      .leftJoinAndSelect("contract.thirdParty", "thirdParty")
      .leftJoinAndSelect("contract.supervisor", "supervisor")
      .where("contract.companyId = :companyId", { companyId })
      .andWhere(
        "(contract.codigo ILIKE :search OR contract.numeroContrato ILIKE :search OR contract.objeto ILIKE :search)",
        { search: `%${search}%` },
      )
      .orderBy("contract.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string): Promise<Contract> {
    const one = await this.repo.findOne({
      where: { id, companyId },
      relations: ["thirdParty", "supervisor"],
    });
    if (!one) throw new NotFoundException(`Contrato ${id} no encontrado`);
    return one;
  }

  async update(
    id: string,
    dto: UpdateContractDto,
    companyId: string,
  ): Promise<Contract> {
    const entity = await this.findOne(id, companyId);
    if (dto.thirdPartyId && dto.thirdPartyId !== entity.thirdPartyId) {
      await this.thirdPartiesService.findOne(dto.thirdPartyId, companyId);
    }
    if (dto.codigo && dto.codigo !== entity.codigo) {
      const exists = await this.repo.findOne({
        where: { companyId, codigo: dto.codigo },
      });
      if (exists)
        throw new ConflictException(`Contrato ${dto.codigo} ya existe`);
    }
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async changeStatus(
    id: string,
    status: ContractStatus,
    companyId: string,
  ): Promise<Contract> {
    const entity = await this.findOne(id, companyId);
    entity.estado = status;
    return this.repo.save(entity);
  }

  async toggleActive(id: string, companyId: string): Promise<Contract> {
    const entity = await this.findOne(id, companyId);
    entity.isActive = !entity.isActive;
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string): Promise<{ message: string }> {
    const entity = await this.findOne(id, companyId);
    await this.repo.remove(entity);
    return { message: `Contrato ${id} eliminado` };
  }

  async markAsSigned(
    codigo: string,
    signData: SignData,
    companyId: string,
  ): Promise<Contract> {
    const contract = await this.repo.findOne({ where: { codigo, companyId } });
    if (!contract)
      throw new NotFoundException(`Contrato ${codigo} no encontrado`);
    contract.firma = signData.firma;
    contract.firmaHash = signData.firmaHash;
    contract.firmaIp = signData.firmaIp;
    contract.firmaMetodo = signData.firmaMetodo;
    contract.firmaMetadata = signData.firmaMetadata;
    contract.firmadoEn = new Date();
    contract.estado = ContractStatus.FIRMADO;
    contract.estadoFirma = "firmado";
    return this.repo.save(contract);
  }
}
