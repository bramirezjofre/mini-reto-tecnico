import { Module } from '@nestjs/common';
import { GitHubService } from './github.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, GitHubService],
})
export class UsersModule {}
