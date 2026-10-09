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
        codigo: dto.codigo,
      },
    });
    if (exists) throw new ConflictException(`Fase ${dto.codigo} ya existe`);
    const entity = this.repo.create({
      projectId: dto.projectId,
      codigo: dto.codigo,
      nombre: dto.nombre,
      companyId,
      descripcion: dto.descripcion ?? null,
      orden: dto.orden ?? 0,
      estado: dto.estado,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
      presupuesto: dto.presupuesto ?? null,
    });
    return this.repo.save(entity);
  }

  async findByProject(
    projectId: string,
    companyId: string,
  ): Promise<ProjectPhase[]> {
    return this.repo.find({
      where: { projectId, companyId },
      order: { orden: "ASC" },
    });
  }

  async findOne(id: string, companyId: string): Promise<ProjectPhase> {
    const e = await this.repo.findOne({
      where: { id, companyId },
    });
    if (!e) throw new NotFoundException(`Fase ${id} no encontrada`);
    return e;
  }

  async update(
    id: string,
    dto: UpdatePhaseDto,
    companyId: string,
  ): Promise<ProjectPhase> {
    const e = await this.findOne(id, companyId);
    Object.assign(e, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.descripcion !== undefined
        ? { descripcion: dto.descripcion ?? null }
        : {}),
      ...(dto.orden !== undefined ? { orden: dto.orden } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
    });
    return this.repo.save(e);
  }

  async remove(id: string, companyId: string): Promise<{ message: string }> {
    const e = await this.findOne(id, companyId);
    await this.repo.remove(e);
    return { message: `Fase ${id} eliminada` };
  }
}
