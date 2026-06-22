import "server-only";

const repoOwner = "ameyalambat128";
const repoName = "token-receipt";
const runtimeAssetName = "token-receipt-darwin-arm64.tar.gz";
const repoUrl = `https://github.com/${repoOwner}/${repoName}`;
const githubApiVersion = "2022-11-28";

type RepoResponse = {
  stargazers_count?: number;
};

type ReleaseAsset = {
  name: string;
  download_count: number;
};

type ReleaseResponse = {
  assets?: ReleaseAsset[];
};

const buildHeaders = () => {
  const token = process.env.GITHUB_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": githubApiVersion,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchRepoStars = async () => {
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}`,
    {
      headers: buildHeaders(),
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub repo fetch failed: ${response.status}`);
  }

  const repo = (await response.json()) as RepoResponse;

  return typeof repo.stargazers_count === "number"
    ? repo.stargazers_count
    : undefined;
};

const fetchLatestRuntimeDownloads = async () => {
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`,
    {
      headers: buildHeaders(),
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub latest release fetch failed: ${response.status}`);
  }

  const release = (await response.json()) as ReleaseResponse;
  const asset = release.assets?.find(({ name }) => name === runtimeAssetName);

  return asset?.download_count;
};

export const formatCompactCount = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 10000 ? 0 : 1,
  }).format(value);

export const getGitHubMetrics = async () => {
  const [stars, downloads] = await Promise.allSettled([
    fetchRepoStars(),
    fetchLatestRuntimeDownloads(),
  ]);

  return {
    repoUrl,
    stars: stars.status === "fulfilled" ? stars.value : undefined,
    downloads: downloads.status === "fulfilled" ? downloads.value : undefined,
  };
};
