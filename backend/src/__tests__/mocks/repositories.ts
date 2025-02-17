export const mockRepositories = [
  {
    id: 1,
    name: 'test-repo',
    full_name: 'test-user/test-repo',
    description: 'Test repository',
    owner: {
      login: 'test-user',
      id: 1,
    },
    private: false,
    html_url: 'https://github.com/test-user/test-repo',
    stargazers_count: 10,
    language: 'TypeScript',
    archived: false,
    updated_at: '2024-02-17T00:00:00Z',
  },
];

export const mockStarredRepositories = mockRepositories.map(repo => ({
  ...repo,
  starred_at: '2024-02-17T00:00:00Z',
}));