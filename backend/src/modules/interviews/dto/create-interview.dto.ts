import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateInterviewDto {
  @IsNotEmpty()
  @IsString()
  submissionId: string;

  @IsOptional()
  @IsString()
  candidateId?: string;

  @IsOptional()
  @IsString()
  requirementId?: string;

  @IsOptional()
  @IsString()
  round?: string;

  @IsNotEmpty()
  @IsDateString()
  dateTime: string;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @IsOptional()
  @IsString()
  interviewerName?: string;

  @IsOptional()
  @IsString()
  interviewerEmail?: string;
}
