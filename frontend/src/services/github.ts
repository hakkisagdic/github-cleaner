import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface User {
  id: number;
  login: string;
  avatar_url: string;
  name: string | null;
}

const githubApi = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token: string) => {
  githubApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const githubService = {
  async getUser() {
    const { data } = await githubApi.get<User>('/github/user');
    return data;
  },

  async getRepositories(page = 1, perPage = 30) {
    const { data } = await githubApi.get<Repository[]>('/github/user/repos', {
      params: { page, per_page: perPage },
    });
    return data;
  },

  async getStarredRepositories(page = 1, perPage = 30) {
    const { data } = await githubApi.get<Repository[]>('/github/user/starred', {
      params: { page, per_page: perPage },
    });
    return data;
  },

  async unstarRepositories(repositories: string[]) {
    await githubApi.post('/github/repos/unstar', { repositories });
  },

  async deleteRepositories(repositories: string[]) {
    await githubApi.post('/github/repos/delete', { repositories });
  },
};