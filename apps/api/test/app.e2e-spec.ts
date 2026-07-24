import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from '../src/app.config';
import { AppModule } from '../src/app.module';
import { GitHubService, UserNotFoundError } from '../src/users/github.service';

describe('GET /user/:username (e2e)', () => {
  let app: INestApplication<App>;
  const githubService = {
    getUser: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GitHubService)
      .useValue(githubService)
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    githubService.getUser.mockReset();
  });

  it('returns the github profile when username is valid', async () => {
    const profile = {
      username: 'octocat',
      name: 'The Octocat',
      bio: 'GitHub mascot',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
      profileUrl: 'https://github.com/octocat',
      publicRepos: 8,
      followers: 9999,
      following: 9,
      location: 'San Francisco',
      company: '@github',
      blog: 'https://github.blog',
      twitterUsername: 'octocat',
      createdAt: '2011-01-25T18:44:36Z',
    };
    githubService.getUser.mockResolvedValue(profile);

    const response = await request(app.getHttpServer())
      .get('/user/octocat')
      .expect(200);

    expect(response.body).toEqual(profile);
    expect(githubService.getUser).toHaveBeenCalledWith('octocat');
  });

  it('rejects usernames with invalid format', async () => {
    await request(app.getHttpServer()).get('/user/-bad-').expect(400);
    expect(githubService.getUser).not.toHaveBeenCalled();
  });

  it('returns 404 when github service reports user not found', async () => {
    githubService.getUser.mockRejectedValue(
      new UserNotFoundError('missing-user-zzz'),
    );

    await request(app.getHttpServer())
      .get('/user/missing-user-zzz')
      .expect(404);
  });
});
