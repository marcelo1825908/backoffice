# POS Client Panel

Client-facing panel for viewing orders, reports, and managing profile information. This Electron app includes both the frontend React application and the backend Node.js server bundled together.

## Features

- **Dashboard**: Overview of orders, sales statistics, and recent activity
- **Orders**: View and filter orders by status and date range
- **Reports**: Generate X and Z reports, view report history
- **Profile**: Manage account information
- **Integrated Backend**: Backend server automatically starts when the app launches

## Development

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend server dependencies:
```bash
cd server
npm install
cd ..
```

**Important**: The server uses native Node.js modules (like `pg` for PostgreSQL and `serialport`). These modules need to be compatible with Electron's Node.js version. If you encounter issues with native modules, you may need to rebuild them using `electron-rebuild`.

### Running in Development

```bash
npm run dev
```

This will start the React development server on `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Packaging as Electron App

Before packaging, make sure:
1. Server dependencies are installed (`cd server && npm install`)
2. Server `node_modules` are present (they will be bundled with the app)

Then build and package:
```bash
npm run package:win
```

This will:
1. Build the React frontend
2. Copy Electron files to the build directory
3. Copy server files to the build directory (excluding node_modules, uploads, and other unnecessary files)
4. Package everything into a distributable Windows application in the `dist` folder

**Note**: The packaged app includes the backend server, which will automatically start when the app launches. The server runs on `http://localhost:5000` and the frontend connects to it automatically.

## Configuration

### Backend Server

The backend server is integrated into the Electron app and starts automatically when the app launches. It runs on `http://localhost:5000` by default.

In development mode, you can run the server separately:
```bash
cd server
npm start
```

### Frontend API Connection

The client panel connects to the backend API server. By default, it connects to `http://localhost:5000/api`.

You can override this by setting the `REACT_APP_API_URL` environment variable:

```bash
REACT_APP_API_URL=http://your-server:5000/api npm run dev
```

**Note**: In the packaged Electron app, the frontend always connects to `http://localhost:5000/api` where the integrated server runs.

## Project Structure

```
client/
├── electron/          # Electron main process files (starts backend server)
├── public/            # Static files
├── scripts/           # Build scripts (including copy-server.js)
├── server/            # Backend Node.js server
│   ├── controllers/   # API controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── config/        # Configuration files
│   └── server.js      # Server entry point
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   └── App.js         # Main app component
└── package.json
```

## API Endpoints Used

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/reports/x-report` - Generate X report
- `GET /api/reports/z-report` - Generate Z report
- `GET /api/reports/history` - Get report history
- `GET /api/customers/:id` - Get customer profile
- `PUT /api/customers/:id` - Update customer profile



