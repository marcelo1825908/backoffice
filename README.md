# POS Client Panel

Client-facing panel for viewing orders, reports, and managing profile information. This React application connects to a separate backend Node.js server.

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

**Important**: The server uses native Node.js modules. Make sure you have the necessary build tools installed if you encounter compilation issues.

### Running in Development

```bash
npm run dev
```

This will start the React development server on `http://localhost:3000`

### Building for Production

```bash
npm run build
```


## Configuration

### Backend Server

The backend server runs separately from the frontend. To start the server:
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


## Project Structure

```
client/
├── public/            # Static files
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



