import { Controller, Get, Param, UseFilters, UsePipes } from '@nestjs/common';
import { GithubUsernameValidationPipe } from './github-username.pipe';
import { GithubUserProfile } from './user-profile.interface';
import { UsersService } from './users.service';
import { UsersExceptionFilter } from './users-exception.filter';

@Controller('user')
@UseFilters(new UsersExceptionFilter())
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get(':username')
  @UsePipes(GithubUsernameValidationPipe)
  getUser(@Param('username') username: string): Promise<GithubUserProfile> {
    return this.users.getProfile(username);
  }
}
