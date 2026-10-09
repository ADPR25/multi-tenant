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
      nombre: dto.nombre,
      companyId,
      descripcion: dto.descripcion ?? null,
      orden: dto.orden ?? 0,
      estado: dto.estado,
      responsableId: dto.responsableId ?? null,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
    });
    return this.repo.save(entity);
  }

  async findByProject(projectId: string, companyId: string): Promise<ProjectActivity[]> {
    return this.repo.find({
      where: { projectId, companyId },
      order: { orden: "ASC", createdAt: "ASC" },
    });
  }

  async findByPhase(phaseId: string, companyId: string): Promise<ProjectActivity[]> {
    return this.repo.find({
      where: { phaseId, companyId },
      order: { orden: "ASC" },
    });
  }

  async findOne(id: string, companyId: string): Promise<ProjectActivity> {
    const e = await this.repo.findOne({ where: { id, companyId } });
    if (!e) throw new NotFoundException(`Actividad ${id} no encontrada`);
    return e;
  }

  async update(id: string, dto: UpdateActivityDto, companyId: string): Promise<ProjectActivity> {
    const e = await this.findOne(id, companyId);
    Object.assign(e, {
      ...dto,
      ...(dto.fechaInicio !== undefined ? { fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null } : {}),
      ...(dto.fechaFin !== undefined ? { fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null } : {}),
    });
    return this.repo.save(e);
  }

  async remove(id: string, companyId: string): Promise<{ message: string }> {
    const e = await this.findOne(id, companyId);
    await this.repo.remove(e);
    return { message: `Actividad ${id} eliminada` };
  }
}