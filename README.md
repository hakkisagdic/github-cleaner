# GitHub Cleaner

A powerful and efficient tool for managing and cleaning GitHub repositories at scale. GitHub Cleaner helps teams and organizations maintain clean and organized repositories by providing automated cleaning features, advanced filtering, and comprehensive management capabilities.

## Features

- 🧹 **Bulk Repository Cleaning**
  - Delete old branches
  - Clean up stale PRs
  - Archive inactive repositories
  - Remove unused workflows
  
- 🔍 **Advanced Filtering**
  - Filter by activity, size, or age
  - Custom search queries
  - Save and reuse filters
  
- ⚡ **Performance Optimized**
  - Pagination for large lists
  - Efficient API usage
  - Background processing for heavy operations
  
- 🛠️ **User Settings**
  - Customizable cleaning rules
  - Persistent preferences
  - Keyboard shortcuts
  
- 📊 **Monitoring & Reporting**
  - Action history
  - Clean-up reports
  - Activity analytics

## Project Structure

```
/
├── frontend/     # React TypeScript frontend
├── backend/      # Node.js Express backend
└── .github/      # GitHub Actions workflows
```

## Prerequisites

- Node.js 18.x or later
- npm 7.x or later

## Setup Instructions

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will start on http://localhost:3001

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend application will start on http://localhost:3000

## Development

- Frontend is built with React 18, TypeScript, and Material-UI
- Backend uses Node.js with Express and TypeScript
- CI/CD is handled through GitHub Actions

## Testing

- Frontend: `cd frontend && npm test`
- Backend: `cd backend && npm test`

## Building for Production

- Frontend: `cd frontend && npm run build`
- Backend: `cd backend && npm run build`

## API Documentation

### Authentication

```http
POST /api/auth/github
```
Authenticates user with GitHub OAuth.

### Repositories

```http
GET /api/repositories
```
Fetches repositories with pagination and filtering.

Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `filter` (string): Filter query
- `sort` (string): Sort field
- `order` (string): Sort order (asc/desc)

```http
POST /api/repositories/clean
```
Initiates cleaning operation on selected repositories.

Body:
```json
{
  "repositories": ["repo1", "repo2"],
  "options": {
    "deleteBranches": boolean,
    "cleanPRs": boolean,
    "removeWorkflows": boolean
  }
}
```

### User Settings

```http
GET /api/settings
```
Retrieves user settings.

```http
PUT /api/settings
```
Updates user settings.

For detailed API documentation, see our [API Reference](docs/API.md).

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
