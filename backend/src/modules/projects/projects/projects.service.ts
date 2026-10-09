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
      where: { companyId, codigo: dto.codigo },
    });
    if (exists) throw new ConflictException(`Proyecto ${dto.codigo} ya existe`);
    const entity = this.repo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      companyId,
      descripcion: dto.descripcion ?? null,
      estado: dto.estado,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
      presupuesto: dto.presupuesto ?? null,
      avance: dto.avance ?? 0,
      clienteId: dto.clienteId ?? null,
      responsableId: dto.responsableId ?? null,
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
      .leftJoinAndSelect("project.cliente", "cliente")
      .leftJoinAndSelect("project.responsable", "responsable")
      .where("project.companyId = :companyId", { companyId })
      .orderBy("project.createdAt", "DESC");

    if (search?.trim()) {
      qb.andWhere(
        "(project.codigo ILIKE :s OR project.nombre ILIKE :s OR project.descripcion ILIKE :s)",
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
    const p = await this.repo.findOne({
      where: { id, companyId },
      relations: ["cliente", "responsable"],
    });
    if (!p) throw new NotFoundException(`Proyecto ${id} no encontrado`);
    return p;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    companyId: string,
  ): Promise<Project> {
    const entity = await this.findOne(id, companyId);
    Object.assign(entity, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.descripcion !== undefined
        ? { descripcion: dto.descripcion ?? null }
        : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
      ...(dto.fechaInicio !== undefined
        ? { fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null }
        : {}),
      ...(dto.fechaFin !== undefined
        ? { fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null }
        : {}),
      ...(dto.presupuesto !== undefined
        ? { presupuesto: dto.presupuesto ?? null }
        : {}),
      ...(dto.avance !== undefined ? { avance: dto.avance } : {}),
      ...(dto.clienteId !== undefined
        ? { clienteId: dto.clienteId ?? null }
        : {}),
      ...(dto.responsableId !== undefined
        ? { responsableId: dto.responsableId ?? null }
        : {}),
    });
    return this.repo.save(entity);
  }

  async toggleActive(id: string, companyId: string): Promise<Project> {
    const e = await this.findOne(id, companyId);
    e.isActive = !e.isActive;
    return this.repo.save(e);
  }

  async remove(id: string, companyId: string): Promise<{ message: string }> {
    const e = await this.findOne(id, companyId);
    await this.repo.remove(e);
    return { message: `Proyecto ${id} eliminado` };
  }
}
