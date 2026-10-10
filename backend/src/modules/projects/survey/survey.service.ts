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

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly repo: Repository<Survey>,
  ) {}

  async create(dto: CreateSurveyDto, companyId: string) {
    const exists = await this.repo.findOne({
      where: { companyId, title: dto.title },
    });
    if (exists) {
      throw new ConflictException(`Survey ${dto.title} already exists`);
    }

    const data = this.repo.create({
      ...dto,
      companyId,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
    return this.repo.save(data);
  }

  async findAll(
    companyId: string,
    pagination: FilterDto,
    state?: boolean,
    search?: string,
  ) {
    const where: FindOptionsWhere<Survey> = {
      companyId,
      ...(state !== undefined ? { isActive: state } : {}),
    };

    if (!search) {
      const [data, total] = await this.repo.findAndCount({
        where,
        order: { createdAt: "DESC" },
        ...paginate(pagination),
      });
      return paginatedResponse(data, total, pagination);
    }

    const [data, total] = await this.repo.findAndCount({
      where: [
        { ...where, title: ILike(`%${search}%`) },
        { ...where, description: ILike(`%${search}%`) },
      ],
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });

    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const survey = await this.repo.findOne({ where: { id, companyId } });
    if (!survey) {
      throw new NotFoundException(`Survey with id ${id} not found`);
    }
    return survey;
  }

  async update(id: string, dto: UpdateSurveyDto, companyId: string) {
    const survey = await this.findOne(id, companyId);

    if (dto.title && dto.title !== survey.title) {
      const exists = await this.repo.findOne({
        where: { companyId, title: dto.title },
      });
      if (exists) {
        throw new ConflictException(`Survey ${dto.title} already exists`);
      }
    }

    Object.assign(survey, {
      ...dto,
      ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
    });

    return this.repo.save(survey);
  }

  async remove(id: string, companyId: string) {
    const survey = await this.findOne(id, companyId);
    return this.repo.softRemove(survey);
  }
}