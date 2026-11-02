import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isProductionEnv, allowDemoCredentials } from '../../common/security/secrets.util';

/**
 * Demo / sample business seeding removed for V1→V2 data migration.
 * SeedModule wiring is unchanged so Nest boot and APIs are unaffected.
 * Hardcoded org/users/clients/requirements/candidates/submissions/interviews
 * are no longer inserted into MongoDB.
 */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    if (isProductionEnv()) {
      this.logger.log('SEED_ON_START skipped: demo seeding is forbidden in production');
      return;
    }
    const enabled =
      String(this.config.get('SEED_ON_START') ?? 'false').toLowerCase() === 'true';
    if (!enabled) return;
    if (!allowDemoCredentials()) {
      this.logger.warn(
        'SEED_ON_START ignored: set ALLOW_DEMO_LOGIN=true and SEED_DEMO_PASSWORD (env/vault) for local demo users',
      );
      return;
    }
    try {
      await this.seed();
    } catch (err) {
      this.logger.error(`Seed failed: ${(err as Error).message}`);
    }
  }

  /**
   * Intentionally empty: hardcoded demo workspace data was removed.
   * Database stays empty for V1 production data import.
   */
  async seed() {
    this.logger.log(
      'SEED_ON_START: hardcoded demo data insert is disabled (V1 migration mode). No documents created.',
    );
  }
}
