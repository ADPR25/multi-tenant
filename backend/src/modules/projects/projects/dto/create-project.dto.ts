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
  code!: string;

  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsString()
  @IsDecimal({ decimal_digits: "0,2" })
  budget?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsUUID()
  clientId?: string | null;
  
  @IsOptional()
  @IsUUID()
  responsibleId?: string | null;
}