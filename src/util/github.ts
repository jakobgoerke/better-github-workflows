const GITHUB_URL_REGEX = /https:\/\/github.com\/(.*)\/(.*)\//;

export interface Repository {
  owner: string;
  name: string;
}

const getRepositoryFromUrl = (): Repository => {
  const url = window.location.href;
  const matches = url.match(GITHUB_URL_REGEX);

  return {
    owner: matches[1],
    name: matches[2]
  };
};

export { getRepositoryFromUrl };
