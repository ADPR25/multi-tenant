import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project } from "./entities/project.entity";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import {
  PaginatedResponseDto,
  PaginationDto,
} from "@/common/dto/pagination.dto";
import { paginatedResponse } from "@/common/helpers/pagination.helper";
import { User } from "@/core/iam/users/entities/user.entity";
import { ThirdParty } from "@/modules/third-parties/entities/third-party.entity";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly repo: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto, companyId: string): Promise<Project> {
    const exists = await this.repo.findOne({
      where: { companyId, code: dto.code },
    });
    if (exists)
      throw new ConflictException(`Project ${dto.code} already exists`);

    const entity = this.repo.create({
      companyId,
      code: dto.code.trim(),
      name: dto.name.trim(),
      description: dto.description ?? null,
      status: dto.status,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      budget: dto.budget ?? null,
      progress: dto.progress ?? 0,
      clientId: dto.clientId || null,
      responsibleId: dto.responsibleId || null,
    });

    const saved = await this.repo.save(entity);
    return this.findOne(saved.id, companyId);
  }

  async findAll(
    companyId: string,
    pagination: PaginationDto,
    search?: string,
  ): Promise<PaginatedResponseDto<Project>> {
    const qb = this.repo
      .createQueryBuilder("project")
      .select([
        "project.id",
        "project.name",
        "project.clientId",
        "project.progress",
        "project.code",
        "project.isActive",
        "project.createdAt",
      ])
      .where("project.companyId = :companyId", { companyId })
      .orderBy("project.createdAt", "DESC");

    if (search?.trim()) {
      qb.andWhere(
        "(project.code ILIKE :s OR project.name ILIKE :s OR project.description ILIKE :s)",
        { s: `%${search}%` },
      );
    }

    if (pagination.limit !== "all") {
      qb.skip(pagination.skip).take(pagination.limit);
    }

    const [data, total] = await qb.getManyAndCount();
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string): Promise<Project> {
    const project = await this.repo.findOne({
      where: { id, companyId },
      relations: ["client", "responsible"],
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    companyId: string,
  ): Promise<Project> {
    const entity = await this.findOne(id, companyId);

    if (dto.code !== undefined) entity.code = dto.code;
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.description !== undefined)
      entity.description = dto.description ?? null;
    if (dto.status !== undefined) entity.status = dto.status;
    if (dto.startDate !== undefined)
      entity.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined)
      entity.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.budget !== undefined) entity.budget = dto.budget ?? null;
    if (dto.progress !== undefined) entity.progress = dto.progress;

    if (dto.clientId !== undefined) {
      entity.clientId = dto.clientId || null;
      entity.client = dto.clientId
        ? ({ id: dto.clientId } as ThirdParty)
        : null;
    }

    if (dto.responsibleId !== undefined) {
      entity.responsibleId = dto.responsibleId || null;
      entity.responsible = dto.responsibleId
        ? ({ id: dto.responsibleId } as User)
        : null;
    }

    const saved = await this.repo.save(entity);
    return this.findOne(saved.id, companyId);
  }

  async toggleActive(id: string, companyId: string): Promise<Project> {
    const entity = await this.findOne(id, companyId);
    entity.isActive = !entity.isActive;
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string): Promise<{ message: string }> {
    const entity = await this.findOne(id, companyId);
    await this.repo.remove(entity);
    return { message: `Project ${id} deleted` };
  }
}
