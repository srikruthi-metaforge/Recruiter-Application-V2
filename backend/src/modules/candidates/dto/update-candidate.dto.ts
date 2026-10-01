import { IsEmail, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateCandidateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  linkedInUrl?: string;

  @IsOptional()
  @IsString()
  currentCompany?: string;

  @IsOptional()
  @IsString()
  qualification?: string;

  @IsOptional()
  @IsNumber()
  totalExperienceYears?: number;

  @IsOptional()
  @IsNumber()
  relevantExperienceYears?: number;

  @IsOptional()
  @IsNumber()
  currentCtc?: number;

  @IsOptional()
  @IsNumber()
  expectedCtc?: number;

  @IsOptional()
  @IsNumber()
  noticePeriodDays?: number;

  @IsOptional()
  @IsString()
  currentLocation?: string;

  @IsOptional()
  @IsString()
  preferredLocation?: string;

  @IsOptional()
  @IsString()
  offerInHand?: string;

  @IsOptional()
  skills?: string[] | string;

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
