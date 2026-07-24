import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { UsersExceptionFilter } from './users/users-exception.filter';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    HealthModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: UsersExceptionFilter,
    },
  ],
})
export class AppModule {}
