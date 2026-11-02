import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsString()
  @IsNotEmpty()
  roleCode: string;

  @IsOptional()
  @IsString()
  roleName?: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
