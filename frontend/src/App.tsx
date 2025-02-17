import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
} from 'react-query';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { RepositoryList } from './components/RepositoryList';
import {
  githubService,
  setAuthToken,
} from './services/github';

const queryClient = new QueryClient();

const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<GitHubCallback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

function Login() {
  const handleLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo,delete_repo`;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Typography variant="h4" gutterBottom>
        GitHub Repository Cleaner
      </Typography>
      <Button variant="contained" onClick={handleLogin}>
        Login with GitHub
      </Button>
    </Box>
  );
}

function GitHubCallback() {
  const code = new URLSearchParams(window.location.search).get('code');

  React.useEffect(() => {
    if (code) {
      fetch(`/api/github/oauth/callback?code=${code}`)
        .then((res) => res.json())
        .then(({ access_token }) => {
          localStorage.setItem('github_token', access_token);
          setAuthToken(access_token);
          window.location.href = '/';
        })
        .catch((error) => {
          console.error('Authentication error:', error);
          window.location.href = '/login';
        });
    }
  }, [code]);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('github_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  setAuthToken(token);
  return <>{children}</>;
}

function Dashboard() {
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    data: repositories,
    isLoading,
    refetch: refetchRepos,
  } = useQuery('repositories', () => githubService.getRepositories());

  const unstarMutation = useMutation(
    (repos: string[]) => githubService.unstarRepositories(repos),
    {
      onSuccess: () => {
        refetchRepos();
        setSnackbar({
          open: true,
          message: 'Repositories unstarred successfully',
          severity: 'success',
        });
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: 'Failed to unstar repositories',
          severity: 'error',
        });
      },
    }
  );

  const deleteMutation = useMutation(
    (repos: string[]) => githubService.deleteRepositories(repos),
    {
      onSuccess: () => {
        refetchRepos();
        setSnackbar({
          open: true,
          message: 'Repositories deleted successfully',
          severity: 'success',
        });
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: 'Failed to delete repositories',
          severity: 'error',
        });
      },
    }
  );

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    window.location.href = '/login';
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            GitHub Repository Cleaner
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <RepositoryList
          repositories={repositories || []}
          loading={isLoading}
          onUnstar={(repos) => unstarMutation.mutate(repos)}
          onDelete={(repos) => deleteMutation.mutate(repos)}
        />
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default App;