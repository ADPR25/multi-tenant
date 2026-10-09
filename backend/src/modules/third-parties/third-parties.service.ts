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
      where: { companyId, nit: dto.nit },
    });
    if (exists)
      throw new ConflictException(`Tercero con NIT ${dto.nit} ya existe`);
    return this.repo.save(this.repo.create({ ...dto, companyId }));
  }

  async findAll(companyId: string, query: FilterDto, state?: boolean) {
    const isSelect = query.find === "select";
    const tipo = query.tipo as ThirdPartyType | undefined;
    const search = query.search?.trim();

    const baseWhere: ThirdPartyWhere = {
      companyId,
      ...(state !== undefined ? { isActive: state } : {}),
      ...(tipo ? { tipo } : {}),
    };

    // sin search
    if (!search) {
      const [data, total] = await this.repo.findAndCount({
        where: baseWhere,
        ...(isSelect
          ? { select: ["id", "nit", "razonSocial", "tipo"] as const }
          : {}),
        order: { createdAt: "DESC" },
        ...paginate(query),
      });
      return paginatedResponse(data, total, query);
    }

    // con search
    const searchWhere: ThirdPartyWhere[] = [
      { ...baseWhere, nit: ILike(`%${search}%`) },
      { ...baseWhere, razonSocial: ILike(`%${search}%`) },
      { ...baseWhere, nombreComercial: ILike(`%${search}%`) },
      { ...baseWhere, email: ILike(`%${search}%`) },
    ];

    const [data, total] = await this.repo.findAndCount({
      where: searchWhere,
      ...(isSelect
        ? { select: ["id", "nit", "razonSocial", "tipo"] as const }
        : {}),
      order: { createdAt: "DESC" },
      ...paginate(query),
    });
    return paginatedResponse(data, total, query);
  }

  async findOne(id: string, companyId: string): Promise<ThirdParty> {
    const one = await this.repo.findOne({ where: { id, companyId } });
    if (!one) throw new NotFoundException(`Tercero ${id} no encontrado`);
    return one;
  }

  async update(
    id: string,
    dto: UpdateThirdPartyDto,
    companyId: string,
  ): Promise<ThirdParty> {
    const entity = await this.findOne(id, companyId);
    if (dto.nit && dto.nit !== entity.nit) {
      const exists = await this.repo.findOne({
        where: { companyId, nit: dto.nit },
      });
      if (exists)
        throw new ConflictException(`Tercero con NIT ${dto.nit} ya existe`);
    }
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async toggleActive(id: string, companyId: string): Promise<ThirdParty> {
    const entity = await this.findOne(id, companyId);
    entity.isActive = !entity.isActive;
    return this.repo.save(entity);
  }

  async findForSelect(companyId: string, tipo?: ThirdPartyType) {
    return this.repo.find({
      where: { companyId, isActive: true, ...(tipo ? { tipo } : {}) },
      select: ["id", "nit", "razonSocial", "tipo"],
      order: { razonSocial: "ASC" },
      take: 100,
    });
  }
}
