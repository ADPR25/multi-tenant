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
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

type UserWithoutPassword = Omit<User, "password">;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private configService: ConfigService,
  ) {}

  private getBcryptRounds(): number {
    return this.configService.getOrThrow<number>("config.bcrypt.rounds");
  }

  async create(
    dto: CreateUserDto & { companyId: string },
  ): Promise<UserWithoutPassword> {
    const emailExists = await this.repo.findOne({
      where: { companyId: dto.companyId, email: dto.email },
    });
    if (emailExists)
      throw new ConflictException("Email already registered in this company");

    const docExists = await this.repo.findOne({
      where: { document_number: dto.document_number },
    });
    if (docExists)
      throw new ConflictException(
        `Document ${dto.document_number} already registered in the system`,
      );

    const role = await this.repo.manager.findOne(Role, {
      where: { id: dto.roleId, companyId: dto.companyId },
    });
    if (!role)
      throw new NotFoundException("The role does not belong to this company");

    const hashed = await bcrypt.hash(dto.password, this.getBcryptRounds());
    const user = this.repo.create({ ...dto, password: hashed });
    const saved = await this.repo.save(user);
    const { password, ...result } = saved;
    void password;
    return result;
  }

  async findAll(companyId: string, pagination: PaginationDto) {
    const [data, total] = await this.repo.findAndCount({
      where: { companyId },
      relations: { role: true },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const user = await this.repo.findOne({
      where: { id, companyId },
      relations: { role: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByDocumentNumber(document_number: string): Promise<User | null> {
    return this.repo.findOne({
      where: { document_number },
      select: {
        id: true,
        email: true,
        password: true,
        document_number: true,
        companyId: true,
        roleId: true,
        isActive: true,
      },
    });
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateUserDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.findOne(id, companyId);

    if (dto.document_number && dto.document_number !== user.document_number) {
      const docExists = await this.repo.findOne({
        where: { document_number: dto.document_number },
      });
      if (docExists && docExists.id !== id) {
        throw new ConflictException(
          `Document ${dto.document_number} already registered in the system`,
        );
      }
    }

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.repo.findOne({
        where: { companyId, email: dto.email },
      });
      if (emailExists && emailExists.id !== id) {
        throw new ConflictException("Email already registered in this company");
      }
    }

    if (dto.roleId && dto.roleId !== user.roleId) {
      const role = await this.repo.manager.findOne(Role, {
        where: { id: dto.roleId, companyId },
      });
      if (!role) {
        throw new BadRequestException(
          "The role does not belong to this company",
        );
      }
    }

    let hashedPassword: string | undefined;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, this.getBcryptRounds());
    }

    Object.assign(user, {
      ...dto,
      ...(hashedPassword ? { password: hashedPassword } : {}),
    });

    const saved = await this.repo.save(user);
    const { password, ...result } = saved;
    void password;
    return result;
  }

  async toggleActive(id: string, companyId: string) {
    const user = await this.findOne(id, companyId);
    user.isActive = !user.isActive;
    return this.repo.save(user);
  }
}
