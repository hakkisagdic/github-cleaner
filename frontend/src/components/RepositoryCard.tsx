import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Checkbox,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import { Star, Delete } from '@mui/icons-material';
import { Repository } from '../services/github';

interface Props {
  repository: Repository;
  selected: boolean;
  onSelect: (id: number) => void;
  onUnstar: (repo: string) => void;
  onDelete: (repo: string) => void;
}

export const RepositoryCard: React.FC<Props> = ({
  repository,
  selected,
  onSelect,
  onUnstar,
  onDelete,
}) => {
  const handleUnstar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnstar(repository.full_name);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(repository.full_name);
  };

  return (
    <Card
      sx={{
        display: 'flex',
        mb: 2,
        cursor: 'pointer',
        bgcolor: selected ? 'action.selected' : 'background.paper',
      }}
      onClick={() => onSelect(repository.id)}
    >
      <Checkbox checked={selected} />
      <CardContent sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            {repository.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleUnstar} size="small">
              <Star />
            </IconButton>
            <IconButton onClick={handleDelete} size="small">
              <Delete />
            </IconButton>
          </Stack>
        </Stack>
        <Typography color="text.secondary" gutterBottom>
          {repository.description}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {repository.language && (
            <Chip label={repository.language} size="small" />
          )}
          <Typography variant="body2" color="text.secondary">
            ⭐ {repository.stargazers_count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Updated: {new Date(repository.updated_at).toLocaleDateString()}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};