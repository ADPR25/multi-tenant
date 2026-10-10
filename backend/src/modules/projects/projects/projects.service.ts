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
      code: dto.code,
      name: dto.name,
      companyId,
      description: dto.description ?? null,
      status: dto.status,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      budget: dto.budget ?? null,
      progress: dto.progress ?? 0,
      clientId: dto.clientId ?? null,
      responsibleId: dto.responsibleId ?? null,
    });
    return this.repo.save(entity);
  }

  async findAll(
    companyId: string,
    pagination: PaginationDto,
    search?: string,
  ): Promise<PaginatedResponseDto<Project>> {
    const qb = this.repo
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.client", "client")
      .leftJoinAndSelect("project.responsible", "responsible")
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
    Object.assign(entity, {
      ...(dto.code !== undefined ? { code: dto.code } : {}),
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description ?? null }
        : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.startDate !== undefined
        ? { startDate: dto.startDate ? new Date(dto.startDate) : null }
        : {}),
      ...(dto.endDate !== undefined
        ? { endDate: dto.endDate ? new Date(dto.endDate) : null }
        : {}),
      ...(dto.budget !== undefined ? { budget: dto.budget ?? null } : {}),
      ...(dto.progress !== undefined ? { progress: dto.progress } : {}),
      ...(dto.clientId !== undefined ? { clientId: dto.clientId ?? null } : {}),
      ...(dto.responsibleId !== undefined
        ? { responsibleId: dto.responsibleId ?? null }
        : {}),
    });
    return this.repo.save(entity);
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
