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
import * as ExcelJS from "exceljs";
import { SURVEY_VENCIDA_DEFAULT } from "./data/vencimiento";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";
import { CreateSurveyResponseDto } from "./dto/create-response.dto";
import { SurveyResponse } from "./entities/survey-response.entity";

type SurveyWithVirtual = Survey & { isActive: boolean };
interface SurveyChoice {
  text: string;
  value: string;
}
interface SurveyField {
  id: string;
  label: string;
  options?: SurveyChoice[];
}
interface SurveyData {
  title: string;
  fields: SurveyField[];
}
interface SurveyResponseEntity {
  response: Record<string, unknown> & { coordinates?: unknown };
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

  async printExcel(id: string, companyId: string): Promise<Buffer> {
    const schema = await this.findOne(id, companyId);
    const responses = (await this.repoResponse.find({
      where: { surveyId: id },
    })) as SurveyResponseEntity[];

    const surveyData = schema.survey as unknown as SurveyData;
    const fields: SurveyField[] = surveyData.fields ?? [];
    const fieldMap = new Map<string, SurveyField>(fields.map((f) => [f.id, f]));

    const resolveValue = (fieldId: string, rawValue: unknown): string => {
      if (rawValue === null || rawValue === undefined) return "";
      const field = fieldMap.get(fieldId);

      if (!field?.options) {
        if (typeof rawValue === "string") return rawValue;
        if (typeof rawValue === "number" || typeof rawValue === "boolean") {
          return String(rawValue);
        }
        return "";
      }

      const opt = field.options.find((o) => o.value === rawValue);
      if (opt) return opt.text;

      if (typeof rawValue === "string") return rawValue;
      if (typeof rawValue === "number" || typeof rawValue === "boolean") {
        return String(rawValue);
      }
      return "";
    };

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Tenliva";
    workbook.created = new Date();
    workbook.company = "Tenliva";

    const sheet = workbook.addWorksheet("Respuestas", {
      properties: { tabColor: { argb: "FF2563EB" } },
      headerFooter: {
        oddHeader: "&C&KCCCCCC&20 Tenliva",
        oddFooter: "&C&K999999&9 Generado por Tenliva - Confidencial",
      },
    });

    // --- ENCABEZADO TENLIVA CENTRADO ---
    sheet.mergeCells(1, 1, 1, fields.length);
    const brandCell = sheet.getCell("A1");
    brandCell.value = "Tenliva";
    brandCell.font = { bold: true, size: 18, color: { argb: "FF2563EB" } };
    brandCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(1).height = 28;

    sheet.mergeCells(2, 1, 2, fields.length);
    const titleCell = sheet.getCell("A2");
    titleCell.value = surveyData.title ?? "Reporte de Encuesta";
    titleCell.font = { bold: true, size: 14, color: { argb: "FF0F172A" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(2).height = 22;

    sheet.mergeCells(3, 1, 3, fields.length);
    const infoCell = sheet.getCell("A3");
    infoCell.value = `Fecha de creación del documento: ${new Date().toLocaleString("es-CO")} | Total: ${responses.length} respuestas`;
    infoCell.font = { size: 10, color: { argb: "FF64748B" }, italic: true };
    infoCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(3).height = 18;

    sheet.addRow([]); // fila 4 vacía

    // --- HEADER ---
    const headerRow = sheet.addRow(fields.map((f) => f.label));
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });

    // --- DATOS ---
    responses.forEach((r, idx) => {
      const row = sheet.addRow(
        fields.map((f) => resolveValue(f.id, r.response[f.id])),
      );
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.font = { size: 11, color: { argb: "FF334155" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: idx % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC" },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });

    // --- ANCHOS ---
    sheet.columns.forEach((col, i) => {
      const field = fields[i];
      if (!field) return;
      let max = field.label.length;
      for (const r of responses) {
        const v = resolveValue(field.id, r.response[field.id]);
        if (v.length > max) max = v.length;
      }
      col.width = Math.min(Math.max(max + 4, 18), 35);
    });

    sheet.autoFilter = {
      from: { row: 5, column: 1 },
      to: { row: 5, column: fields.length },
    };
    sheet.views = [{ state: "frozen", ySplit: 5 }];

    // --- FOOTER ---
    const lastRow = sheet.addRow([]);
    sheet.mergeCells(lastRow.number + 1, 1, lastRow.number + 1, fields.length);
    const footer = sheet.getCell(`A${lastRow.number + 1}`);
    footer.value =
      "Documento generado por Tenliva - Plataforma multiempresa | Módulo de Proyectos - Encuestas";
    footer.font = { size: 9, color: { argb: "FF94A3B8" }, italic: true };
    footer.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(lastRow.number + 1).height = 20;

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
