import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RepositoryCard } from './RepositoryCard';

expect.extend(toHaveNoViolations);

describe('RepositoryCard Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const mockRepo = {
      id: 1,
      name: 'test-repo',
      description: 'Test repository description',
      language: 'TypeScript',
      archived: false,
      html_url: 'https://github.com/test/test-repo'
    };

    const { container } = render(
      <RepositoryCard 
        repository={mockRepo}
        onArchive={() => {}}
        onDelete={() => {}}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});