import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RepositoryCard } from '../components/RepositoryCard';

const mockRepository = {
  id: 1,
  name: 'test-repo',
  full_name: 'user/test-repo',
  description: 'Test repository',
  stargazers_count: 10,
  language: 'TypeScript',
  updated_at: '2024-02-17T00:00:00Z',
  html_url: 'https://github.com/user/test-repo',
  owner: {
    login: 'user',
    avatar_url: 'https://github.com/user.png',
  },
};

describe('RepositoryCard', () => {
  const mockOnSelect = jest.fn();
  const mockOnUnstar = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders repository information', () => {
    render(
      <RepositoryCard
        repository={mockRepository}
        selected={false}
        onSelect={mockOnSelect}
        onUnstar={mockOnUnstar}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('test-repo')).toBeInTheDocument();
    expect(screen.getByText('Test repository')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('⭐ 10')).toBeInTheDocument();
  });

  it('handles selection', () => {
    render(
      <RepositoryCard
        repository={mockRepository}
        selected={false}
        onSelect={mockOnSelect}
        onUnstar={mockOnUnstar}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });

  it('handles unstar action', () => {
    render(
      <RepositoryCard
        repository={mockRepository}
        selected={false}
        onSelect={mockOnSelect}
        onUnstar={mockOnUnstar}
        onDelete={mockOnDelete}
      />
    );

    const unstarButton = screen.getByLabelText('unstar');
    fireEvent.click(unstarButton);
    expect(mockOnUnstar).toHaveBeenCalledWith('user/test-repo');
  });

  it('handles delete action', () => {
    render(
      <RepositoryCard
        repository={mockRepository}
        selected={false}
        onSelect={mockOnSelect}
        onUnstar={mockOnUnstar}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith('user/test-repo');
  });

  it('shows selected state', () => {
    render(
      <RepositoryCard
        repository={mockRepository}
        selected={true}
        onSelect={mockOnSelect}
        onUnstar={mockOnUnstar}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });
});