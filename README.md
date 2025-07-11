# BisnisKu - Business Management Application

A comprehensive business management application for Indonesian MSME owners, featuring transaction tracking, customer management, financial reporting, and HPP calculations.

## Project Structure

```
├── client/          # React frontend (deploy to Vercel)
├── server/          # Express.js backend (deploy to Railway/Google Cloud Run)
├── shared/          # Shared types and schemas
└── README.md        # This file
```

## Features

- **Dashboard**: Financial overview with charts and analytics
- **Transaction Management**: Income and expense tracking
- **Customer Management**: Customer database and contact information
- **Financial Reports**: Monthly reports and HPP calculations
- **Firebase Authentication**: Secure user authentication with Google OAuth
- **PostgreSQL Database**: Reliable data storage with Drizzle ORM
- **Indonesian Language**: Complete Bahasa Indonesia interface
- **Mobile Responsive**: Mobile-first design with touch-friendly interface

## Technology Stack

### Frontend (Client)
- React 18 with TypeScript
- Vite for build and development
- Tailwind CSS with shadcn/ui components
- TanStack Query for state management
- Wouter for routing
- Firebase Authentication

### Backend (Server)
- Node.js with Express.js
- TypeScript
- Drizzle ORM with PostgreSQL
- Session-based authentication
- CORS configured for production

### Database
- PostgreSQL (via Neon serverless)
- Drizzle ORM for type-safe operations
- Automatic migrations with Drizzle Kit

## Development Setup

1. **Install dependencies** (from root directory):
```bash
npm install
```

2. **Setup environment variables**:
   - Add Firebase credentials to Replit Secrets
   - Database is automatically configured

3. **Start development server**:
```bash
npm run dev
```

## Deployment

### Client (Vercel)
1. Navigate to `client/` directory
2. Set environment variables:
   - `VITE_API_URL`: Your server URL
   - `VITE_FIREBASE_API_KEY`: Firebase API key
   - `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
   - `VITE_FIREBASE_APP_ID`: Firebase app ID
3. Build command: `npm run build`
4. Output directory: `dist`

### Server (Railway/Google Cloud Run)
1. Navigate to `server/` directory
2. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `CLIENT_URL`: Your Vercel client URL
   - `NODE_ENV`: production
3. Build command: `npm run build`
4. Start command: `npm start`

## Environment Variables

### Client (.env)
```
VITE_API_URL=https://your-server-domain.railway.app
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Server (.env)
```
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
CLIENT_URL=https://your-client-domain.vercel.app
```

## Database Setup

Run database migrations:
```bash
cd server
npm run db:push
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.