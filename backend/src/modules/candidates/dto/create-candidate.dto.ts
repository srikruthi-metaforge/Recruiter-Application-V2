import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCandidateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

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
