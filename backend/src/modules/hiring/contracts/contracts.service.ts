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
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { paginatedResponse } from "@/common/helpers/pagination.helper";
import { FilterDto } from "@/common/filters/filter.dto";
import { Addendum } from "../addendums/entities/addendum.entity";

interface SignData {
  signature: string;
  signatureHash: string;
  signatureIp: string;
  signatureMethod: string;
  signatureMetadata: Record<string, unknown>;
}

interface SumByContract {
  contractId: string;
  additionsSum: string;
  extensionSum: string;
}

export type ContractListItem = Contract & {
  totalAmountBase: string;
  additionsTotal: string;
  totalAmountReal: string;
  extensionDaysTotal: number;
};

export type ContractDetailWithTotals = Contract & {
  totalAmountBase: string;
  additionsTotal: string;
  totalAmountReal: string;
  extensionDaysTotal: number;
  endDateReal: Date | null;
};

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly repo: Repository<Contract>,
    @InjectRepository(Addendum)
    private readonly addendumRepo: Repository<Addendum>,
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
    filter: FilterDto,
  ): Promise<
    PaginatedResponseDto<ContractListItem | ContractDetailWithTotals>
  > {
    const { search, state, find, parentId, tipo, isActive } = filter;
    const activeParam = isActive ?? state;
    const isActiveBool =
      activeParam !== undefined ? activeParam === "true" : undefined;
    const isList =
      find === "list" || (typeof find === "string" && find.includes("list"));

    const qb = this.repo
      .createQueryBuilder("contract")
      .leftJoin("contract.thirdParty", "thirdParty")
      .leftJoin("contract.supervisor", "supervisor")
      .where("contract.companyId = :companyId", { companyId });

    if (isActiveBool !== undefined) {
      qb.andWhere("contract.isActive = :isActive", {
        isActive: isActiveBool,
      });
    }
    if (search) {
      qb.andWhere(
        "(contract.code ILIKE :search OR contract.contractNumber ILIKE :search OR contract.purpose ILIKE :search)",
        { search: `%${search}%` },
      );
    }
    if (find && !isList) {
      qb.andWhere("contract.status = :status", { status: find });
    }
    if (parentId) {
      qb.andWhere("contract.projectId = :projectId", {
        projectId: parentId,
      });
    }
    if (tipo) {
      qb.andWhere("contract.contractType = :tipo", {
        tipo: Number(tipo),
      });
    }

    qb.orderBy("contract.createdAt", "DESC");
    const limit = filter.limit === "all" ? undefined : filter.limit;
    qb.skip(filter.skip).take(limit);

    if (isList) {
      qb.select([
        "contract.id",
        "contract.code",
        "contract.contractNumber",
        "contract.totalAmount",
        "contract.status",
        "contract.isActive",
        "contract.createdAt",
        "contract.thirdPartyId",
        "contract.startDate",
        "contract.endDate",
        "thirdParty.id",
        "thirdParty.legalName",
      ]);
      qb.addSelect(
        (sub) =>
          sub
            .select(
              "COALESCE(SUM(CAST(a.additionalAmount AS DECIMAL)),0)",
              "sum",
            )
            .from(Addendum, "a")
            .where("a.contractId = contract.id")
            .andWhere("a.companyId = :companyId", { companyId })
            .andWhere("a.isActive = true"),
        "additionsTotal",
      );
      qb.addSelect(
        (sub) =>
          sub
            .select("COALESCE(SUM(a.additionalDays),0)", "sumDays")
            .from(Addendum, "a")
            .where("a.contractId = contract.id")
            .andWhere("a.companyId = :companyId", { companyId })
            .andWhere("a.isActive = true"),
        "extensionTotal",
      );

      const [data, total] = await qb.getManyAndCount();
      const raws = await qb.getRawMany<{
        additionsTotal: string;
        extensionTotal: string;
      }>();

      const enriched: ContractListItem[] = data.map((c, i) => {
        const raw = raws[i];
        const additions = Number(raw?.additionsTotal || 0);
        const extDays = Number(raw?.extensionTotal || 0);
        const base = Number(c.totalAmount || 0);
        const real = base + additions;
        const endDateReal = c.endDate
          ? new Date(
              new Date(c.endDate).getTime() + extDays * 24 * 60 * 60 * 1000,
            )
          : null;
        return {
          ...c,
          totalAmountBase: String(c.totalAmount),
          additionsTotal: String(additions),
          totalAmount: String(real),
          totalAmountReal: String(real),
          extensionDaysTotal: extDays,
          endDateReal,
        } as ContractListItem;
      });

      return paginatedResponse(enriched, total, filter);
    }

    qb.leftJoinAndSelect("contract.thirdParty", "thirdPartyFull");
    qb.leftJoinAndSelect("contract.supervisor", "supervisorFull");

    const [data, total] = await qb.getManyAndCount();
    if (!data.length) {
      return paginatedResponse([], total, filter);
    }

    const ids = data.map((c) => c.id);
    const sums = await this.addendumRepo
      .createQueryBuilder("a")
      .select("a.contractId", "contractId")
      .addSelect(
        "COALESCE(SUM(CAST(a.additionalAmount AS DECIMAL)),0)",
        "additionsSum",
      )
      .addSelect("COALESCE(SUM(a.additionalDays),0)", "extensionSum")
      .where("a.contractId IN (:...ids) AND a.companyId = :companyId", {
        ids,
        companyId,
      })
      .andWhere("a.isActive = true")
      .groupBy("a.contractId")
      .getRawMany<SumByContract>();

    const map = new Map<
      string,
      { additionsSum: number; extensionSum: number }
    >();
    for (const s of sums) {
      map.set(s.contractId, {
        additionsSum: Number(s.additionsSum || 0),
        extensionSum: Number(s.extensionSum || 0),
      });
    }

    const enriched: ContractDetailWithTotals[] = data.map((c) => {
      const found = map.get(c.id);
      const additionsSum = found?.additionsSum ?? 0;
      const extensionSum = found?.extensionSum ?? 0;
      const base = Number(c.totalAmount || 0);
      const endDateReal = c.endDate
        ? new Date(
            new Date(c.endDate).getTime() + extensionSum * 24 * 60 * 60 * 1000,
          )
        : null;
      return {
        ...c,
        totalAmountBase: String(c.totalAmount),
        additionsTotal: String(additionsSum),
        totalAmountReal: String(base + additionsSum),
        extensionDaysTotal: extensionSum,
        endDateReal,
      };
    });

    return paginatedResponse(enriched, total, filter);
  }

  async findOne(
    id: string,
    companyId: string,
  ): Promise<ContractDetailWithTotals> {
    const one = await this.repo.findOne({
      where: { id, companyId },
      relations: ["thirdParty", "supervisor", "addendums"],
    });
    if (!one) throw new NotFoundException(`Contract ${id} not found`);

    const additions =
      one.addendums
        ?.filter((a) => a.isActive && a.additionalAmount)
        .reduce((acc, a) => acc + Number(a.additionalAmount), 0) ?? 0;

    const extensionDays =
      one.addendums
        ?.filter((a) => a.isActive && a.additionalDays)
        .reduce((acc, a) => acc + Number(a.additionalDays ?? 0), 0) ?? 0;

    const base = Number(one.totalAmount || 0);
    const endDateReal = one.endDate
      ? new Date(
          new Date(one.endDate).getTime() + extensionDays * 24 * 60 * 60 * 1000,
        )
      : null;

    return {
      ...one,
      totalAmountBase: String(one.totalAmount),
      additionsTotal: String(additions),
      totalAmountReal: String(base + additions),
      totalAmount: String(base + additions),
      extensionDaysTotal: extensionDays,
      endDateReal,
    };
  }

  async update(
    id: string,
    dto: UpdateContractDto,
    companyId: string,
  ): Promise<Contract> {
    const entity = await this.repo.findOne({ where: { id, companyId } });
    if (!entity) throw new NotFoundException(`Contract ${id} not found`);
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
    const entity = await this.repo.findOne({ where: { id, companyId } });
    if (!entity) throw new NotFoundException(`Contract ${id} not found`);
    entity.status = status;
    return this.repo.save(entity);
  }

  async toggleActive(id: string, companyId: string): Promise<Contract> {
    const entity = await this.repo.findOne({ where: { id, companyId } });
    if (!entity) throw new NotFoundException(`Contract ${id} not found`);
    entity.isActive = !entity.isActive;
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string): Promise<{ message: string }> {
    const entity = await this.repo.findOne({ where: { id, companyId } });
    if (!entity) throw new NotFoundException(`Contract ${id} not found`);
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
