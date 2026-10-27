export interface Repository {
  owner: string;
  name: string;
}

const getRepositoryFromPath = (url: string): Repository => {
  const matches = url.split('/').slice();

  return {
    owner: matches[1],
    name: matches[2],
  };
};

const getWorkflowFileNameFromPath = (path: string): string => {
  return path.split('/').pop() ?? '';
};

const buildWorkflowLink = (repository: Repository, path: string): string => {
  const file = getWorkflowFileNameFromPath(path);
  return `https://github.com/${repository.owner}/${repository.name}/actions/workflows/${file}`;
};

export { buildWorkflowLink, getRepositoryFromPath, getWorkflowFileNameFromPath };
