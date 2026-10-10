import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProjectTask } from "./entities/project-task.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { FilterDto } from "@/common/filters/filter.dto";
import { paginatedResponse } from "@/common/helpers/pagination.helper";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(ProjectTask)
    private readonly repo: Repository<ProjectTask>,
  ) {}

  async create(dto: CreateTaskDto, companyId: string): Promise<ProjectTask> {
    const entity = this.repo.create({
      projectId: dto.projectId,
      phaseId: dto.phaseId ?? null,
      activityId: dto.activityId,
      title: dto.title,
      companyId,
      description: dto.description ?? null,
      status: dto.status,
      priority: dto.priority,
      responsibleId: dto.responsibleId ?? null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      estimatedHours: dto.estimatedHours ?? null,
      actualHours: dto.actualHours ?? null,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.repo.save(entity);
  }

  async findByProject(projectId: string, companyId: string, query?: FilterDto) {
    const qb = this.repo
      .createQueryBuilder("task")
      .where("task.projectId = :projectId", { projectId })
      .andWhere("task.companyId = :companyId", { companyId })
      .orderBy("task.sortOrder", "ASC");

    if (query?.search?.trim()) {
      qb.andWhere("(task.title ILIKE :s OR task.description ILIKE :s)", {
        s: `%${query.search}%`,
      });
    }

    if (query && query.limit !== "all") {
      qb.skip(query.skip).take(query.limit);
    }

    const [data, total] = await qb.getManyAndCount();

    if (query) {
      return paginatedResponse(data, total, query);
    }
    return data;
  }

  async findByActivity(
    activityId: string,
    companyId: string,
  ): Promise<ProjectTask[]> {
    return this.repo.find({
      where: { activityId, companyId },
      order: { sortOrder: "ASC" },
    });
  }

  async findOne(id: string, companyId: string): Promise<ProjectTask> {
    const entity = await this.repo.findOne({ where: { id, companyId } });
    if (!entity) throw new NotFoundException(`Task ${id} not found`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    companyId: string,
  ): Promise<ProjectTask> {
    const entity = await this.findOne(id, companyId);
    Object.assign(entity, {
      ...dto,
      ...(dto.dueDate !== undefined
        ? {
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          }
        : {}),
    });
    return this.repo.save(entity);
  }

  async toggleActive(id: string, companyId: string): Promise<ProjectTask> {
    const entity = await this.findOne(id, companyId);
    entity.isActive = !entity.isActive;
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string): Promise<{ message: string }> {
    const entity = await this.findOne(id, companyId);
    await this.repo.remove(entity);
    return { message: `Task ${id} deleted` };
  }
}
