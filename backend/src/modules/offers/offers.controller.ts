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
import { SkipThrottle } from '@nestjs/throttler';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { UpdateOfferStatusDto } from './dto/update-offer-status.dto';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  /** GET /api/v1/offers — Reports / onboarding lists; skip global throttle. */
  @Get()
  @SkipThrottle()
  async findAll(
    @Req() req: any,
    @Query('candidateId') candidateId?: string,
    @Query('submissionId') submissionId?: string,
    @Query('requirementId') requirementId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.offersService.findAll(req.user, {
      candidateId,
      submissionId,
      requirementId,
      status,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  /** GET /api/v1/offers/:id */
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.offersService.findById(id, req.user);
  }

  /** POST /api/v1/offers */
  @Post()
  async create(@Body() dto: CreateOfferDto, @Req() req: any) {
    return this.offersService.create(dto, req.user);
  }

  /** PUT /api/v1/offers/:id */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
    @Req() req: any,
  ) {
    return this.offersService.update(id, dto, req.user);
  }

  /** PUT /api/v1/offers/:id/status */
  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOfferStatusDto,
    @Req() req: any,
  ) {
    return this.offersService.updateStatus(id, dto, req.user);
  }

  /** DELETE /api/v1/offers/:id */
  @Delete(':id')
  async softDelete(@Param('id') id: string, @Req() req: any) {
    return this.offersService.softDelete(id, req.user);
  }
}
