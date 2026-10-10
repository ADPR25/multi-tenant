import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { ThirdParty } from "./entities/third-party.entity";
import { CreateThirdPartyDto } from "./dto/create-third-party.dto";
import { UpdateThirdPartyDto } from "./dto/update-third-party.dto";
import { FilterDto } from "@/common/filters/filter.dto";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";
import { ThirdPartyType } from "./enums/third-party-type.enum";

type ThirdPartyWhere = FindOptionsWhere<ThirdParty>;
@Injectable()
export class ThirdPartiesService {
  constructor(
    @InjectRepository(ThirdParty)
    private readonly repo: Repository<ThirdParty>,
  ) {}

  async create(
    dto: CreateThirdPartyDto,
    companyId: string,
  ): Promise<ThirdParty> {
    const exists = await this.repo.findOne({
      where: { companyId, taxId: dto.taxId },
    });
    if (exists)
      throw new ConflictException(
        `Third party with Tax ID ${dto.taxId} already exists`,
      );
    return this.repo.save(this.repo.create({ ...dto, companyId }));
  }

  async findAll(companyId: string, query: FilterDto, state?: boolean) {
    const isSelect = query.find === "select";
    const type = query.tipo as ThirdPartyType | undefined;
    const search = query.search?.trim();

    const baseWhere: ThirdPartyWhere = {
      companyId,
      ...(state !== undefined ? { isActive: state } : {}),
      ...(type ? { type } : {}),
    };

    if (!search) {
      const [data, total] = await this.repo.findAndCount({
        where: baseWhere,
        ...(isSelect
          ? { select: ["id", "taxId", "legalName", "type"] as const }
          : {}),
        order: { createdAt: "DESC" },
        ...paginate(query),
      });
      return paginatedResponse(data, total, query);
    }

    const searchWhere: ThirdPartyWhere[] = [
      { ...baseWhere, taxId: ILike(`%${search}%`) },
      { ...baseWhere, legalName: ILike(`%${search}%`) },
      { ...baseWhere, tradeName: ILike(`%${search}%`) },
      { ...baseWhere, email: ILike(`%${search}%`) },
    ];

    const [data, total] = await this.repo.findAndCount({
      where: searchWhere,
      ...(isSelect
        ? { select: ["id", "taxId", "legalName", "type"] as const }
        : {}),
      order: { createdAt: "DESC" },
      ...paginate(query),
    });
    return paginatedResponse(data, total, query);
  }

  async findOne(id: string, companyId: string): Promise<ThirdParty> {
    const entity = await this.repo.findOne({ where: { id, companyId } });
    if (!entity) throw new NotFoundException(`Third party ${id} not found`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateThirdPartyDto,
    companyId: string,
  ): Promise<ThirdParty> {
    const entity = await this.findOne(id, companyId);
    if (dto.taxId && dto.taxId !== entity.taxId) {
      const exists = await this.repo.findOne({
        where: { companyId, taxId: dto.taxId },
      });
      if (exists)
        throw new ConflictException(
          `Third party with Tax ID ${dto.taxId} already exists`,
        );
    }
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async toggleActive(id: string, companyId: string): Promise<ThirdParty> {
    const entity = await this.findOne(id, companyId);
    entity.isActive = !entity.isActive;
    return this.repo.save(entity);
  }

  async findForSelect(companyId: string, type?: ThirdPartyType) {
    return this.repo.find({
      where: { companyId, isActive: true, ...(type ? { type } : {}) },
      select: ["id", "taxId", "legalName", "type"],
      order: { legalName: "ASC" },
      take: 100,
    });
  }
}
