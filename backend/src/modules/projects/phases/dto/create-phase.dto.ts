import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsInt, MaxLength, Min } from "class-validator";
import { ProjectStatus } from "../../enums/project-status.enum";

export class CreatePhaseDto {
  @IsUUID() 
  projectId!: string;
  
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
  @IsInt() @Min(0) 
  sortOrder?: number;

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
  budget?: string | null;
}