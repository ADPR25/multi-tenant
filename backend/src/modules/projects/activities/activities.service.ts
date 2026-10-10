import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProjectActivity } from "./entities/project-activity.entity";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(ProjectActivity)
    private readonly repo: Repository<ProjectActivity>,
  ) {}

  async create(dto: CreateActivityDto, companyId: string): Promise<ProjectActivity> {
    const entity = this.repo.create({
      projectId: dto.projectId,
      phaseId: dto.phaseId,
      name: dto.name,
      companyId,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status,
      responsibleId: dto.responsibleId ?? null,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
    return this.repo.save(entity);
  }

  async findByProject(projectId: string, companyId: string): Promise<ProjectActivity[]> {
    return this.repo.find({
      where: { projectId, companyId },
      order: { sortOrder: "ASC", createdAt: "ASC" },
    });
  }

  async findByPhase(phaseId: string, companyId: string): Promise<ProjectActivity[]> {
    return this.repo.find({
      where: { phaseId, companyId },
      order: { sortOrder: "ASC" },
    });
  }

  async findOne(id: string, companyId: string): Promise<ProjectActivity> {
    const entity = await this.repo.findOne({ where: { id, companyId } });
    if (!entity) throw new NotFoundException(`Activity ${id} not found`);
    return entity;
  }

  async update(id: string, dto: UpdateActivityDto, companyId: string): Promise<ProjectActivity> {
    const entity = await this.findOne(id, companyId);
    Object.assign(entity, {
      ...dto,
      ...(dto.startDate !== undefined ? { startDate: dto.startDate ? new Date(dto.startDate) : null } : {}),
      ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
    });
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string): Promise<{ message: string }> {
    const entity = await this.findOne(id, companyId);
    await this.repo.remove(entity);
    return { message: `Activity ${id} deleted` };
  }
}