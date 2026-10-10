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
  signature: string;
  signatureHash: string;
  signatureIp: string;
  signatureMethod: string;
  signatureMetadata: Record<string, unknown>;
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
      where: { companyId, code: dto.code },
    });
    if (exists)
      throw new ConflictException(`Contract ${dto.code} already exists`);
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
        "(contract.code ILIKE :search OR contract.contractNumber ILIKE :search OR contract.purpose ILIKE :search)",
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
    if (!one) throw new NotFoundException(`Contract ${id} not found`);
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
    if (dto.code && dto.code !== entity.code) {
      const exists = await this.repo.findOne({
        where: { companyId, code: dto.code },
      });
      if (exists)
        throw new ConflictException(`Contract ${dto.code} already exists`);
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
    entity.status = status;
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
    return { message: `Contract ${id} deleted` };
  }

  async markAsSigned(
    code: string,
    signData: SignData,
    companyId: string,
  ): Promise<Contract> {
    const contract = await this.repo.findOne({ where: { code, companyId } });
    if (!contract) throw new NotFoundException(`Contract ${code} not found`);
    contract.signature = signData.signature;
    contract.signatureHash = signData.signatureHash;
    contract.signatureIp = signData.signatureIp;
    contract.signatureMethod = signData.signatureMethod;
    contract.signatureMetadata = signData.signatureMetadata;
    contract.signedAt = new Date();
    contract.status = ContractStatus.SIGNED;
    contract.signatureStatus = "signed";
    return this.repo.save(contract);
  }
}
