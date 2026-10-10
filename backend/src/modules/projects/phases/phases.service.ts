import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProjectPhase } from "./entities/project-phase.entity";
import { CreatePhaseDto } from "./dto/create-phase.dto";
import { UpdatePhaseDto } from "./dto/update-phase.dto";

@Injectable()
export class PhasesService {
  constructor(
    @InjectRepository(ProjectPhase)
    private readonly repo: Repository<ProjectPhase>,
  ) {}

  async create(dto: CreatePhaseDto, companyId: string): Promise<ProjectPhase> {
    const exists = await this.repo.findOne({
      where: {
        companyId,
        projectId: dto.projectId,
        code: dto.code,
      },
    });
    if (exists) throw new ConflictException(`Phase ${dto.code} already exists`);
    const entity = this.repo.create({
      projectId: dto.projectId,
      code: dto.code,
      name: dto.name,
      companyId,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      budget: dto.budget ?? null,
    });
    return this.repo.save(entity);
  }

  async findByProject(
    projectId: string,
    companyId: string,
  ): Promise<ProjectPhase[]> {
    return this.repo.find({
      where: { projectId, companyId },
      order: { sortOrder: "ASC" },
    });
  }

  async findOne(id: string, companyId: string): Promise<ProjectPhase> {
    const entity = await this.repo.findOne({
      where: { id, companyId },
    });
    if (!entity) throw new NotFoundException(`Phase ${id} not found`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdatePhaseDto,
    companyId: string,
  ): Promise<ProjectPhase> {
    const entity = await this.findOne(id, companyId);
    Object.assign(entity, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.code !== undefined ? { code: dto.code } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description ?? null }
        : {}),
      ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.startDate !== undefined
        ? { startDate: dto.startDate ? new Date(dto.startDate) : null }
        : {}),
      ...(dto.endDate !== undefined
        ? { endDate: dto.endDate ? new Date(dto.endDate) : null }
        : {}),
      ...(dto.budget !== undefined ? { budget: dto.budget ?? null } : {}),
    });
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string): Promise<{ message: string }> {
    const entity = await this.findOne(id, companyId);
    await this.repo.remove(entity);
    return { message: `Phase ${id} deleted` };
  }
}
