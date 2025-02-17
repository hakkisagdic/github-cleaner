export interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  owner: {
    login: string;
    id: number;
  };
  private: boolean;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  archived?: boolean;
  updated_at: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface StarredRepository extends GitHubRepository {
  starred_at: string;
}
