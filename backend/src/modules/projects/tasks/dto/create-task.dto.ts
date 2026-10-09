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
import { TaskStatus, TaskPriority } from "../../enums/task-status.enum";
export class CreateTaskDto {
  @IsUUID()
  projectId!: string;

  @IsOptional()
  @IsUUID()
  phaseId?: string | null;

  @IsUUID()
  activityId!: string;

  @IsString()
  @MaxLength(200)
  titulo!: string;

  @IsOptional()
  @IsString()
  descripcion?: string | null;

  @IsOptional()
  @IsEnum(TaskStatus)
  estado?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  prioridad?: TaskPriority;

  @IsOptional()
  @IsUUID()
  responsableId?: string | null;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string | null;

  @IsOptional()
  @IsString()
  horasEstimadas?: string | null;

  @IsOptional()
  @IsString()
  horasReales?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}
