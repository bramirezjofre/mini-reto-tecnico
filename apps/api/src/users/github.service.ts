import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GithubUserProfile } from './user-profile.interface';

interface GithubRawUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  created_at: string;
}

export class UserNotFoundError extends Error {
  constructor(username: string) {
    super(`GitHub user "${username}" not found`);
  }
}

export class GitHubUpstreamError extends Error {
  constructor(message: string) {
    super(message);
  }
}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  private readonly baseUrl: string;
  private readonly token: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>(
      'GITHUB_API_BASE_URL',
      'https://api.github.com',
    );
    this.token = this.config.get<string>('GITHUB_TOKEN');
  }

  async getUser(username: string): Promise<GithubUserProfile> {
    const url = `${this.baseUrl}/users/${encodeURIComponent(username)}`;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'mini-reto-tecnico-api',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { headers });

    if (response.status === 404) {
      throw new UserNotFoundError(username);
    }
    if (!response.ok) {
      const body = await response.text();
      this.logger.error(
        `GitHub responded ${response.status} for "${username}": ${body.slice(0, 200)}`,
      );
      throw new GitHubUpstreamError(
        `GitHub API returned ${response.status} for "${username}"`,
      );
    }

    const raw = (await response.json()) as GithubRawUser;
    return {
      username: raw.login,
      name: raw.name,
      bio: raw.bio,
      avatarUrl: raw.avatar_url,
      profileUrl: raw.html_url,
      publicRepos: raw.public_repos,
      followers: raw.followers,
      following: raw.following,
      location: raw.location,
      company: raw.company,
      blog: raw.blog,
      twitterUsername: raw.twitter_username,
      createdAt: raw.created_at,
    };
  }
}
