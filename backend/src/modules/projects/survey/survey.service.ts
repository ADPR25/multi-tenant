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
import { SURVEY_VENCIDA_DEFAULT } from "./data/vencimiento";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";
import { CreateSurveyResponseDto } from "./dto/create-response.dto";
import { SurveyResponse } from "./entities/survey-response.entity";

type Choice = { text: string; value: string };
type SurveyElement = {
  name: string;
  title: string;
  type: string;
  choices?: Choice[];
};
type SurveyPage = { elements: SurveyElement[] };
type SurveySchema = { pages: SurveyPage[] };

type SurveyWithVirtual = Survey & { isActive: boolean };

type MetaInfo = {
  title: string;
  type: string;
  choicesMap: Map<string, string>;
};

type CountBucket = {
  __name: string;
  type: string;
  counts: Record<string, number>;
};

type ValueBucket = {
  __name: string;
  type: string;
  values: unknown[];
};

type Bucket = CountBucket | ValueBucket;

const CHOICE_TYPES = new Set<string>([
  "radiogroup",
  "checkbox",
  "dropdown",
  "ranking",
]);

const COUNTABLE_TYPES = new Set<string>([
  ...CHOICE_TYPES,
  "boolean",
  "rating",
  "scale",
  "slider",
]);

function isCountBucket(b: Bucket): b is CountBucket {
  return "counts" in b;
}

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly repo: Repository<Survey>,
    @InjectRepository(SurveyResponse)
    private readonly repoResponse: Repository<SurveyResponse>,
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

  async createResponse(dto: CreateSurveyResponseDto) {
    const create = this.repoResponse.create(dto);
    const save = await this.repoResponse.save(create);
    return save;
  }

  async findAll(
    companyId: string,
    pagination: FilterDto,
    state?: boolean,
    search?: string,
    find?: string,
  ) {
    const isSelect = find === "select" || find?.includes("select");
    const baseWhere = { companyId } as FindOptionsWhere<Survey>;

    const select = isSelect
      ? ({ id: true, title: true, code: true } as const)
      : ({
          id: true,
          description: true,
          title: true,
          endDate: true,
          code: true,
        } as const);

    const where = search
      ? [
          { ...baseWhere, title: ILike(`%${search}%`) },
          { ...baseWhere, description: ILike(`%${search}%`) },
        ]
      : baseWhere;

    const [data, total] = await this.repo.findAndCount({
      where,
      select,
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });

    let mapped = data.map((s) => this.withVirtualIsActive(s));

    if (state !== undefined) {
      mapped = mapped.filter((s) => s.isActive === state);
      return paginatedResponse(mapped, mapped.length, pagination);
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

  async findByCode(code: string) {
    const survey = await this.repo.findOne({
      where: { code },
      select: {
        id: true,
        survey: true,
        endDate: true,
        title: true,
        description: true,
      },
    });
    if (!survey) {
      throw new NotFoundException(`Survey con code ${code} no encontrado`);
    }
    const isActive = this.isActiveByDate(survey.endDate);
    if (!isActive) {
      return SURVEY_VENCIDA_DEFAULT;
    }
    return survey;
  }

  async findByChar(surveyId: string): Promise<Record<string, unknown>> {
    const responses = await this.repoResponse.find({
      where: { surveyId },
      relations: { survey: true },
    });

    if (responses.length === 0) return {};

    const firstSurvey = responses[0].survey;
    const surveyDef = firstSurvey.survey as unknown as SurveySchema;

    if (!surveyDef?.pages) return {};

    const meta = new Map<string, MetaInfo>();

    for (const page of surveyDef.pages) {
      if (!page.elements) continue;
      for (const el of page.elements) {
        const choicesMap = new Map<string, string>();
        if (el.choices) {
          for (const c of el.choices) {
            choicesMap.set(c.value, c.text);
          }
        }
        meta.set(el.name, {
          title: el.title,
          type: el.type,
          choicesMap,
        });
      }
    }

    const aggregated = new Map<string, Bucket>();

    for (const [, m] of meta.entries()) {
      if (COUNTABLE_TYPES.has(m.type)) {
        const counts: Record<string, number> = {};

        if (m.choicesMap.size > 0) {
          for (const text of m.choicesMap.values()) {
            counts[text] = 0;
          }
        } else if (m.type === "boolean") {
          counts["Sí"] = 0;
          counts["No"] = 0;
        }

        aggregated.set(m.title, {
          __name: m.title,
          type: m.type,
          counts,
        });
      } else {
        aggregated.set(m.title, {
          __name: m.title,
          type: m.type,
          values: [],
        });
      }
    }

    for (const row of responses) {
      const resp = row.response;
      for (const [qName, qValue] of Object.entries(resp)) {
        const m = meta.get(qName);
        if (!m) continue;
        const bucket = aggregated.get(m.title);
        if (!bucket) continue;

        if (isCountBucket(bucket)) {
          const values = Array.isArray(qValue) ? qValue : [qValue];
          for (const v of values) {
            if (typeof v !== "string") continue;
            const text = m.choicesMap.get(v) ?? v;
            bucket.counts[text] = (bucket.counts[text] ?? 0) + 1;
          }
        } else {
          bucket.values.push(qValue);
        }
      }
    }

    const result: Record<string, unknown> = {};
    for (const [title, bucket] of aggregated.entries()) {
      if (isCountBucket(bucket)) {
        result[title] = bucket.counts;
      } else {
        result[title] =
          bucket.values.length === 1 ? bucket.values[0] : bucket.values;
      }
    }

    return result;
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
