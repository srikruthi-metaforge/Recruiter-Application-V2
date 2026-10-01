import { IsOptional, IsString } from 'class-validator';

export class ForwardClientDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
