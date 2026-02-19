import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
  });

  const configService = app.get(ConfigService);

  // Security headers
  app.use(helmet());

  // CORS
  const appUrl = configService.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
  app.enableCors({
    origin: appUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['webhooks/stripe'],
  });

  const port = configService.get<number>('API_PORT', 4000);
  await app.listen(port);
  console.log(`Kooki API running on http://localhost:${port}`);
}

bootstrap();
