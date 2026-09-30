import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Role } from "../roles/entities/role.entity";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { paginate, paginatedResponse } from "@/common/helpers/pagination.helper";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private configService: ConfigService,
  ) {}

  private getBcryptRounds(): number {
    return this.configService.getOrThrow<number>("config.bcrypt.rounds");
  }

  async create(dto: CreateUserDto & { companyId: string }) {
    const emailExists = await this.repo.findOne({
      where: { companyId: dto.companyId, email: dto.email },
    });
    if (emailExists)
      throw new ConflictException("Email ya registrado en esta empresa");

    const docExists = await this.repo.findOne({
      where: { document_number: dto.document_number },
    });
    if (docExists)
      throw new ConflictException(
        `Documento ${dto.document_number} ya registrado en el sistema`,
      );

    const role = await this.repo.manager.findOne(Role, {
      where: { id: dto.roleId, companyId: dto.companyId },
    });
    if (!role)
      throw new NotFoundException("El rol no pertenece a esta empresa");

    const hashed = await bcrypt.hash(dto.password, this.getBcryptRounds());
    const user = this.repo.create({ ...dto, password: hashed });
    const saved = await this.repo.save(user);
    const { password, ...result } = saved as any;
    return result;
  }

  async findAll(companyId: string, pagination: PaginationDto) {
    const [data, total] = await this.repo.findAndCount({
      where: { companyId },
      relations: { role: true },
      ...paginate(pagination)
    });
    return paginatedResponse(data, total, pagination)
  }

  async findOne(id: string, companyId: string) {
    const user = await this.repo.findOne({
      where: { id, companyId },
      relations: { role: true },
    });
    if (!user) throw new NotFoundException("Usuario no encontrado");
    return user;
  }

  async findByDocumentNumber(document_number: string) {
    return this.repo.findOne({
      where: { document_number },
      select: [
        "id",
        "email",
        "password",
        "document_number",
        "companyId",
        "roleId",
        "isActive",
      ] as any,
    });
  }

  async update(id: string, companyId: string, dto: UpdateUserDto) {
    const user = await this.findOne(id, companyId);

    if (
      (dto as any).document_number &&
      (dto as any).document_number !== user.document_number
    ) {
      const docExists = await this.repo.findOne({
        where: { document_number: (dto as any).document_number },
      });
      if (docExists && docExists.id !== id) {
        throw new ConflictException(
          `Documento ${(dto as any).document_number} ya registrado en el sistema`,
        );
      }
    }

    if ((dto as any).email && (dto as any).email !== user.email) {
      const emailExists = await this.repo.findOne({
        where: { companyId, email: (dto as any).email },
      });
      if (emailExists && emailExists.id !== id) {
        throw new ConflictException("Email ya registrado en esta empresa");
      }
    }

    if ((dto as any).roleId && (dto as any).roleId !== user.roleId) {
      const role = await this.repo.manager.findOne(Role, {
        where: { id: (dto as any).roleId, companyId },
      });
      if (!role) {
        throw new BadRequestException("El rol no pertenece a esta empresa");
      }
    }

    if ((dto as any).password) {
      (dto as any).password = await bcrypt.hash(
        (dto as any).password,
        this.getBcryptRounds(),
      );
    }

    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    const { password, ...result } = saved as any;
    return result;
  }

  async toggleActive(id: string, companyId: string) {
    const category = await this.findOne(id, companyId);
    category.isActive = !category.isActive;
    return this.repo.save(category);
  }
}
