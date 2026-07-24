import { INestApplication, ValidationPipe } from '@nestjs/common';
import { resolveCorsOrigins } from './cors';
import { UsersExceptionFilter } from './users/users-exception.filter';

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
  app.useGlobalFilters(new UsersExceptionFilter());
}
