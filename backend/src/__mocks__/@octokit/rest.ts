export const Octokit = jest.fn().mockImplementation(() => ({
  rest: {
    repos: {
      listForAuthenticatedUser: jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            name: 'test-repo',
            full_name: 'test-user/test-repo',
            private: false,
            html_url: 'https://github.com/test-user/test-repo',
            description: 'Test repository',
            fork: false,
            created_at: '2021-01-01T00:00:00Z',
            updated_at: '2021-01-01T00:00:00Z',
            pushed_at: '2021-01-01T00:00:00Z',
            language: 'TypeScript',
            archived: false
          }
        ]
      }),
      delete: jest.fn().mockResolvedValue({ status: 204 }),
      update: jest.fn().mockResolvedValue({
        data: {
          id: 1,
          name: 'updated-repo',
          archived: true
        }
      })
    }
  }
}));