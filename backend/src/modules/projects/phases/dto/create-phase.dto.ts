import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsInt, MaxLength, Min } from "class-validator";
import { ProjectStatus } from "../../enums/project-status.enum";
export class CreatePhaseDto {
  @IsUUID() 
  projectId!: string;
  
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
  @IsInt() @Min(0) 
  orden?: number;

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
  presupuesto?: string | null;
}
