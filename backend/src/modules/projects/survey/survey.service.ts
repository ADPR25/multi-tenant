import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { Survey } from "./entities/survey.entity";
import { CreateSurveyDto } from "./dto/create-survey.dto";
import { UpdateSurveyDto } from "./dto/update-survey.dto";
import { FilterDto } from "@/common/filters/filter.dto";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

type SurveyWithVirtual = Survey & { isActive: boolean };

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly repo: Repository<Survey>,
  ) {}

  private isActiveByDate(
    endDate: Survey["endDate"] | string | null | undefined,
  ): boolean {
    if (!endDate) return true;
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const today = new Date();

    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const todayDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    return todayDay <= endDay;
  }

  private withVirtualIsActive(survey: Survey): SurveyWithVirtual {
    return {
      ...survey,
      isActive: this.isActiveByDate(survey.endDate),
    };
  }

  private generateCode(length = 6): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists: Survey | null;
    do {
      code = this.generateCode();
      exists = await this.repo.findOne({ where: { code }, select: ["id"] });
    } while (exists);
    return code;
  }

  async create(
    dto: CreateSurveyDto,
    companyId: string,
  ): Promise<SurveyWithVirtual> {
    const exists = await this.repo.findOne({
      where: { companyId, title: dto.title },
    });
    if (exists) {
      throw new ConflictException(`Survey ${dto.title} already exists`);
    }

    const code = await this.generateUniqueCode();

    const data = this.repo.create({
      ...dto,
      companyId,
      code,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });

    const saved = await this.repo.save(data);
    return this.withVirtualIsActive(saved);
  }

  async findAll(
    companyId: string,
    pagination: FilterDto,
    state?: boolean,
    search?: string,
  ) {
    const where: FindOptionsWhere<Survey> = {
      companyId,
    };

    let data: Survey[];
    let total: number;

    if (!search) {
      [data, total] = await this.repo.findAndCount({
        where,
        order: { createdAt: "DESC" },
        select: { id: true, description: true, title: true, endDate: true },
        ...paginate(pagination),
      });
    } else {
      [data, total] = await this.repo.findAndCount({
        where: [
          { ...where, title: ILike(`%${search}%`) },
          { ...where, description: ILike(`%${search}%`) },
        ],
        order: { createdAt: "DESC" },
        select: { id: true, description: true, title: true, endDate: true },
        ...paginate(pagination),
      });
    }

    let mapped = data.map((s) => this.withVirtualIsActive(s));

    if (state !== undefined) {
      mapped = mapped.filter((s) => s.isActive === state);
      total = mapped.length;
    }

    return paginatedResponse(mapped, total, pagination);
  }

  async findOne(id: string, companyId: string): Promise<Survey> {
    const survey = await this.repo.findOne({
      where: { id, companyId },
      select: {
        title: true,
        endDate: true,
        survey: true,
        description: true,
        id: true,
        companyId: true,
      },
    });
    if (!survey) {
      throw new NotFoundException(`Survey with id ${id} not found`);
    }
    return survey;
  }

  async update(
    id: string,
    dto: UpdateSurveyDto,
    companyId: string,
  ): Promise<SurveyWithVirtual> {
    const raw = await this.repo.findOne({
      where: { id, companyId },
    });
    if (!raw) {
      throw new NotFoundException(`Survey with id ${id} not found`);
    }

    if (dto.title && dto.title !== raw.title) {
      const exists = await this.repo.findOne({
        where: { companyId, title: dto.title },
      });
      if (exists) {
        throw new ConflictException(`Survey ${dto.title} already exists`);
      }
    }

    Object.assign(raw, {
      ...dto,
      ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
    });

    const saved = await this.repo.save(raw);
    return this.withVirtualIsActive(saved);
  }

  async remove(id: string, companyId: string) {
    const survey = await this.repo.findOne({
      where: { id, companyId },
    });
    if (!survey) {
      throw new NotFoundException(`Survey with id ${id} not found`);
    }
    return this.repo.softRemove(survey);
  }
}
