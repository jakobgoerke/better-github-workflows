export interface Repository {
  owner: string;
  name: string;
}

const getRepositoryFromUrl = (): Repository => {
  const url = window.location.pathname;
  const matches = url.split('/').slice();

  return {
    owner: matches[1],
    name: matches[2]
  };
};

const getWorkflowFileNameFromPath = (path: string): string => {
  return path.split('/').pop() ?? '';
};

export { getRepositoryFromUrl, getWorkflowFileNameFromPath };
