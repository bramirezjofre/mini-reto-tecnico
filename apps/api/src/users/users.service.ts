import { Injectable } from '@nestjs/common';
import { GitHubService } from './github.service';
import { GithubUserProfile } from './user-profile.interface';

@Injectable()
export class UsersService {
  constructor(private readonly github: GitHubService) {}

  getProfile(username: string): Promise<GithubUserProfile> {
    return this.github.getUser(username);
  }
}
