import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceService } from './workspace.service';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  /** GET /api/v1/workspace — SPA bootstrap; skipped from budget (large, infrequent). */
  @Get()
  @SkipThrottle()
  async getWorkspace(@Req() req: any) {
    return this.workspaceService.getWorkspacePayload(req.user);
  }
}
