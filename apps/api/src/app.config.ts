import { INestApplication, ValidationPipe } from '@nestjs/common';
import { resolveCorsOrigins } from './cors';

export function configureApp(app: INestApplication): void {
  app.enableCors({
    origin: resolveCorsOrigins(),
    credentials: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
}
