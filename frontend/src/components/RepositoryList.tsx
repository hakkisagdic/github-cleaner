import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { Repository } from '../services/github';
import { RepositoryCard } from './RepositoryCard';

interface Props {
  repositories: Repository[];
  loading: boolean;
  onUnstar: (repos: string[]) => void;
  onDelete: (repos: string[]) => void;
}

type SortField = 'name' | 'stars' | 'updated';
type SortOrder = 'asc' | 'desc';

export const RepositoryList: React.FC<Props> = ({
  repositories,
  loading,
  onUnstar,
  onDelete,
}) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'unstar' | 'delete';
  }>({ open: false, action: 'unstar' });

  const languages = useMemo(() => {
    const langs = new Set(repositories.map((repo) => repo.language).filter(Boolean));
    return Array.from(langs);
  }, [repositories]);

  const filteredAndSortedRepos = useMemo(() => {
    return repositories
      .filter((repo) => {
        const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        const matchesLanguage = !languageFilter || repo.language === languageFilter;
        return matchesSearch && matchesLanguage;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'stars':
            comparison = a.stargazers_count - b.stargazers_count;
            break;
          case 'updated':
            comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
            break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [repositories, searchTerm, languageFilter, sortField, sortOrder]);

  const handleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirmAction = () => {
    const selectedRepos = repositories
      .filter((repo) => selected.includes(repo.id))
      .map((repo) => repo.full_name);

    if (confirmDialog.action === 'unstar') {
      onUnstar(selectedRepos);
    } else {
      onDelete(selectedRepos);
    }

    setConfirmDialog({ open: false, action: 'unstar' });
    setSelected([]);
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Search repositories"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            labelId="language-select-label"
            value={languageFilter}
            label="Language"
            onChange={(e) => setLanguageFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {languages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="sort-select-label">Sort by</InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortField}
            label="Sort by"
            onChange={(e) => setSortField(e.target.value as SortField)}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="stars">Stars</MenuItem>
            <MenuItem value="updated">Updated</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="secondary"
          disabled={selected.length === 0}
          onClick={() => setConfirmDialog({ open: true, action: 'unstar' })}
        >
          Unstar Selected
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={selected.length === 0}
          onClick={() => setConfirmDialog({ open: true, action: 'delete' })}
        >
          Delete Selected
        </Button>
      </Stack>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        filteredAndSortedRepos.map((repo) => (
          <RepositoryCard
            key={repo.id}
            repository={repo}
            selected={selected.includes(repo.id)}
            onSelect={handleSelect}
            onUnstar={(repo) => onUnstar([repo])}
            onDelete={(repo) => onDelete([repo])}
          />
        ))
      )}

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, action: 'unstar' })}>
        <DialogTitle>
          Confirm {confirmDialog.action === 'unstar' ? 'Unstar' : 'Delete'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.action === 'unstar' ? 'unstar' : 'delete'}{' '}
            {selected.length} selected repositories?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: 'unstar' })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
