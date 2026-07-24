export interface GithubUserProfile {
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitterUsername: string | null;
  createdAt: string;
}
