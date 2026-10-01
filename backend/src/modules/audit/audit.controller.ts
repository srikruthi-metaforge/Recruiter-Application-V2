import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller(['audit-logs', 'audit'])
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /** POST /api/v1/audit/logs  (frontend workspaceService) */
  @Post('logs')
  async create(@Req() req: any, @Body() body: Record<string, any>) {
    return this.auditService.createFromClient(req.user, body);
  }

  /** GET /api/v1/audit-logs */
  @Get()
  async findAll(
    @Req() req: any,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('category') category?: string,
    @Query('targetEntity') targetEntity?: string,
    @Query('module') module?: string,
    @Query('entity') entity?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findAll(req.user, {
      userId,
      action,
      category,
      targetEntity,
      module,
      entity,
      status,
      startDate,
      endDate,
      search,
      page,
      limit,
    });
  }

  /** GET /api/v1/audit-logs/:id */
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.auditService.findById(req.user, id);
  }
}
