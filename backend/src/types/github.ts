export interface GitHubRepository {
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

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string | null;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}