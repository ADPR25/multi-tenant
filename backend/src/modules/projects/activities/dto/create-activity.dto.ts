import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsInt,
  MaxLength,
  Min,
} from "class-validator";
import { ProjectStatus } from "../../enums/project-status.enum";
export class CreateActivityDto {
  @IsUUID()
  projectId!: string;

  @IsUUID()
  phaseId!: string;

  @IsString()
  @MaxLength(200)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  @IsOptional()
  @IsEnum(ProjectStatus)
  estado?: ProjectStatus;

  @IsOptional()
  @IsUUID()
  responsableId?: string | null;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string | null;

  @IsOptional()
  @IsDateString()
  fechaFin?: string | null;
}
