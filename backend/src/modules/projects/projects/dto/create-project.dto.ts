import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsNumber,
  MaxLength,
  Min,
  Max,
  IsDecimal,
} from "class-validator";
import { ProjectStatus } from "../../enums/project-status.enum";
export class CreateProjectDto {
  @IsString()
  @MaxLength(50)
  codigo!: string;

  @IsString()
  @MaxLength(200)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string | null;
  @IsOptional()
  @IsEnum(ProjectStatus)
  estado?: ProjectStatus;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string | null;

  @IsOptional()
  @IsDateString()
  fechaFin?: string | null;

  @IsOptional()
  @IsString()
  @IsDecimal({ decimal_digits: "0,2" })
  presupuesto?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  avance?: number;

  @IsOptional()
  @IsUUID()
  clienteId?: string | null;
  
  @IsOptional()
  @IsUUID()
  responsableId?: string | null;
}
