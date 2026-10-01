import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global role/permission guards run before controller JwtAuthGuard.
  // Populate req.user first when a bearer token or access cookie is present
  // so those guards can see the authenticated role.
  app.use(passport.initialize());
  app.use((req: any, res: any, next: any) => {
    const header = String(req.headers?.authorization || '');
    const cookie = String(req.headers?.cookie || '');
    if (!header.startsWith('Bearer ') && !cookie.includes('access_token=')) {
      return next();
    }
    passport.authenticate('jwt', { session: false }, (_err: unknown, user: unknown) => {
      if (user) req.user = user;
      next();
    })(req, res, next);
  });

  const origins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8080')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: 'health', method: RequestMethod.ALL },
      { path: 'health/db', method: RequestMethod.ALL },
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me-in-production')) {
    throw new Error('JWT_SECRET must be set to a strong value in production');
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`V2 backend running on http://localhost:${port}/api/v1`);
}

bootstrap();
