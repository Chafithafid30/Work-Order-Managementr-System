import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: false });
  // Reject unknown fields at the HTTP boundary so use cases receive only
  // validated, typed input.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Work Order API')
    .setDescription('API for the Work Order technical test workflow')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'Idempotency-Key', in: 'header' },
      'idempotency',
    )
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const port = Number(process.env.PORT ?? 3000);
  // Binding to all interfaces makes the API reachable from Docker networking.
  await app.listen(port, '0.0.0.0');
  Logger.log(`Backend is listening on port ${port}`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  const stack = error instanceof Error ? error.stack : String(error);
  Logger.error('Backend failed to start', stack, 'Bootstrap');
  process.exit(1);
});
