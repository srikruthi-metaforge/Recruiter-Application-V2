import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { DuplicateCheckDto } from './dto/duplicate-check.dto';
import { BulkUploadCandidatesDto } from './dto/bulk-upload.dto';

@ApiTags('Candidates')
@ApiBearerAuth('access-token')
@Controller('candidates')
@UseGuards(JwtAuthGuard)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  /** GET /api/v1/candidates — paged repository reads; do not burn global throttle budget. */
  @Get()
  @SkipThrottle()
  async findAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('skill') skill?: string,
    @Query('minExperience') minExperience?: number,
    @Query('maxExperience') maxExperience?: number,
    @Query('noticePeriod') noticePeriod?: number,
    @Query('location') location?: string,
    @Query('status') status?: string,
    @Query('createdBy') createdBy?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.candidatesService.findAll(req.user, {
      search,
      skill,
      minExperience,
      maxExperience,
      noticePeriod,
      location,
      status,
      createdBy,
      page,
      limit,
    });
  }

  /** POST /api/v1/candidates/duplicate-check */
  @Post('duplicate-check')
  @HttpCode(HttpStatus.OK)
  async duplicateCheck(@Body() dto: DuplicateCheckDto, @Req() req: any) {
    return this.candidatesService.duplicateCheck(dto, req.user);
  }

  /** POST /api/v1/candidates/bulk-upload */
  @Post('bulk-upload')
  @HttpCode(HttpStatus.OK)
  async bulkUpload(@Body() payload: any, @Req() req: any) {
    return this.candidatesService.bulkUpload(payload, req.user);
  }

  /**
   * GET /api/v1/candidates/sourced-counts
   * Must be registered before :id so "sourced-counts" is not treated as an id.
   */
  @Get('sourced-counts')
  @SkipThrottle()
  async sourcedCounts(@Req() req: any) {
    return this.candidatesService.sourcedCountsByRecruiter(req.user);
  }

  /**
   * GET /api/v1/candidates/sourced-trend
   * Daily sourced-profile counts for the Sourced vs Submitted chart.
   * Must be registered before :id.
   */
  @Get('sourced-trend')
  @SkipThrottle()
  async sourcedTrend(
    @Req() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('recruiterId') recruiterId?: string,
    @Query('timezone') timezone?: string,
  ) {
    return this.candidatesService.sourcedTrend(req.user, { from, to, recruiterId, timezone });
  }

  /**
   * GET /api/v1/candidates/sourced-by/:recruiterId
   * Must be registered before :id.
   */
  @Get('sourced-by/:recruiterId')
  @SkipThrottle()
  async sourcedByRecruiter(
    @Req() req: any,
    @Param('recruiterId') recruiterId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.candidatesService.findSourcedByRecruiter(
      req.user,
      recruiterId,
      page,
      limit,
      from,
      to,
    );
  }

  /**
   * GET /api/v1/candidates/:id/resume
   * Must stay ahead of GET :id so the extra path is not swallowed.
   */
  @Get(':id/resume')
  async downloadResume(@Param('id') id: string, @Req() req: any) {
    return this.candidatesService.createResumeDownload(id, req.user);
  }

  /** GET /api/v1/candidates/:id */
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.candidatesService.findById(id, req.user);
  }

  /** POST /api/v1/candidates */
  @Post()
  @Roles('superadmin', 'admin', 'lead', 'recruiter', 'devteam')
  @RequirePermission('cand_add')
  async create(@Body() dto: CreateCandidateDto, @Req() req: any) {
    return this.candidatesService.create(dto, req.user);
  }

  /** PUT /api/v1/candidates/:id */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCandidateDto,
    @Req() req: any,
  ) {
    return this.candidatesService.update(id, dto, req.user);
  }

  /** DELETE /api/v1/candidates/:id */
  @Delete(':id')
  @Roles('superadmin', 'admin', 'devteam')
  @RequirePermission('cand_delete')
  async softDelete(@Param('id') id: string, @Req() req: any) {
    return this.candidatesService.softDelete(id, req.user);
  }
}
