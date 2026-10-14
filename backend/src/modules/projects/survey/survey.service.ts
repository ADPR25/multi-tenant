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
import * as util from "util";

type SurveyWithVirtual = Survey & { isActive: boolean };

interface SurveyChoice {
  text: string;
  value: string;
}

interface SurveyField {
  id: string;
  label: string;
  type: string;
  options?: SurveyChoice[];
  rows?: string[];
  columns?: string[];
  fileMode?: string;
  accept?: string;
}

interface SurveyData {
  title: string;
  fields: SurveyField[];
}

interface SurveyResponseEntity {
  response: Record<string, unknown> & { coordinates?: unknown };
  id?: string;
}

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly repo: Repository<Survey>,
    @InjectRepository(SurveyResponse)
    private readonly repoResponse: Repository<SurveyResponse>,
  ) {}

  private logFull(title: string, data: unknown) {
    console.log(`\n========== ${title} ==========`);
    console.log(
      util.inspect(data, {
        depth: null,
        colors: true,
        maxArrayLength: null,
        maxStringLength: null,
      }),
    );
    console.log(`========== END ${title} ==========\n`);
  }

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

    const EXCLUDED_TYPES = new Set<string>([
      "heading",
      "description",
      "image",
      "video",
      "separator",
      "section",
      "calculated",
      "hidden",
      "file",
      "signature",
    ]);

    const rawExportFields = fields.filter(
      (f) => !EXCLUDED_TYPES.has(f.type.toLowerCase()),
    );

    if (rawExportFields.length === 0) {
      throw new Error("No hay campos exportables para esta encuesta");
    }

    type ExportColumnDebug = {
      colId: string;
      fieldId: string;
      label: string;
      type: string;
      isMatrix: boolean;
      isMultiMatrix: boolean;
      matrixRow?: string;
      options?: SurveyChoice[];
      columns?: string[];
    };

    const exportColumns: ExportColumnDebug[] = [];
    for (const f of rawExportFields) {
      const t = f.type.toLowerCase();
      const rows = f.rows;
      const isMatrixType =
        t === "matrix" || t === "matrixcheckbox" || t === "matrixtext";

      if (isMatrixType && rows && rows.length > 0) {
        for (const r of rows) {
          exportColumns.push({
            colId: `${f.id}__${r}`,
            fieldId: f.id,
            label: `${f.label} - ${r}`,
            type: t,
            isMatrix: true,
            isMultiMatrix: t !== "matrix",
            matrixRow: r,
            options: f.options,
            columns: f.columns,
          });
        }
      } else {
        exportColumns.push({
          colId: f.id,
          fieldId: f.id,
          label: f.label,
          type: t,
          isMatrix: false,
          isMultiMatrix: false,
          options: f.options,
          columns: f.columns,
        });
      }
    }

    const fieldMap = new Map<string, SurveyField>(
      rawExportFields.map((f) => [f.id, f]),
    );

    const isRecord = (v: unknown): v is Record<string, unknown> =>
      typeof v === "object" && v !== null && !Array.isArray(v);

    const findOptionText = (
      options: SurveyChoice[] | undefined,
      columns: string[] | undefined,
      value: unknown,
    ): string | null => {
      if (options) {
        const opt = options.find((o) => o.value === value);
        if (opt) return opt.text;
      }
      if (columns && typeof value === "string" && columns.includes(value)) {
        return value;
      }
      return null;
    };

    const toSafeString = (v: unknown): string => {
      if (typeof v === "string") return v;
      if (typeof v === "number" || typeof v === "boolean") return String(v);
      if (v === null || v === undefined) return "";

      if (isRecord(v) && "number" in v && "country" in v) {
        const tel = v as { number?: unknown; country?: unknown };
        const rawNum = tel.number;
        const rawCountry = tel.country;

        const numStr =
          typeof rawNum === "string" || typeof rawNum === "number"
            ? String(rawNum)
            : "";
        const countryStr =
          typeof rawCountry === "string" || typeof rawCountry === "number"
            ? String(rawCountry)
            : "";

        const combined = `${countryStr} ${numStr}`.trim();
        if (combined) return combined;
      }

      try {
        return JSON.stringify(v);
      } catch {
        return util.inspect(v, { depth: null, breakLength: Infinity });
      }
    };

    const resolveValue = (
      col: ExportColumnDebug,
      rawResponse: unknown,
    ): string => {
      if (rawResponse === null || rawResponse === undefined) return "";
      if (col.isMatrix) {
        const rowKey = col.matrixRow;
        if (!rowKey) return "";
        if (!isRecord(rawResponse)) return "";

        const cellValue = rawResponse[rowKey];
        if (cellValue === null || cellValue === undefined || cellValue === "")
          return "";

        if (Array.isArray(cellValue)) {
          return cellValue
            .map(
              (v) =>
                findOptionText(col.options, col.columns, v) ?? toSafeString(v),
            )
            .filter(Boolean)
            .join(", ");
        }

        return (
          findOptionText(col.options, col.columns, cellValue) ??
          toSafeString(cellValue)
        );
      }

      const field = fieldMap.get(col.fieldId);
      if (Array.isArray(rawResponse)) {
        return rawResponse
          .map(
            (v) =>
              findOptionText(field?.options, field?.columns, v) ??
              toSafeString(v),
          )
          .filter(Boolean)
          .join(", ");
      }
      if (isRecord(rawResponse)) {
        return toSafeString(rawResponse);
      }
      if (!field?.options && !field?.columns) return toSafeString(rawResponse);
      return (
        findOptionText(field?.options, field?.columns, rawResponse) ??
        toSafeString(rawResponse)
      );
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

    const colCount = exportColumns.length;
    sheet.mergeCells(1, 1, 1, colCount);
    const brandCell = sheet.getCell("A1");
    brandCell.value = "Tenliva";
    brandCell.font = { bold: true, size: 18, color: { argb: "FF2563EB" } };
    brandCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(1).height = 28;

    sheet.mergeCells(2, 1, 2, colCount);
    const titleCell = sheet.getCell("A2");
    titleCell.value = surveyData.title ?? "Reporte de Encuesta";
    titleCell.font = { bold: true, size: 14, color: { argb: "FF0F172A" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(2).height = 22;

    sheet.mergeCells(3, 1, 3, colCount);
    const infoCell = sheet.getCell("A3");
    infoCell.value = `Fecha: ${new Date().toLocaleString("es-CO")} | Total: ${responses.length}`;
    infoCell.font = { size: 10, color: { argb: "FF64748B" }, italic: true };
    infoCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(3).height = 18;

    sheet.addRow([]);
    const headerRow = sheet.addRow(exportColumns.map((f) => f.label));
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
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    responses.forEach((r, idx) => {
      const row = sheet.addRow(
        exportColumns.map((col) => resolveValue(col, r.response[col.fieldId])),
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

    exportColumns.forEach((field, i) => {
      const col = sheet.getColumn(i + 1);
      let max = field.label.length;
      for (const r of responses) {
        const v = resolveValue(field, r.response[field.fieldId]);
        if (v.length > max) max = v.length;
      }
      col.width = Math.min(Math.max(max + 4, 18), 35);
    });

    sheet.autoFilter = {
      from: { row: 5, column: 1 },
      to: { row: 5, column: colCount },
    };
    sheet.views = [{ state: "frozen", ySplit: 5 }];

    const lastRow = sheet.addRow([]);
    sheet.mergeCells(lastRow.number + 1, 1, lastRow.number + 1, colCount);
    const footer = sheet.getCell(`A${lastRow.number + 1}`);
    footer.value = "Documento generado por Tenliva";
    footer.font = { size: 9, color: { argb: "FF94A3B8" }, italic: true };
    footer.alignment = { horizontal: "center", vertical: "middle" };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}
