import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RepositoryList } from '../components/RepositoryList';

const mockRepositories = [
  {
    id: 1,
    name: 'test-repo-1',
    full_name: 'user/test-repo-1',
    description: 'Test repository 1',
    stargazers_count: 10,
    language: 'TypeScript',
    updated_at: '2024-02-17T00:00:00Z',
    html_url: 'https://github.com/user/test-repo-1',
    owner: {
      login: 'user',
      avatar_url: 'https://github.com/user.png',
    },
  },
  {
    id: 2,
    name: 'test-repo-2',
    full_name: 'user/test-repo-2',
    description: 'Test repository 2',
    stargazers_count: 20,
    language: 'JavaScript',
    updated_at: '2024-02-16T00:00:00Z',
    html_url: 'https://github.com/user/test-repo-2',
    owner: {
      login: 'user',
      avatar_url: 'https://github.com/user.png',
    },
  },
];

describe('RepositoryList', () => {
  const mockOnUnstar = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders repository cards', () => {
    render(
      <RepositoryList
        repositories={mockRepositories}
        loading={false}
        onUnstar={mockOnUnstar}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    expect(screen.getByText('test-repo-2')).toBeInTheDocument();
  });

  it('filters repositories by search term', () => {
    render(
      <RepositoryList
        repositories={mockRepositories}
        loading={false}
        onUnstar={mockOnUnstar}
        onDelete={mockOnDelete}
      />
    );

    const searchInput = screen.getByLabelText('Search repositories');
    userEvent.type(searchInput, 'repo-1');

    expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    expect(screen.queryByText('test-repo-2')).not.toBeInTheDocument();
  });

  it('filters repositories by language', () => {
    render(
      <RepositoryList
        repositories={mockRepositories}
        loading={false}
        onUnstar={mockOnUnstar}
        onDelete={mockOnDelete}
      />
    );

    const languageSelect = screen.getByLabelText('Language');
    userEvent.click(languageSelect);
    userEvent.click(screen.getByText('TypeScript'));

    expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    expect(screen.queryByText('test-repo-2')).not.toBeInTheDocument();
  });

  it('handles batch unstar operation', () => {
    render(
      <RepositoryList
        repositories={mockRepositories}
        loading={false}
        onUnstar={mockOnUnstar}
        onDelete={mockOnDelete}
      />
    );

    // Select repositories
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    // Click unstar button
    const unstarButton = screen.getByText('Unstar Selected');
    fireEvent.click(unstarButton);

    // Confirm action
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(mockOnUnstar).toHaveBeenCalledWith([
      'user/test-repo-1',
      'user/test-repo-2',
    ]);
  });

  it('handles batch delete operation', () => {
    render(
      <RepositoryList
        repositories={mockRepositories}
        loading={false}
        onUnstar={mockOnUnstar}
        onDelete={mockOnDelete}
      />
    );

    // Select repositories
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    // Click delete button
    const deleteButton = screen.getByText('Delete Selected');
    fireEvent.click(deleteButton);

    // Confirm action
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(mockOnDelete).toHaveBeenCalledWith([
      'user/test-repo-1',
      'user/test-repo-2',
    ]);
  });

  it('shows loading state', () => {
    render(
      <RepositoryList
        repositories={[]}
        loading={true}
        onUnstar={mockOnUnstar}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});