import { IsNotEmpty, IsOptional, IsString, IsNumber, ValidateIf } from 'class-validator';

export class CreateSubmissionDto {
  @ValidateIf((o) => !o.email && !o.candidate)
  @IsNotEmpty()
  @IsString()
  candidateId?: string;

  @ValidateIf((o) => !o.req)
  @IsNotEmpty()
  @IsString()
  requirementId?: string;

  @IsOptional()
  @IsString()
  candidate?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  req?: string;

  @IsOptional()
  @IsString()
  client?: string;

  @IsOptional()
  @IsString()
  recruiter?: string;

  @IsOptional()
  @IsString()
  match?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  recruiterId?: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsNumber()
  matchScore?: number;
}
