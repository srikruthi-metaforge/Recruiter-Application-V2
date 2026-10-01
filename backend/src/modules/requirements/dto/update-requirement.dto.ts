import { IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRequirementDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsEnum(['High', 'Medium', 'Low', 'Urgent'])
  priority?: string;

  @IsOptional()
  @IsEnum(['Open', 'Assigned', 'In Progress', 'On Hold', 'Reopen', 'Closed'])
  status?: string;

  @IsOptional()
  @IsEnum(['Unassigned', 'Assigned', 'In Progress', 'Closed'])
  assignmentStatus?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  openings?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  placedCount?: number;

  @IsOptional()
  @IsObject()
  budgetRange?: {
    min: number;
    max: number;
    currency: string;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsRequired?: string[];

  @IsOptional()
  @IsObject()
  experienceRange?: {
    min: number;
    max: number;
  };

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  assignedLeadId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedRecruiterIds?: string[];
}
