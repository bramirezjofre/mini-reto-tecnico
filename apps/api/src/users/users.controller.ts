import { Controller, Get, Param, UsePipes } from '@nestjs/common';
import { GithubUsernameValidationPipe } from './github-username.pipe';
import { GithubUserProfile } from './user-profile.interface';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get(':username')
  @UsePipes(GithubUsernameValidationPipe)
  getUser(@Param('username') username: string): Promise<GithubUserProfile> {
    return this.users.getProfile(username);
  }
}
