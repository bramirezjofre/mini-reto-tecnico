import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface GithubUserProfile {
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

interface ApiError {
  statusCode: number;
  message: string;
}

function getConfig() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!username) {
    throw new Error(
      'NEXT_PUBLIC_GITHUB_USERNAME is not defined. Set it in apps/web/.env',
    );
  }
  if (!apiUrl) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not defined. Set it in apps/web/.env',
    );
  }
  return { username, apiUrl };
}

async function fetchProfile(
  apiUrl: string,
  username: string,
): Promise<GithubUserProfile> {
  const res = await fetch(`${apiUrl}/user/${encodeURIComponent(username)}`, {
    cache: 'no-store',
  });
  if (res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(
      `Backend error ${res.status}: ${body?.message ?? res.statusText}`,
    );
  }
  return (await res.json()) as GithubUserProfile;
}

export default async function HomePage() {
  const { username, apiUrl } = getConfig();
  const profile = await fetchProfile(apiUrl, username);

  const displayName = profile.name ?? profile.username;
  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black px-4 py-10">
      <article className="w-full max-w-2xl rounded-2xl border border-black/[.08] bg-white p-8 shadow-sm dark:border-white/[.145] dark:bg-zinc-900">
        <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={`${displayName} avatar`}
              width={96}
              height={96}
              className="rounded-full border border-black/[.08] dark:border-white/[.145]"
              priority
              unoptimized
            />
          ) : null}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              {displayName}
            </h1>
            <Link
              href={profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 hover:underline"
            >
              @{profile.username}
            </Link>
            {profile.bio ? (
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                {profile.bio}
              </p>
            ) : null}
          </div>
        </header>

        <dl className="mt-8 grid grid-cols-3 gap-4 text-center">
          <Stat label="Repos" value={profile.publicRepos} />
          <Stat label="Followers" value={profile.followers} />
          <Stat label="Following" value={profile.following} />
        </dl>

        <dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {profile.company ? <Meta label="Company" value={profile.company} /> : null}
          {profile.location ? <Meta label="Location" value={profile.location} /> : null}
          {profile.blog ? (
            <Meta
              label="Website"
              value={
                <Link
                  href={
                    profile.blog.startsWith('http')
                      ? profile.blog
                      : `https://${profile.blog}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {profile.blog}
                </Link>
              }
            />
          ) : null}
          {profile.twitterUsername ? (
            <Meta
              label="Twitter"
              value={
                <Link
                  href={`https://twitter.com/${profile.twitterUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  @{profile.twitterUsername}
                </Link>
              }
            />
          ) : null}
          <Meta label="Joined" value={joinedDate} />
        </dl>

        <footer className="mt-8 text-center text-xs text-zinc-400">
          Data fetched from your NestJS API at <code>{apiUrl}</code>
        </footer>
      </article>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-black/[.06] bg-zinc-50 p-4 dark:border-white/[.1] dark:bg-zinc-800">
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-black/[.06] px-3 py-2 dark:border-white/[.1]">
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-800 dark:text-zinc-200">{value}</dd>
    </div>
  );
}
