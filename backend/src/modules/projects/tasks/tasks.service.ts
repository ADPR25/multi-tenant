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
      titulo: dto.titulo,
      companyId,
      descripcion: dto.descripcion ?? null,
      estado: dto.estado,
      prioridad: dto.prioridad,
      responsableId: dto.responsableId ?? null,
      fechaVencimiento: dto.fechaVencimiento
        ? new Date(dto.fechaVencimiento)
        : null,
      horasEstimadas: dto.horasEstimadas ?? null,
      horasReales: dto.horasReales ?? null,
      orden: dto.orden ?? 0,
    });
    return this.repo.save(entity);
  }

  async findByProject(projectId: string, companyId: string, query?: FilterDto) {
    const qb = this.repo
      .createQueryBuilder("task")
      .where("task.projectId = :projectId", { projectId })
      .andWhere("task.companyId = :companyId", { companyId })
      .orderBy("task.orden", "ASC");

    if (query?.search?.trim()) {
      qb.andWhere("(task.titulo ILIKE :s OR task.descripcion ILIKE :s)", {
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
      order: { orden: "ASC" },
    });
  }

  async findOne(id: string, companyId: string): Promise<ProjectTask> {
    const e = await this.repo.findOne({ where: { id, companyId } });
    if (!e) throw new NotFoundException(`Tarea ${id} no encontrada`);
    return e;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    companyId: string,
  ): Promise<ProjectTask> {
    const e = await this.findOne(id, companyId);
    Object.assign(e, {
      ...dto,
      ...(dto.fechaVencimiento !== undefined
        ? {
            fechaVencimiento: dto.fechaVencimiento
              ? new Date(dto.fechaVencimiento)
              : null,
          }
        : {}),
    });
    return this.repo.save(e);
  }

  async toggleActive(id: string, companyId: string): Promise<ProjectTask> {
    const e = await this.findOne(id, companyId);
    const entityWithActive = e as ProjectTask & { isActive: boolean };
    entityWithActive.isActive = !entityWithActive.isActive;
    return this.repo.save(entityWithActive);
  }

  async remove(id: string, companyId: string): Promise<{ message: string }> {
    const e = await this.findOne(id, companyId);
    await this.repo.remove(e);
    return { message: `Tarea ${id} eliminada` };
  }
}
