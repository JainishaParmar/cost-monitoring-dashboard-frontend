# Cost Monitoring Dashboard

A modern, interactive dashboard for monitoring and analyzing cloud cost data. Built with React, TypeScript, Material-UI, and Recharts.

## Features
- **User Authentication**: Secure login/logout, protected routes
- **Dashboard**: Cost summary cards (total cost, total records, average daily cost, services)
- **Charts**: Visualize cost trends and service breakdowns
- **Filtering**: By date range, service, region, and account
- **Table View**: Detailed cost records
- **Responsive UI**: Material-UI, modern UX, error/success alerts

## Project Structure
```
src/
  components/      # UI components (dashboard, filters, navigation, etc.)
  services/        # API and authentication logic
  contexts/        # React context for authentication
  types/           # TypeScript types
  utils/           # Utility functions (error handling, logging)
  App.tsx, index.tsx, common.css
public/
  index.html, favicon.ico, ...
```

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- npm

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env` file in the root to override API URLs (see below)
4. Start the development server:
   ```bash
   npm start
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts
- `npm start` — Run the app in development mode
- `npm run build` — Build the app for production
- `npm run eject` — Eject from Create React App (not recommended)

### Environment Variables
Create a `.env` file in the project root to override defaults:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AUTH_API_URL=/api/auth
```
- `REACT_APP_API_URL`: Base URL for backend API (default: `http://localhost:5000/api`)
- `REACT_APP_AUTH_API_URL`: Base URL for authentication API (default: `/api/auth`)

### Proxy
- The frontend proxies API requests to `http://localhost:5000` (see `package.json`)

### Build for Production
- Run `npm run build` and deploy the contents of the `build/` directory

### Testing
- Run `npm test` to execute tests

### Main Dependencies
- React, Material-UI, Recharts, Axios, Date-fns, React Router, TypeScript

## Customization
- Update environment variables in `.env` as needed
- Adjust UI and logic in `src/components/` and `src/services/`

## Contribution
- Fork the repo, create a feature branch, and submit a pull request
