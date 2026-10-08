import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { PaginationDto } from "@/common/dto/pagination.dto";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";
import { User } from "@/core/iam/users/entities/user.entity";
import {
  Contract,
  ContractStatus,
  ContractThirdParty,
  ContractType,
  ContractTypeCode,
} from "./entities/contract.entity";
import {
  CreateContractDto,
  CreateContractTypeDto,
  CreateThirdPartyDto,
  UpdateContractDto,
  UpdateContractTypeDto,
  UpdateThirdPartyDto,
} from "./dto/contracting.dto";

type SearchPagination = PaginationDto & { search?: string };

const DEFAULT_TYPES: Array<{ code: ContractTypeCode; name: string }> = [
  { code: ContractTypeCode.PRESTACION_SERVICIOS, name: "Prestación de Servicios" },
  { code: ContractTypeCode.OBRA, name: "Obra" },
  { code: ContractTypeCode.SUMINISTRO, name: "Suministro" },
  { code: ContractTypeCode.LABORAL, name: "Laboral" },
  { code: ContractTypeCode.ARRIENDO, name: "Arriendo" },
  { code: ContractTypeCode.OTRO, name: "Otro" },
];

@Injectable()
export class ContractingService {
  constructor(
    @InjectRepository(ContractThirdParty)
    private readonly thirdPartyRepo: Repository<ContractThirdParty>,
    @InjectRepository(ContractType)
    private readonly typeRepo: Repository<ContractType>,
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async createThirdParty(dto: CreateThirdPartyDto, companyId: string) {
    const exists = await this.thirdPartyRepo.findOne({
      where: { companyId, taxId: dto.taxId },
    });
    if (exists) throw new ConflictException("El NIT/CC ya está registrado");
    return this.thirdPartyRepo.save(
      this.thirdPartyRepo.create({ ...dto, companyId }),
    );
  }

  async listThirdParties(companyId: string, pagination: SearchPagination) {
    const qb = this.thirdPartyRepo
      .createQueryBuilder("party")
      .where("party.companyId = :companyId", { companyId });
    if (pagination.search) {
      qb.andWhere(
        "(party.name ILIKE :search OR party.legalName ILIKE :search OR party.taxId ILIKE :search)",
        { search: `%${pagination.search}%` },
      );
    }
    qb.orderBy("party.name", "ASC");
    const { skip, take } = paginate(pagination);
    qb.skip(skip).take(take);
    const [data, total] = await qb.getManyAndCount();
    return paginatedResponse(data, total, pagination);
  }

  async updateThirdParty(
    id: string,
    dto: UpdateThirdPartyDto,
    companyId: string,
  ) {
    const party = await this.thirdPartyRepo.findOne({ where: { id, companyId } });
    if (!party) throw new NotFoundException("Tercero no encontrado");
    if (dto.taxId && dto.taxId !== party.taxId) {
      const exists = await this.thirdPartyRepo.findOne({
        where: { companyId, taxId: dto.taxId },
      });
      if (exists) throw new ConflictException("El NIT/CC ya está registrado");
    }
    Object.assign(party, dto);
    return this.thirdPartyRepo.save(party);
  }

  async listTypes(companyId: string) {
    await this.typeRepo
      .createQueryBuilder()
      .insert()
      .into(ContractType)
      .values(
        DEFAULT_TYPES.map((type) => ({
          ...type,
          companyId,
          requiresPolicy: false,
          isActive: true,
        })),
      )
      .orIgnore()
      .execute();

    return this.typeRepo.find({
      where: { companyId },
      order: { name: "ASC" },
    });
  }

  async createType(dto: CreateContractTypeDto, companyId: string) {
    const exists = await this.typeRepo.findOne({
      where: { companyId, code: dto.code },
    });
    if (exists) throw new ConflictException("El código del tipo ya existe");
    return this.typeRepo.save(
      this.typeRepo.create({ ...dto, companyId }),
    );
  }

  async updateType(id: string, dto: UpdateContractTypeDto, companyId: string) {
    const contractType = await this.typeRepo.findOne({
      where: { id, companyId },
    });
    if (!contractType) throw new NotFoundException("Tipo de contrato no encontrado");
    if (dto.code && dto.code !== contractType.code) {
      const exists = await this.typeRepo.findOne({
        where: { companyId, code: dto.code },
      });
      if (exists) throw new ConflictException("El código del tipo ya existe");
    }
    Object.assign(contractType, dto);
    return this.typeRepo.save(contractType);
  }

  private async validateContractRelations(
    dto: CreateContractDto | UpdateContractDto,
    companyId: string,
  ) {
    if (dto.contractTypeId) {
      const type = await this.typeRepo.findOne({
        where: { id: dto.contractTypeId, companyId, isActive: true },
      });
      if (!type) throw new BadRequestException("Tipo de contrato inválido");
    }
    if (dto.thirdPartyId) {
      const party = await this.thirdPartyRepo.findOne({
        where: { id: dto.thirdPartyId, companyId, isActive: true },
      });
      if (!party) throw new BadRequestException("Tercero inválido o inactivo");
    }
    if (dto.supervisorId) {
      const supervisor = await this.userRepo.findOne({
        where: { id: dto.supervisorId, companyId, isActive: true },
      });
      if (!supervisor) throw new BadRequestException("Supervisor inválido");
    }
    if (dto.startDate && dto.endDate && dto.endDate < dto.startDate) {
      throw new BadRequestException("La fecha final no puede ser anterior a la inicial");
    }
  }

  async createContract(
    dto: CreateContractDto,
    companyId: string,
    createdBy: string,
  ) {
    if (
      dto.status &&
      dto.status !== ContractStatus.BORRADOR &&
      dto.status !== ContractStatus.VIGENTE
    ) {
      throw new BadRequestException(
        "Un contrato nuevo solo puede iniciar como borrador o vigente",
      );
    }
    await this.validateContractRelations(dto, companyId);
    const creator = await this.userRepo.findOne({
      where: { id: createdBy, companyId, isActive: true },
    });
    if (!creator) throw new BadRequestException("Usuario creador inválido");

    const year = new Date().getFullYear();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        `contracts:${companyId}:${year}`,
      ]);
      const sequenceRow = await queryRunner.manager
        .createQueryBuilder(Contract, "contract")
        .select(
          "COALESCE(MAX(CAST(split_part(contract.contractNumber, '-', 3) AS INTEGER)), 0)",
          "sequence",
        )
        .where("contract.companyId = :companyId", { companyId })
        .andWhere("contract.contractNumber LIKE :pattern", {
          pattern: `CTR-${year}-%`,
        })
        .getRawOne<{ sequence: string | number }>();
      const contractNumber = `CTR-${year}-${String(Number(sequenceRow?.sequence ?? 0) + 1).padStart(3, "0")}`;
      const contract = queryRunner.manager.create(Contract, {
        ...dto,
        totalValue: dto.totalValue.toFixed(2),
        contractNumber,
        companyId,
        createdBy,
      });
      const saved = await queryRunner.manager.save(contract);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listContracts(companyId: string, pagination: SearchPagination) {
    const qb = this.contractRepo
      .createQueryBuilder("contract")
      .leftJoinAndSelect("contract.contractType", "contractType")
      .leftJoinAndSelect("contract.thirdParty", "thirdParty")
      .where("contract.companyId = :companyId", { companyId });
    if (pagination.search) {
      qb.andWhere(
        "(contract.title ILIKE :search OR contract.contractNumber ILIKE :search OR thirdParty.name ILIKE :search OR thirdParty.taxId ILIKE :search)",
        { search: `%${pagination.search}%` },
      );
    }
    qb.orderBy("contract.endDate", "ASC");
    const { skip, take } = paginate(pagination);
    qb.skip(skip).take(take);
    const [data, total] = await qb.getManyAndCount();
    return paginatedResponse(data, total, pagination);
  }

  async getContract(id: string, companyId: string) {
    const contract = await this.contractRepo.findOne({
      where: { id, companyId },
      relations: ["contractType", "thirdParty", "supervisor", "creator"],
    });
    if (!contract) throw new NotFoundException("Contrato no encontrado");
    return contract;
  }

  async updateContract(
    id: string,
    dto: UpdateContractDto,
    companyId: string,
  ) {
    await this.validateContractRelations(dto, companyId);
    const contract = await this.contractRepo.findOne({
      where: { id, companyId },
    });
    if (!contract) throw new NotFoundException("Contrato no encontrado");
    const startDate = dto.startDate ?? contract.startDate;
    const endDate = dto.endDate ?? contract.endDate;
    if (endDate < startDate) {
      throw new BadRequestException("La fecha final no puede ser anterior a la inicial");
    }
    Object.assign(contract, dto);
    if (dto.totalValue !== undefined) {
      contract.totalValue = dto.totalValue.toFixed(2);
    }
    return this.contractRepo.save(contract);
  }

  @Cron("5 0 * * *")
  async updateLifecycleStatuses() {
    const today = new Date().toISOString().slice(0, 10);
    const nearEnd = new Date();
    nearEnd.setUTCDate(nearEnd.getUTCDate() + 30);
    const threshold = nearEnd.toISOString().slice(0, 10);

    await this.contractRepo
      .createQueryBuilder()
      .update(Contract)
      .set({ status: ContractStatus.VENCIDO })
      .where("status IN (:...statuses)", {
        statuses: [ContractStatus.VIGENTE, ContractStatus.POR_VENCER],
      })
      .andWhere("end_date < :today", { today })
      .execute();
    await this.contractRepo
      .createQueryBuilder()
      .update(Contract)
      .set({ status: ContractStatus.POR_VENCER })
      .where("status = :status", { status: ContractStatus.VIGENTE })
      .andWhere("end_date >= :today AND end_date <= :threshold", {
        today,
        threshold,
      })
      .execute();
    await this.contractRepo
      .createQueryBuilder()
      .update(Contract)
      .set({ status: ContractStatus.VIGENTE })
      .where("status = :status", { status: ContractStatus.POR_VENCER })
      .andWhere("end_date > :threshold", { threshold })
      .execute();
  }
}